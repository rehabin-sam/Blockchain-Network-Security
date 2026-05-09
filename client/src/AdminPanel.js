import React, { useState } from "react";
import {
  KeyRound,
  LoaderCircle,
  Search,
  ShieldAlert,
  ShieldCog,
  UserCheck,
  UserX,
} from "lucide-react";

const shortAddress = (value = "") =>
  value ? `${value.slice(0, 6)}...${value.slice(-4)}` : "unknown";

export default function AdminPanel({
  contract,
  account,
  isAdmin,
  adminAddress,
  onAuditEvent,
}) {
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);

  const authorize = async () => {
    if (!isAdmin) {
      setStatus("Switch MetaMask to the contract admin wallet");
      return;
    }

    if (!isValidAddress(address)) {
      setStatus("Invalid wallet address");
      return;
    }

    try {
      setLoading(true);
      setStatus("Authorizing wallet...");

      await contract.methods.authorizeUser(address).send({ from: account });

      setStatus("Wallet authorized");
      onAuditEvent?.({ action: "USER_AUTHORIZED", address });
    } catch {
      setStatus("Authorization failed");
    } finally {
      setLoading(false);
    }
  };

  const revoke = async () => {
    if (!isAdmin) {
      setStatus("Switch MetaMask to the contract admin wallet");
      return;
    }

    if (!isValidAddress(address)) {
      setStatus("Invalid wallet address");
      return;
    }

    try {
      setLoading(true);
      setStatus("Revoking wallet...");

      await contract.methods.revokeUser(address).send({ from: account });

      setStatus("Wallet revoked");
      onAuditEvent?.({ action: "USER_REVOKED", address });
    } catch {
      setStatus("Revocation failed");
    } finally {
      setLoading(false);
    }
  };

  const check = async () => {
    if (!isValidAddress(address)) {
      setStatus("Invalid wallet address");
      return;
    }

    try {
      const result = await contract.methods.authorized(address).call();

      setStatus(result ? "Wallet is authorized" : "Wallet is not authorized");
    } catch {
      setStatus("Authorization lookup failed");
    }
  };

  return (
    <section className="rounded-lg border border-slate-800/80 bg-slate-950/70 p-5 shadow-2xl shadow-cyan-950/10 backdrop-blur-xl transition duration-300 hover:border-cyan-400/45 hover:bg-slate-950/85">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.12)]">
            <ShieldCog size={22} />
          </div>
          <div>
            <h2 className="font-semibold text-white">Administrator Console</h2>
            <p className="text-sm text-slate-500">
              {isAdmin
                ? "Wallet authorization and revocation controls"
                : `Locked. Admin wallet: ${shortAddress(adminAddress)}`}
            </p>
          </div>
        </div>

        {(status || !isAdmin) && (
          <div className="inline-flex items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-sm text-slate-300">
            {loading ? (
              <LoaderCircle size={16} className="animate-spin text-cyan-300" />
            ) : !isAdmin ? (
              <ShieldAlert size={16} className="text-amber-300" />
            ) : (
              <KeyRound size={16} className="text-cyan-300" />
            )}
            {status || "Admin controls locked"}
          </div>
        )}
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
        <div className="relative">
          <KeyRound
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            placeholder="Enter wallet address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 py-3 pl-10 pr-3 font-mono text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:flex xl:flex-wrap">
          <button
            onClick={authorize}
            disabled={loading || !isAdmin}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-300 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserCheck size={17} />
            Authorize
          </button>

          <button
            onClick={revoke}
            disabled={loading || !isAdmin}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-400 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-rose-950/20 transition duration-300 hover:-translate-y-0.5 hover:bg-rose-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserX size={17} />
            Revoke
          </button>

          <button
            onClick={check}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-sm font-bold text-cyan-100 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search size={17} />
            Check
          </button>
        </div>
      </div>
    </section>
  );
}
