#!/usr/bin/env bash
set -euo pipefail

mode="${1:---dry-run}"
[[ "$mode" == "--dry-run" || "$mode" == "--apply" ]] || {
  echo "Usage: $0 [--dry-run|--apply]" >&2
  exit 2
}

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
project_root="$(cd "$repo_root/.." && pwd)"
manifest="$repo_root/scripts/product-image-seed-manifest.json"
artifact_dir="$project_root/docs/assets/generated-products"
backup="$artifact_dir/convex-image-backup-dev.json"
ledger="$artifact_dir/convex-image-seed-dev.jsonl"

cd "$repo_root"
for command in jq curl file npx; do command -v "$command" >/dev/null || { echo "Missing command: $command" >&2; exit 1; }; done

jq -e 'length == 28 and ([.[].product] | length) == ([.[].product] | unique | length)' "$manifest" >/dev/null || {
  echo "Manifest must contain 28 unique products" >&2
  exit 1
}
jq -e 'all(.[]; (.file | test("_generated\\.(png|jpg|jpeg|webp)$")))' "$manifest" >/dev/null || {
  echo "Every seeded image must use a _generated.(png|jpg|jpeg|webp) suffix" >&2
  exit 1
}

audit="$(CI=1 npx convex run seedImages:audit '{}')"
jq -e 'length == 32' <<<"$audit" >/dev/null || { echo "Convex must contain exactly 32 products" >&2; exit 1; }

# Reuse the protected flag from seedImages:audit (convex/seedImages.ts) instead of a
# second hardcoded list, so the two never drift out of sync.
protected="$(jq -c '[.[] | select(.protected) | .name]' <<<"$audit")"
jq -e --argjson protected "$protected" 'all(.[]; .product as $name | ($protected | index($name) | not))' "$manifest" >/dev/null || {
  echo "Manifest contains a protected product" >&2
  exit 1
}

while IFS= read -r relative; do
  image="$project_root/$relative"
  [[ -f "$image" ]] || { echo "Missing image: $image" >&2; exit 1; }
  case "$relative" in
    *.png) expected_mime=image/png ;;
    *.jpg | *.jpeg) expected_mime=image/jpeg ;;
    *.webp) expected_mime=image/webp ;;
    *) echo "Unsupported extension: $relative" >&2; exit 1 ;;
  esac
  mime="$(file -b --mime-type "$image")"
  [[ "$mime" == "$expected_mime" ]] || { echo "Invalid image MIME type for $relative: $mime (expected $expected_mime)" >&2; exit 1; }
done < <(jq -r '.[].file' "$manifest")

jq -e --argjson protected "$protected" 'all(.[] | select(.name as $name | $protected | index($name)); .imageStorageId != null)' <<<"$audit" >/dev/null || {
  echo "Every protected product must retain its existing storage image" >&2
  exit 1
}
if [[ ! -s "$backup" ]]; then
  printf '%s\n' "$audit" > "$backup"
fi

echo "Validated 28 generated images against 32 Convex products."
if [[ "$mode" == "--dry-run" ]]; then
  echo "Dry run complete. No uploads or product rows changed."
  exit 0
fi

while IFS= read -r row; do
  product="$(jq -r .product <<<"$row")"
  relative="$(jq -r .file <<<"$row")"
  image="$project_root/$relative"

  if [[ -s "$ledger" ]]; then
    seeded_storage_id="$(jq -sr --arg product "$product" '[.[] | select(.product == $product and .status == "succeeded")][-1].storageId // empty' "$ledger")"
    current_storage_id="$(jq -r --arg product "$product" '.[] | select(.name == $product) | .imageStorageId // empty' <<<"$audit")"
    if [[ -n "$seeded_storage_id" && "$seeded_storage_id" == "$current_storage_id" ]]; then
      echo "SKIP $product"
      continue
    fi
  fi

  echo "UPLOAD $product"
  case "$relative" in
    *.png) content_type=image/png ;;
    *.jpg | *.jpeg) content_type=image/jpeg ;;
    *.webp) content_type=image/webp ;;
    *) echo "Unsupported extension: $relative" >&2; exit 1 ;;
  esac
  prepared="$(CI=1 npx convex run seedImages:prepareUpload "$(jq -nc --arg productName "$product" '{productName:$productName}')")"
  upload_response="$(curl -fsS -H "Content-Type: $content_type" --data-binary "@$image" "$(jq -r .uploadUrl <<<"$prepared")")"
  storage_id="$(jq -er '.storageId' <<<"$upload_response")"
  args="$(jq -nc \
    --arg productId "$(jq -r .productId <<<"$prepared")" \
    --arg productName "$product" \
    --argjson expectedUpdatedAt "$(jq -r .expectedUpdatedAt <<<"$prepared")" \
    --arg imageStorageId "$storage_id" \
    '{productId:$productId,productName:$productName,expectedUpdatedAt:$expectedUpdatedAt,imageStorageId:$imageStorageId}')"
  CI=1 npx convex run seedImages:setGeneratedImage "$args" >/dev/null
  jq -nc --arg product "$product" --arg file "$relative" --arg storageId "$storage_id" \
    '{product:$product,file:$file,storageId:$storageId,status:"succeeded"}' >> "$ledger"
  echo "DONE $product"
done < <(jq -c '.[]' "$manifest")

echo "Seeded 28 generated product images into Convex storage."
