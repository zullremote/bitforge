# BitForge — Bitcoin Exchange Prototype

A Binance-inspired **simulation-only** BTC/USDT exchange UI and matching-engine starter.

## Current scope
- Responsive exchange dashboard with simulated BTC/USDT price chart.
- Market and limit order form.
- In-memory order book and matching engine (demo data resets when the server restarts).
- Virtual BTC/USDT balances and trade history.
- Admin-style overview panel.
- No deposits, withdrawals, private keys, or real cryptocurrency transactions.

## Requirements
- Ubuntu VPS
- Node.js 20+
- npm

## Run locally/on VPS
```bash
unzip bitcoin-exchange-prototype.zip
cd bitcoin-exchange-prototype
npm install
npm run dev
```
Open `http://SERVER_IP:3000`.

For a production build:
```bash
npm run build
npm run start
```

## Docker
```bash
cp .env.example .env
# Edit .env and set a long random SESSION_SECRET
docker compose up -d --build
```
Then open `http://SERVER_IP:3000`.

## Important prototype limitations
This starter is not a production exchange. Orders and balances are in-memory demo state, there is no real account/session system, and it is not suitable for real funds or public financial services. Before exposing it publicly, add proper authentication, database transactions, rate limiting, audit logs, TLS/reverse proxy, backups, monitoring, and a security review. Keep all balances virtual.
