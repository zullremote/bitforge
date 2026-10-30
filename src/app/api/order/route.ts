import { NextResponse } from "next/server";
import { z } from "zod";
import { placeOrder } from "@/lib/engine";

const schema = z.object({
  side: z.enum(["BUY", "SELL"]),
  type: z.enum(["MARKET", "LIMIT"]),
  price: z.number().positive().optional(),
  qty: z.number().positive().max(10)
}).superRefine((v, ctx) => {
  if (v.type === "LIMIT" && (!v.price || v.price <= 0)) {
    ctx.addIssue({ code: "custom", message: "Limit order memerlukan harga yang valid.", path: ["price"] });
  }
});
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Input tidak valid." }, { status: 400 });
    const order = placeOrder(parsed.data);
    return NextResponse.json({ order });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Order gagal." }, { status: 400 });
  }
}
