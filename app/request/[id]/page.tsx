"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lang = "jp" | "en";
type Status = "pending" | "approved" | "rejected" | "revision" | "escalated";

const jp = {
  logo: "Hanko 判子",
  logout: "ログアウト",
  back: "← 戻る",
  requestDetail: "申請詳細",
  auditLog: "監査ログ",
  comments: "コメント",
  requestId: "申請番号",
  submittedBy: "申請者",
  submittedAt: "申請日時",
  requestType: "申請種別",
  amount: "金額",
  justification: "申請理由",
  status: "ステータス",
  slaLabel: "SLA残り時間",
  approvalChain: "承認チェーン",
  chainGenerated: "自動生成 · Org chartより",
  actionPanel: "アクション",
  approve: "承認する",
  reject: "却下する",
  revise: "差し戻す",
  rejectReason: "却下理由",
  rejectReasons: {
    BUDGET_EXCEEDED: "予算超過",
    MISSING_RECEIPT: "領収書不足",
    INVALID_LOCATION: "場所不一致",
    OTHER: "その他",
  },
  reviseGuidance: "差し戻し理由・修正指示",
  timerFreeze: "⏸ 再提出まで SLA タイマーが一時停止します",
  permanent: "この操作は永久に記録されます",
  confirm: "確定する",
  cancel: "キャンセル",
  commentPlaceholder: "コメントを入力...",
  sendComment: "送信",
  auditImmutable: "監査ログは変更不可 · 秒単位で記録",
  gpsLabel: "GPS位置情報",
  selfieLabel: "本人確認",
  selfieVerified: "確認済み",
  receiptLabel: "領収書",
  statuses: {
    pending: "承認待ち",
    approved: "承認済み",
    rejected: "却下",
    revision: "差し戻し中",
    escalated: "エスカレーション",
  },
};

const en = {
  logo: "Hanko 判子",
  logout: "Logout",
  back: "← Back",
  requestDetail: "Request Detail",
  auditLog: "Audit Log",
  comments: "Comments",
  requestId: "Request ID",
  submittedBy: "Submitted by",
  submittedAt: "Submitted at",
  requestType: "Request Type",
  amount: "Amount",
  justification: "Justification",
  status: "Status",
  slaLabel: "SLA Remaining",
  approvalChain: "Approval Chain",
  chainGenerated: "Auto-generated from org chart",
  actionPanel: "Actions",
  approve: "Approve",
  reject: "Reject",
  revise: "Request Revision",
  rejectReason: "Rejection Reason",
  rejectReasons: {
    BUDGET_EXCEEDED: "Budget Exceeded",
    MISSING_RECEIPT: "Missing Receipt",
    INVALID_LOCATION: "Invalid Location",
    OTHER: "Other",
  },
  reviseGuidance: "Revision guidance for submitter",
  timerFreeze: "⏸ SLA timer will FREEZE until resubmission",
  permanent: "This action is permanent and timestamped",
  confirm: "Confirm",
  cancel: "Cancel",
  commentPlaceholder: "Add a comment...",
  sendComment: "Send",
  auditImmutable: "Audit log is immutable · Timestamped to the second",
  gpsLabel: "GPS Location",
  selfieLabel: "Identity",
  selfieVerified: "Verified",
  receiptLabel: "Receipt",
  statuses: {
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    revision: "Revision Requested",
    escalated: "Escalated",
  },
};

// Mock data
const MOCK_REQUEST = {
  id: "REQ-2024-0847",
  type: "経費申請 · Expense Reimbursement",
  amount: "¥75,000",
  submittedBy: "田中 太郎",
  submittedAt: "2024-01-15 09:23:41",
  justification: "Q4営業会議のため、東京から大阪への新幹線往復チケット代および接待費用として申請します。顧客との契約締結に必要な出張でした。",
  gps: "Tokyo, Japan (35.6762° N, 139.6503° E)",
  receiptFile: "receipt_2024_0115.jpg",
  selfieVerified: true,
};

const MOCK_CHAIN = [
  { role: "担当", name: "田中 太郎", status: "approved" as Status, time: "2024-01-15 09:23:41", comment: "申請しました" },
  { role: "係長", name: "佐藤 健二", status: "approved" as Status, time: "2024-01-15 11:45:02", comment: "データ確認済み、転送します" },
  { role: "課長", name: "山田 次郎", status: "pending" as Status, time: null, comment: null },
  { role: "部長", name: "鈴木 一郎", status: "pending" as Status, time: null, comment: null },
  { role: "社長", name: "—", status: "pending" as Status, time: null, comment: null },
];

const MOCK_AUDIT = [
  { action: "Request submitted", actor: "田中 太郎", role: "担当", time: "2024-01-15 09:23:41" },
  { action: "GPS verified · Tokyo 35.6762°N", actor: "System", role: "AUTO", time: "2024-01-15 09:23:41" },
  { action: "Biometric verified", actor: "System", role: "AUTO", time: "2024-01-15 09:23:42" },
  { action: "Fraud check passed · No flags", actor: "System", role: "AUTO", time: "2024-01-15 09:23:43" },
  { action: "Forwarded to 課長", actor: "佐藤 健二", role: "係長", time: "2024-01-15 11:45:02" },
  { action: "SLA timer started (48h)", actor: "System", role: "AUTO", time: "2024-01-15 11:45:02" },
];

const MOCK_COMMENTS = [
  { author: "佐藤 健二", role: "係長", time: "2024-01-15 11:44:30", text: "GPS と領収書の住所が一致しています。問題なし。" },
  { author: "山田 次郎", role: "課長", time: "2024-01-15 14:02:11", text: "領収書の詳細をもう少し教えてください。新幹線のeチケットか紙チケットかを確認したい。" },
  { author: "田中 太郎", role: "担当", time: "2024-01-15 14:28:55", text: "eチケットです。スクリーンショットを追加で添付します。" },
];

type ModalType = "approve" | "reject" | "revise" | null;

const statusColor: Record<Status, string> = {
  pending: "#f59e0b",
  approved: "#22c55e",
  rejected: "#ef4444",
  revision: "#f59e0b",
  escalated: "#a78bfa",
};

export default function RequestDetailPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [modal, setModal] = useState<ModalType>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectOther, setRejectOther] = useState("");
  const [reviseText, setReviseText] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [actionDone, setActionDone] = useState<"approved" | "rejected" | "revised" | null>(null);
  const router = useRouter();
  const t = lang === "jp" ? jp : en;

  const slaHours = 31;
  const slaColor = slaHours < 4 ? "#ef4444" : slaHours < 12 ? "#f59e0b" : slaHours < 36 ? "#f59e0b" : "#666";
  const slaPercent = Math.max(0, (slaHours / 48) * 100);

  const handleAction = (type: "approve" | "reject" | "revise") => {
    setActionDone(type === "approve" ? "approved" : type === "reject" ? "rejected" : "revised");
    setModal(null);
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    setComments([...comments, {
      author: "山田 次郎",
      role: "課長",
      time: new Date().toISOString().replace("T", " ").slice(0, 19),
      text: comment,
    }]);
    setComment("");
  };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#0a0a0a", minHeight: "100vh", color: "#e5e5e5" }}>
      {/* Navbar */}
      <nav style={{ background: "#111", borderBottom: "1px solid #1f1f1f", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ color: "#7c3aed", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.5px" }}>{t.logo}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => setLang(lang === "en" ? "jp" : "en")} style={btnStyle("#1f1f1f", "#aaa")}>{lang === "en" ? "JP" : "EN"}</button>
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

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px 80px" }}>
        {/* Back + title */}
        <div style={{ marginBottom: "28px" }}>
          <button style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: "13px", padding: 0, marginBottom: "12px" }}>{t.back}</button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0, color: "#f5f5f5", letterSpacing: "-0.5px" }}>{t.requestDetail}</h1>
              <p style={{ color: "#555", fontSize: "13px", marginTop: "4px" }}>{MOCK_REQUEST.id}</p>
            </div>
            <div style={{ background: "#1a0f00", border: `1px solid ${slaColor}`, borderRadius: "4px", padding: "8px 16px", textAlign: "right" }}>
              <p style={{ color: "#666", fontSize: "11px", margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.slaLabel}</p>
              <p style={{ color: slaColor, fontSize: "20px", fontWeight: 700, margin: "2px 0 6px", fontVariantNumeric: "tabular-nums" }}>{slaHours}h remaining</p>
              <div style={{ width: "140px", height: "3px", background: "#1f1f1f", borderRadius: "2px" }}>
                <div style={{ width: `${slaPercent}%`, height: "100%", background: slaColor, borderRadius: "2px" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Action done banner */}
        {actionDone && (
          <div style={{ background: actionDone === "approved" ? "#0d1f0d" : actionDone === "rejected" ? "#1f0d0d" : "#1a1200", border: `1px solid ${actionDone === "approved" ? "#1a3a1a" : actionDone === "rejected" ? "#3a1a1a" : "#3a2800"}`, borderRadius: "4px", padding: "12px 16px", marginBottom: "24px", color: actionDone === "approved" ? "#22c55e" : actionDone === "rejected" ? "#ef4444" : "#f59e0b", fontSize: "14px" }}>
            ✓ {actionDone === "approved" ? (lang === "en" ? "Request approved and logged." : "承認済み・記録完了") : actionDone === "rejected" ? (lang === "en" ? "Request rejected and logged." : "却下済み・記録完了") : (lang === "en" ? "Revision requested. SLA timer frozen." : "差し戻し済み・タイマー一時停止")}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Request info card */}
            <Card>
              <SectionLabel>{t.requestDetail}</SectionLabel>
              <InfoRow label={t.submittedBy} value={MOCK_REQUEST.submittedBy} />
              <InfoRow label={t.submittedAt} value={MOCK_REQUEST.submittedAt} mono />
              <InfoRow label={t.requestType} value={MOCK_REQUEST.type} />
              <InfoRow label={t.amount} value={MOCK_REQUEST.amount} accent />
              <div style={{ marginTop: "16px" }}>
                <p style={labelStyle()}>{t.justification}</p>
                <p style={{ color: "#ccc", fontSize: "14px", lineHeight: "1.7", background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: "4px", padding: "12px" }}>{MOCK_REQUEST.justification}</p>
              </div>
            </Card>

            {/* Anti-fraud card */}
            <Card>
              <SectionLabel>Anti-fraud · セキュリティ</SectionLabel>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <FraudBadge label={t.gpsLabel} value={MOCK_REQUEST.gps} ok />
                <FraudBadge label={t.selfieLabel} value={t.selfieVerified} ok />
                <FraudBadge label={t.receiptLabel} value={MOCK_REQUEST.receiptFile} ok />
              </div>
            </Card>

            {/* Approval chain */}
            <Card>
              <SectionLabel>{t.approvalChain}</SectionLabel>
              <p style={{ color: "#555", fontSize: "11px", marginBottom: "16px" }}>{t.chainGenerated}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {MOCK_CHAIN.map((node, i) => (
                  <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, border: `2px solid ${node.status === "approved" ? "#22c55e" : node.status === "pending" ? (i === 2 ? "#7c3aed" : "#2f2f2f") : "#ef4444"}`, background: node.status === "approved" ? "#0d1f0d" : node.status === "pending" ? (i === 2 ? "#12073a" : "#0a0a0a") : "#1f0d0d", color: node.status === "approved" ? "#22c55e" : node.status === "pending" ? (i === 2 ? "#a78bfa" : "#444") : "#ef4444", flexShrink: 0 }}>
                        {node.status === "approved" ? "✓" : i + 1}
                      </div>
                      {i < MOCK_CHAIN.length - 1 && <div style={{ width: "1px", height: "32px", background: node.status === "approved" ? "#22c55e33" : "#1f1f1f" }} />}
                    </div>
                    <div style={{ paddingBottom: "16px", flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#e5e5e5" }}>{node.name}</span>
                        <span style={{ fontSize: "11px", color: "#555" }}>{node.role}</span>
                        <span style={{ fontSize: "11px", color: statusColor[node.status], background: `${statusColor[node.status]}15`, padding: "1px 6px", borderRadius: "3px" }}>
                          {node.status === "approved" ? (lang === "en" ? "Approved" : "承認済み") : node.status === "pending" ? (lang === "en" ? "Pending" : "待機中") : (lang === "en" ? "Rejected" : "却下")}
                        </span>
                      </div>
                      {node.time && <p style={{ fontSize: "11px", color: "#555", margin: "2px 0", fontFamily: "monospace" }}>{node.time}</p>}
                      {node.comment && <p style={{ fontSize: "12px", color: "#888", margin: "4px 0 0" }}>{node.comment}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Comment thread */}
            <Card>
              <SectionLabel>{t.comments}</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                {comments.map((c, i) => (
                  <div key={i} style={{ background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: "4px", padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#e5e5e5" }}>{c.author}</span>
                      <span style={{ fontSize: "11px", color: "#555", background: "#1a1a1a", padding: "1px 6px", borderRadius: "3px" }}>{c.role}</span>
                      <span style={{ fontSize: "11px", color: "#444", marginLeft: "auto", fontFamily: "monospace" }}>{c.time}</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#bbb", margin: 0, lineHeight: "1.6" }}>{c.text}</p>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <input value={comment} onChange={(e) => setComment(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleComment()} placeholder={t.commentPlaceholder} style={{ flex: 1, background: "#111", border: "1px solid #1f1f1f", borderRadius: "4px", color: "#e5e5e5", padding: "8px 12px", fontSize: "13px", outline: "none" }} />
                <button onClick={handleComment} style={{ background: "#7c3aed", border: "none", borderRadius: "4px", color: "white", padding: "8px 16px", cursor: "pointer", fontSize: "13px", fontWeight: 600 }}>{t.sendComment}</button>
              </div>
            </Card>

            {/* Audit log */}
            <Card>
              <SectionLabel>{t.auditLog}</SectionLabel>
              <p style={{ color: "#555", fontSize: "11px", marginBottom: "12px" }}>{t.auditImmutable}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {MOCK_AUDIT.map((entry, i) => (
                  <div key={i} style={{ display: "flex", gap: "12px", padding: "8px 0", borderBottom: i < MOCK_AUDIT.length - 1 ? "1px solid #111" : "none" }}>
                    <span style={{ fontSize: "11px", color: "#444", fontFamily: "monospace", whiteSpace: "nowrap", minWidth: "130px" }}>{entry.time}</span>
                    <span style={{ fontSize: "11px", color: entry.role === "AUTO" ? "#555" : "#a78bfa", minWidth: "60px" }}>{entry.role === "AUTO" ? "SYSTEM" : entry.actor}</span>
                    <span style={{ fontSize: "12px", color: "#888" }}>{entry.action}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column — action panel */}
          <div style={{ position: "sticky", top: "72px", height: "fit-content" }}>
            <Card>
              <SectionLabel>{t.actionPanel}</SectionLabel>
              {!actionDone ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <button onClick={() => setModal("approve")} style={{ width: "100%", padding: "14px", borderRadius: "4px", border: "none", background: "#7c3aed", color: "white", fontSize: "15px", fontWeight: 700, cursor: "pointer", letterSpacing: "-0.2px" }}>
                    ✓ {t.approve}
                  </button>
                  <button onClick={() => setModal("revise")} style={{ width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #3a2800", background: "#1a1200", color: "#f59e0b", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                    ↩ {t.revise}
                  </button>
                  <button onClick={() => setModal("reject")} style={{ width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #3a1a1a", background: "#1f0d0d", color: "#ef4444", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                    ✕ {t.reject}
                  </button>
                </div>
              ) : (
                <p style={{ color: "#555", fontSize: "13px", textAlign: "center", padding: "16px 0" }}>Action recorded.</p>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "#000000cc", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "4px", padding: "28px", width: "440px", maxWidth: "90vw" }}>

            {modal === "approve" && (
              <>
                <h3 style={{ margin: "0 0 12px", color: "#f5f5f5", fontSize: "16px" }}>✓ {t.approve}</h3>
                <p style={{ color: "#666", fontSize: "13px", marginBottom: "20px" }}>{t.permanent}</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleAction("approve")} style={{ flex: 1, padding: "12px", background: "#7c3aed", border: "none", borderRadius: "4px", color: "white", fontWeight: 700, cursor: "pointer" }}>{t.confirm}</button>
                  <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", background: "#1a1a1a", border: "1px solid #2f2f2f", borderRadius: "4px", color: "#888", cursor: "pointer" }}>{t.cancel}</button>
                </div>
              </>
            )}

            {modal === "reject" && (
              <>
                <h3 style={{ margin: "0 0 16px", color: "#ef4444", fontSize: "16px" }}>✕ {t.rejectReason}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                  {Object.entries(t.rejectReasons).map(([key, label]) => (
                    <button key={key} onClick={() => setRejectReason(key)} style={{ padding: "10px 14px", borderRadius: "4px", border: `1px solid ${rejectReason === key ? "#ef4444" : "#1f1f1f"}`, background: rejectReason === key ? "#1f0d0d" : "#0d0d0d", color: rejectReason === key ? "#ef4444" : "#888", cursor: "pointer", textAlign: "left", fontSize: "13px" }}>
                      {label}
                    </button>
                  ))}
                </div>
                {rejectReason === "OTHER" && (
                  <textarea value={rejectOther} onChange={(e) => setRejectOther(e.target.value)} placeholder={lang === "en" ? "Explain (min 15 chars)..." : "理由を入力 (15文字以上)..."} rows={3} style={{ width: "100%", background: "#0d0d0d", border: `1px solid ${rejectOther.length > 0 && rejectOther.length < 15 ? "#ef4444" : "#1f1f1f"}`, borderRadius: "4px", color: "#e5e5e5", padding: "8px 12px", fontSize: "13px", resize: "none", boxSizing: "border-box", outline: "none", marginBottom: "12px" }} />
                )}
                <p style={{ color: "#555", fontSize: "12px", marginBottom: "16px" }}>{t.permanent}</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleAction("reject")} disabled={!rejectReason || (rejectReason === "OTHER" && rejectOther.length < 15)} style={{ flex: 1, padding: "12px", background: rejectReason && !(rejectReason === "OTHER" && rejectOther.length < 15) ? "#ef4444" : "#1a1a1a", border: "none", borderRadius: "4px", color: "white", fontWeight: 700, cursor: "pointer" }}>{t.confirm}</button>
                  <button onClick={() => setModal(null)} style={{ flex: 1, padding: "12px", background: "#1a1a1a", border: "1px solid #2f2f2f", borderRadius: "4px", color: "#888", cursor: "pointer" }}>{t.cancel}</button>
                </div>
              </>
            )}

            {modal === "revise" && (
              <>
                <h3 style={{ margin: "0 0 16px", color: "#f59e0b", fontSize: "16px" }}>↩ {t.revise}</h3>
                <textarea value={reviseText} onChange={(e) => setReviseText(e.target.value)} placeholder={lang === "en" ? "Provide specific guidance (min 15 chars)..." : "具体的な修正指示を入力 (15文字以上)..."} rows={4} style={{ width: "100%", background: "#0d0d0d", border: `1px solid ${reviseText.length > 0 && reviseText.length < 15 ? "#ef4444" : "#1f1f1f"}`, borderRadius: "4px", color: "#e5e5e5", padding: "8px 12px", fontSize: "13px", resize: "none", boxSizing: "border-box", outline: "none", marginBottom: "10px" }} />
                <p style={{ color: "#f59e0b", fontSize: "12px", marginBottom: "16px" }}>{t.timerFreeze}</p>
                <p style={{ color: "#555", fontSize: "12px", marginBottom: "16px" }}>{t.permanent}</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleAction("revise")} disabled={reviseText.length < 15} style={{ flex: 1, padding: "12px", background: reviseText.length >= 15 ? "#f59e0b" : "#1a1a1a", border: "none", borderRadius: "4px", color: reviseText.length >= 15 ? "#000" : "#555", fontWeight: 700, cursor: "pointer" }}>{t.confirm}</button>
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

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "4px", padding: "20px" }}>{children}</div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px", fontWeight: 600 }}>{children}</p>;
}

function InfoRow({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #0f0f0f" }}>
      <span style={{ fontSize: "12px", color: "#555" }}>{label}</span>
      <span style={{ fontSize: "13px", color: accent ? "#a78bfa" : "#ccc", fontFamily: mono ? "monospace" : "inherit", fontWeight: accent ? 700 : 400 }}>{value}</span>
    </div>
  );
}

function FraudBadge({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div style={{ background: ok ? "#0d1f0d" : "#1f0d0d", border: `1px solid ${ok ? "#1a3a1a" : "#3a1a1a"}`, borderRadius: "4px", padding: "10px 14px", minWidth: "160px" }}>
      <p style={{ fontSize: "11px", color: "#555", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ fontSize: "12px", color: ok ? "#22c55e" : "#ef4444", margin: 0 }}>{ok ? "✓ " : "✕ "}{value}</p>
    </div>
  );
}

function labelStyle(): React.CSSProperties {
  return { fontSize: "12px", color: "#555", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" };
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return { background: bg, border: "1px solid #2f2f2f", color, borderRadius: "4px", padding: "4px 12px", cursor: "pointer", fontSize: "12px" };
}