import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import StellarSdk from "@stellar/stellar-sdk";

dotenv.config();

const {
  Keypair,
  Horizon,            // ⬅️ koristimo Horizon.Server
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
} = StellarSdk;

const app = express();
app.use(cors());
app.use(express.json());

// Horizon (TESTNET)
const horizon = new Horizon.Server("https://horizon-testnet.stellar.org");

// Health
app.get("/", (_req, res) => res.send("LumixPay backend (Horizon) ✅"));

// 1) Create & fund testnet account (friendbot)
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

// 2) Fetch balances
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

// 3) Send payment (XLM default; za USDC prosledi assetCode+assetIssuer)
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
    res.json({ ok: true, hash: resp.hash });
  } catch (err) {
    console.error("❌ send error:", err.response?.data || err);
    res.status(500).json({ error: "Payment failed", detail: err.response?.data || String(err) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ LumixPay backend running on ${PORT}`));
