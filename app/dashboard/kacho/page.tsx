"use client";

import { FormEvent, useMemo, useState } from "react";

type Language = "jp" | "en" | "mn";
type RequestStatus = "pending" | "approved" | "rejected" | "revision";
type RequestAction = "approve" | "reject" | "revision";
type RejectReason = "BUDGET_EXCEEDED" | "MISSING_RECEIPT" | "INVALID_LOCATION" | "OTHER" | "";

type PendingRequest = {
  id: string;
  requester: string;
  amount: string;
  type: Record<Language, string>;
  sla: Record<Language, string>;
  urgency: "overdue" | "urgent" | "neutral";
};

type CcRequest = {
  id: string;
  requester: string;
  amount: string;
};

type AuditEntry = {
  id: string;
  requestId: string;
  action: RequestAction;
  actor: string;
  timestamp: string;
  detail: string;
};

const languages: { value: Language; label: string }[] = [
  { value: "jp", label: "JP" },
  { value: "en", label: "EN" },
  { value: "mn", label: "MN" },
];

const text = {
  jp: {
    role: "課長 · Kachō · Хэлтсийн дарга",
    logout: "ログアウト",
    pendingApproval: "承認待ち",
    approvedToday: "本日承認済み",
    overdue: "期限超過",
    withinLimit: "上限内（¥100k）",
    ccNotifications: "CC通知（上限超過）",
    requests: "件",
    fyiTitle: "情報通知",
    routedToBucho: "→ 部長へ転送済み",
    readOnly: "読み取り専用",
    queueTitle: "承認待ち申請",
    queueHint: "SLA順 · ¥100,000以下は課長が最終承認",
    requester: "申請者",
    amount: "金額",
    type: "種別",
    sla: "SLA",
    approve: "承認",
    reject: "却下",
    revise: "差し戻し",
    approved: "承認済み",
    rejected: "却下済み",
    revisionRequested: "差し戻し中",
    frozen: "SLA一時停止中",
    rejectTitle: "却下理由",
    rejectReason: "却下理由",
    otherExplanation: "その他の説明",
    otherPlaceholder: "15文字以上で説明してください。",
    rejectWarning: "永久に記録されます",
    confirmReject: "却下を確定",
    cancel: "キャンセル",
    rejectValidation: "却下理由を選択してください。",
    otherValidation: "OTHERの場合、15文字以上の説明が必要です。",
    revisionTitle: "差し戻し",
    guidance: "修正指示",
    guidancePlaceholder: "提出者への修正指示を15文字以上で入力してください。",
    revisionValidation: "修正指示は15文字以上で入力してください。",
    timerNotice: "⏸ SLAタイマーは再提出まで一時停止します",
    confirmRevision: "差し戻しを確定",
    auditTitle: "監査ログ",
    auditHint: "編集・削除できない永続アクション履歴",
    actor: "佐々木 課長",
    noAudit: "アクションはまだありません。",
    actions: {
      approve: "承認",
      reject: "却下",
      revision: "差し戻し",
    },
    rejectReasons: {
      BUDGET_EXCEEDED: "予算超過",
      MISSING_RECEIPT: "領収書不足",
      INVALID_LOCATION: "場所不一致",
      OTHER: "その他",
    },
  },
  en: {
    role: "課長 · Kachō · Хэлтсийн дарга",
    logout: "Logout",
    pendingApproval: "Pending approval",
    approvedToday: "Approved today",
    overdue: "Overdue",
    withinLimit: "Within limit (¥100k)",
    ccNotifications: "CC notifications (above limit)",
    requests: "requests",
    fyiTitle: "FYI",
    routedToBucho: "→ Routed to Buchō",
    readOnly: "Read-only",
    queueTitle: "Pending Approval",
    queueHint: "Sorted by SLA · Kachō has final authority up to ¥100,000",
    requester: "Requester",
    amount: "Amount",
    type: "Type",
    sla: "SLA",
    approve: "Approve",
    reject: "Reject",
    revise: "Revise",
    approved: "Approved",
    rejected: "Rejected",
    revisionRequested: "Revision requested",
    frozen: "SLA timer frozen",
    rejectTitle: "Rejection Reason",
    rejectReason: "Rejection reason",
    otherExplanation: "Other explanation",
    otherPlaceholder: "Explain in at least 15 characters.",
    rejectWarning: "This action is permanent",
    confirmReject: "Confirm reject",
    cancel: "Cancel",
    rejectValidation: "Select a rejection reason.",
    otherValidation: "OTHER requires an explanation of at least 15 characters.",
    revisionTitle: "Request Revision",
    guidance: "Revision guidance",
    guidancePlaceholder: "Enter structured guidance for the submitter in at least 15 characters.",
    revisionValidation: "Revision guidance must be at least 15 characters.",
    timerNotice: "⏸ SLA timer will FREEZE until resubmission",
    confirmRevision: "Confirm revision",
    auditTitle: "Audit log",
    auditHint: "Immutable action thread. Entries cannot be edited or deleted.",
    actor: "Sasaki Kachō",
    noAudit: "No actions recorded yet.",
    actions: {
      approve: "Approve",
      reject: "Reject",
      revision: "Request Revision",
    },
    rejectReasons: {
      BUDGET_EXCEEDED: "Budget exceeded",
      MISSING_RECEIPT: "Missing receipt",
      INVALID_LOCATION: "Invalid location",
      OTHER: "Other",
    },
  },
  mn: {
    role: "課長 · Kachō · Хэлтсийн дарга",
    logout: "Гарах",
    pendingApproval: "Зөвшөөрөл хүлээгдэж буй",
    approvedToday: "Өнөөдөр зөвшөөрсөн",
    overdue: "Хугацаа хэтэрсэн",
    withinLimit: "Хязгаарт багтсан (¥100k)",
    ccNotifications: "CC мэдэгдэл (хязгаараас дээш)",
    requests: "хүсэлт",
    fyiTitle: "Мэдэгдэл",
    routedToBucho: "→ Buchō руу дамжуулсан",
    readOnly: "Зөвхөн харах",
    queueTitle: "Хүлээгдэж буй зөвшөөрөл",
    queueHint: "SLA-аар эрэмбэлсэн · Kachō ¥100,000 хүртэл эцсийн зөвшөөрөл өгнө",
    requester: "Хүсэлт гаргагч",
    amount: "Дүн",
    type: "Төрөл",
    sla: "SLA",
    approve: "Зөвшөөрөх",
    reject: "Татгалзах",
    revise: "Засварлуулах",
    approved: "Зөвшөөрсөн",
    rejected: "Татгалзсан",
    revisionRequested: "Засвар хүссэн",
    frozen: "SLA таймер зогссон",
    rejectTitle: "Татгалзах шалтгаан",
    rejectReason: "Татгалзах шалтгаан",
    otherExplanation: "Бусад тайлбар",
    otherPlaceholder: "Хамгийн багадаа 15 тэмдэгтээр тайлбарлана уу.",
    rejectWarning: "Энэ үйлдэл бүртгэгдэнэ",
    confirmReject: "Татгалзлыг батлах",
    cancel: "Цуцлах",
    rejectValidation: "Татгалзах шалтгаан сонгоно уу.",
    otherValidation: "OTHER сонгосон бол хамгийн багадаа 15 тэмдэгтийн тайлбар шаардлагатай.",
    revisionTitle: "Засварлах хүсэлт",
    guidance: "Засварын заавар",
    guidancePlaceholder: "Илгээгчид өгөх заавраа хамгийн багадаа 15 тэмдэгтээр бичнэ үү.",
    revisionValidation: "Засварын заавар хамгийн багадаа 15 тэмдэгт байх ёстой.",
    timerNotice: "⏸ SLA таймер дахин илгээх хүртэл ЗОГСОНО",
    confirmRevision: "Засвар хүсэлтийг батлах",
    auditTitle: "Аудит бүртгэл",
    auditHint: "Өөрчлөх, устгах боломжгүй үйлдлийн түүх",
    actor: "Sasaki Kachō",
    noAudit: "Одоогоор үйлдэл бүртгэгдээгүй.",
    actions: {
      approve: "Зөвшөөрөх",
      reject: "Татгалзах",
      revision: "Засварлах хүсэлт",
    },
    rejectReasons: {
      BUDGET_EXCEEDED: "Төсөв хэтэрсэн",
      MISSING_RECEIPT: "Баримт дутуу",
      INVALID_LOCATION: "Байршил таарахгүй",
      OTHER: "Бусад",
    },
  },
};

const rejectReasons: Exclude<RejectReason, "">[] = [
  "BUDGET_EXCEEDED",
  "MISSING_RECEIPT",
  "INVALID_LOCATION",
  "OTHER",
];

const pendingRequests: PendingRequest[] = [
  {
    id: "KAC-301",
    requester: "田中 太郎",
    amount: "¥75,000",
    type: { jp: "経費申請", en: "Expense", mn: "Зардал" },
    sla: { jp: "期限超過", en: "OVERDUE", mn: "ХУГАЦАА ХЭТЭРСЭН" },
    urgency: "overdue",
  },
  {
    id: "KAC-302",
    requester: "佐藤 花子",
    amount: "¥45,000",
    type: { jp: "文書承認", en: "Document", mn: "Баримт бичиг" },
    sla: { jp: "残り3時間22分", en: "3h 22m remaining", mn: "3 цаг 22 минут үлдсэн" },
    urgency: "urgent",
  },
  {
    id: "KAC-303",
    requester: "山田 次郎",
    amount: "¥90,000",
    type: { jp: "契約承認", en: "Contract", mn: "Гэрээ" },
    sla: { jp: "残り28時間", en: "28h remaining", mn: "28 цаг үлдсэн" },
    urgency: "neutral",
  },
];

const ccRequests: CcRequest[] = [
  { id: "CC-901", requester: "鈴木 一郎", amount: "¥142,000" },
  { id: "CC-902", requester: "高橋 美咲", amount: "¥218,000" },
  { id: "CC-903", requester: "伊藤 健", amount: "¥130,000" },
];

const statusStyles: Record<RequestStatus, string> = {
  pending: "border-zinc-700 bg-[#0a0a0a] text-zinc-300",
  approved: "border-[#22c55e]/30 bg-[#22c55e]/10 text-green-200",
  rejected: "border-[#ef4444]/30 bg-[#ef4444]/10 text-red-200",
  revision: "border-[#f59e0b]/30 bg-[#f59e0b]/10 text-amber-200",
};

export default function KachoDashboardPage() {
  const [activeLanguage, setActiveLanguage] = useState<Language>("jp");
  const [statuses, setStatuses] = useState<Record<string, RequestStatus>>({});
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [revisionId, setRevisionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<RejectReason>("");
  const [otherReason, setOtherReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const [revisionGuidance, setRevisionGuidance] = useState("");
  const [revisionError, setRevisionError] = useState("");
  const t = text[activeLanguage];

  const rejectingRequest = pendingRequests.find((request) => request.id === rejectingId);
  const revisionRequest = pendingRequests.find((request) => request.id === revisionId);

  const pendingCount = useMemo(
    () =>
      pendingRequests.filter((request) => !statuses[request.id] || statuses[request.id] === "pending")
        .length,
    [statuses],
  );

  function timestamp() {
    return new Date().toLocaleString(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  function addAuditEntry(requestId: string, action: RequestAction, detail: string) {
    setAuditLog((current) => [
      {
        id: `${requestId}-${action}-${Date.now()}`,
        requestId,
        action,
        actor: t.actor,
        timestamp: timestamp(),
        detail,
      },
      ...current,
    ]);
  }

  function handleApprove(request: PendingRequest) {
    setStatuses((current) => ({ ...current, [request.id]: "approved" }));
    addAuditEntry(request.id, "approve", request.type[activeLanguage]);
  }

  function openRejectModal(requestId: string) {
    setRejectingId(requestId);
    setRejectReason("");
    setOtherReason("");
    setRejectError("");
  }

  function closeRejectModal() {
    setRejectingId(null);
    setRejectReason("");
    setOtherReason("");
    setRejectError("");
  }

  function openRevisionModal(requestId: string) {
    setRevisionId(requestId);
    setRevisionGuidance("");
    setRevisionError("");
  }

  function closeRevisionModal() {
    setRevisionId(null);
    setRevisionGuidance("");
    setRevisionError("");
  }

  function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!rejectingId) return;

    if (!rejectReason) {
      setRejectError(t.rejectValidation);
      return;
    }

    if (rejectReason === "OTHER" && otherReason.trim().length < 15) {
      setRejectError(t.otherValidation);
      return;
    }

    setStatuses((current) => ({ ...current, [rejectingId]: "rejected" }));
    addAuditEntry(
      rejectingId,
      "reject",
      rejectReason === "OTHER"
        ? `${t.rejectReasons.OTHER}: ${otherReason.trim()}`
        : `${rejectReason} · ${t.rejectReasons[rejectReason]}`,
    );
    closeRejectModal();
  }

  function handleRevision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!revisionId) return;

    if (revisionGuidance.trim().length < 15) {
      setRevisionError(t.revisionValidation);
      return;
    }

    setStatuses((current) => ({ ...current, [revisionId]: "revision" }));
    addAuditEntry(revisionId, "revision", revisionGuidance.trim());
    closeRevisionModal();
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-50">
      <nav className="border-b border-[#1f1f1f] bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p className="text-lg font-semibold tracking-normal text-white">Hanko 判子</p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded border border-[#1f1f1f] bg-[#111111] px-3 py-2 text-sm text-zinc-300">
              {t.role}
            </div>
            <div className="flex w-fit rounded border border-[#1f1f1f] bg-[#111111] p-1">
              {languages.map((language) => {
                const isActive = activeLanguage === language.value;

                return (
                  <button
                    aria-pressed={isActive}
                    className={[
                      "h-8 rounded px-3 text-xs font-semibold transition",
                      isActive ? "bg-[#7c3aed] text-white" : "text-zinc-500 hover:text-zinc-200",
                    ].join(" ")}
                    key={language.value}
                    onClick={() => {
                      setActiveLanguage(language.value);
                      setRejectError("");
                      setRevisionError("");
                    }}
                    type="button"
                  >
                    {language.label}
                  </button>
                );
              })}
            </div>
            <button
              className="h-10 rounded border border-[#1f1f1f] px-4 text-sm font-medium text-zinc-200 transition hover:border-[#7c3aed] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
              type="button"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-3 md:grid-cols-5">
          {[
            [t.pendingApproval, pendingCount],
            [t.approvedToday, 12],
            [t.overdue, 1],
            [t.withinLimit, `8 ${t.requests}`],
            [t.ccNotifications, 3],
          ].map(([label, value]) => (
            <div className="rounded border border-[#1f1f1f] bg-[#111111] p-4" key={label}>
              <p className="text-xs text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded border border-slate-500/20 bg-slate-500/10 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold tracking-normal text-white">{t.fyiTitle}</h1>
            <span className="rounded border border-slate-400/20 px-2 py-1 text-xs font-semibold text-slate-300">
              {t.readOnly}
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {ccRequests.map((request) => (
              <article className="rounded border border-[#1f1f1f] bg-[#111111] p-4" key={request.id}>
                <p className="text-xs text-zinc-500">{request.id}</p>
                <p className="mt-2 font-semibold text-white">{request.requester}</p>
                <p className="mt-1 text-sm text-zinc-300">{request.amount}</p>
                <p className="mt-3 text-xs font-semibold text-slate-300">{t.routedToBucho}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded border border-[#1f1f1f] bg-[#111111] p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold tracking-normal text-white">{t.queueTitle}</h2>
            <p className="mt-1 text-sm text-zinc-500">{t.queueHint}</p>
          </div>

          <div className="grid gap-4">
            {pendingRequests.map((request) => {
              const status = statuses[request.id] ?? "pending";
              const isClosed = status !== "pending";

              return (
                <article
                  className={[
                    "rounded border p-4",
                    request.urgency === "overdue"
                      ? "border-[#ef4444]/40 bg-[#ef4444]/10"
                      : "border-[#1f1f1f] bg-[#0a0a0a]",
                  ].join(" ")}
                  key={request.id}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={["rounded border px-2 py-1 text-xs font-semibold", statusStyles[status]].join(" ")}>
                          {status === "approved"
                            ? t.approved
                            : status === "rejected"
                              ? t.rejected
                              : status === "revision"
                                ? t.revisionRequested
                                : t.pendingApproval}
                        </span>
                        {status === "revision" ? (
                          <span className="rounded border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-2 py-1 text-xs font-semibold text-amber-200">
                            {t.frozen}
                          </span>
                        ) : null}
                      </div>

                      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <dt className="text-xs text-zinc-500">{t.requester}</dt>
                          <dd className="mt-1 font-medium text-zinc-100">{request.requester}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">{t.amount}</dt>
                          <dd className="mt-1 font-medium text-zinc-100">{request.amount}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">{t.type}</dt>
                          <dd className="mt-1 text-zinc-300">{request.type[activeLanguage]}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">{t.sla}</dt>
                          <dd className={["mt-1 font-semibold", request.urgency === "overdue" ? "text-red-200" : request.urgency === "urgent" ? "text-amber-200" : "text-zinc-300"].join(" ")}>
                            {request.sla[activeLanguage]}
                          </dd>
                        </div>
                      </dl>

                      {request.urgency !== "overdue" ? (
                        <div className="mt-4 h-2 overflow-hidden rounded bg-zinc-900">
                          <div
                            className={[
                              "h-full rounded",
                              request.urgency === "urgent" ? "w-4/5 bg-[#f59e0b]" : "w-1/3 bg-zinc-600",
                            ].join(" ")}
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="grid gap-2 sm:grid-cols-3 lg:w-40 lg:grid-cols-1">
                      <button
                        className="h-10 rounded border border-[#7c3aed] bg-[#7c3aed] px-4 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
                        disabled={isClosed}
                        onClick={() => handleApprove(request)}
                        type="button"
                      >
                        {t.approve}
                      </button>
                      <button
                        className="h-10 rounded border border-[#ef4444] bg-[#ef4444] px-4 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
                        disabled={isClosed}
                        onClick={() => openRejectModal(request.id)}
                        type="button"
                      >
                        {t.reject}
                      </button>
                      <button
                        className="h-10 rounded border border-[#f59e0b] bg-[#f59e0b] px-4 text-sm font-semibold text-black transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
                        disabled={isClosed}
                        onClick={() => openRevisionModal(request.id)}
                        type="button"
                      >
                        {t.revise}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded border border-[#1f1f1f] bg-[#111111] p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold tracking-normal text-white">{t.auditTitle}</h2>
            <p className="mt-1 text-sm text-zinc-500">{t.auditHint}</p>
          </div>

          <div className="divide-y divide-[#1f1f1f] rounded border border-[#1f1f1f]">
            {auditLog.length === 0 ? (
              <p className="bg-[#0a0a0a] px-4 py-4 text-sm text-zinc-500">{t.noAudit}</p>
            ) : (
              auditLog.map((entry) => (
                <div className="grid gap-2 bg-[#0a0a0a] px-4 py-3 text-sm md:grid-cols-[auto_1fr_auto] md:items-center" key={entry.id}>
                  <span className="rounded border border-zinc-700 px-2 py-1 text-xs font-semibold text-zinc-200">
                    {t.actions[entry.action]}
                  </span>
                  <div>
                    <p className="text-zinc-200">
                      {entry.requestId} · {entry.detail}
                    </p>
                    <p className="text-xs text-zinc-500">{entry.actor}</p>
                  </div>
                  <p className="text-xs text-zinc-500">{entry.timestamp}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {rejectingRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form className="w-full max-w-lg rounded border border-[#1f1f1f] bg-[#111111] p-5 shadow-2xl shadow-black/40" onSubmit={handleReject}>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white">
                却下理由 · Rejection Reason · Татгалзах шалтгаан
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                {rejectingRequest.requester} · {rejectingRequest.amount}
              </p>
            </div>

            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              {t.rejectReason}
              <select
                className="h-11 rounded border border-[#1f1f1f] bg-[#0a0a0a] px-3 text-sm text-white outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30"
                onChange={(event) => {
                  setRejectReason(event.target.value as RejectReason);
                  setRejectError("");
                }}
                required
                value={rejectReason}
              >
                <option value="">-</option>
                {rejectReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason} · {text.jp.rejectReasons[reason]} · {text.mn.rejectReasons[reason]}
                  </option>
                ))}
              </select>
            </label>

            {rejectReason === "OTHER" ? (
              <label className="mt-4 grid gap-2 text-sm font-medium text-zinc-200">
                {t.otherExplanation}
                <textarea
                  className="min-h-28 resize-y rounded border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30"
                  minLength={15}
                  onChange={(event) => {
                    setOtherReason(event.target.value);
                    setRejectError("");
                  }}
                  placeholder={t.otherPlaceholder}
                  required
                  value={otherReason}
                />
                <span className="text-xs text-zinc-500">{otherReason.trim().length}/15</span>
              </label>
            ) : null}

            <p className="mt-4 rounded border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-3 py-2 text-sm text-amber-200">
              This action is permanent · 永久に記録されます · Энэ үйлдэл бүртгэгдэнэ
            </p>

            {rejectError ? <p className="mt-3 text-sm text-red-300" role="alert">{rejectError}</p> : null}

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button className="h-10 rounded border border-[#1f1f1f] px-4 text-sm font-semibold text-zinc-200 transition hover:border-zinc-600" onClick={closeRejectModal} type="button">
                {t.cancel}
              </button>
              <button className="h-10 rounded border border-[#ef4444] bg-[#ef4444] px-4 text-sm font-semibold text-white transition hover:bg-red-600" type="submit">
                {t.confirmReject}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {revisionRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form className="w-full max-w-lg rounded border border-[#1f1f1f] bg-[#111111] p-5 shadow-2xl shadow-black/40" onSubmit={handleRevision}>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white">
                差し戻し · Request Revision · Засварлах хүсэлт
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                {revisionRequest.requester} · {revisionRequest.amount}
              </p>
            </div>

            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              {t.guidance}
              <textarea
                className="min-h-32 resize-y rounded border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30"
                minLength={15}
                onChange={(event) => {
                  setRevisionGuidance(event.target.value);
                  setRevisionError("");
                }}
                placeholder={t.guidancePlaceholder}
                required
                value={revisionGuidance}
              />
              <span className="text-xs text-zinc-500">{revisionGuidance.trim().length}/15</span>
            </label>

            <p className="mt-4 rounded border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-3 py-2 text-sm text-amber-200">
              ⏸ SLA timer will FREEZE until resubmission · 再提出まで一時停止
            </p>

            {revisionError ? <p className="mt-3 text-sm text-red-300" role="alert">{revisionError}</p> : null}

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button className="h-10 rounded border border-[#1f1f1f] px-4 text-sm font-semibold text-zinc-200 transition hover:border-zinc-600" onClick={closeRevisionModal} type="button">
                {t.cancel}
              </button>
              <button className="h-10 rounded border border-[#f59e0b] bg-[#f59e0b] px-4 text-sm font-semibold text-black transition hover:bg-amber-500" type="submit">
                {t.confirmRevision}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
