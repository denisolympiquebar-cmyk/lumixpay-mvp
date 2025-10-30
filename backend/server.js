import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import StellarSdk from "@stellar/stellar-sdk";

dotenv.config();

const {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} = StellarSdk;

const app = express();
app.use(cors());
app.use(express.json());

// ---------- simple history store (JSON file) ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const HISTORY_PATH = path.join(__dirname, "history.json");

function readHistory() {
  try {
    const txt = fs.readFileSync(HISTORY_PATH, "utf8");
    return JSON.parse(txt);
  } catch {
    return [];
  }
}
function writeHistory(items) {
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(items, null, 2));
}
function logEvent(type, payload) {
  const items = readHistory();
  items.push({
    id: crypto.randomUUID?.() ?? `${Date.now()}`,
    type,
    at: new Date().toISOString(),
    ...payload,
  });
  writeHistory(items);
  return items.at(-1);
}

// ---------- Stellar (TESTNET) ----------
const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

// Health
app.get("/", (_req, res) => res.send("LumixPay backend (Horizon) ✅"));

// Create & fund testnet account
app.post("/create-account", async (_req, res) => {
  try {
    const kp = Keypair.random();
    const fb = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(kp.publicKey())}`
    );
    if (!fb.ok) {
      const text = await fb.text();
      throw new Error(`Friendbot failed: ${fb.status} ${text}`);
    }

    logEvent("create_account", { publicKey: kp.publicKey() });

    return res.json({
      publicKey: kp.publicKey(),
      secretKey: kp.secret(), // ⚠️ samo za lokalni MVP
      funded: true,
    });
  } catch (err) {
    console.error("❌ create-account error:", err);
    res.status(500).json({ error: err.message || "Account creation failed" });
  }
});

// Fetch balances
app.get("/balance/:pub", async (req, res) => {
  try {
    const { pub } = req.params;
    const account = await horizon.loadAccount(pub);
    const balances = account.balances.map((b) => ({
      asset: b.asset_type === "native" ? "XLM" : b.asset_code,
      amount: b.balance,
    }));
    res.json({ pub, balances });
  } catch (err) {
    console.error("❌ balance error:", err);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// Send payment (XLM default; za issued asset prosledi assetCode+assetIssuer)
app.post("/send", async (req, res) => {
  try {
    const { secret, to, amount, assetCode, assetIssuer } = req.body;
    if (!secret || !to || !amount) {
      return res.status(400).json({ error: "secret, to, amount are required" });
    }

    const sender = Keypair.fromSecret(secret);
    const sourceAccount = await horizon.loadAccount(sender.publicKey());
    const asset =
      assetCode && assetIssuer
        ? new Asset(assetCode, assetIssuer)
        : Asset.native();

    const tx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          destination: to,
          asset,
          amount: String(amount),
        })
      )
      .setTimeout(60)
      .build();

    tx.sign(sender);
    const resp = await horizon.submitTransaction(tx);

    logEvent("send", {
      from: sender.publicKey(),
      to,
      amount: String(amount),
      asset: asset.isNative() ? "XLM" : `${asset.getCode()}:${asset.getIssuer()}`,
      hash: resp.hash,
    });

    res.json({ ok: true, hash: resp.hash });
  } catch (err) {
    console.error("❌ send error:", err.response?.data || err);
    res.status(500).json({ error: "Payment failed", detail: err.response?.data || String(err) });
  }
});

// ---------- Convert (SIMULACIJA fiat ⇄ stable) ----------
/**
 * body: { from: "EUR"|"USDC", to: "USDC"|"EUR", amount: number }
 * vraća: { ok, txType:"convert", rate, amountOut }
 * Napomena: ovdje NE radimo pravi on/off-ramp – ovo je MVP simulacija.
 */
app.post("/convert", async (req, res) => {
  try {
    const { from, to, amount } = req.body || {};
    if (!from || !to || !amount) {
      return res.status(400).json({ error: "from, to, amount are required" });
    }
    if (from === to) return res.status(400).json({ error: "from and to must differ" });

    // Jednostavan mock kurs – kasnije zamijeniti pravim FX izvorom / Anchor API
    // EUR -> USDC ~1.02  |  USDC -> EUR ~0.98
    const rates = {
      "EUR>USDC": 1.02,
      "USDC>EUR": 0.98,
    };
    const key = `${from}>${to}`;
    const rate = rates[key] ?? 1.0;
    const amountOut = Number((Number(amount) * rate).toFixed(2));

    const ev = logEvent("convert", { from, to, amount: Number(amount), rate, amountOut });

    return res.json({
      ok: true,
      txType: "convert",
      from,
      to,
      amountIn: Number(amount),
      rate,
      amountOut,
      id: ev.id,
    });
  } catch (err) {
    console.error("❌ convert error:", err);
    res.status(500).json({ error: "Conversion failed" });
  }
});

// History (najnovije prvo)
app.get("/history", (_req, res) => {
  const items = readHistory().sort((a, b) => b.at.localeCompare(a.at));
  res.json(items);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ LumixPay backend running on ${PORT}`));
