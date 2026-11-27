import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

interface Rule {
  id: string;
  symbol: string;
  condition: "PRICE_ABOVE" | "PRICE_BELOW";
  target_price: string;
  status: "ACTIVE" | "PAUSED" | "TRIGGERED";
  last_triggered_at: string | null;
  created_at: string;
}

interface Notification {
  id: string;
  type: string;
  message: string;
  read_at: string | null;
  created_at: string;
}

const SYMBOLS = ["INFY", "TCS", "RELIANCE", "HDFCBANK", "ICICIBANK", "TATAMOTORS", "ITC", "SBIN", "BHARTIARTL", "WIPRO"];

export const RulesPage: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [symbol, setSymbol] = useState("TCS");
  const [condition, setCondition] = useState<"PRICE_BELOW" | "PRICE_ABOVE">("PRICE_BELOW");
  const [targetPrice, setTargetPrice] = useState("3500");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [r, n] = await Promise.all([
        apiFetch<Rule[]>("/api/rules"),
        apiFetch<Notification[]>("/api/notifications"),
      ]);
      setRules(r);
      setNotifications(n);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load rules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch("/api/rules", {
        method: "POST",
        body: JSON.stringify({ symbol, condition, target_price: Number(targetPrice) }),
      });
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create rule");
    }
  };

  const handlePauseToggle = async (id: string) => {
    try {
      await apiFetch(`/api/rules/${id}/pause`, { method: "POST" });
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to toggle rule");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/rules/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete rule");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Conditional Alerts & Rules</h1>
          <p className="text-sm text-slate-400">Evaluated every 30s against verified market data; stale data never triggers.</p>
        </div>
        <button onClick={loadData} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700">
          Refresh
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-300">{error}</div>}

      <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs text-slate-400">Symbol</label>
          <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white">
            {SYMBOLS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Condition</label>
          <select value={condition} onChange={(e) => setCondition(e.target.value as "PRICE_BELOW" | "PRICE_ABOVE")} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white">
            <option value="PRICE_BELOW">Price Below (₹)</option>
            <option value="PRICE_ABOVE">Price Above (₹)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-400">Target Price (₹)</label>
          <input type="number" step="0.01" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white" required />
        </div>
        <div className="flex items-end">
          <button type="submit" className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
            Create Alert
          </button>
        </div>
      </form>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-lg font-semibold text-white">Your Rules</h2>
        {loading ? (
          <p className="text-sm text-slate-400">Loading rules...</p>
        ) : rules.length === 0 ? (
          <p className="text-sm text-slate-400">No conditional rules configured.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {rules.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-4 py-3">
                <div>
                  <span className="font-semibold text-white">{r.symbol}</span>{" "}
                  <span className="text-sm text-slate-300">
                    {r.condition === "PRICE_BELOW" ? "drops below" : "rises above"} ₹{r.target_price}
                  </span>
                  <div className="text-xs text-slate-500">Created {new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    r.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-300" :
                    r.status === "TRIGGERED" ? "bg-amber-500/20 text-amber-300" :
                    "bg-slate-700 text-slate-300"
                  }`}>{r.status}</span>
                  {r.status !== "TRIGGERED" && (
                    <button onClick={() => handlePauseToggle(r.id)} className="rounded bg-slate-800 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700">
                      {r.status === "ACTIVE" ? "Pause" : "Resume"}
                    </button>
                  )}
                  <button onClick={() => handleDelete(r.id)} className="rounded bg-red-900/40 px-2.5 py-1 text-xs text-red-300 hover:bg-red-900/70">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-lg font-semibold text-white">Recent Alert Notifications</h2>
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-400">No notifications yet.</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-center justify-between rounded-lg bg-slate-800/60 px-3 py-2 text-sm">
                <span className="text-slate-200">{n.message}</span>
                <span className="text-xs text-slate-500">{new Date(n.created_at).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
