"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lang = "jp" | "en";
type RequestType = "expense" | "sop" | "proposal" | null;
type SopScope = "team" | "department" | "company";

const jp = {
  logo: "Hanko 判子",
  role: "担当 · 申請者",
  logout: "ログアウト",
  pageTitle: "新規申請",
  pageSubtitle: "申請種別を選択してください",
  types: {
    expense: { title: "経費申請", desc: "交通費、接待費、備品購入など" },
    sop: { title: "SOP改訂", desc: "社内規則・手順書の変更申請" },
    proposal: { title: "企画提案", desc: "新規プロジェクト・ツール導入の承認申請" },
  },
  amount: "金額 (¥)",
  category: "費目",
  categories: ["交通費", "接待費", "備品購入", "出張費", "その他"],
  receipt: "領収書",
  receiptNote: "OCRが金額と日付を自動読取",
  justification: "申請理由",
  gps: "GPS位置情報",
  gpsCaptured: "位置情報取得済み",
  gpsNote: "領収書の住所と照合されます",
  selfie: "本人確認",
  selfieBtn: "撮影する (ライブカメラのみ)",
  selfieVerified: "確認済み",
  selfieNote: "ギャラリー写真は使用不可",
  targetDoc: "対象規程",
  targetDocs: ["経費規程", "勤怠規程", "安全規程", "その他"],
  scope: "適用範囲",
  scopeOptions: { team: "自分のチーム", department: "部署全体", company: "会社全体" },
  oldText: "現行テキスト (変更前)",
  newText: "改訂テキスト (変更後)",
  projectTitle: "プロジェクト名",
  summary: "概要 (最大200語)",
  budget: "予算 (¥)",
  attachment: "添付ファイル / リンク",
  uploadPdf: "PDFをアップロード",
  pasteLink: "リンクを貼り付け",
  chainLabel: "承認ルート (自動生成)",
  submit: "申請する",
  submitted: "申請を送信しました",
  routing: {
    kacho: "→ 課長 (Kachō) が承認",
    bucho: "→ 部長 (Buchō) が承認",
    shacho: "→ 社長 (Shachō) が承認",
    auto: "→ 自動承認の可能性あり",
  },
  chars: "文字",
  words: "語",
  required: "必須項目です",
  emailError: "会社メールを使用してください",
};

const en = {
  logo: "Hanko 判子",
  role: "担当 · Submitter",
  logout: "Logout",
  pageTitle: "New Request",
  pageSubtitle: "Select a request type to begin",
  types: {
    expense: { title: "Expense Reimbursement", desc: "Travel, entertainment, office supplies" },
    sop: { title: "SOP / Rule Update", desc: "Internal rule or procedure change" },
    proposal: { title: "Project Proposal", desc: "New project or tool approval" },
  },
  amount: "Amount (¥)",
  category: "Category",
  categories: ["Transportation", "Entertainment", "Office Supplies", "Business Trip", "Other"],
  receipt: "Receipt",
  receiptNote: "OCR will auto-read amount and date",
  justification: "Justification",
  gps: "GPS Location",
  gpsCaptured: "Location captured",
  gpsNote: "Cross-referenced with receipt address",
  selfie: "Identity Verification",
  selfieBtn: "Take Selfie (Live camera only)",
  selfieVerified: "Verified",
  selfieNote: "Gallery photos are blocked",
  targetDoc: "Target Document",
  targetDocs: ["Expense Policy", "Attendance Policy", "Safety Policy", "Other"],
  scope: "Scope",
  scopeOptions: { team: "My Team", department: "My Department", company: "Company-wide" },
  oldText: "Current Text (Before)",
  newText: "Revised Text (After)",
  projectTitle: "Project Title",
  summary: "Executive Summary (max 200 words)",
  budget: "Budget (¥)",
  attachment: "Attachment / Link",
  uploadPdf: "Upload PDF",
  pasteLink: "Paste Link",
  chainLabel: "Approval Chain · Auto-generated from org chart",
  submit: "Submit Request",
  submitted: "Request submitted successfully",
  routing: {
    kacho: "→ Will be reviewed by Kachō (課長)",
    bucho: "→ Will be reviewed by Buchō (部長)",
    shacho: "→ Will be reviewed by Shachō (社長)",
    auto: "→ May qualify for auto-approval",
  },
  chars: "chars",
  words: "words",
  required: "This field is required",
  emailError: "Must use corporate email",
};

const CHAIN_NODES = ["担当", "係長", "課長", "部長", "社長"];
const CHAIN_LEVELS = { kacho: 2, bucho: 3, shacho: 4 };

function countWords(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export default function NewRequestPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [requestType, setRequestType] = useState<RequestType>(null);
  const [submitted, setSubmitted] = useState(false);

  // Expense fields
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [receiptFile, setReceiptFile] = useState<string | null>(null);
  const [justification, setJustification] = useState("");
  const [selfieVerified, setSelfieVerified] = useState(false);
  const router = useRouter();
  // SOP fields
  const [targetDoc, setTargetDoc] = useState("");
  const [scope, setScope] = useState<SopScope | "">("");
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [sopJustification, setSopJustification] = useState("");

  // Proposal fields
  const [projectTitle, setProjectTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [budget, setBudget] = useState("");
  const [attachmentMode, setAttachmentMode] = useState<"pdf" | "link">("pdf");
  const [attachmentValue, setAttachmentValue] = useState("");
  const [proposalJustification, setProposalJustification] = useState("");

  const t = lang === "jp" ? jp : en;

  const getExpenseRouting = () => {
    const n = parseInt(amount);
    if (!n || isNaN(n)) return null;
    if (n <= 100000) return { label: t.routing.kacho, level: "kacho" };
    if (n <= 1000000) return { label: t.routing.bucho, level: "bucho" };
    return { label: t.routing.shacho, level: "shacho" };
  };

  const getSopRouting = () => {
    if (!scope) return null;
    if (scope === "team") return { label: t.routing.kacho, level: "kacho" };
    if (scope === "department") return { label: t.routing.bucho, level: "bucho" };
    return { label: t.routing.shacho, level: "shacho" };
  };

  const getProposalRouting = () => {
    const n = parseInt(budget);
    if (!n || isNaN(n)) return null;
    if (n < 500000) return { label: t.routing.auto, level: "kacho" };
    if (n <= 1000000) return { label: t.routing.bucho, level: "bucho" };
    return { label: t.routing.shacho, level: "shacho" };
  };

  const routing =
    requestType === "expense"
      ? getExpenseRouting()
      : requestType === "sop"
      ? getSopRouting()
      : requestType === "proposal"
      ? getProposalRouting()
      : null;

  const activeNodeIndex = routing ? CHAIN_LEVELS[routing.level as keyof typeof CHAIN_LEVELS] : null;

  const isExpenseValid =
    !!amount && !!category && !!receiptFile && justification.length >= 50 && selfieVerified;
  const isSopValid =
    !!targetDoc && !!scope && oldText.length >= 10 && newText.length >= 10 && sopJustification.length >= 50;
  const isProposalValid =
    !!projectTitle && countWords(summary) >= 10 && !!budget && !!attachmentValue && proposalJustification.length >= 50;

  const isSubmitEnabled =
    (requestType === "expense" && isExpenseValid) ||
    (requestType === "sop" && isSopValid) ||
    (requestType === "proposal" && isProposalValid);

  const handleSubmit = () => {
    console.log({ requestType, amount, category, justification, scope, projectTitle, budget });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const s: React.CSSProperties = {
    fontFamily: "Inter, system-ui, sans-serif",
    background: "#0a0a0a",
    minHeight: "100vh",
    color: "#e5e5e5",
  };
  
  return (
    <div style={s}>
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

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Page title */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: "#f5f5f5", letterSpacing: "-0.5px" }}>{t.pageTitle}</h1>
          <p style={{ color: "#666", marginTop: "6px", fontSize: "14px" }}>{t.pageSubtitle}</p>
        </div>

        {/* Request type cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "40px" }}>
          {(["expense", "sop", "proposal"] as const).map((type) => (
            <button key={type} onClick={() => setRequestType(type)} style={{ background: requestType === type ? "#12073a" : "#111", border: `1px solid ${requestType === type ? "#7c3aed" : "#1f1f1f"}`, borderRadius: "4px", padding: "20px 16px", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s" }}>
              <div style={{ fontSize: "22px", marginBottom: "8px" }}>
                {type === "expense" ? "¥" : type === "sop" ? "📋" : "🚀"}
              </div>
              <div style={{ color: requestType === type ? "#a78bfa" : "#e5e5e5", fontWeight: 600, fontSize: "14px", marginBottom: "6px" }}>{t.types[type].title}</div>
              <div style={{ color: "#666", fontSize: "12px", lineHeight: "1.5" }}>{t.types[type].desc}</div>
            </button>
          ))}
        </div>

        {/* Dynamic form */}
        {requestType && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* ── EXPENSE FORM ── */}
            {requestType === "expense" && (
              <>
                <Field label={t.amount}>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="45000" style={inputStyle} />
                  {routing && <p style={{ color: budget || amount ? "#7c3aed" : "#666", marginTop: "6px", fontSize: "13px" }}>{routing.label}</p>}
                </Field>

                <Field label={t.category}>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                    <option value="">—</option>
                    {t.categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label={t.receipt} note={t.receiptNote}>
                  {receiptFile ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#22c55e", fontSize: "13px" }}>
                      <span>✓</span><span>{receiptFile}</span>
                    </div>
                  ) : (
                    <label style={{ ...inputStyle, display: "inline-block", cursor: "pointer", color: "#888", textAlign: "center" }}>
                      {lang === "en" ? "Choose file" : "ファイルを選択"}
                      <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={(e) => setReceiptFile(e.target.files?.[0]?.name ?? null)} />
                    </label>
                  )}
                </Field>

                <Field label={t.justification}>
                  <textarea value={justification} onChange={(e) => setJustification(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical", border: `1px solid ${justification.length > 0 && justification.length < 50 ? "#ef4444" : "#1f1f1f"}` }} />
                  <p style={{ fontSize: "12px", color: justification.length >= 50 ? "#22c55e" : "#666", marginTop: "4px" }}>{justification.length}/50 {t.chars}</p>
                </Field>

                <Field label={t.gps} note={t.gpsNote}>
                  <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "4px", padding: "10px 14px", fontSize: "13px", color: "#22c55e" }}>
                    📍 Tokyo, Japan (35.6762° N, 139.6503° E) · {t.gpsCaptured}
                  </div>
                </Field>

                <Field label={t.selfie} note={t.selfieNote}>
                  {selfieVerified ? (
                    <div style={{ color: "#22c55e", fontSize: "13px" }}>✓ {t.selfieVerified}</div>
                  ) : (
                    <button onClick={() => setSelfieVerified(true)} style={{ ...btnSecondary, borderColor: "#7c3aed", color: "#a78bfa" }}>{t.selfieBtn}</button>
                  )}
                </Field>
              </>
            )}

            {/* ── SOP FORM ── */}
            {requestType === "sop" && (
              <>
                <Field label={t.targetDoc}>
                  <select value={targetDoc} onChange={(e) => setTargetDoc(e.target.value)} style={inputStyle}>
                    <option value="">—</option>
                    {t.targetDocs.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </Field>

                <Field label={t.scope}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {(["team", "department", "company"] as SopScope[]).map((s) => (
                      <button key={s} onClick={() => setScope(s)} style={{ flex: 1, padding: "10px", borderRadius: "4px", border: `1px solid ${scope === s ? "#7c3aed" : "#1f1f1f"}`, background: scope === s ? "#12073a" : "#111", color: scope === s ? "#a78bfa" : "#888", cursor: "pointer", fontSize: "13px" }}>
                        {t.scopeOptions[s]}
                      </button>
                    ))}
                  </div>
                  {getSopRouting() && <p style={{ color: "#7c3aed", fontSize: "13px", marginTop: "6px" }}>{getSopRouting()!.label}</p>}
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <Field label={t.oldText}>
                    <textarea value={oldText} onChange={(e) => setOldText(e.target.value)} rows={5} style={{ ...inputStyle, resize: "vertical", borderColor: "#3a1a1a", background: "#110a0a" }} />
                  </Field>
                  <Field label={t.newText}>
                    <textarea value={newText} onChange={(e) => setNewText(e.target.value)} rows={5} style={{ ...inputStyle, resize: "vertical", borderColor: "#1a3a1a", background: "#0a110a" }} />
                  </Field>
                </div>

                <Field label={t.justification}>
                  <textarea value={sopJustification} onChange={(e) => setSopJustification(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical", border: `1px solid ${sopJustification.length > 0 && sopJustification.length < 50 ? "#ef4444" : "#1f1f1f"}` }} />
                  <p style={{ fontSize: "12px", color: sopJustification.length >= 50 ? "#22c55e" : "#666", marginTop: "4px" }}>{sopJustification.length}/50 {t.chars}</p>
                </Field>
              </>
            )}

            {/* ── PROPOSAL FORM ── */}
            {requestType === "proposal" && (
              <>
                <Field label={t.projectTitle}>
                  <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} maxLength={100} placeholder={lang === "en" ? "e.g. Customer Portal v2" : "例：顧客ポータルv2"} style={inputStyle} />
                </Field>

                <Field label={t.summary}>
                  <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={5} style={{ ...inputStyle, resize: "vertical" }} />
                  <p style={{ fontSize: "12px", color: countWords(summary) > 200 ? "#ef4444" : "#666", marginTop: "4px" }}>{countWords(summary)}/200 {t.words}</p>
                </Field>

                <Field label={t.budget}>
                  <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="500000" style={inputStyle} />
                  {getProposalRouting() && (
                    <p style={{ color: parseInt(budget) < 500000 ? "#22c55e" : "#7c3aed", fontSize: "13px", marginTop: "6px" }}>{getProposalRouting()!.label}</p>
                  )}
                </Field>

                <Field label={t.attachment}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    {(["pdf", "link"] as const).map((m) => (
                      <button key={m} onClick={() => { setAttachmentMode(m); setAttachmentValue(""); }} style={{ padding: "6px 16px", borderRadius: "4px", border: `1px solid ${attachmentMode === m ? "#7c3aed" : "#1f1f1f"}`, background: attachmentMode === m ? "#12073a" : "#111", color: attachmentMode === m ? "#a78bfa" : "#888", cursor: "pointer", fontSize: "13px" }}>
                        {m === "pdf" ? t.uploadPdf : t.pasteLink}
                      </button>
                    ))}
                  </div>
                  {attachmentMode === "pdf" ? (
                    <label style={{ ...inputStyle, display: "inline-block", cursor: "pointer", color: "#888", textAlign: "center" }}>
                      {attachmentValue || (lang === "en" ? "Choose PDF" : "PDFを選択")}
                      <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={(e) => setAttachmentValue(e.target.files?.[0]?.name ?? "")} />
                    </label>
                  ) : (
                    <input type="url" value={attachmentValue} onChange={(e) => setAttachmentValue(e.target.value)} placeholder="https://..." style={inputStyle} />
                  )}
                </Field>

                <Field label={t.justification}>
                  <textarea value={proposalJustification} onChange={(e) => setProposalJustification(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical", border: `1px solid ${proposalJustification.length > 0 && proposalJustification.length < 50 ? "#ef4444" : "#1f1f1f"}` }} />
                  <p style={{ fontSize: "12px", color: proposalJustification.length >= 50 ? "#22c55e" : "#666", marginTop: "4px" }}>{proposalJustification.length}/50 {t.chars}</p>
                </Field>
              </>
            )}

            {/* Approval chain */}
            {routing && (
              <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "4px", padding: "20px" }}>
                <p style={{ color: "#666", fontSize: "12px", marginBottom: "16px", letterSpacing: "0.05em", textTransform: "uppercase" }}>{t.chainLabel}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                  {CHAIN_NODES.map((node, i) => {
                    const isActive = i === activeNodeIndex;
                    const isPassed = activeNodeIndex !== null && i < activeNodeIndex;
                    const isSkipped = activeNodeIndex !== null && i > activeNodeIndex;
                    return (
                      <div key={node} style={{ display: "flex", alignItems: "center", flex: i < CHAIN_NODES.length - 1 ? 1 : "none" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, border: `2px solid ${isActive ? "#7c3aed" : isPassed ? "#22c55e" : "#2f2f2f"}`, background: isActive ? "#12073a" : isPassed ? "#0d1f0d" : "#0a0a0a", color: isActive ? "#a78bfa" : isPassed ? "#22c55e" : "#444" }}>
                            {isPassed ? "✓" : i + 1}
                          </div>
                          <span style={{ fontSize: "10px", color: isActive ? "#a78bfa" : isPassed ? "#22c55e" : isSkipped ? "#333" : "#555", whiteSpace: "nowrap" }}>{node}</span>
                        </div>
                        {i < CHAIN_NODES.length - 1 && (
                          <div style={{ flex: 1, height: "1px", background: isPassed ? "#22c55e" : "#1f1f1f", margin: "0 4px", marginBottom: "20px" }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={!isSubmitEnabled} style={{ width: "100%", padding: "14px", borderRadius: "4px", border: "none", background: isSubmitEnabled ? "#7c3aed" : "#1a1a1a", color: isSubmitEnabled ? "#fff" : "#444", fontSize: "15px", fontWeight: 600, cursor: isSubmitEnabled ? "pointer" : "not-allowed", letterSpacing: "-0.2px", transition: "background 0.15s" }}>
              {t.submit}
            </button>

            {submitted && (
              <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "4px", padding: "12px 16px", color: "#22c55e", fontSize: "14px", textAlign: "center" }}>
                ✓ {t.submitted}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#aaa", marginBottom: "8px", letterSpacing: "0.02em" }}>{label}</label>
      {children}
      {note && <p style={{ fontSize: "12px", color: "#555", marginTop: "5px" }}>{note}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#111",
  border: "1px solid #1f1f1f",
  borderRadius: "4px",
  color: "#e5e5e5",
  padding: "10px 12px",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const btnSecondary: React.CSSProperties = {
  background: "#111",
  border: "1px solid #1f1f1f",
  borderRadius: "4px",
  color: "#aaa",
  padding: "8px 16px",
  cursor: "pointer",
  fontSize: "13px",
};