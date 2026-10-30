export type Side = "BUY" | "SELL";
export type OrderType = "MARKET" | "LIMIT";
export type Order = { id: string; side: Side; type: OrderType; price: number; qty: number; remaining: number; status: "OPEN" | "FILLED" | "PARTIALLY_FILLED"; createdAt: string };
export type Trade = { id: string; price: number; qty: number; side: Side; time: string };

const START_PRICE = 67420.5;
const state = globalThis as typeof globalThis & {
  __bitforge?: { price: number; orders: Order[]; trades: Trade[]; usdt: number; btc: number };
};
if (!state.__bitforge) {
  state.__bitforge = {
    price: START_PRICE, orders: [], trades: [
      { id: "T-1004", price: 67420.5, qty: 0.018, side: "BUY", time: new Date().toISOString() },
      { id: "T-1003", price: 67411.2, qty: 0.006, side: "SELL", time: new Date(Date.now()-30000).toISOString() },
      { id: "T-1002", price: 67435.0, qty: 0.012, side: "BUY", time: new Date(Date.now()-65000).toISOString() }
    ], usdt: 10000, btc: 0.15
  };
}
export const exchange = state.__bitforge;

export function placeOrder(input: { side: Side; type: OrderType; price?: number; qty: number }) {
  const qty = Number(input.qty);
  const price = input.type === "MARKET" ? exchange.price : Number(input.price);
  if (!Number.isFinite(qty) || qty <= 0 || qty > 10) throw new Error("Jumlah BTC tidak valid (maksimal 10 BTC per order demo).");
  if (!Number.isFinite(price) || price <= 0) throw new Error("Harga order tidak valid.");
  const cost = qty * price;
  if (input.side === "BUY" && cost > exchange.usdt) throw new Error("Saldo USDT virtual tidak mencukupi.");
  if (input.side === "SELL" && qty > exchange.btc) throw new Error("Saldo BTC virtual tidak mencukupi.");

  const order: Order = {
    id: `BF-${Date.now().toString(36).toUpperCase()}`, side: input.side, type: input.type,
    price, qty, remaining: qty, status: "OPEN", createdAt: new Date().toISOString()
  };

  // Demo matching: market orders execute immediately; limit orders execute if crossing current simulated price.
  const crosses = input.type === "MARKET" || (input.side === "BUY" ? price >= exchange.price : price <= exchange.price);
  if (crosses) {
    order.status = "FILLED";
    order.remaining = 0;
    exchange.trades.unshift({ id: `TR-${Date.now().toString(36).toUpperCase()}`, price: exchange.price, qty, side: input.side, time: new Date().toISOString() });
    exchange.trades = exchange.trades.slice(0, 50);
    if (input.side === "BUY") { exchange.usdt -= cost; exchange.btc += qty; }
    else { exchange.usdt += cost; exchange.btc -= qty; }
  } else {
    exchange.orders.unshift(order);
  }
  return order;
}
