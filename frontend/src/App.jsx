import { useState } from "react";

function Nav({ tab, setTab }) {
  const items = [
    { id: "wallet", label: "Wallet" },
    { id: "send", label: "Send" },
    { id: "history", label: "History" },
  ];
  return (
    <div className="w-full border-b border-white/10 bg-[#0B0F19]">
      <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/40" />
          <span className="font-semibold tracking-wide">LumixPay</span>
        </div>
        <div className="flex gap-2">
          {items.map(i => (
            <button
              key={i.id}
              onClick={() => setTab(i.id)}
              className={`px-3 py-2 rounded-lg text-sm transition ${
                tab === i.id ? "bg-primary/20 text-white" : "text-white/70 hover:text-white/90"
              }`}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ title, children, actions }) {
  return (
    <div className="bg-darkcard/90 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );
}

function WalletScreen() {
  const [pub, setPub] = useState("");
  const [sec, setSec] = useState("");
  const [balances] = useState([{ asset: "USDC (testnet)", amount: "0.00" }, { asset: "XLM", amount: "10.00" }]);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card title="Account">
        <div className="space-y-3">
          <label className="block text-sm text-white/70">Public Key</label>
          <input
            className="w-full rounded-lg bg-[#0A0D14] border border-white/10 px-3 py-2 outline-none focus:border-primary/60"
            placeholder="G... (public key)"
            value={pub}
            onChange={e => setPub(e.target.value)}
          />
          <label className="block text-sm text-white/70">Secret (local dev only)</label>
          <input
            type="password"
            className="w-full rounded-lg bg-[#0A0D14] border border-white/10 px-3 py-2 outline-none focus:border-primary/60"
            placeholder="S... (secret key)"
            value={sec}
            onChange={e => setSec(e.target.value)}
          />
          <p className="text-xs text-white/50">Never share secrets in production. This field exists only for local MVP testing.</p>
        </div>
      </Card>

      <Card title="Balances">
        <ul className="space-y-2">
          {balances.map((b, i) => (
            <li key={i} className="flex items-center justify-between bg-[#0A0D14] border border-white/10 rounded-lg px-3 py-2">
              <span>{b.asset}</span>
              <span className="font-mono">{b.amount}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function SendScreen() {
  const [to, setTo] = useState("");
  const [amt, setAmt] = useState("1.00");
  const [asset, setAsset] = useState("USDC");

  function handleSend(e) {
    e.preventDefault();
    alert(`(demo) Send ${amt} ${asset} to ${to}`);
  }

  return (
    <Card title="Send payment">
      <form onSubmit={handleSend} className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-white/70 mb-1">Destination (public key)</label>
          <input
            className="w-full rounded-lg bg-[#0A0D14] border border-white/10 px-3 py-2 outline-none focus:border-primary/60"
            placeholder="G... destination"
            value={to}
            onChange={e => setTo(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Amount</label>
          <input
            className="w-full rounded-lg bg-[#0A0D14] border border-white/10 px-3 py-2 outline-none focus:border-primary/60"
            placeholder="1.00"
            value={amt}
            onChange={e => setAmt(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm text-white/70 mb-1">Asset</label>
          <select
            className="w-full rounded-lg bg-[#0A0D14] border border-white/10 px-3 py-2 outline-none focus:border-primary/60"
            value={asset}
            onChange={e => setAsset(e.target.value)}
          >
            <option>USDC</option>
            <option>XLM</option>
          </select>
        </div>
        <div className="flex items-end">
          <button className="w-full bg-primary/80 hover:bg-primary text-white rounded-lg px-4 py-2 transition">
            Send
          </button>
        </div>
      </form>
    </Card>
  );
}

function HistoryScreen() {
  const rows = [
    { hash: "…abc123", asset: "USDC", amount: "-12.50", when: "2m ago", status: "success" },
    { hash: "…def456", asset: "XLM", amount: "+10.00", when: "1h ago", status: "success" },
  ];
  return (
    <Card title="Recent activity">
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-[#0B0F19] text-white/70">
            <tr>
              <th className="text-left px-4 py-3">Tx</th>
              <th className="text-left px-4 py-3">Asset</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">When</th>
              <th className="text-left px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className="px-4 py-3 font-mono">{r.hash}</td>
                <td className="px-4 py-3">{r.asset}</td>
                <td className="px-4 py-3">{r.amount}</td>
                <td className="px-4 py-3">{r.when}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded bg-green-500/20 text-green-300 text-xs">{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function App() {
  const [tab, setTab] = useState("wallet");

  return (
    <div className="min-h-screen">
      <Nav tab={tab} setTab={setTab} />
      <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {tab === "wallet" && <WalletScreen />}
        {tab === "send" && <SendScreen />}
        {tab === "history" && <HistoryScreen />}
      </main>
      <footer className="mx-auto max-w-5xl px-4 pb-8 text-xs text-white/40">
        2025 © LumixPay — Dark Fintech MVP UI
      </footer>
    </div>
  );
}

