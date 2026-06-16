"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Language = "jp" | "en" | "mn";
type FlagType = "gps" | "duplicate" | "amount";
type ActionState = "waiting" | "forwarded" | "rejected";

type FlaggedRequest = {
  id: string;
  requester: string;
  amount: string;
  flag: FlagType;
  detail: Record<Language, string>;
  sla: Record<Language, string>;
  urgent: boolean;
};

type AutoPassItem = {
  id: string;
  requester: string;
  amount: string;
};

type RequestAction = {
  state: ActionState;
  reason?: string;
  timestamp?: string;
};

const languages: { value: Language; label: string }[] = [
  { value: "jp", label: "JP" },
  { value: "en", label: "EN" },
  { value: "mn", label: "MN" },
];

const text = {
  jp: {
    role: "係長 · Kakarichō",
    roleFull: "係長 · Kakarichō · Багийн ахлах",
    logout: "ログアウト",
    flaggedWaiting: "確認待ちフラグ申請",
    reviewedToday: "本日レビュー済み",
    autoPassed: "自動通過",
    transparency: "透明性ダッシュボード",
    rejectCount: "却下件数",
    queueTitle: "フラグ付き申請",
    queueHint: "SLA緊急度順",
    autoPassTitle: "自動通過フィード",
    autoPassHint: "直近5件はフラグなしで課長へ転送済み",
    requester: "申請者",
    amount: "金額",
    submittedFrom: "提出元",
    reason: "理由",
    sla: "SLA",
    forward: "課長へ転送",
    reject: "却下",
    forwarded: "課長へ転送済み",
    rejected: "却下済み",
    timestamp: "記録時刻",
    rejectionReason: "却下理由",
    rejectionTitle: "却下理由",
    rejectionWarning: "この操作は永久に記録されます",
    confirmReject: "却下を確定",
    cancel: "キャンセル",
    reasonPlaceholder: "却下理由を30文字以上で入力してください。",
    reasonValidation: "却下理由は30文字以上で入力してください。",
    autoVerified: "✓ 自動確認済み",
    noFlags: "通常申請は係長をスキップして課長へ直接送信されます。",
    flags: {
      gps: "GPS不一致",
      duplicate: "重複検出",
      amount: "異常金額",
    },
  },
  en: {
    role: "Kakarichō",
    roleFull: "係長 · Kakarichō · Багийн ахлах",
    logout: "Logout",
    flaggedWaiting: "Flagged requests waiting",
    reviewedToday: "Reviewed today",
    autoPassed: "Auto-passed",
    transparency: "Transparency dashboard",
    rejectCount: "Reject count",
    queueTitle: "Flagged Requests",
    queueHint: "Sorted by SLA urgency",
    autoPassTitle: "Auto-pass feed",
    autoPassHint: "Last 5 requests auto-verified and passed to Kachō",
    requester: "Requester",
    amount: "Amount",
    submittedFrom: "Submitted from",
    reason: "Reason",
    sla: "SLA",
    forward: "Forward to Kachō",
    reject: "Reject",
    forwarded: "Forwarded to Kachō",
    rejected: "Rejected",
    timestamp: "Timestamp",
    rejectionReason: "Rejection Reason",
    rejectionTitle: "Rejection Reason",
    rejectionWarning: "This action is permanent and timestamped",
    confirmReject: "Confirm reject",
    cancel: "Cancel",
    reasonPlaceholder: "Enter at least 30 characters explaining the rejection.",
    reasonValidation: "Rejection reason must be at least 30 characters.",
    autoVerified: "✓ Auto-verified",
    noFlags: "Normal requests skip Kakarichō and go directly to Kachō.",
    flags: {
      gps: "GPS MISMATCH",
      duplicate: "DUPLICATE DETECTED",
      amount: "ABNORMAL AMOUNT",
    },
  },
  mn: {
    role: "Багийн ахлах",
    roleFull: "係長 · Kakarichō · Багийн ахлах",
    logout: "Гарах",
    flaggedWaiting: "Хүлээгдэж буй тэмдэглэгдсэн хүсэлт",
    reviewedToday: "Өнөөдөр хянасан",
    autoPassed: "Автоматаар дамжсан",
    transparency: "Ил тод байдлын самбар",
    rejectCount: "Татгалзсан тоо",
    queueTitle: "Тэмдэглэгдсэн хүсэлтүүд",
    queueHint: "SLA яаралтай байдлаар эрэмбэлсэн",
    autoPassTitle: "Автомат дамжуулалтын бүртгэл",
    autoPassHint: "Сүүлийн 5 хүсэлт автоматаар баталгаажиж Kachō руу дамжсан",
    requester: "Хүсэлт гаргагч",
    amount: "Дүн",
    submittedFrom: "Илгээсэн байршил",
    reason: "Шалтгаан",
    sla: "SLA",
    forward: "Kachō руу дамжуулах",
    reject: "Татгалзах",
    forwarded: "Kachō руу дамжуулсан",
    rejected: "Татгалзсан",
    timestamp: "Цагийн тэмдэг",
    rejectionReason: "Татгалзах шалтгаан",
    rejectionTitle: "Татгалзах шалтгаан",
    rejectionWarning: "Энэ үйлдэл байнга бүртгэгдэнэ",
    confirmReject: "Татгалзлыг батлах",
    cancel: "Цуцлах",
    reasonPlaceholder: "Татгалзах шалтгаанаа хамгийн багадаа 30 тэмдэгтээр бичнэ үү.",
    reasonValidation: "Татгалзах шалтгаан хамгийн багадаа 30 тэмдэгт байх ёстой.",
    autoVerified: "✓ Автоматаар баталгаажсан",
    noFlags: "Энгийн хүсэлтүүд Kakarichō-г алгасаад шууд Kachō руу очно.",
    flags: {
      gps: "GPS ЗӨРҮҮ",
      duplicate: "ДАВХАРДСАН ИЛЭРСЭН",
      amount: "ХЭВИЙН БУС ДҮН",
    },
  },
};

const flaggedRequests: FlaggedRequest[] = [
  {
    id: "FLAG-001",
    requester: "田中 太郎",
    amount: "¥45,000",
    flag: "gps",
    detail: {
      jp: "東京から提出（領収書所在地：大阪）",
      en: "Tokyo (receipt location: Osaka)",
      mn: "Токио (баримтын байршил: Осака)",
    },
    sla: {
      jp: "残り8時間",
      en: "8h remaining",
      mn: "8 цаг үлдсэн",
    },
    urgent: true,
  },
  {
    id: "FLAG-002",
    requester: "佐藤 花子",
    amount: "¥12,000",
    flag: "duplicate",
    detail: {
      jp: "3日前に同額の申請あり",
      en: "Same amount submitted 3 days ago",
      mn: "Ижил дүн 3 хоногийн өмнө илгээгдсэн",
    },
    sla: {
      jp: "残り31時間",
      en: "31h remaining",
      mn: "31 цаг үлдсэн",
    },
    urgent: false,
  },
  {
    id: "FLAG-003",
    requester: "山田 次郎",
    amount: "¥98,000",
    flag: "amount",
    detail: {
      jp: "この従業員の平均申請額より340%高い",
      en: "340% above this employee's average submission",
      mn: "Энэ ажилтны дундаж хүсэлтээс 340% өндөр",
    },
    sla: {
      jp: "残り2時間",
      en: "2h remaining",
      mn: "2 цаг үлдсэн",
    },
    urgent: true,
  },
];

const autoPassFeed: AutoPassItem[] = [
  { id: "AUTO-097", requester: "鈴木 一郎", amount: "¥8,400" },
  { id: "AUTO-096", requester: "高橋 美咲", amount: "¥6,200" },
  { id: "AUTO-095", requester: "伊藤 健", amount: "¥15,000" },
  { id: "AUTO-094", requester: "渡辺 葵", amount: "¥4,900" },
  { id: "AUTO-093", requester: "中村 優", amount: "¥22,000" },
];

export default function KakaarichoDashboardPage() {
  const [activeLanguage, setActiveLanguage] = useState<Language>("jp");
  const [actions, setActions] = useState<Record<string, RequestAction>>({});
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");
  const t = text[activeLanguage];
  const router = useRouter();
  const rejectCount = useMemo(
    () => Object.values(actions).filter((action) => action.state === "rejected").length,
    [actions],
  );

  const selectedRequest = flaggedRequests.find((request) => request.id === rejectingId);

  function handleForward(requestId: string) {
    setActions((current) => ({
      ...current,
      [requestId]: {
        state: "forwarded",
        timestamp: new Date().toLocaleString(),
      },
    }));
  }

  function openRejectModal(requestId: string) {
    setRejectingId(requestId);
    setRejectReason("");
    setRejectError("");
  }

  function closeRejectModal() {
    setRejectingId(null);
    setRejectReason("");
    setRejectError("");
  }

  function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!rejectingId) return;

    if (rejectReason.trim().length < 30) {
      setRejectError(t.reasonValidation);
      return;
    }

    setActions((current) => ({
      ...current,
      [rejectingId]: {
        state: "rejected",
        reason: rejectReason.trim(),
        timestamp: new Date().toLocaleString(),
      },
    }));
    closeRejectModal();
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-50">
      <nav className="border-b border-[#1f1f1f] bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold tracking-normal text-white">
                Hanko 判子
              </p>
              <p className="mt-1 text-xs text-zinc-500">{t.noFlags}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded border border-[#1f1f1f] bg-[#111111] px-3 py-2 text-sm text-zinc-300">
                {t.roleFull}
              </div>
              <div className="flex w-fit rounded border border-[#1f1f1f] bg-[#111111] p-1">
                {languages.map((language) => {
                  const isActive = activeLanguage === language.value;

                  return (
                    <button
                      aria-pressed={isActive}
                      className={[
                        "h-8 rounded px-3 text-xs font-semibold transition",
                        isActive
                          ? "bg-[#7c3aed] text-white"
                          : "text-zinc-500 hover:text-zinc-200",
                      ].join(" ")}
                      key={language.value}
                      onClick={() => {
                        setActiveLanguage(language.value);
                        setRejectError("");
                      }}
                      type="button"
                    >
                      {language.label}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => router.push('/login')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                type="button"
              >
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-3 md:grid-cols-4">
          <div className="rounded border border-[#1f1f1f] bg-[#111111] p-4">
            <p className="text-xs text-zinc-500">{t.flaggedWaiting}</p>
            <p className="mt-2 text-3xl font-semibold text-white">3</p>
          </div>
          <div className="rounded border border-[#1f1f1f] bg-[#111111] p-4">
            <p className="text-xs text-zinc-500">{t.reviewedToday}</p>
            <p className="mt-2 text-3xl font-semibold text-white">7</p>
          </div>
          <div className="rounded border border-[#1f1f1f] bg-[#111111] p-4">
            <p className="text-xs text-zinc-500">{t.autoPassed}</p>
            <p className="mt-2 text-3xl font-semibold text-white">94%</p>
          </div>
          <div className="rounded border border-[#1f1f1f] bg-[#111111] p-4">
            <p className="text-xs text-zinc-500">{t.transparency}</p>
            <p className="mt-2 text-3xl font-semibold text-red-300">{rejectCount}</p>
            <p className="mt-1 text-xs text-zinc-500">{t.rejectCount}</p>
          </div>
        </section>

        <section className="mt-6 rounded border border-[#1f1f1f] bg-[#111111] p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-white">
                {t.queueTitle}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">{t.queueHint}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {flaggedRequests.map((request) => {
              const action = actions[request.id];
              const isClosed = action?.state === "forwarded" || action?.state === "rejected";

              return (
                <article
                  className="rounded border border-[#1f1f1f] bg-[#0a0a0a] p-4"
                  key={request.id}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded border border-red-400/30 bg-red-400/10 px-2 py-1 text-xs font-semibold text-red-200">
                          {t.flags[request.flag]}
                        </span>
                        <span
                          className={[
                            "rounded border px-2 py-1 text-xs font-semibold",
                            request.urgent
                              ? "border-[#f59e0b]/40 bg-[#f59e0b]/15 text-amber-200"
                              : "border-zinc-700 bg-[#111111] text-zinc-300",
                          ].join(" ")}
                        >
                          {t.sla}: {request.sla[activeLanguage]}
                        </span>
                      </div>

                      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                          <dt className="text-xs text-zinc-500">{t.requester}</dt>
                          <dd className="mt-1 font-medium text-zinc-100">
                            {request.requester}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-zinc-500">{t.amount}</dt>
                          <dd className="mt-1 font-medium text-zinc-100">
                            {request.amount}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-xs text-zinc-500">
                            {request.flag === "gps" ? t.submittedFrom : t.reason}
                          </dt>
                          <dd className="mt-1 text-zinc-300">
                            {request.detail[activeLanguage]}
                          </dd>
                        </div>
                      </dl>

                      {action ? (
                        <div className="mt-4 rounded border border-[#1f1f1f] bg-[#111111] px-3 py-2 text-sm text-zinc-300">
                          <span className="font-medium text-white">
                            {action.state === "forwarded" ? t.forwarded : t.rejected}
                          </span>
                          {action.timestamp ? (
                            <span className="ml-2 text-zinc-500">
                              {t.timestamp}: {action.timestamp}
                            </span>
                          ) : null}
                          {action.reason ? (
                            <p className="mt-2 text-zinc-400">
                              {t.rejectionReason}: {action.reason}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                    {/* View Detail Button */}
                    <button
                      onClick={() => router.push(`/request/${request.id}`)}
                      style={{
                        padding: '10px 14px',
                        border: '1px solid #1f1f1f',
                        backgroundColor: 'transparent',
                        color: '#aaa',
                        borderRadius: '4px',
                        fontSize: '13px',
                        cursor: 'pointer',
                        width: '100%'
                      }}
                      type="button"
                    >
                      {activeLanguage === 'jp' ? '詳細を見る' : 'View Detail'}
                    </button>

                    {/* Existing Forward Button */}
                    <button
                      className="h-10 rounded border border-[#7c3aed] bg-[#7c3aed] px-4 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
                      disabled={isClosed}
                      onClick={() => handleForward(request.id)}
                      type="button"
                    >
                      {t.forward}
                    </button>

                    {/* Existing Reject Button */}
                    <button
                      className="h-10 rounded border border-[#ef4444] bg-[#ef4444] px-4 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:bg-zinc-800 disabled:text-zinc-500"
                      disabled={isClosed}
                      onClick={() => openRejectModal(request.id)}
                      type="button"
                    >
                      {t.reject}
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
            <h2 className="text-xl font-semibold tracking-normal text-white">
              {t.autoPassTitle}
            </h2>
            <p className="mt-1 text-sm text-zinc-500">{t.autoPassHint}</p>
          </div>

          <div className="divide-y divide-[#1f1f1f] rounded border border-[#1f1f1f]">
            {autoPassFeed.map((item) => (
              <div
                className="grid gap-2 bg-[#0a0a0a] px-4 py-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center"
                key={item.id}
              >
                <div>
                  <p className="font-medium text-zinc-100">{item.requester}</p>
                  <p className="text-xs text-zinc-500">{item.id}</p>
                </div>
                <p className="text-zinc-300">{item.amount}</p>
                <p className="w-fit rounded border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs font-semibold text-emerald-200">
                  {t.autoVerified}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedRequest ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <form
            className="w-full max-w-lg rounded border border-[#1f1f1f] bg-[#111111] p-5 shadow-2xl shadow-black/40"
            onSubmit={handleReject}
          >
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-white">{t.rejectionTitle}</h2>
              <p className="mt-2 text-sm text-zinc-500">
                {selectedRequest.requester} · {selectedRequest.amount}
              </p>
            </div>

            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              {t.rejectionReason}
              <textarea
                className="min-h-32 resize-y rounded border border-[#1f1f1f] bg-[#0a0a0a] px-3 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30"
                minLength={30}
                onChange={(event) => {
                  setRejectReason(event.target.value);
                  setRejectError("");
                }}
                placeholder={t.reasonPlaceholder}
                required
                value={rejectReason}
              />
              <span className="text-xs text-zinc-500">
                {rejectReason.trim().length}/30
              </span>
            </label>

            <p className="mt-4 rounded border border-[#f59e0b]/30 bg-[#f59e0b]/10 px-3 py-2 text-sm text-amber-200">
              {t.rejectionWarning}
            </p>

            {rejectError ? (
              <p className="mt-3 text-sm text-red-300" role="alert">
                {rejectError}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="h-10 rounded border border-[#1f1f1f] px-4 text-sm font-semibold text-zinc-200 transition hover:border-zinc-600"
                onClick={closeRejectModal}
                type="button"
              >
                {t.cancel}
              </button>
              <button
                className="h-10 rounded border border-[#ef4444] bg-[#ef4444] px-4 text-sm font-semibold text-white transition hover:bg-red-600"
                type="submit"
              >
                {t.confirmReject}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
