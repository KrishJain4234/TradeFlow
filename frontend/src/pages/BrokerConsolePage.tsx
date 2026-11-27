import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/client";

interface BrokerClient {
  id: string;
  name: string;
  email: string;
}

interface BrokerRequest {
  order_id: string;
  client_id: string;
  client_name: string;
  symbol: string;
  side: string;
  quantity: number;
  indicative_price: string;
  estimated_total: string;
  status: string;
  required_approvals: string[];
  approvals_received: string[];
  expires_at: string;
}

interface AuditEvent {
  id: string;
  actor_id: string;
  event_type: string;
  entity_id: string;
  timestamp: string;
  event_hash: string;
}

export const BrokerConsolePage: React.FC = () => {
  const [clients, setClients] = useState<BrokerClient[]>([]);
  const [requests, setRequests] = useState<BrokerRequest[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadConsole = async () => {
    try {
      const [c, r, a] = await Promise.all([
        apiFetch<BrokerClient[]>("/api/broker/clients"),
        apiFetch<BrokerRequest[]>("/api/broker/requests"),
        apiFetch<AuditEvent[]>("/api/audit"),
      ]);
      setClients(c);
      setRequests(r);
      setAuditEvents(a);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Broker console requires BROKER role login.");
    }
  };

  useEffect(() => {
    loadConsole();
  }, []);

  const handleDecision = async (orderId: string, action: "approve" | "reject") => {
    try {
      await apiFetch(`/api/broker/requests/${orderId}/${action}`, {
        method: "POST",
        body: action === "reject" ? JSON.stringify({ reason: "Declined by broker" }) : undefined,
      });
      await loadConsole();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : `Failed to ${action}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Broker Console</h1>
          <p className="text-sm text-slate-400">Tenant-isolated client queue, dual-approval execution, and hash-chained audit trail.</p>
        </div>
        <button onClick={loadConsole} className="rounded-lg bg-slate-800 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-700">
          Refresh
        </button>
      </div>

      {error && <div className="rounded-lg border border-amber-500/40 bg-amber-950/40 p-3 text-sm text-amber-300">{error}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 text-lg font-semibold text-white">Assigned Clients ({clients.length})</h2>
          <ul className="space-y-2">
            {clients.map((c) => (
              <li key={c.id} className="rounded-lg bg-slate-800/60 p-3 text-sm">
                <div className="font-medium text-white">{c.name}</div>
                <div className="text-xs text-slate-400">{c.email}</div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 lg:col-span-2">
          <h2 className="mb-3 text-lg font-semibold text-white">Client Approval Queue</h2>
          {requests.length === 0 ? (
            <p className="text-sm text-slate-400">No client requests in queue.</p>
          ) : (
            <div className="space-y-3">
              {requests.map((r) => (
                <div key={r.order_id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-700 bg-slate-800/50 p-3">
                  <div>
                    <div className="font-semibold text-white">
                      {r.client_name} — {r.side} {r.quantity} {r.symbol}
                    </div>
                    <div className="text-xs text-slate-400">
                      Total: ₹{r.estimated_total} | Status: {r.status} | Received: {r.approvals_received.join(", ")}
                    </div>
                  </div>
                  {r.status === "PENDING_APPROVAL" ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleDecision(r.order_id, "approve")} className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500">
                        Approve
                      </button>
                      <button onClick={() => handleDecision(r.order_id, "reject")} className="rounded bg-rose-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-600">
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="rounded-full bg-slate-700 px-2.5 py-0.5 text-xs text-slate-300">{r.status}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-lg font-semibold text-white">Audit Trail (SHA-256 Hash-Chained)</h2>
        <div className="max-h-64 space-y-1.5 overflow-y-auto text-xs">
          {auditEvents.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between rounded bg-slate-800/40 px-3 py-1.5 font-mono">
              <span className="text-emerald-400">{ev.event_type}</span>
              <span className="text-slate-400">{ev.entity_id}</span>
              <span className="text-slate-500">{ev.event_hash.slice(0, 14)}...</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
