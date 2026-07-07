import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

// ============================================
// Agent HTTP surface — the ONLY externally reachable path for agents.
// Every route requires: Authorization: Bearer $AGENT_API_TOKEN
// (set via `npx convex env set AGENT_API_TOKEN <value>`).
// Agents hold ONLY this token — never the Convex admin/deploy key —
// so they cannot call any function that isn't routed here.
// ============================================

const http = httpRouter();

function authorized(req: Request): boolean {
  const token = process.env.AGENT_API_TOKEN;
  if (!token) return false; // fail closed if unset
  return req.headers.get("Authorization") === `Bearer ${token}`;
}

const unauthorized = () =>
  new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });

const ok = (data: unknown) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

const badRequest = (msg: string) =>
  new Response(JSON.stringify({ error: msg }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });

// ---------- READS ----------

http.route({
  path: "/agent/products",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    if (!authorized(req)) return unauthorized();
    return ok(await ctx.runQuery(internal.agentApi.getBonramProducts, {}));
  }),
});

http.route({
  path: "/agent/product",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    if (!authorized(req)) return unauthorized();
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return badRequest("missing ?id");
    const data = await ctx.runQuery(internal.agentApi.getBonramProductById, {
      id: id as any,
    });
    if (!data) return badRequest("product not found");
    return ok(data);
  }),
});

http.route({
  path: "/agent/quotations",
  method: "GET",
  handler: httpAction(async (ctx, req) => {
    if (!authorized(req)) return unauthorized();
    return ok(await ctx.runQuery(internal.agentApi.getBonramQuotations, {}));
  }),
});

// ---------- WRITES ----------

http.route({
  path: "/agent/product-pricing",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    if (!authorized(req)) return unauthorized();
    const body = await req.json().catch(() => null);
    if (!body?.productId || typeof body.dailyRate !== "number")
      return badRequest("require { productId, dailyRate:number }");
    return ok(
      await ctx.runMutation(internal.agentApi.agentUpdateProductPricing, {
        productId: body.productId,
        dailyRate: body.dailyRate,
      })
    );
  }),
});

http.route({
  path: "/agent/invoice-user",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    if (!authorized(req)) return unauthorized();
    const body = await req.json().catch(() => null);
    if (!body?.customer?.name || !body?.customer?.email)
      return badRequest("require { customer: { name, email, ... } }");
    return ok(
      await ctx.runMutation(internal.agentApi.agentCreateInvoiceUser, {
        customer: body.customer,
      })
    );
  }),
});

http.route({
  path: "/agent/invoice",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    if (!authorized(req)) return unauthorized();
    const body = await req.json().catch(() => null);
    if (!body?.customer?.name || !body?.customer?.email)
      return badRequest("require { customer: { name, email }, items: [...] }");
    if (!Array.isArray(body.items) || body.items.length === 0)
      return badRequest("items must be a non-empty array");
    return ok(
      await ctx.runMutation(internal.agentApi.agentCreateInvoice, {
        customer: body.customer,
        eventDetails: body.eventDetails,
        items: body.items,
        dueDate: body.dueDate,
      })
    );
  }),
});

export default http;
