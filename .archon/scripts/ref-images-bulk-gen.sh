#!/usr/bin/env bash
set -euo pipefail

mode="${1:-test}"
case "$mode" in test|bulk) ;; *) echo "Usage: $0 [test|bulk]" >&2; exit 2;; esac

repo_root="$(cd "$(dirname "$0")/../.." && pwd)"
project_root="$(cd "$repo_root/.." && pwd)"
manifest="$repo_root/.archon/data/ref-images-products.json"
output_dir="$project_root/docs/assets/generated-products"
ledger="$output_dir/generation-ledger.jsonl"
hf="${HIGGSFIELD_BIN:-/Users/lucas/.hermes/node/bin/higgsfield}"
mkdir -p "$output_dir"

for command in jq curl file; do command -v "$command" >/dev/null || { echo "Missing command: $command" >&2; exit 1; }; done
[[ -x "$hf" ]] || { echo "Missing Higgsfield CLI: $hf" >&2; exit 1; }
[[ "$(jq length "$manifest")" == 32 ]] || { echo "Manifest must contain 32 products" >&2; exit 1; }
jq -e '([.[].slug] | length) == ([.[].slug] | unique | length)' "$manifest" >/dev/null || {
  echo "Product slugs must be unique" >&2
  exit 1
}
jq -e 'all(.[]; (.references | type == "array" and length > 0))' "$manifest" >/dev/null || {
  echo "Every product must have at least one reference image" >&2
  exit 1
}

if [[ "$mode" == test ]]; then
  selected_count=1
else
  selected_count="$(jq length "$manifest")"
fi
echo "Mode: $mode; products: $selected_count; FLUX.2 paid sequential generation"

while IFS= read -r row; do
  slug="$(jq -r .slug <<<"$row")"
  product="$(jq -r .product <<<"$row")"
  prompt="$(jq -r .prompt <<<"$row")"
  aspect="$(jq -r .aspect_ratio <<<"$row")"
  resolution="$(jq -r .resolution <<<"$row")"
  model="$(jq -r .model <<<"$row")"
  submit_raw="$output_dir/$slug.submit.json"
  raw="$output_dir/$slug.job.json"
  references="$(jq -c .references <<<"$row")"

  if [[ -s "$ledger" ]] && jq -e --arg slug "$slug" 'select(.slug == $slug and .status == "succeeded")' "$ledger" >/dev/null 2>&1; then
    echo "SKIP $product (already succeeded)"
    continue
  fi

  image_args=()
  while IFS= read -r ref; do
    abs_ref="$project_root/$ref"
    [[ -f "$abs_ref" ]] || { echo "Missing reference for $product: $abs_ref" >&2; exit 1; }
    image_args+=(--image "$abs_ref")
  done < <(jq -r '.references[]' <<<"$row")
  [[ ${#image_args[@]} -ge 2 ]] || { echo "No reference attached for $product" >&2; exit 1; }

  echo "GENERATE $product WITH REFERENCES $references"
  started="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  start_epoch="$(date +%s)"
  job_id=""
  if [[ -s "$submit_raw" ]]; then
    job_id="$(jq -r 'if type == "array" then .[0] // empty else .id // .job_id // .jobId // empty end' "$submit_raw")"
  fi
  if [[ -z "$job_id" ]]; then
    submit_tmp="$(mktemp)"
    if ! "$hf" generate create flux_2 --prompt "$prompt" --aspect_ratio "$aspect" --resolution "$resolution" --model "$model" "${image_args[@]}" --json >"$submit_tmp"; then
      rm -f "$submit_tmp"
      exit 1
    fi
    mv "$submit_tmp" "$submit_raw"
    job_id="$(jq -r 'if type == "array" then .[0] // empty else .id // .job_id // .jobId // empty end' "$submit_raw")"
    [[ -n "$job_id" ]] || { echo "No job ID returned for $product" >&2; exit 1; }
  else
    echo "RESUME $product job $job_id"
  fi

  tmp="$(mktemp)"
  if ! "$hf" generate wait "$job_id" --timeout 20m --interval 5s --quiet --json >"$tmp"; then
    duration="$(( $(date +%s) - start_epoch ))"
    jq -nc --arg slug "$slug" --arg product "$product" --arg job_id "$job_id" --arg started "$started" \
      --argjson duration "$duration" --argjson references "$references" \
      '{slug:$slug,product:$product,status:"failed",job_id:$job_id,started_at:$started,duration_seconds:$duration,references:$references}' >> "$ledger"
    mv "$tmp" "$raw"
    exit 1
  fi
  mv "$tmp" "$raw"
  duration="$(( $(date +%s) - start_epoch ))"
  result_url="$(jq -r '.result_url // [.. | strings | select(test("^https://")) | select(test("(png|jpe?g|webp|cloudfront|higgs)";"i"))][-1] // empty' "$raw")"
  [[ -n "$result_url" ]] || { echo "No result URL found for $product; inspect $raw" >&2; exit 1; }
  download_tmp="$output_dir/$slug.download"
  curl -fsSL "$result_url" -o "$download_tmp"
  mime="$(file -b --mime-type "$download_tmp")"
  case "$mime" in image/jpeg) ext=jpg;; image/png) ext=png;; image/webp) ext=webp;; *) echo "Invalid result MIME for $product: $mime" >&2; exit 1;; esac
  output="$output_dir/${slug}_generated.$ext"
  mv "$download_tmp" "$output"
  finished="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  jq -nc --arg slug "$slug" --arg product "$product" --arg job_id "$job_id" --arg started "$started" \
    --arg finished "$finished" --arg output "$output" --argjson duration "$duration" --argjson references "$references" \
    '{slug:$slug,product:$product,status:"succeeded",job_id:$job_id,started_at:$started,finished_at:$finished,duration_seconds:$duration,credits:1,references:$references,output:$output}' >> "$ledger"
  echo "DONE $product (${duration}s) -> $output"
done < <(if [[ "$mode" == test ]]; then jq -c '.[] | select(.slug == "white-event-tent-10x20m")' "$manifest"; else jq -c '.[]' "$manifest"; fi)
