import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CircleCheck,
  CircleX,
  Cpu,
  Database,
  FileClock,
  Gauge,
  LockKeyhole,
  Network,
  Radio,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  TriangleAlert,
  UserCheck,
  UserX,
  Wallet,
  Zap,
} from "lucide-react";
import useTransactionHandler from "./hooks/useTransactionHandler";
import AdminPanel from "./AdminPanel";

const shortAddress = (value = "") =>
  value ? `${value.slice(0, 6)}...${value.slice(-4)}` : "0x0000...0000";

const shortHash = (value = "") =>
  value ? `${value.slice(0, 14)}...${value.slice(-8)}` : "pending";

const surfaceClass =
  "rounded-lg border border-slate-800/80 bg-slate-950/70 shadow-2xl shadow-cyan-950/10 backdrop-blur-xl transition duration-300 hover:border-cyan-400/40 hover:bg-slate-950/85";

const compactSurfaceClass =
  "rounded-lg border border-slate-800/80 bg-slate-950/65 backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-cyan-400/45 hover:shadow-lg hover:shadow-cyan-950/20";

const emptyAlerts = [
  {
    msg: "No active contract denials detected",
    level: "low",
    source: "AccessControl.sol",
    time: "Live",
  },
];

const actionStyles = {
  ACCESS_GRANTED: {
    icon: CircleCheck,
    label: "ACCESS_GRANTED",
    className: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
    risk: "Low",
  },
  ACCESS_DENIED: {
    icon: CircleX,
    label: "ACCESS_DENIED",
    className: "border-rose-400/25 bg-rose-400/10 text-rose-200",
    risk: "High",
  },
  USER_AUTHORIZED: {
    icon: UserCheck,
    label: "USER_AUTHORIZED",
    className: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
    risk: "Low",
  },
  USER_REVOKED: {
    icon: UserX,
    label: "USER_REVOKED",
    className: "border-amber-400/25 bg-amber-400/10 text-amber-200",
    risk: "Medium",
  },
};

export default function Dashboard({ contract, account }) {
  const { transactions, alerts } = useTransactionHandler(contract, account);
  const [txStatus, setTxStatus] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminAddress, setAdminAddress] = useState("");
  const [adminAuditLogs, setAdminAuditLogs] = useState([]);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const admin = await contract.methods.admin().call();
        setAdminAddress(admin);
        setIsAdmin(admin.toLowerCase() === account.toLowerCase());
      } catch (err) {
        console.error("Failed to check contract admin:", err);
        setAdminAddress("");
        setIsAdmin(false);
      }
    };

    if (contract && account) checkAdmin();
  }, [contract, account]);

  const failedTransactions = transactions.filter(
    (tx) => tx.status !== "success"
  ).length;
  const successfulTransactions = transactions.length - failedTransactions;
  const successRate = transactions.length
    ? Math.round((successfulTransactions / transactions.length) * 100)
    : 100;

  const handleAdminAuditEvent = (event) => {
    setAdminAuditLogs((current) => [
      {
        id: `admin-${Date.now()}`,
        user: event.address,
        action: event.action,
        gas: "wallet",
        validator: "Admin",
        block: "pending",
        risk: actionStyles[event.action].risk,
        time: "Just now",
      },
      ...current,
    ]);
  };

  const alertFeed = useMemo(() => {
    if (!alerts.length) return emptyAlerts;

    return alerts.slice(0, 8).map((alert, index) => ({
      ...alert,
      source: "AccessDenied event",
      time: index === 0 ? "Just now" : `${index + 1}m ago`,
    }));
  }, [alerts]);

  const auditLogs = useMemo(() => {
    const accessLogs = transactions.slice(0, 12).map((tx, index) => ({
      ...tx,
      action: tx.status === "success" ? "ACCESS_GRANTED" : "ACCESS_DENIED",
      validator: `Node-${String(index + 1).padStart(2, "0")}`,
      block: 54210 + index,
      risk: tx.status === "success" ? "Low" : "High",
      time: index === 0 ? "Live" : `${index + 2}m ago`,
    }));

    return [...adminAuditLogs, ...accessLogs].slice(0, 16);
  }, [adminAuditLogs, transactions]);

  const metrics = [
    {
      label: "Events",
      value: transactions.length,
      detail: "on-chain access events",
      icon: Activity,
      tone: "text-cyan-300",
    },
    {
      label: "Blocks",
      value: 54,
      detail: "validated audit depth",
      icon: Database,
      tone: "text-emerald-300",
    },
    {
      label: "Alerts",
      value: alerts.length,
      detail: `${failedTransactions} denied requests`,
      icon: ShieldAlert,
      tone: "text-amber-300",
    },
    {
      label: "Wallet",
      value: "100 ETH",
      detail: "SOC treasury balance",
      icon: Wallet,
      tone: "text-sky-300",
    },
  ];

  const sensorHealth = [
    { name: "RPC listener", value: 98, tone: "bg-cyan-300" },
    { name: "Event indexer", value: 94, tone: "bg-emerald-300" },
    { name: "Audit writer", value: 90, tone: "bg-sky-300" },
    { name: "Threat rules", value: alerts.length ? 82 : 96, tone: "bg-amber-300" },
  ];

  const runAccessRequest = async () => {
    try {
      setTxStatus("Awaiting wallet signature");
      await contract.methods.requestAccess().send({ from: account });
      setTxStatus("Access request confirmed");
    } catch {
      setTxStatus("Access request rejected");
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#05070b] text-slate-100">
      <div className="pointer-events-none fixed inset-0 opacity-60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.12),transparent_28%),radial-gradient(circle_at_85%_8%,rgba(16,185,129,0.10),transparent_24%),linear-gradient(rgba(148,163,184,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.035)_1px,transparent_1px)] bg-[length:auto,auto,48px_48px,48px_48px]" />
      </div>

      <header className="relative border-b border-slate-800/80 bg-slate-950/75 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8 2xl:px-10">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-cyan-300/40 bg-cyan-300/10 text-cyan-200 shadow-lg shadow-cyan-950/50">
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.95)]" />
              <ShieldCheck size={26} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-300">
                SOC Command Center
              </p>
              <h1 className="truncate text-2xl font-bold text-white md:text-3xl">
                Blockchain Network Security Monitor
              </h1>
            </div>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-3 xl:min-w-[620px]">
            <StatusChip
              icon={Radio}
              label="Telemetry"
              value="Live"
              tone="emerald"
              pulse
            />
            <StatusChip
              icon={Network}
              label="Network"
              value="Hardened"
              tone="cyan"
            />
            <div className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-700/80 bg-slate-900/80 px-3 py-2">
              <LockKeyhole size={17} className="shrink-0 text-cyan-300" />
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                  Active wallet
                </p>
                <p className="truncate font-mono text-slate-200">
                  {shortAddress(account)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative space-y-5 px-4 py-5 sm:px-6 xl:px-8 2xl:px-10">
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.6fr)_minmax(340px,0.55fr)] 2xl:grid-cols-[minmax(0,1.8fr)_minmax(380px,0.52fr)]">
          <div className={`${surfaceClass} overflow-hidden p-5 sm:p-6`}>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
              <div className="min-w-0">
                <p className="mb-3 inline-flex items-center gap-2 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  <Network size={14} />
                  Protected contract perimeter
                </p>
                <h2 className="text-3xl font-bold text-white 2xl:text-4xl">
                  Access-control intelligence layer
                </h2>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-400">
                  Monitoring wallet authorization, denied access events, gas
                  anomalies, and immutable audit evidence from the blockchain.
                </p>
              </div>

              <button
                className="group inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/50 transition duration-300 hover:-translate-y-0.5 hover:bg-cyan-200 hover:shadow-cyan-400/20 focus:outline-none focus:ring-2 focus:ring-cyan-100"
                onClick={runAccessRequest}
              >
                <Zap size={18} className="transition group-hover:rotate-12" />
                Simulate Access Request
              </button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3 2xl:grid-cols-[0.8fr_0.8fr_1.4fr]">
              <SignalTile
                icon={CircleCheck}
                label="Success Rate"
                value={`${successRate}%`}
                tone="emerald"
              />
              <SignalTile
                icon={Gauge}
                label="Risk Posture"
                value={alerts.length ? "Elevated" : "Nominal"}
                tone={alerts.length ? "amber" : "cyan"}
              />
              <SignalTile
                icon={Terminal}
                label="Last Action"
                value={txStatus || "Ready for simulation"}
                tone="sky"
                truncate
              />
            </div>
          </div>

          <SensorHealth sensors={sensorHealth} />
        </section>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <div key={metric.label} className={`${compactSurfaceClass} p-4`}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                      {metric.label}
                    </p>
                    <h2 className="mt-2 text-2xl font-bold text-white">
                      {metric.value}
                    </h2>
                  </div>
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-slate-700/80 bg-slate-900 ${metric.tone}`}
                  >
                    <Icon size={21} />
                  </div>
                </div>
                <p className="mt-3 truncate text-sm text-slate-500">
                  {metric.detail}
                </p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(360px,0.44fr)_minmax(0,1fr)]">
          <AlertFeed alerts={alertFeed} />
          <AuditLogTable logs={auditLogs} />
        </section>

        <AdminPanel
          contract={contract}
          account={account}
          isAdmin={isAdmin}
          adminAddress={adminAddress}
          onAuditEvent={handleAdminAuditEvent}
        />
      </main>
    </div>
  );
}

function StatusChip({ icon: Icon, label, value, tone, pulse = false }) {
  const tones = {
    cyan: "border-cyan-400/25 bg-cyan-400/10 text-cyan-200",
    emerald: "border-emerald-400/25 bg-emerald-400/10 text-emerald-200",
  };

  return (
    <div className={`flex items-center gap-3 rounded-lg border px-3 py-2 ${tones[tone]}`}>
      <span
        className={`grid h-8 w-8 place-items-center rounded-md bg-slate-950/60 ${
          pulse ? "shadow-[0_0_18px_rgba(110,231,183,0.35)]" : ""
        }`}
      >
        <Icon size={16} className={pulse ? "animate-pulse" : ""} />
      </span>
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] opacity-70">
          {label}
        </p>
        <p className="font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function SignalTile({ icon: Icon, label, value, tone, truncate = false }) {
  const tones = {
    amber: "text-amber-300 hover:border-amber-300/50",
    cyan: "text-cyan-300 hover:border-cyan-300/50",
    emerald: "text-emerald-300 hover:border-emerald-300/50",
    sky: "text-sky-300 hover:border-sky-300/50",
  };

  return (
    <div
      className={`rounded-lg border border-slate-800 bg-slate-900/70 p-4 transition duration-300 hover:-translate-y-0.5 ${tones[tone]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-slate-400">{label}</span>
        <Icon size={18} />
      </div>
      <p
        className={`mt-3 text-2xl font-bold text-white ${
          truncate ? "truncate" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SensorHealth({ sensors }) {
  return (
    <div className={`${surfaceClass} p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white">Sensor Health</h2>
          <p className="mt-1 text-sm text-slate-500">Consensus node mesh</p>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-400/25 bg-cyan-400/10 text-cyan-300">
          <Cpu size={22} />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        {sensors.map((sensor) => (
          <div key={sensor.name}>
            <div className="mb-2 flex items-center justify-between gap-4 text-sm">
              <span className="text-slate-300">{sensor.name}</span>
              <span className="font-mono text-cyan-200">{sensor.value}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/90">
              <div
                className={`h-full rounded-full ${sensor.tone} shadow-[0_0_14px_rgba(34,211,238,0.35)] transition-all duration-700`}
                style={{ width: `${sensor.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertFeed({ alerts }) {
  return (
    <div className={`${surfaceClass} p-5`}>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-white">Alert Feed</h2>
          <p className="mt-1 text-sm text-slate-500">
            Unauthorized access and anomaly stream
          </p>
        </div>
        <TriangleAlert className="text-amber-300" size={22} />
      </div>

      <div className="max-h-[520px] space-y-2 overflow-y-auto pr-1">
        {alerts.map((alert, index) => {
          const isLow = alert.level === "low";

          return (
            <div
              key={`${alert.msg}-${index}`}
              className={`group rounded-lg border p-3 transition duration-300 hover:-translate-y-0.5 ${
                isLow
                  ? "border-emerald-400/20 bg-emerald-400/5 hover:border-emerald-300/40"
                  : "border-amber-400/20 bg-amber-400/5 hover:border-amber-300/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                    isLow
                      ? "bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]"
                      : "bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.8)]"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`text-xs font-bold uppercase tracking-[0.2em] ${
                        isLow ? "text-emerald-200" : "text-amber-200"
                      }`}
                    >
                      {alert.level} severity
                    </span>
                    <span className="shrink-0 font-mono text-xs text-slate-500">
                      {alert.time}
                    </span>
                  </div>
                  <p className="mt-2 break-words text-sm text-slate-200">
                    {alert.msg}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Source: {alert.source}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AuditLogTable({ logs }) {
  return (
    <div className={`${surfaceClass} overflow-hidden`}>
      <div className="flex items-start justify-between gap-4 border-b border-slate-800/90 p-5">
        <div>
          <h2 className="font-semibold text-white">Blockchain Audit Logs</h2>
          <p className="mt-1 text-sm text-slate-500">
            Immutable transaction evidence and admin access changes
          </p>
        </div>
        <FileClock className="shrink-0 text-cyan-300" size={22} />
      </div>

      <div className="max-h-[560px] overflow-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/95 text-xs uppercase tracking-[0.18em] text-slate-500 backdrop-blur">
            <tr>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Wallet</th>
              <th className="px-5 py-3">Tx Hash</th>
              <th className="px-5 py-3">Block</th>
              <th className="px-5 py-3">Risk</th>
              <th className="px-5 py-3">Gas</th>
              <th className="px-5 py-3">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {logs.map((log) => {
              const style = actionStyles[log.action] || actionStyles.ACCESS_DENIED;
              const Icon = style.icon;

              return (
                <tr
                  key={`${log.id}-${log.block}-${log.action}`}
                  className="transition hover:bg-cyan-400/[0.04]"
                >
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-2 rounded-md border px-2.5 py-1 text-xs font-bold ${style.className}`}
                    >
                      <Icon size={14} />
                      {style.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-300">
                    {shortAddress(log.user)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-md border border-cyan-400/15 bg-cyan-400/5 px-2 py-1 font-mono text-xs text-cyan-200">
                      {shortHash(log.id)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-400">
                    {typeof log.block === "number" ? `#${log.block}` : log.block}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300">{log.risk}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-400">
                    {log.gas}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{log.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!logs.length && (
        <div className="p-8 text-center text-sm text-slate-500">
          No audit records yet. Run a simulated access request to create live
          evidence.
        </div>
      )}
    </div>
  );
}
