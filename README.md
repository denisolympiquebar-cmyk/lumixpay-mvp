# 🌐 LumixPay — Cross-Border Payments MVP (Testnet Demo)

[![Deployed on Fly.io](https://img.shields.io/badge/deployed%20on-Fly.io-009cf3?logo=fly.io&logoColor=white)](https://fly.io)
[![Built with Stellar](https://img.shields.io/badge/built%20on-Stellar-07b5e5?logo=stellar&logoColor=white)](https://stellar.org)
[![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)](LICENSE)

> **LumixPay** is a minimal proof-of-concept for seamless on/off-ramp payments between fiat (EUR/KM) and digital assets (USDC on Stellar testnet).  
> It demonstrates how a future cross-border remittance platform can function using anchors, Stellar assets, and local payout instructions.

---

## 🚀 Live Demo

Frontend (React / Vite / Tailwind): [https://lumixpay-frontend.fly.dev](https://lumixpay-frontend.fly.dev)
Backend (Node.js / Express / Stellar SDK): [https://backend-weathered-moon-2556lumixpay-backend.fly.dev](https://backend-weathered-moon-2556lumixpay-backend.fly.dev)

> ⚠️ Demo operates entirely on **Stellar Testnet**.  
> All funds, keys, and operations are for **educational & testing purposes only**.

---

## 🧭 Overview

This MVP covers the full simulated flow:

1. **Wallet creation** — auto-funded via friendbot.  
2. **Trustline setup** — adds trust for custom asset (USDC).  
3. **Mint** — issuer account sends test USDC to the wallet.  
4. **Send** — user sends XLM or USDC to another address.  
5. **Convert** — mock FX (EUR ⇄ USDC) via `/convert` endpoint.  
6. **Payout request** — logs a local “withdrawal” event.  
7. **Anchor withdraw simulation** — endpoint `/anchor/withdraw`.  
8. **History** — persistent transaction records stored on Fly volume.

---

## 💻 How to Test

### 1. Wallet Setup
- Go to **Wallet** tab → click **Create Wallet**.  
  → Backend uses `friendbot` to fund the new account.  
- Add trustline (`Add USDC`)  
- Mint test balance (`Mint 50 USDC`)  
- Check balance — XLM + USDC will appear.

### 2. Send Assets
- Open **Send** tab.  
- Use your wallet secret (temporary, demo only).  
- Enter destination public key (create a second wallet to test).  
- Select asset and amount, then click **Send**.  
- Toast notification shows TX hash — link opens on Stellar Expert.

### 3. Convert (On-Ramp Simulation)
- Go to **Convert** tab.  
- Choose `From: EUR → To: USDC`, enter amount (e.g., 100).  
- Click **Convert** → backend simulates a fixed FX rate.  
- Conversion details and transaction ID appear below.

### 4. Payout & Anchor Withdraw (Off-Ramp Simulation)
- Fill in recipient info (name, account/IBAN, note).  
- Click **Generate payout instruction** — creates a mock payout log.  
- Optionally click **Send to anchor withdraw** — creates a simulated SEP-24 withdraw event.

### 5. History
- The **History** tab shows all recorded actions:
  - `create_account`, `trustline`, `mint`, `send`
  - `convert`, `payout_request`, `anchor_withdraw`
- Data persists in `/data/history.json` on the Fly volume.

---

## 🧩 Architecture

| Layer | Stack | Description |
|-------|--------|-------------|
| **Frontend** | React + Vite + Tailwind | Minimal PWA-ready UI with toast feedback, state hooks, and dynamic API env. |
| **Backend** | Node.js + Express + Stellar SDK | Handles account ops, asset issuance, mock FX and payouts. |
| **Persistence** | Fly.io Volume | Stores `history.json` (persistent ledger of all actions). |
| **Blockchain** | Stellar Testnet (Horizon API) | Real on-chain ops for accounts, trustlines, and transfers. |

---

## ⚙️ Deployment Summary

### Backend (`/backend`)
```bash
fly launch --name backend-lumixpay --region cdg
fly volumes create history_data --region cdg --size 1
fly secrets set PORT=3001 ASSET_CODE=USDC ISSUER_SECRET=YOUR_ISSUER_SECRET
fly deploy


## ⚡ Quickstart

For local testing or review:

```bash
# clone repo
git clone https://github.com/denisolympiquebar-cmyk/lumixpay-mvp.git
cd lumixpay-mvp

# setup environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# install dependencies
npm install --prefix backend
npm install --prefix frontend

# run locally
npm run dev --prefix backend
npm run dev --prefix frontend


## 👤 Author

**Denis Barukčić**  
Founder, [Bubblegum Labs](https://bubblegumlabs.xyz)  
Creator of [CryptoAdriatic.com](https://cryptoadriatic.com)  

---

## 📜 License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.
