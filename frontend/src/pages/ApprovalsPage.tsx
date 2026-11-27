import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

interface Order {
  order_id: string;
  version: number;
  payload_hash: string;
  symbol: string;
  name: string;
  side: "BUY" | "SELL";
  quantity: number;
  order_type: string;
  indicative_price: { value: string; source: string; as_of: string; status: string };
  estimated_total: string;
  charges: string;
  expires_at: string;
  status: string;
  required_approvals: string[];
  approvals_received: string[];
}

export const ApprovalsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Order[]>("/api/orders");
      setOrders(data);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleApprove = async (order: Order) => {
    try {
      const idempotencyKey = `ui-${order.order_id}-v${order.version}-${Date.now()}`;
      await apiFetch(`/api/orders/${order.order_id}/approve`, {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({
          version: order.version,
          payload_hash: order.payload_hash,
          method: "UI",
        }),
      });
      await loadOrders();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Approval failed");
    }
  };

  const handleReject = async (orderId: string) => {
    try {
      await apiFetch(`/api/orders/${orderId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: "Declined by user" }),
      });
      await loadOrders();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Rejection failed");
    }
  };

  const pending = orders.filter((o) => o.status === "PENDING_APPROVAL");
  const history = orders.filter((o) => o.status !== "PENDING_APPROVAL");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Order Approvals & History</h1>
          <p className="text-sm text-slate-400">Every order requires explicit confirmation with a 5-minute expiry and idempotent execution.</p>
        </div>
        <button onClick={loadOrders} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700">
          Refresh
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-300">{error}</div>}

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-lg font-semibold text-white">Pending Approvals ({pending.length})</h2>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : pending.length === 0 ? (
          <p className="text-sm text-slate-400">No orders waiting for approval.</p>
        ) : (
          <div className="space-y-3">
            {pending.map((o) => (
              <div key={o.order_id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${o.side === "BUY" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"}`}>
                      {o.side}
                    </span>
                    <span className="font-semibold text-white">{o.quantity} × {o.symbol}</span>
                    <span className="text-xs text-slate-400">({o.indicative_price.source.toUpperCase()})</span>
                  </div>
                  <div className="text-sm text-slate-300">
                    Price: ₹{o.indicative_price.value} | Total: ₹{o.estimated_total} + ₹{o.charges} charges
                  </div>
                  <div className="text-xs text-slate-500">
                    Expires: {new Date(o.expires_at).toLocaleTimeString()} | Approvals: {o.approvals_received.join(", ") || "None"} / {o.required_approvals.join(", ")}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!o.approvals_received.includes("CLIENT") ? (
                    <>
                      <button onClick={() => handleApprove(o)} className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
                        Approve
                      </button>
                      <button onClick={() => handleReject(o.order_id)} className="rounded-lg bg-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-600">
                        Reject
                      </button>
                    </>
                  ) : (
                    <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-300">
                      Waiting for Broker
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-lg font-semibold text-white">Order History</h2>
        {history.length === 0 ? (
          <p className="text-sm text-slate-400">No completed orders yet.</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {history.map((o) => (
              <div key={o.order_id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <span className="font-medium text-white">{o.side} {o.quantity} {o.symbol}</span>{" "}
                  <span className="text-slate-400">@ ₹{o.indicative_price.value} (₹{o.estimated_total})</span>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  o.status === "FILLED" ? "bg-emerald-500/20 text-emerald-300" :
                  o.status === "REJECTED" ? "bg-rose-500/20 text-rose-300" :
                  "bg-slate-700 text-slate-300"
                }`}>{o.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
