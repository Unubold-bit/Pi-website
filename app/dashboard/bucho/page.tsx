"use client";

import { useState } from "react";

type Lang = "jp" | "en";
type RequestType = "expense" | "sop" | "proposal";
type Urgency = "overdue" | "critical" | "warning" | "normal";

const jp = {
  logo: "Hanko 判子",
  role: "部長 · 部署長",
  logout: "ログアウト",
  title: "承認インボックス",
  subtitle: "部長レベルの承認が必要な申請",
  pending: "承認待ち",
  approvedToday: "本日承認済み",
  overdue: "期限超過",
  ccNotif: "情報通知 (閲覧のみ)",
  ccDesc: "社長レベルへ転送された申請",
  routed: "社長へ転送済み",
  approve: "承認",
  reject: "却下",
  revise: "差し戻し",
  rejectReason: "却下理由",
  rejectReasons: {
    BUDGET_EXCEEDED: "予算超過",
    MISSING_RECEIPT: "領収書不足",
    INVALID_LOCATION: "場所不一致",
    POLICY_VIOLATION: "規定違反",
    OTHER: "その他",
  },
  reviseGuidance: "修正指示",
  timerFreeze: "⏸ 再提出まで SLA タイマーが一時停止",
  permanent: "この操作は永久に記録されます",
  confirm: "確定",
  cancel: "キャンセル",
  slaRemaining: "残り時間",
  submittedBy: "申請者",
  amount: "金額",
  budget: "予算",
  scope: "範囲",
  viewDetail: "詳細を見る →",
  types: {
    expense: "経費申請",
    sop: "SOP改訂",
    proposal: "企画提案",
  },
  urgency: {
    overdue: "期限超過",
    critical: "緊急",
    warning: "注意",
    normal: "通常",
  },
  authority: "承認権限: ¥100,001 — ¥1,000,000",
};

const en = {
  logo: "Hanko 判子",
  role: "部長 · Dept Head",
  logout: "Logout",
  title: "Approval Inbox",
  subtitle: "Requests requiring Department Head approval",
  pending: "Pending",
  approvedToday: "Approved today",
  overdue: "Overdue",
  ccNotif: "FYI Notifications (read-only)",
  ccDesc: "Requests routed above your authority",
  routed: "→ Routed to Shachō",
  approve: "Approve",
  reject: "Reject",
  revise: "Request Revision",
  rejectReason: "Rejection Reason",
  rejectReasons: {
    BUDGET_EXCEEDED: "Budget Exceeded",
    MISSING_RECEIPT: "Missing Receipt",
    INVALID_LOCATION: "Invalid Location",
    POLICY_VIOLATION: "Policy Violation",
    OTHER: "Other",
  },
  reviseGuidance: "Revision guidance",
  timerFreeze: "⏸ SLA timer will FREEZE until resubmission",
  permanent: "This action is permanent and timestamped",
  confirm: "Confirm",
  cancel: "Cancel",
  slaRemaining: "remaining",
  submittedBy: "Submitted by",
  amount: "Amount",
  budget: "Budget",
  scope: "Scope",
  viewDetail: "View detail →",
  types: {
    expense: "Expense",
    sop: "SOP Update",
    proposal: "Proposal",
  },
  urgency: {
    overdue: "OVERDUE",
    critical: "Critical",
    warning: "Warning",
    normal: "Normal",
  },
  authority: "Authority: ¥100,001 — ¥1,000,000",
};

interface Request {
  id: string;
  type: RequestType;
  submittedBy: string;
  amount?: string;
  budget?: string;
  scope?: string;
  summary?: string;
  slaHours: number;
  urgency: Urgency;
}

const MOCK_PENDING: Request[] = [
  {
    id: "REQ-2024-0912",
    type: "expense",
    submittedBy: "田中 太郎",
    amount: "¥450,000",
    slaHours: -2,
    urgency: "overdue",
  },
  {
    id: "REQ-2024-0908",
    type: "proposal",
    submittedBy: "佐藤 花子",
    budget: "¥800,000",
    summary: "新CRMシステム導入提案",
    slaHours: 3,
    urgency: "critical",
  },
  {
    id: "REQ-2024-0901",
    type: "expense",
    submittedBy: "山田 次郎",
    amount: "¥220,000",
    slaHours: 18,
    urgency: "warning",
  },
  {
    id: "REQ-2024-0899",
    type: "proposal",
    submittedBy: "鈴木 美咲",
    budget: "¥650,000",
    summary: "海外マーケット調査プロジェクト",
    slaHours: 31,
    urgency: "normal",
  },
  {
    id: "REQ-2024-0895",
    type: "expense",
    submittedBy: "高橋 健",
    amount: "¥175,000",
    slaHours: 40,
    urgency: "normal",
  },
];

const MOCK_CC: Request[] = [
  {
    id: "REQ-2024-0910",
    type: "expense",
    submittedBy: "伊藤 誠",
    amount: "¥1,500,000",
    slaHours: 12,
    urgency: "warning",
  },
  {
    id: "REQ-2024-0903",
    type: "sop",
    submittedBy: "渡辺 学",
    scope: "Company-wide",
    slaHours: 28,
    urgency: "normal",
  },
];

const urgencyColors: Record<Urgency, { border: string; bg: string; text: string; badge: string }> = {
  overdue: { border: "#ef4444", bg: "#0f0404", text: "#ef4444", badge: "#ef444420" },
  critical: { border: "#f59e0b", bg: "#0f0900", text: "#f59e0b", badge: "#f59e0b20" },
  warning:  { border: "#f59e0b44", bg: "#0a0a0a", text: "#f59e0b", badge: "#f59e0b15" },
  normal:   { border: "#1f1f1f", bg: "#0a0a0a", text: "#666", badge: "#ffffff08" },
};

const typeColors: Record<RequestType, string> = {
  expense:  "#a78bfa",
  sop:      "#60a5fa",
  proposal: "#34d399",
};

type ModalState = { type: "approve" | "reject" | "revise"; requestId: string } | null;

export default function BuchoDashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const [modal, setModal] = useState<ModalState>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOther, setRejectOther] = useState("");
  const [reviseText, setReviseText] = useState("");
  const [doneIds, setDoneIds] = useState<Record<string, "approved" | "rejected" | "revised">>({});

  const t = lang === "jp" ? jp : en;

  const pending = MOCK_PENDING.filter((r) => !doneIds[r.id]);

  const handleAction = () => {
    if (!modal) return;
    setDoneIds((prev) => ({
      ...prev,
      [modal.requestId]: modal.type === "approve" ? "approved" : modal.type === "reject" ? "rejected" : "revised",
    }));
    setModal(null);
    setRejectReason("");
    setRejectOther("");
    setReviseText("");
  };

  const slaLabel = (hours: number) => {
    if (hours < 0) return lang === "en" ? `${Math.abs(hours)}h overdue` : `${Math.abs(hours)}h 超過`;
    return lang === "en" ? `${hours}h ${t.slaRemaining}` : `残り ${hours}h`;
  };

  const slaPercent = (hours: number) => Math.max(0, Math.min(100, (hours / 48) * 100));

  const overdueCount = pending.filter((r) => r.urgency === "overdue").length;

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#0a0a0a", minHeight: "100vh", color: "#e5e5e5" }}>
      {/* Navbar */}
      <nav style={{ background: "#111", borderBottom: "1px solid #1f1f1f", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ color: "#7c3aed", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.5px" }}>{t.logo}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ background: "#1a1030", color: "#a78bfa", border: "1px solid #3b1fa8", borderRadius: "4px", padding: "2px 10px", fontSize: "12px", fontWeight: 600 }}>{t.role}</span>
          <button onClick={() => setLang(lang === "en" ? "jp" : "en")} style={{ background: "#1f1f1f", border: "1px solid #2f2f2f", color: "#aaa", borderRadius: "4px", padding: "4px 12px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
            {lang === "en" ? "JP" : "EN"}
          </button>
          <button style={{ background: "transparent", border: "1px solid #2f2f2f", color: "#888", borderRadius: "4px", padding: "4px 12px", cursor: "pointer", fontSize: "12px" }}>{t.logout}</button>
        </div>
      </nav>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "36px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px", color: "#f5f5f5", letterSpacing: "-0.5px" }}>{t.title}</h1>
          <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>{t.subtitle}</p>
          <p style={{ color: "#3b1fa8", fontSize: "11px", marginTop: "6px", background: "#12073a", display: "inline-block", padding: "2px 10px", borderRadius: "3px", border: "1px solid #2a1060" }}>{t.authority}</p>
        </div>

        {/* Summary bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "32px" }}>
          {[
            { label: t.pending, value: pending.length, color: "#a78bfa" },
            { label: t.approvedToday, value: Object.values(doneIds).filter(v => v === "approved").length, color: "#22c55e" },
            { label: t.overdue, value: overdueCount + Object.values(doneIds).filter(v => v === "approved").length * 0, color: "#ef4444" },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "4px", padding: "16px 20px" }}>
              <p style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>{stat.label}</p>
              <p style={{ color: stat.color, fontSize: "28px", fontWeight: 700, margin: 0, fontVariantNumeric: "tabular-nums" }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* CC Notifications */}
        {MOCK_CC.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <p style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{t.ccNotif}</p>
              <span style={{ fontSize: "11px", color: "#444", background: "#111", border: "1px solid #1f1f1f", borderRadius: "3px", padding: "1px 6px" }}>{t.ccDesc}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {MOCK_CC.map((req) => (
                <div key={req.id} style={{ background: "#0d0d12", border: "1px solid #1a1a2e", borderRadius: "4px", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", opacity: 0.8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "11px", color: typeColors[req.type], background: `${typeColors[req.type]}15`, padding: "2px 8px", borderRadius: "3px", fontWeight: 600 }}>{t.types[req.type]}</span>
                    <span style={{ fontSize: "13px", color: "#888" }}>{req.submittedBy}</span>
                    <span style={{ fontSize: "13px", color: "#666" }}>{req.amount || req.budget || req.scope}</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#60a5fa", background: "#0d1a2e", border: "1px solid #1a3a5e", borderRadius: "3px", padding: "2px 8px" }}>{t.routed}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {pending.length === 0 && (
            <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "4px", padding: "40px", textAlign: "center", color: "#444", fontSize: "14px" }}>
              {lang === "en" ? "No pending requests." : "承認待ちの申請はありません。"}
            </div>
          )}

          {pending.map((req) => {
            const uc = urgencyColors[req.urgency];
            return (
              <div key={req.id} style={{ background: uc.bg, border: `1px solid ${uc.border}`, borderRadius: "4px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                  {/* Left info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", color: typeColors[req.type], background: `${typeColors[req.type]}15`, padding: "2px 8px", borderRadius: "3px", fontWeight: 600 }}>{t.types[req.type]}</span>
                    <span style={{ fontSize: "11px", color: uc.text, background: uc.badge, padding: "2px 8px", borderRadius: "3px", fontWeight: 700, textTransform: "uppercase" }}>{t.urgency[req.urgency]}</span>
                    <span style={{ fontSize: "12px", color: "#555" }}>{req.id}</span>
                  </div>
                  {/* Amount */}
                  <span style={{ fontSize: "18px", fontWeight: 700, color: "#e5e5e5", fontVariantNumeric: "tabular-nums" }}>
                    {req.amount || req.budget}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "14px" }}>
                  <span style={{ fontSize: "13px", color: "#aaa" }}>{t.submittedBy}: <strong style={{ color: "#e5e5e5" }}>{req.submittedBy}</strong></span>
                  {req.summary && <span style={{ fontSize: "13px", color: "#666" }}>— {req.summary}</span>}
                  {req.scope && <span style={{ fontSize: "13px", color: "#666" }}>{t.scope}: {req.scope}</span>}
                </div>

                {/* SLA bar */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                    <span style={{ fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.slaRemaining !== "remaining" ? "SLA" : "SLA"}</span>
                    <span style={{ fontSize: "12px", color: uc.text, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{slaLabel(req.slaHours)}</span>
                  </div>
                  <div style={{ height: "3px", background: "#1f1f1f", borderRadius: "2px" }}>
                    <div style={{ width: `${slaPercent(req.slaHours)}%`, height: "100%", background: uc.text, borderRadius: "2px", transition: "width 0.3s" }} />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setModal({ type: "approve", requestId: req.id })} style={{ flex: 2, padding: "10px", borderRadius: "4px", border: "none", background: "#7c3aed", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
                    ✓ {t.approve}
                  </button>
                  <button onClick={() => setModal({ type: "revise", requestId: req.id })} style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #3a2800", background: "#1a1200", color: "#f59e0b", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    ↩ {t.revise}
                  </button>
                  <button onClick={() => setModal({ type: "reject", requestId: req.id })} style={{ flex: 1, padding: "10px", borderRadius: "4px", border: "1px solid #3a1a1a", background: "#1f0d0d", color: "#ef4444", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    ✕ {t.reject}
                  </button>
                  <button style={{ padding: "10px 14px", borderRadius: "4px", border: "1px solid #1f1f1f", background: "transparent", color: "#666", fontSize: "12px", cursor: "pointer" }}>
                    {t.viewDetail}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal overlay */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "4px", padding: "28px", width: "440px", maxWidth: "90vw" }}>

            {modal.type === "approve" && (
              <>
                <h3 style={{ margin: "0 0 12px", color: "#f5f5f5", fontSize: "16px" }}>✓ {t.approve}</h3>
                <p style={{ color: "#666", fontSize: "13px", marginBottom: "20px" }}>{t.permanent}</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={handleAction} style={{ flex: 1, padding: "12px", background: "#7c3aed", border: "none", borderRadius: "4px", color: "white", fontWeight: 700, cursor: "pointer" }}>{t.confirm}</button>
                  <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", background: "#1a1a1a", border: "1px solid #2f2f2f", borderRadius: "4px", color: "#888", cursor: "pointer" }}>{t.cancel}</button>
                </div>
              </>
            )}

            {modal.type === "reject" && (
              <>
                <h3 style={{ margin: "0 0 16px", color: "#ef4444", fontSize: "16px" }}>✕ {t.rejectReason}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                  {Object.entries(t.rejectReasons).map(([key, label]) => (
                    <button key={key} onClick={() => setRejectReason(key)} style={{ padding: "10px 14px", borderRadius: "4px", border: `1px solid ${rejectReason === key ? "#ef4444" : "#1f1f1f"}`, background: rejectReason === key ? "#1f0d0d" : "#0d0d0d", color: rejectReason === key ? "#ef4444" : "#888", cursor: "pointer", textAlign: "left", fontSize: "13px" }}>
                      {label}
                    </button>
                  ))}
                </div>
                {rejectReason === "OTHER" && (
                  <textarea value={rejectOther} onChange={(e) => setRejectOther(e.target.value)} placeholder={lang === "en" ? "Explain (min 15 chars)..." : "理由を入力 (15文字以上)..."} rows={3} style={{ width: "100%", background: "#0d0d0d", border: `1px solid ${rejectOther.length > 0 && rejectOther.length < 15 ? "#ef4444" : "#1f1f1f"}`, borderRadius: "4px", color: "#e5e5e5", padding: "8px 12px", fontSize: "13px", resize: "none", boxSizing: "border-box", outline: "none", marginBottom: "12px" }} />
                )}
                <p style={{ color: "#555", fontSize: "12px", marginBottom: "14px" }}>{t.permanent}</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={handleAction} disabled={!rejectReason || (rejectReason === "OTHER" && rejectOther.length < 15)} style={{ flex: 1, padding: "12px", background: rejectReason && !(rejectReason === "OTHER" && rejectOther.length < 15) ? "#ef4444" : "#1a1a1a", border: "none", borderRadius: "4px", color: "white", fontWeight: 700, cursor: "pointer" }}>{t.confirm}</button>
                  <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", background: "#1a1a1a", border: "1px solid #2f2f2f", borderRadius: "4px", color: "#888", cursor: "pointer" }}>{t.cancel}</button>
                </div>
              </>
            )}

            {modal.type === "revise" && (
              <>
                <h3 style={{ margin: "0 0 16px", color: "#f59e0b", fontSize: "16px" }}>↩ {t.revise}</h3>
                <textarea value={reviseText} onChange={(e) => setReviseText(e.target.value)} placeholder={lang === "en" ? "Provide specific guidance (min 15 chars)..." : "具体的な修正指示 (15文字以上)..."} rows={4} style={{ width: "100%", background: "#0d0d0d", border: `1px solid ${reviseText.length > 0 && reviseText.length < 15 ? "#ef4444" : "#1f1f1f"}`, borderRadius: "4px", color: "#e5e5e5", padding: "8px 12px", fontSize: "13px", resize: "none", boxSizing: "border-box", outline: "none", marginBottom: "10px" }} />
                <p style={{ color: "#f59e0b", fontSize: "12px", marginBottom: "10px" }}>{t.timerFreeze}</p>
                <p style={{ color: "#555", fontSize: "12px", marginBottom: "14px" }}>{t.permanent}</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={handleAction} disabled={reviseText.length < 15} style={{ flex: 1, padding: "12px", background: reviseText.length >= 15 ? "#f59e0b" : "#1a1a1a", border: "none", borderRadius: "4px", color: reviseText.length >= 15 ? "#000" : "#555", fontWeight: 700, cursor: "pointer" }}>{t.confirm}</button>
                  <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", background: "#1a1a1a", border: "1px solid #2f2f2f", borderRadius: "4px", color: "#888", cursor: "pointer" }}>{t.cancel}</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}