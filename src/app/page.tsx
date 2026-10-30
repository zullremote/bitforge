"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type Trade = { id: string; price: number; qty: number; side: "BUY" | "SELL"; time: string };
type Order = { id: string; side: "BUY" | "SELL"; type: "MARKET" | "LIMIT"; price: number; qty: number; remaining: number; status: string; createdAt: string };
type Market = { price: number; change24h: number; high24h: number; low24h: number; volume24h: number; balances: { btc: number; usdt: number }; orders: Order[]; trades: Trade[] };

const money = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const qtyFmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });

function MiniChart({ price }: { price: number }) {
  const candles = useMemo(() => Array.from({ length: 52 }, (_, i) => {
    const wave = Math.sin(i * 0.67) * 230 + Math.cos(i * 0.23) * 160 + (i - 26) * 5;
    const close = price - 550 + i * 20 + wave;
    const open = close + Math.sin(i * 2.2) * 90;
    const high = Math.max(open, close) + 30 + (i % 5) * 15;
    const low = Math.min(open, close) - 25 - (i % 4) * 12;
    return { open, close, high, low };
  }), [price]);
  const min = Math.min(...candles.map(c => c.low));
  const max = Math.max(...candles.map(c => c.high));
  const range = max - min || 1;
  return <div className="chart" aria-label="Simulated candlestick chart">{candles.map((c, i) => {
    const y = (v: number) => ((v - min) / range) * 88 + 5;
    const top = Math.min(y(c.open), y(c.close));
    const height = Math.max(1.5, Math.abs(y(c.open) - y(c.close)));
    const down = c.close < c.open;
    return <div className="candle" key={i} style={{ height: "100%" }}>
      <div className={`wick ${down ? "down" : ""}`} style={{ top: `${100-y(c.high)}%`, height: `${y(c.high)-y(c.low)}%` }} />
      <div className={`body-candle ${down ? "down" : ""}`} style={{ top: `${top}%`, height: `${height}%` }} />
    </div>;
  })}</div>;
}

export default function Home() {
  const [market, setMarket] = useState<Market | null>(null);
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [type, setType] = useState<"MARKET" | "LIMIT">("MARKET");
  const [qty, setQty] = useState("0.001");
  const [limitPrice, setLimitPrice] = useState("67400");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/market", { cache: "no-store" });
      if (res.ok) setMarket(await res.json());
    } catch { /* Keep last-known demo state visible. */ }
  }, []);
  useEffect(() => { void refresh(); const timer = setInterval(() => void refresh(), 2500); return () => clearInterval(timer); }, [refresh]);

  const submit = async () => {
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        side, type, qty: Number(qty), ...(type === "LIMIT" ? { price: Number(limitPrice) } : {})
      }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Order gagal.");
      setMessage(`Order ${data.order.id} berhasil: ${data.order.status === "FILLED" ? "terisi (simulasi)" : "masuk antrean limit"}.`);
      await refresh();
    } catch (e) { setMessage(e instanceof Error ? e.message : "Terjadi kesalahan."); }
    finally { setBusy(false); }
  };

  const asks = useMemo(() => (market?.orders.filter(o => o.side === "SELL" && o.status === "OPEN") ?? []).slice(0, 5), [market]);
  const bids = useMemo(() => (market?.orders.filter(o => o.side === "BUY" && o.status === "OPEN") ?? []).slice(0, 5), [market]);
  const price = market?.price ?? 67420.5;

  return <div className="shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">B</div><span>BitForge</span></div>
      <nav className="nav"><span>Markets</span><span>Trade</span><span>Orders</span><span>Assets</span></nav>
      <div className="top-actions"><span className="demo-pill">SIMULATION MODE</span><button className="pill" onClick={() => { setMessage("Ini demo tanpa akun dan tanpa uang asli."); }}>Demo Account</button></div>
    </header>
    <main>
      <section className="market-head">
        <div><div className="pair"><span className="coin">₿</span> BTC/USDT <span className="muted" style={{fontSize:12}}>▾</span></div><div className="sub">Bitcoin <span style={{margin:"0 6px"}}>•</span> Spot Market <span style={{margin:"0 6px"}}>•</span> Demo data</div></div>
        <div><div className="price">{money(price)}</div><div className="sub green">+{market?.change24h.toFixed(2) ?? "2.38"}% <span className="muted">24h</span></div></div>
        <div className="market-stats">
          <div><div className="stat-label">24h High</div><div className="stat-value">{money(market?.high24h ?? 68190)}</div></div>
          <div><div className="stat-label">24h Low</div><div className="stat-value">{money(market?.low24h ?? 65840.2)}</div></div>
          <div><div className="stat-label">24h Volume (BTC)</div><div className="stat-value">{money(market?.volume24h ?? 1284.73)}</div></div>
        </div>
      </section>

      <section className="grid">
        <div className="panel">
          <div className="panel-title"><span>BTC/USDT Chart</span><span className="muted" style={{fontSize:11}}>Candlestick · 1H</span></div>
          <div className="chart-head"><b>1H</b><span>4H</span><span>1D</span><span>1W</span><span className="muted" style={{marginLeft:"auto"}}>MA(7)　 MA(25)</span></div>
          <MiniChart price={price} />
        </div>

        <div className="panel">
          <div className="panel-title"><span>Spot Trading</span><span className="demo-pill">VIRTUAL</span></div>
          <div className="order-tabs"><button className={`tab ${side==="BUY"?"active":""}`} onClick={() => setSide("BUY")}>Buy BTC</button><button className={`tab ${side==="SELL"?"active":""}`} onClick={() => setSide("SELL")}>Sell BTC</button></div>
          <div className="panel-body">
            <div style={{display:"flex", gap:8}}><button className={`tab ${type==="MARKET"?"active":""}`} onClick={() => setType("MARKET")}>Market</button><button className={`tab ${type==="LIMIT"?"active":""}`} onClick={() => setType("LIMIT")}>Limit</button></div>
            {type==="LIMIT" && <><div className="field-label">Price (USDT)</div><input className="field" type="number" min="0" value={limitPrice} onChange={e=>setLimitPrice(e.target.value)} /></>}
            <div className="field-label">Amount (BTC)</div><input className="field" type="number" min="0.000001" step="0.0001" value={qty} onChange={e=>setQty(e.target.value)} />
            <div className="field-label"><span>Estimated total</span><span>{money(Number(qty || 0) * (type==="LIMIT" ? Number(limitPrice || 0) : price))} USDT</span></div>
            <button disabled={busy} className={side==="BUY"?"buy-btn":"sell-btn"} onClick={submit}>{busy ? "Processing…" : `${side==="BUY"?"Buy":"Sell"} BTC`}</button>
            {message && <div className="toast" role="status">{message}</div>}
            <div className="balance">Available balance<br/><span style={{color:"#eaecef"}}>{qtyFmt(market?.balances.usdt ?? 10000)} USDT</span><br/><span style={{color:"#eaecef"}}>{qtyFmt(market?.balances.btc ?? .15)} BTC</span></div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title"><span>Order Book</span><span className="muted">BTC/USDT</span></div>
          <div className="book">
            <div className="book-head"><span>Price (USDT)</span><span>Amount (BTC)</span><span>Total</span></div>
            {asks.length ? asks.map(o=><div className="book-row ask" key={o.id}><span>{money(o.price)}</span><span>{qtyFmt(o.remaining)}</span><span>{money(o.price*o.remaining)}</span></div>) : <div className="empty" style={{padding:"8px 0"}}>No active asks yet</div>}
            <div className="mid-price">{money(price)} <span className="green" style={{fontSize:11}}>≈ market</span></div>
            {bids.length ? bids.map(o=><div className="book-row bid" key={o.id}><span>{money(o.price)}</span><span>{qtyFmt(o.remaining)}</span><span>{money(o.price*o.remaining)}</span></div>) : <div className="empty" style={{padding:"8px 0"}}>No active bids yet</div>}
          </div>
        </div>
        <div className="panel">
          <div className="panel-title"><span>Recent Trades</span><span className="muted">Live demo</span></div>
          <div className="table-wrap"><table><thead><tr><th>Price (USDT)</th><th>Amount (BTC)</th><th>Time</th></tr></thead><tbody>
            {(market?.trades ?? []).slice(0,8).map(t=><tr key={t.id}><td className={t.side==="BUY"?"green":"red"}>{money(t.price)}</td><td>{qtyFmt(t.qty)}</td><td>{new Date(t.time).toLocaleTimeString("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</td></tr>)}
          </tbody></table></div>
        </div>
      </section>

      <section className="lower-grid">
        <div className="panel"><div className="panel-title"><span>Open Orders</span><span className="muted">{market?.orders.filter(o=>o.status==="OPEN").length ?? 0} orders</span></div>
          <div className="table-wrap"><table><thead><tr><th>Order ID</th><th>Type</th><th>Side</th><th>Price</th><th>Amount</th><th>Status</th></tr></thead><tbody>
            {(market?.orders ?? []).slice(0,10).map(o=><tr key={o.id}><td>{o.id}</td><td>{o.type}</td><td className={o.side==="BUY"?"green":"red"}>{o.side}</td><td>{money(o.price)}</td><td>{qtyFmt(o.remaining)}</td><td>{o.status}</td></tr>)}
          </tbody></table>{!market?.orders.length && <div className="empty">Belum ada limit order. Buat limit order untuk mengisi antrean.</div>}</div>
        </div>
        <div className="panel"><div className="panel-title"><span>Demo Portfolio</span><span className="demo-pill">TEST BALANCE</span></div><div className="panel-body">
          <div className="stat-label">Estimated total asset value</div><div style={{fontSize:27,fontWeight:800,margin:"7px 0 20px"}}>{money((market?.balances.usdt ?? 10000)+(market?.balances.btc ?? .15)*price)} <span style={{fontSize:12,color:"var(--muted)"}}>USDT</span></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"13px 0",borderTop:"1px solid var(--line)"}}><span>Bitcoin (BTC)</span><b>{qtyFmt(market?.balances.btc ?? .15)}</b></div>
          <div style={{display:"flex",justifyContent:"space-between",padding:"13px 0",borderTop:"1px solid var(--line)"}}><span>USDT</span><b>{qtyFmt(market?.balances.usdt ?? 10000)}</b></div>
          <div className="sub">Starting demo balance: 0.15 BTC + 10,000 USDT.</div>
        </div></div>
      </section>
      <div className="footer-note"><b>SIMULATION ONLY:</b> Semua saldo, harga, order, dan transaksi di sini adalah data demo. Tidak ada Bitcoin/USDT sungguhan, deposit, penarikan, atau koneksi ke blockchain. Data order disimpan sementara di memori server dan akan reset ketika server restart.</div>
    </main>
  </div>;
}
