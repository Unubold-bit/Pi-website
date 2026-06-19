"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lang = "jp" | "en";
type RequestType = "expense" | "sop" | "proposal";
type Urgency = "overdue" | "critical" | "warning" | "normal";

const jp = {
  logo: "Hanko 判子",
  role: "社長 · 代表取締役",
  logout: "ログアウト",
  title: "最高承認インボックス",
  subtitle: "社長レベルの最終承認が必要な申請",
  authority: "承認権限: ¥1,000,000以上 · 全社SOP · 大型プロジェクト",
  pending: "承認待ち",
  approvedToday: "本日承認済み",
  overdue: "期限超過",
  totalValue: "承認待ち総額",
  approve: "最終承認",
  reject: "却下",
  revise: "差し戻し",
  rejectReason: "却下理由",
  rejectReasons: {
    BUDGET_EXCEEDED: "予算超過",
    POLICY_VIOLATION: "規定違反",
    STRATEGIC_MISMATCH: "戦略的不一致",
    INSUFFICIENT_JUSTIFICATION: "理由不十分",
    OTHER: "その他",
  },
  timerFreeze: "⏸ 再提出まで SLA タイマーが一時停止",
  permanent: "この操作は最高権限で永久に記録されます",
  confirm: "最終確定",
  cancel: "キャンセル",
  slaRemaining: "残り",
  submittedBy: "申請者",
  amount: "金額",
  budget: "予算",
  scope: "適用範囲",
  viewDetail: "詳細 →",
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
  routedFrom: "転送元",
  companyWide: "全社適用",
};

const en = {
  logo: "Hanko 判子",
  role: "社長 · President",
  logout: "Logout",
  title: "Executive Approval Inbox",
  subtitle: "Requests requiring Presidential final approval",
  authority: "Authority: Above ¥1,000,000 · Company-wide SOPs · Major Projects",
  pending: "Pending",
  approvedToday: "Approved today",
  overdue: "Overdue",
  totalValue: "Total pending value",
  approve: "Final Approve",
  reject: "Reject",
  revise: "Request Revision",
  rejectReason: "Rejection Reason",
  rejectReasons: {
    BUDGET_EXCEEDED: "Budget Exceeded",
    POLICY_VIOLATION: "Policy Violation",
    STRATEGIC_MISMATCH: "Strategic Mismatch",
    INSUFFICIENT_JUSTIFICATION: "Insufficient Justification",
    OTHER: "Other",
  },
  timerFreeze: "⏸ SLA timer will FREEZE until resubmission",
  permanent: "This action is final and permanently recorded at executive level",
  confirm: "Final Confirm",
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
  routedFrom: "Routed from",
  companyWide: "Company-wide",
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
  routedFrom: string;
}

const MOCK_PENDING: Request[] = [
  {
    id: "REQ-2024-1042",
    type: "expense",
    submittedBy: "田中 太郎",
    amount: "¥2,800,000",
    slaHours: -5,
    urgency: "overdue",
    routedFrom: "部長 · 鈴木 一郎",
  },
  {
    id: "REQ-2024-1038",
    type: "sop",
    submittedBy: "佐藤 花子",
    scope: "Company-wide · 全社",
    summary: "全社セキュリティポリシー改訂",
    slaHours: 4,
    urgency: "critical",
    routedFrom: "部長 · 山田 次郎",
  },
  {
    id: "REQ-2024-1031",
    type: "proposal",
    submittedBy: "高橋 健",
    budget: "¥3,500,000",
    summary: "東南アジア市場参入プロジェクト",
    slaHours: 11,
    urgency: "critical",
    routedFrom: "部長 · 伊藤 誠",
  },
  {
    id: "REQ-2024-1024",
    type: "expense",
    submittedBy: "渡辺 学",
    amount: "¥1,200,000",
    slaHours: 22,
    urgency: "warning",
    routedFrom: "部長 · 鈴木 一郎",
  },
  {
    id: "REQ-2024-1018",
    type: "proposal",
    submittedBy: "中村 悠",
    budget: "¥5,000,000",
    summary: "新製品ライン開発・製造設備投資",
    slaHours: 38,
    urgency: "normal",
    routedFrom: "部長 · 山田 次郎",
  },
];

const urgencyColors: Record<Urgency, { border: string; bg: string; text: string; badge: string }> = {
  overdue:  { border: "#ef4444", bg: "#0f0404", text: "#ef4444", badge: "#ef444420" },
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

export default function ShachoDashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const [modal, setModal] = useState<ModalState>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOther, setRejectOther] = useState("");
  const [reviseText, setReviseText] = useState("");
  const [doneIds, setDoneIds] = useState<Record<string, "approved" | "rejected" | "revised">>({});
  const router = useRouter();
  const t = lang === "jp" ? jp : en;
  const pending = MOCK_PENDING.filter((r) => !doneIds[r.id]);
  const overdueCount = pending.filter((r) => r.urgency === "overdue").length;
  const approvedCount = Object.values(doneIds).filter((v) => v === "approved").length;

  const totalPendingValue = pending
    .map((r) => parseInt((r.amount || r.budget || "¥0").replace(/[¥,]/g, "")))
    .reduce((a, b) => a + b, 0);

  const formatYen = (n: number) => `¥${n.toLocaleString()}`;

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

  const slaLabel = (hours: number) =>
    hours < 0
      ? lang === "en" ? `${Math.abs(hours)}h overdue` : `${Math.abs(hours)}h 超過`
      : lang === "en" ? `${hours}h ${t.slaRemaining}` : `残り ${hours}h`;

  const slaPercent = (hours: number) => Math.max(0, Math.min(100, (hours / 48) * 100));

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
            <button 
                onClick={() => router.push('/login')}
                style={{ 
                    background: "transparent", 
                    border: "1px solid #ef4444", 
                    color: "#ef4444", 
                    borderRadius: "4px", 
                    padding: "4px 12px", 
                    cursor: "pointer", 
                    fontSize: "12px" 
                }}
                >
                {t.logout}
            </button>        
        </div>
      </nav>

      <div style={{ maxWidth: "860px", margin: "0 auto", padding: "36px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px", color: "#f5f5f5", letterSpacing: "-0.5px" }}>{t.title}</h1>
          <p style={{ color: "#555", fontSize: "13px", margin: "0 0 8px" }}>{t.subtitle}</p>
          <p style={{ color: "#a78bfa", fontSize: "11px", background: "#12073a", display: "inline-block", padding: "2px 10px", borderRadius: "3px", border: "1px solid #3b1fa8" }}>{t.authority}</p>
        </div>

        {/* Summary bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "32px" }}>
          {[
            { label: t.pending, value: pending.length, color: "#a78bfa" },
            { label: t.approvedToday, value: approvedCount, color: "#22c55e" },
            { label: t.overdue, value: overdueCount, color: "#ef4444" },
            { label: t.totalValue, value: formatYen(totalPendingValue), color: "#f59e0b", small: true },
          ].map((stat) => (
            <div key={stat.label} style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "4px", padding: "16px 20px" }}>
              <p style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>{stat.label}</p>
              <p style={{ color: stat.color, fontSize: stat.small ? "16px" : "28px", fontWeight: 700, margin: 0, fontVariantNumeric: "tabular-nums" }}>{stat.value}</p>
            </div>
          ))}
        </div>

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
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "11px", color: typeColors[req.type], background: `${typeColors[req.type]}15`, padding: "2px 8px", borderRadius: "3px", fontWeight: 600 }}>{t.types[req.type]}</span>
                    <span style={{ fontSize: "11px", color: uc.text, background: uc.badge, padding: "2px 8px", borderRadius: "3px", fontWeight: 700, textTransform: "uppercase" }}>{t.urgency[req.urgency]}</span>
                    <span style={{ fontSize: "12px", color: "#444" }}>{req.id}</span>
                  </div>
                  <span style={{ fontSize: "20px", fontWeight: 700, color: "#f5f5f5", fontVariantNumeric: "tabular-nums" }}>
                    {req.amount || req.budget}
                  </span>
                </div>

                {/* Info row */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "6px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "13px", color: "#aaa" }}>{t.submittedBy}: <strong style={{ color: "#e5e5e5" }}>{req.submittedBy}</strong></span>
                  {req.summary && <span style={{ fontSize: "13px", color: "#666" }}>— {req.summary}</span>}
                  {req.scope && <span style={{ fontSize: "12px", color: "#60a5fa", background: "#0d1a2e", border: "1px solid #1a3a5e", borderRadius: "3px", padding: "1px 6px" }}>{req.scope}</span>}
                </div>

                {/* Routed from */}
                <div style={{ marginBottom: "14px" }}>
                  <span style={{ fontSize: "11px", color: "#444" }}>{t.routedFrom}: </span>
                  <span style={{ fontSize: "11px", color: "#666" }}>{req.routedFrom}</span>
                </div>

                {/* SLA bar */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                    <span style={{ fontSize: "11px", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>SLA</span>
                    <span style={{ fontSize: "12px", color: uc.text, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{slaLabel(req.slaHours)}</span>
                  </div>
                  <div style={{ height: "3px", background: "#1f1f1f", borderRadius: "2px" }}>
                    <div style={{ width: `${slaPercent(req.slaHours)}%`, height: "100%", background: uc.text, borderRadius: "2px" }} />
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => setModal({ type: "approve", requestId: req.id })} style={{ flex: 2, padding: "11px", borderRadius: "4px", border: "none", background: "#7c3aed", color: "white", fontSize: "13px", fontWeight: 700, cursor: "pointer", letterSpacing: "-0.2px" }}>
                    ✓ {t.approve}
                  </button>
                  <button onClick={() => setModal({ type: "revise", requestId: req.id })} style={{ flex: 1, padding: "11px", borderRadius: "4px", border: "1px solid #3a2800", background: "#1a1200", color: "#f59e0b", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    ↩ {t.revise}
                  </button>
                  <button onClick={() => setModal({ type: "reject", requestId: req.id })} style={{ flex: 1, padding: "11px", borderRadius: "4px", border: "1px solid #3a1a1a", background: "#1f0d0d", color: "#ef4444", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    ✕ {t.reject}
                  </button>
                  <button 
                    onClick={() => router.push(`/request/${req.id}`)}
                    style={{ 
                        padding: "11px 14px", 
                        borderRadius: "4px", 
                        border: "1px solid #1f1f1f", 
                        background: "transparent", 
                        color: "#666", 
                        fontSize: "12px", 
                        cursor: "pointer" 
                    }}
                    >
                    {t.viewDetail}
                </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "4px", padding: "28px", width: "440px", maxWidth: "90vw" }}>

            {modal.type === "approve" && (
              <>
                <h3 style={{ margin: "0 0 8px", color: "#f5f5f5", fontSize: "16px" }}>✓ {t.approve}</h3>
                <p style={{ color: "#ef4444", fontSize: "12px", marginBottom: "16px", background: "#1f0d0d", border: "1px solid #3a1a1a", borderRadius: "3px", padding: "8px 12px" }}>
                  {lang === "en" ? "⚠ This is an executive-level final decision. It cannot be undone." : "⚠ これは最高権限による最終決定です。取り消せません。"}
                </p>
                <p style={{ color: "#555", fontSize: "12px", marginBottom: "20px" }}>{t.permanent}</p>
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