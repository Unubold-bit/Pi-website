"use client";

import { useState } from "react";

// ── Language text ───────────────────────────────────────────────────────────
const jp = {
  logo: "Hanko 判子",
  roleBadge: "部長 · Buchō",
  logout: "ログアウト",
  // Summary
  pendingApproval: "承認待ち",
  approvedToday: "本日承認済み",
  overdue: "期限超過",
  withinLimit: "権限内 (¥1M)",
  ccNotifications: "CC通知",
  // CC Banner
  ccTitle: "情報通知 · FYI",
  ccRouted: "→ 社長へ転送済み",
  // Cards
  requester: "申請者",
  amount: "金額",
  type: "種別",
  slaLabel: "SLA",
  overdueLabel: "期限超過",
  approve: "承認",
  reject: "却下",
  revise: "差し戻し",
  // Request types
  expenseType: "経費申請",
  sopType: "SOP改訂",
  proposalType: "企画提案",
  // Reject modal
  rejectTitle: "却下理由",
  rejectReason: "却下理由を選択",
  rejectOtherNote: "詳細を記入してください（最低15文字）",
  rejectWarning: "この操作は永久に記録されます",
  confirmReject: "却下を確定",
  cancel: "キャンセル",
  // Revise modal
  reviseTitle: "差し戻し",
  reviseGuidance: "修正指示を記入してください（最低15文字）",
  slaFreezeNote: "⏸ 再提出まで SLA タイマーが停止します",
  confirmRevise: "差し戻しを確定",
  // Approve modal
  approveTitle: "承認確認",
  approveConfirmMsg: "この申請を承認しますか？",
  confirmApprove: "承認する",
  // Audit log
  auditTitle: "監査ログ",
  auditImmutable: "変更・削除不可",
};

const en = {
  logo: "Hanko 判子",
  roleBadge: "部長 · Buchō · Department Head",
  logout: "Logout",
  pendingApproval: "Pending Approval",
  approvedToday: "Approved Today",
  overdue: "Overdue",
  withinLimit: "Within Limit (¥1M)",
  ccNotifications: "CC Notifications",
  ccTitle: "FYI · Notifications",
  ccRouted: "→ Routed to Shachō",
  requester: "Requester",
  amount: "Amount",
  type: "Type",
  slaLabel: "SLA",
  overdueLabel: "OVERDUE",
  approve: "Approve",
  reject: "Reject",
  revise: "Revise",
  expenseType: "Expense",
  sopType: "SOP Update",
  proposalType: "Proposal",
  rejectTitle: "Rejection Reason",
  rejectReason: "Select a reason",
  rejectOtherNote: "Please explain (min. 15 characters)",
  rejectWarning: "This action is permanently recorded",
  confirmReject: "Confirm Rejection",
  cancel: "Cancel",
  reviseTitle: "Request Revision",
  reviseGuidance: "Enter revision guidance (min. 15 characters)",
  slaFreezeNote: "⏸ SLA timer will FREEZE until resubmission",
  confirmRevise: "Confirm Revision",
  approveTitle: "Confirm Approval",
  approveConfirmMsg: "Are you sure you want to approve this request?",
  confirmApprove: "Approve",
  auditTitle: "Audit Log",
  auditImmutable: "Immutable — cannot be edited or deleted",
};

// ── Types ───────────────────────────────────────────────────────────────────
type Lang = "jp" | "en";
type RejectReason =
  | "BUDGET_EXCEEDED"
  | "MISSING_RECEIPT"
  | "INVALID_LOCATION"
  | "SCOPE_TOO_BROAD"
  | "OTHER";
type CardStatus = "pending" | "approved" | "rejected" | "revised";
type RequestKind = "expense" | "sop" | "proposal";

interface Request {
  id: string;
  requester: string;
  amount: string;
  kind: RequestKind;
  slaMinutes: number | null; // null = overdue
  status: CardStatus;
  // extra detail
  detail?: string;
}

interface AuditEntry {
  id: string;
  action: string;
  timestamp: string;
  actor: string;
  requestId: string;
}

// ── Mock data ────────────────────────────────────────────────────────────────
const CC_REQUESTS = [
  { id: "CC-001", requester: "木村 剛", amount: "¥1,800,000", kindLabel: "経費申請 · Expense", note: "" },
  { id: "CC-002", requester: "中村 さくら", amount: "¥2,500,000", kindLabel: "企画提案 · Proposal", note: "" },
  { id: "CC-003", requester: "小林 浩二", amount: "¥1,200,000", kindLabel: "SOP改訂 · SOP", note: "" },
];

const INITIAL_REQUESTS: Request[] = [
  {
    id: "REQ-101",
    requester: "鈴木 一郎",
    amount: "¥480,000",
    kind: "expense",
    slaMinutes: null,
    status: "pending",
    detail: "Q2 overseas business trip — Tokyo → Frankfurt",
  },
  {
    id: "REQ-102",
    requester: "高橋 みか",
    amount: "¥750,000",
    kind: "proposal",
    slaMinutes: 202,
    status: "pending",
    detail: "New CRM tool adoption — Salesforce Enterprise tier",
  },
  {
    id: "REQ-103",
    requester: "伊藤 健太",
    amount: "¥220,000",
    kind: "expense",
    slaMinutes: 1680,
    status: "pending",
    detail: "Client entertainment — Michelin dinner, Ginza",
  },
  {
    id: "REQ-104",
    requester: "渡辺 あや",
    amount: "¥600,000",
    kind: "sop",
    slaMinutes: 850,
    status: "pending",
    detail: "Update expense policy § 4.2 — department-wide scope",
  },
  {
    id: "REQ-105",
    requester: "山本 誠",
    amount: "¥950,000",
    kind: "proposal",
    slaMinutes: 3320,
    status: "pending",
    detail: "R&D pilot — AI document classification tool, 6-month trial",
  },
];

const INITIAL_AUDIT: AuditEntry[] = [
  {
    id: "AUD-001",
    action: "APPROVED",
    timestamp: "2026-06-15 08:14:02",
    actor: "田中 部長",
    requestId: "REQ-099",
  },
  {
    id: "AUD-002",
    action: "REJECTED · BUDGET_EXCEEDED",
    timestamp: "2026-06-15 09:01:47",
    actor: "田中 部長",
    requestId: "REQ-098",
  },
  {
    id: "AUD-003",
    action: "REVISION REQUESTED",
    timestamp: "2026-06-15 10:33:18",
    actor: "田中 部長",
    requestId: "REQ-097",
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatSLA(minutes: number | null): string {
  if (minutes === null) return "OVERDUE";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h remaining`;
  return `${h}h ${m}m remaining`;
}

function slaColor(minutes: number | null): string {
  if (minutes === null) return "#ef4444";
  if (minutes < 240) return "#f59e0b";
  return "#6b7280";
}

function slaBarWidth(minutes: number | null): string {
  if (minutes === null) return "100%";
  const max = 4320; // 3 days
  return `${Math.min(100, Math.round(((max - minutes) / max) * 100))}%`;
}

function kindLabel(kind: RequestKind, t: typeof jp): string {
  if (kind === "expense") return t.expenseType;
  if (kind === "sop") return t.sopType;
  return t.proposalType;
}

// ── Sub-components ───────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid #1f1f1f",
        borderRadius: "4px",
        padding: "16px 20px",
        minWidth: "140px",
        flex: "1",
      }}
    >
      <div
        style={{
          fontSize: "28px",
          fontWeight: 700,
          color: accent ?? "#ffffff",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{ fontSize: "11px", color: "#6b7280", marginTop: "6px", letterSpacing: "0.05em" }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function BuchoDashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const [requests, setRequests] = useState<Request[]>(INITIAL_REQUESTS);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(INITIAL_AUDIT);

  // Modals
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<RejectReason | "">("");
  const [rejectNote, setRejectNote] = useState("");

  const [reviseTarget, setReviseTarget] = useState<string | null>(null);
  const [reviseNote, setReviseNote] = useState("");

  const [approveTarget, setApproveTarget] = useState<string | null>(null);

  const t = lang === "jp" ? jp : en;

  // ── Actions ──────────────────────────────────────────────────────────────
  function addAudit(action: string, requestId: string) {
    const now = new Date();
    const ts = now.toISOString().replace("T", " ").substring(0, 19);
    setAuditLog((prev) => [
      {
        id: `AUD-${Date.now()}`,
        action,
        timestamp: ts,
        actor: lang === "jp" ? "田中 部長" : "Tanaka · Buchō",
        requestId,
      },
      ...prev,
    ]);
  }

  function handleApproveConfirm() {
    if (!approveTarget) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === approveTarget ? { ...r, status: "approved" } : r))
    );
    addAudit("APPROVED", approveTarget);
    setApproveTarget(null);
  }

  function handleRejectConfirm() {
    if (!rejectTarget || !rejectReason) return;
    if (rejectReason === "OTHER" && rejectNote.length < 15) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === rejectTarget ? { ...r, status: "rejected" } : r))
    );
    addAudit(`REJECTED · ${rejectReason}${rejectNote ? ` — "${rejectNote.slice(0, 30)}"` : ""}`, rejectTarget);
    setRejectTarget(null);
    setRejectReason("");
    setRejectNote("");
  }

  function handleReviseConfirm() {
    if (!reviseTarget || reviseNote.length < 15) return;
    setRequests((prev) =>
      prev.map((r) => (r.id === reviseTarget ? { ...r, status: "revised" } : r))
    );
    addAudit(`REVISION REQUESTED — "${reviseNote.slice(0, 30)}"`, reviseTarget);
    setReviseTarget(null);
    setReviseNote("");
  }

  // ── Derived stats ────────────────────────────────────────────────────────
  const pending = requests.filter((r) => r.status === "pending");
  const approvedToday = requests.filter((r) => r.status === "approved").length;
  const overdue = pending.filter((r) => r.slaMinutes === null).length;

  // ── Styles ───────────────────────────────────────────────────────────────
  const surface: React.CSSProperties = {
    background: "#111111",
    border: "1px solid #1f1f1f",
    borderRadius: "4px",
  };

  const btnBase: React.CSSProperties = {
    border: "none",
    borderRadius: "4px",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "Inter, sans-serif",
  };

  const modalOverlay: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  };

  const modalBox: React.CSSProperties = {
    ...surface,
    padding: "28px",
    width: "460px",
    maxWidth: "90vw",
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        background: "#0a0a0a",
        minHeight: "100vh",
        color: "#ffffff",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
      }}
    >
      {/* ── Navbar ── */}
      <nav
        style={{
          background: "#111111",
          borderBottom: "1px solid #1f1f1f",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: "16px", color: "#7c3aed", letterSpacing: "-0.02em" }}>
          {t.logo}
        </span>
        <span
          style={{
            background: "#1a1033",
            border: "1px solid #3b1f7a",
            color: "#a78bfa",
            fontSize: "11px",
            fontWeight: 600,
            padding: "3px 10px",
            borderRadius: "4px",
            letterSpacing: "0.04em",
          }}
        >
          {t.roleBadge}
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setLang(lang === "en" ? "jp" : "en")}
          style={{
            ...btnBase,
            background: "#1a1a1a",
            color: "#9ca3af",
            border: "1px solid #2a2a2a",
            padding: "5px 12px",
            fontSize: "12px",
          }}
        >
          {lang === "en" ? "JP" : "EN"}
        </button>
        <button style={{ ...btnBase, background: "#1a1a1a", color: "#6b7280", border: "1px solid #1f1f1f", fontSize: "12px" }}>
          {t.logout}
        </button>
      </nav>

      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "28px 24px" }}>

        {/* ── Summary Bar ── */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
          <StatCard label={t.pendingApproval} value={pending.length} accent="#7c3aed" />
          <StatCard label={t.approvedToday} value={approvedToday + 12} accent="#22c55e" />
          <StatCard label={t.overdue} value={overdue} accent={overdue > 0 ? "#ef4444" : "#22c55e"} />
          <StatCard label={t.withinLimit} value={pending.length} />
          <StatCard label={t.ccNotifications} value={CC_REQUESTS.length} accent="#60a5fa" />
        </div>

        {/* ── CC Banner ── */}
        <div
          style={{
            background: "#0d1117",
            border: "1px solid #1e2a3a",
            borderRadius: "4px",
            padding: "16px 20px",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#60a5fa",
              letterSpacing: "0.08em",
              marginBottom: "14px",
              textTransform: "uppercase",
            }}
          >
            {t.ccTitle}
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {CC_REQUESTS.map((cc) => (
              <div
                key={cc.id}
                style={{
                  background: "#0a0f18",
                  border: "1px solid #1e2a3a",
                  borderRadius: "4px",
                  padding: "12px 16px",
                  minWidth: "220px",
                  flex: "1",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "4px" }}>{cc.requester}</div>
                <div style={{ color: "#60a5fa", fontWeight: 700, fontSize: "16px", marginBottom: "4px" }}>
                  {cc.amount}
                </div>
                <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "8px" }}>{cc.kindLabel}</div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#60a5fa",
                    background: "#0d1a2d",
                    border: "1px solid #1e2a3a",
                    borderRadius: "3px",
                    padding: "3px 8px",
                    display: "inline-block",
                  }}
                >
                  {t.ccRouted}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pending Cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "48px" }}>
          {pending
            .sort((a, b) => (a.slaMinutes === null ? -1 : b.slaMinutes === null ? 1 : a.slaMinutes - b.slaMinutes))
            .map((req) => {
              const isOverdue = req.slaMinutes === null;
              const slaCol = slaColor(req.slaMinutes);

              return (
                <div
                  key={req.id}
                  style={{
                    ...surface,
                    padding: "20px",
                    borderLeft: `3px solid ${isOverdue ? "#ef4444" : slaCol}`,
                    background: isOverdue ? "#120808" : "#111111",
                  }}
                >
                  {/* Card header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "15px", marginBottom: "2px" }}>{req.requester}</div>
                      <div style={{ fontSize: "11px", color: "#6b7280" }}>{req.id}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 700, fontSize: "20px", color: "#ffffff" }}>{req.amount}</div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#a78bfa",
                          background: "#1a1033",
                          border: "1px solid #3b1f7a",
                          borderRadius: "3px",
                          padding: "2px 8px",
                          display: "inline-block",
                          marginTop: "2px",
                        }}
                      >
                        {kindLabel(req.kind, t)}
                      </div>
                    </div>
                  </div>

                  {/* Detail */}
                  {req.detail && (
                    <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "12px", fontStyle: "italic" }}>
                      {req.detail}
                    </div>
                  )}

                  {/* Anti-fraud badges */}
                  {req.kind === "expense" && (
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
                      {[
                        { icon: "📍", label: "GPS Verified" },
                        { icon: "📸", label: "Selfie Verified" },
                        { icon: "🧾", label: "Receipt Uploaded" },
                      ].map((b) => (
                        <span
                          key={b.label}
                          style={{
                            fontSize: "11px",
                            color: "#22c55e",
                            background: "#0b1f12",
                            border: "1px solid #166534",
                            borderRadius: "3px",
                            padding: "2px 8px",
                          }}
                        >
                          {b.icon} {b.label}
                        </span>
                      ))}
                    </div>
                  )}
                  {req.kind === "sop" && (
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "11px", color: "#f59e0b", background: "#1c1300", border: "1px solid #78350f", borderRadius: "3px", padding: "2px 8px" }}>
                        📋 Diff attached
                      </span>
                      <span style={{ fontSize: "11px", color: "#60a5fa", background: "#0d1117", border: "1px solid #1e3a5f", borderRadius: "3px", padding: "2px 8px" }}>
                        🏢 Department scope
                      </span>
                    </div>
                  )}
                  {req.kind === "proposal" && (
                    <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "11px", color: "#a78bfa", background: "#1a1033", border: "1px solid #3b1f7a", borderRadius: "3px", padding: "2px 8px" }}>
                        🚀 PDF attached
                      </span>
                    </div>
                  )}

                  {/* SLA bar */}
                  <div style={{ marginBottom: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "11px",
                        marginBottom: "4px",
                        color: slaCol,
                        fontWeight: 600,
                      }}
                    >
                      <span>{t.slaLabel}</span>
                      <span style={{ color: isOverdue ? "#ef4444" : slaCol }}>
                        {isOverdue ? t.overdueLabel : formatSLA(req.slaMinutes)}
                      </span>
                    </div>
                    <div style={{ background: "#1f1f1f", borderRadius: "2px", height: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: slaBarWidth(req.slaMinutes),
                          height: "100%",
                          background: isOverdue ? "#ef4444" : slaCol,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => setApproveTarget(req.id)}
                      style={{ ...btnBase, background: "#7c3aed", color: "#fff", flex: 1 }}
                    >
                      {t.approve}
                    </button>
                    <button
                      onClick={() => { setRejectTarget(req.id); setRejectReason(""); setRejectNote(""); }}
                      style={{ ...btnBase, background: "#1a0505", color: "#ef4444", border: "1px solid #3b0f0f", flex: 1 }}
                    >
                      {t.reject}
                    </button>
                    <button
                      onClick={() => { setReviseTarget(req.id); setReviseNote(""); }}
                      style={{ ...btnBase, background: "#1c1300", color: "#f59e0b", border: "1px solid #78350f", flex: 1 }}
                    >
                      {t.revise}
                    </button>
                  </div>
                </div>
              );
            })}

          {/* Resolved cards (greyed) */}
          {requests
            .filter((r) => r.status !== "pending")
            .map((req) => (
              <div
                key={req.id}
                style={{
                  ...surface,
                  padding: "16px 20px",
                  opacity: 0.45,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ fontWeight: 600 }}>{req.requester}</span>
                  <span style={{ color: "#6b7280", marginLeft: "12px", fontSize: "12px" }}>{req.id}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontWeight: 700 }}>{req.amount}</span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "3px",
                      background:
                        req.status === "approved" ? "#0b1f12" : req.status === "rejected" ? "#120808" : "#1c1300",
                      color:
                        req.status === "approved" ? "#22c55e" : req.status === "rejected" ? "#ef4444" : "#f59e0b",
                      border: `1px solid ${req.status === "approved" ? "#166534" : req.status === "rejected" ? "#3b0f0f" : "#78350f"}`,
                    }}
                  >
                    {req.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
        </div>

        {/* ── Audit Log ── */}
        <div style={{ ...surface, padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <span style={{ fontWeight: 700, fontSize: "13px" }}>{t.auditTitle}</span>
            <span style={{ fontSize: "11px", color: "#4b5563" }}>{t.auditImmutable}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {auditLog.map((entry, idx) => (
              <div
                key={entry.id}
                style={{
                  display: "flex",
                  gap: "16px",
                  padding: "10px 0",
                  borderBottom: idx < auditLog.length - 1 ? "1px solid #1a1a1a" : "none",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#4b5563",
                    fontFamily: "monospace",
                    whiteSpace: "nowrap",
                    paddingTop: "1px",
                    minWidth: "150px",
                  }}
                >
                  {entry.timestamp}
                </div>
                <div style={{ flex: 1 }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      color: entry.action.startsWith("APPROVED")
                        ? "#22c55e"
                        : entry.action.startsWith("REJECTED")
                        ? "#ef4444"
                        : "#f59e0b",
                      marginRight: "8px",
                    }}
                  >
                    {entry.action}
                  </span>
                  <span style={{ fontSize: "11px", color: "#6b7280" }}>{entry.requestId}</span>
                </div>
                <div style={{ fontSize: "11px", color: "#6b7280", whiteSpace: "nowrap" }}>{entry.actor}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* ══════════════ APPROVE MODAL ══════════════ */}
      {approveTarget && (
        <div style={modalOverlay} onClick={() => setApproveTarget(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "16px" }}>{t.approveTitle}</div>
            <div style={{ color: "#9ca3af", marginBottom: "24px" }}>{t.approveConfirmMsg}</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={handleApproveConfirm} style={{ ...btnBase, background: "#7c3aed", color: "#fff", flex: 1 }}>
                {t.confirmApprove}
              </button>
              <button onClick={() => setApproveTarget(null)} style={{ ...btnBase, background: "#1a1a1a", color: "#9ca3af", flex: 1 }}>
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ REJECT MODAL ══════════════ */}
      {rejectTarget && (
        <div style={modalOverlay} onClick={() => setRejectTarget(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "20px" }}>
              {t.rejectTitle} · 却下理由
            </div>

            {/* Reason selector */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {(
                [
                  ["BUDGET_EXCEEDED", "BUDGET_EXCEEDED · 予算超過"],
                  ["MISSING_RECEIPT", "MISSING_RECEIPT · 領収書不足"],
                  ["INVALID_LOCATION", "INVALID_LOCATION · 場所不一致"],
                  ["SCOPE_TOO_BROAD", "SCOPE_TOO_BROAD · 範囲が広すぎる"],
                  ["OTHER", "OTHER · その他"],
                ] as [RejectReason, string][]
              ).map(([val, label]) => (
                <label
                  key={val}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    background: rejectReason === val ? "#1a0505" : "#0d0d0d",
                    border: `1px solid ${rejectReason === val ? "#ef4444" : "#1f1f1f"}`,
                    borderRadius: "4px",
                    cursor: "pointer",
                    color: rejectReason === val ? "#ef4444" : "#9ca3af",
                    fontSize: "13px",
                  }}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    value={val}
                    checked={rejectReason === val}
                    onChange={() => setRejectReason(val)}
                    style={{ accentColor: "#ef4444" }}
                  />
                  {label}
                </label>
              ))}
            </div>

            {/* OTHER textarea */}
            {rejectReason === "OTHER" && (
              <div style={{ marginBottom: "16px" }}>
                <textarea
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  placeholder={t.rejectOtherNote}
                  rows={3}
                  style={{
                    width: "100%",
                    background: "#0d0d0d",
                    border: `1px solid ${rejectNote.length >= 15 ? "#22c55e" : "#ef4444"}`,
                    color: "#fff",
                    borderRadius: "4px",
                    padding: "10px",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "13px",
                    resize: "vertical",
                    boxSizing: "border-box",
                  }}
                />
                <div style={{ fontSize: "11px", color: rejectNote.length >= 15 ? "#22c55e" : "#ef4444", marginTop: "4px" }}>
                  {rejectNote.length}/15 min
                </div>
              </div>
            )}

            {/* Warning */}
            <div
              style={{
                fontSize: "11px",
                color: "#ef4444",
                background: "#1a0505",
                border: "1px solid #3b0f0f",
                borderRadius: "3px",
                padding: "8px 12px",
                marginBottom: "20px",
              }}
            >
              ⚠ {t.rejectWarning}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectReason || (rejectReason === "OTHER" && rejectNote.length < 15)}
                style={{
                  ...btnBase,
                  background: rejectReason && (rejectReason !== "OTHER" || rejectNote.length >= 15) ? "#ef4444" : "#2a1010",
                  color: "#fff",
                  flex: 1,
                }}
              >
                {t.confirmReject}
              </button>
              <button
                onClick={() => { setRejectTarget(null); setRejectReason(""); setRejectNote(""); }}
                style={{ ...btnBase, background: "#1a1a1a", color: "#9ca3af", flex: 1 }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ REVISE MODAL ══════════════ */}
      {reviseTarget && (
        <div style={modalOverlay} onClick={() => setReviseTarget(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: "16px", marginBottom: "20px" }}>
              {t.reviseTitle} · 差し戻し
            </div>

            <textarea
              value={reviseNote}
              onChange={(e) => setReviseNote(e.target.value)}
              placeholder={t.reviseGuidance}
              rows={4}
              style={{
                width: "100%",
                background: "#0d0d0d",
                border: `1px solid ${reviseNote.length >= 15 ? "#22c55e" : "#1f1f1f"}`,
                color: "#fff",
                borderRadius: "4px",
                padding: "10px",
                fontFamily: "Inter, sans-serif",
                fontSize: "13px",
                resize: "vertical",
                marginBottom: "6px",
                boxSizing: "border-box",
              }}
            />
            <div style={{ fontSize: "11px", color: reviseNote.length >= 15 ? "#22c55e" : "#6b7280", marginBottom: "16px" }}>
              {reviseNote.length}/15 min
            </div>

            {/* SLA freeze notice */}
            <div
              style={{
                fontSize: "12px",
                color: "#f59e0b",
                background: "#1c1300",
                border: "1px solid #78350f",
                borderRadius: "3px",
                padding: "10px 12px",
                marginBottom: "20px",
              }}
            >
              {t.slaFreezeNote}
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleReviseConfirm}
                disabled={reviseNote.length < 15}
                style={{
                  ...btnBase,
                  background: reviseNote.length >= 15 ? "#f59e0b" : "#1c1300",
                  color: reviseNote.length >= 15 ? "#000" : "#78350f",
                  flex: 1,
                }}
              >
                {t.confirmRevise}
              </button>
              <button
                onClick={() => { setReviseTarget(null); setReviseNote(""); }}
                style={{ ...btnBase, background: "#1a1a1a", color: "#9ca3af", flex: 1 }}
              >
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}