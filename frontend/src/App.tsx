import React, { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { apiFetch } from "./api/client";
import { RulesPage } from "./pages/RulesPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { BrokerConsolePage } from "./pages/BrokerConsolePage";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const App: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);

  const checkAuth = async () => {
    try {
      const me = await apiFetch<UserInfo>("/api/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const quickLogin = async (email: string, password: string) => {
    const u = await apiFetch<UserInfo>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(u);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <nav className="border-b border-slate-800 bg-slate-900 px-6 py-3">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <span className="text-lg font-bold tracking-tight text-emerald-400">TradeFlow</span>
              <div className="flex gap-4 text-sm font-medium text-slate-300">
                <Link to="/rules" className="hover:text-white">Rules</Link>
                <Link to="/approvals" className="hover:text-white">Approvals</Link>
                <Link to="/broker" className="hover:text-white">Broker Console</Link>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs">
              {user ? (
                <span className="rounded-full bg-slate-800 px-3 py-1 text-slate-300">
                  {user.name} ({user.role})
                </span>
              ) : (
                <span className="text-slate-400">Not signed in</span>
              )}
              <button onClick={() => quickLogin("demo@tradeflow.in", "Demo1234!")} className="rounded bg-slate-800 px-2.5 py-1 hover:bg-slate-700">
                Demo Client
              </button>
              <button onClick={() => quickLogin("broker@tradeflow.in", "Broker1234!")} className="rounded bg-slate-800 px-2.5 py-1 hover:bg-slate-700">
                Demo Broker
              </button>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-6xl p-6">
          <Routes>
            <Route path="/" element={<ApprovalsPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/broker" element={<BrokerConsolePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
