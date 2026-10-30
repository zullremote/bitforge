import { NextResponse } from "next/server";
import { exchange } from "@/lib/engine";

export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({
    symbol: "BTC/USDT", price: exchange.price, change24h: 2.38,
    high24h: 68190.0, low24h: 65840.2, volume24h: 1284.73,
    balances: { btc: exchange.btc, usdt: exchange.usdt },
    orders: exchange.orders, trades: exchange.trades
  });
}
