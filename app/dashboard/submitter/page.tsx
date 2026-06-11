"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type Language = "jp" | "en" | "mn";
type RequestStatus = "pending" | "approved" | "rejected";

type RequestType = {
  value: string;
  labels: Record<Language, string>;
};

type MockRequest = {
  id: string;
  type: RequestType["value"];
  submittedAt: string;
  approverLevel: string;
  status: RequestStatus;
  activeLevel: number;
  timeRemaining: string;
};

const languages: { value: Language; label: string }[] = [
  { value: "jp", label: "JP" },
  { value: "en", label: "EN" },
  { value: "mn", label: "MN" },
];

const text = {
  jp: {
    workspace: "承認ワークスペース",
    navNewRequest: "新規申請",
    navMyRequests: "申請一覧",
    role: "担当 · 申請者",
    logout: "ログアウト",
    sectionOne: "セクション 1",
    sectionTwo: "セクション 2",
    newRequest: "新規申請",
    myRequests: "申請一覧",
    requestType: "申請種別",
    amount: "金額 (¥)",
    justification: "申請理由",
    attachFile: "添付ファイル",
    chooseFile: "ファイルを選択",
    browse: "参照",
    submit: "申請する",
    minimum: "50文字以上",
    justificationPlaceholder: "業務上の背景、金額、取引先、承認内容を入力してください。",
    validation: "申請理由は50文字以上で入力してください。",
    submitted: "申請を送信しました。",
    records: "3件",
    dateSubmitted: "申請日",
    currentApprover: "現在の承認者",
    approvalChain: "承認ルート",
    timeRemaining: "残り時間",
    pending: "承認待ち",
    approved: "承認済み",
    rejected: "却下",
    approvers: {
      submitter: "担当",
      supervisor: "係長",
      manager: "課長",
      head: "部長",
      president: "社長",
    },
  },
  en: {
    workspace: "Approval workspace",
    navNewRequest: "New Request",
    navMyRequests: "My Requests",
    role: "Submitter",
    logout: "Logout",
    sectionOne: "Section 1",
    sectionTwo: "Section 2",
    newRequest: "New Request",
    myRequests: "My Requests",
    requestType: "Request Type",
    amount: "Amount (¥)",
    justification: "Justification",
    attachFile: "Attach File",
    chooseFile: "Choose file",
    browse: "Browse",
    submit: "Submit",
    minimum: "50 characters minimum",
    justificationPlaceholder: "Provide business context, amount, vendor, or approval details.",
    validation: "Justification must be at least 50 characters.",
    submitted: "Request submitted.",
    records: "3 active records",
    dateSubmitted: "Date submitted",
    currentApprover: "Current approver",
    approvalChain: "Approval chain",
    timeRemaining: "Time remaining",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    approvers: {
      submitter: "Submitter",
      supervisor: "Team Supervisor",
      manager: "Section Manager",
      head: "Department Head",
      president: "President",
    },
  },
  mn: {
    workspace: "Зөвшөөрлийн ажлын талбар",
    navNewRequest: "Шинэ хүсэлт",
    navMyRequests: "Миний хүсэлтүүд",
    role: "Илгээгч",
    logout: "Гарах",
    sectionOne: "Хэсэг 1",
    sectionTwo: "Хэсэг 2",
    newRequest: "Шинэ хүсэлт",
    myRequests: "Миний хүсэлтүүд",
    requestType: "Хүсэлтийн төрөл",
    amount: "Дүн (¥)",
    justification: "Үндэслэл",
    attachFile: "Файл хавсаргах",
    chooseFile: "Файл сонгох",
    browse: "Сонгох",
    submit: "Илгээх",
    minimum: "хамгийн багадаа 50 тэмдэгт",
    justificationPlaceholder: "Бизнесийн үндэслэл, дүн, нийлүүлэгч эсвэл зөвшөөрлийн мэдээллээ оруулна уу.",
    validation: "Үндэслэл хамгийн багадаа 50 тэмдэгт байх ёстой.",
    submitted: "Хүсэлтийг илгээлээ.",
    records: "3 идэвхтэй хүсэлт",
    dateSubmitted: "Илгээсэн огноо",
    currentApprover: "Одоогийн зөвшөөрөгч",
    approvalChain: "Зөвшөөрлийн гинж",
    timeRemaining: "Үлдсэн хугацаа",
    pending: "Хүлээгдэж буй",
    approved: "Зөвшөөрсөн",
    rejected: "Татгалзсан",
    approvers: {
      submitter: "Илгээгч",
      supervisor: "Багийн ахлагч",
      manager: "Хэсгийн менежер",
      head: "Хэлтсийн дарга",
      president: "Ерөнхийлөгч",
    },
  },
};

const requestTypes: RequestType[] = [
  {
    value: "expense",
    labels: { jp: "経費申請", en: "Expense", mn: "Зардал" },
  },
  {
    value: "document",
    labels: { jp: "文書承認", en: "Document", mn: "Баримт бичиг" },
  },
  {
    value: "contract",
    labels: { jp: "契約承認", en: "Contract", mn: "Гэрээ" },
  },
  {
    value: "other",
    labels: { jp: "その他", en: "Other", mn: "Бусад" },
  },
];

const approvalLevels = ["submitter", "supervisor", "manager", "head", "president"] as const;

const mockRequests: MockRequest[] = [
  {
    id: "REQ-2401",
    type: "expense",
    submittedAt: "2026-06-08",
    approverLevel: "supervisor",
    status: "pending",
    activeLevel: 1,
    timeRemaining: "18h",
  },
  {
    id: "REQ-2398",
    type: "document",
    submittedAt: "2026-06-03",
    approverLevel: "manager",
    status: "approved",
    activeLevel: 2,
    timeRemaining: "0h",
  },
  {
    id: "REQ-2389",
    type: "contract",
    submittedAt: "2026-05-29",
    approverLevel: "head",
    status: "rejected",
    activeLevel: 3,
    timeRemaining: "0h",
  },
];

const statusStyles: Record<RequestStatus, string> = {
  pending: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  approved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  rejected: "border-red-400/30 bg-red-400/10 text-red-200",
};

export default function SubmitterDashboardPage() {
  const [activeLanguage, setActiveLanguage] = useState<Language>("jp");
  const [requestType, setRequestType] = useState(requestTypes[0].value);
  const [amount, setAmount] = useState("");
  const [justification, setJustification] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmittedMessage, setIsSubmittedMessage] = useState(false);
  const t = text[activeLanguage];

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setAttachment(event.target.files?.[0] ?? null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!requestType || !amount || justification.trim().length < 50) {
      setMessage(t.validation);
      setIsSubmittedMessage(false);
      return;
    }

    const selectedType = requestTypes.find((type) => type.value === requestType);

    console.log({
      requestType: selectedType?.labels.en,
      amount,
      justification,
      attachment: attachment?.name ?? null,
    });

    setMessage(t.submitted);
    setIsSubmittedMessage(true);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-50">
      <nav className="border-b border-zinc-800 bg-[#0d0d0d]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded border border-zinc-700 bg-zinc-950 text-lg font-bold text-violet-300">
                判
              </div>
              <div>
                <p className="text-base font-semibold tracking-normal text-white">
                  Hanko 判子
                </p>
                <p className="text-xs text-zinc-500">{t.workspace}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex w-fit rounded border border-zinc-800 bg-zinc-950 p-1">
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
                        setMessage("");
                      }}
                      type="button"
                    >
                      {language.label}
                    </button>
                  );
                })}
              </div>
              <div className="rounded border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
                {t.role}
              </div>
              <button
                className="h-10 rounded border border-zinc-700 px-4 text-sm font-medium text-zinc-200 transition hover:border-[#7c3aed] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
                type="button"
              >
                {t.logout}
              </button>
            </div>
          </div>

          <div className="flex gap-2 text-sm">
            <a className="rounded border border-zinc-800 px-3 py-2 text-zinc-300" href="#new-request">
              {t.navNewRequest}
            </a>
            <a className="rounded border border-zinc-800 px-3 py-2 text-zinc-300" href="#my-requests">
              {t.navMyRequests}
            </a>
          </div>
        </div>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <section
          className="rounded border border-zinc-800 bg-[#111111] p-5 sm:p-6"
          id="new-request"
        >
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
              {t.sectionOne}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-white">
              {t.newRequest}
            </h1>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              {t.requestType}
              <select
                className="h-12 rounded border border-zinc-800 bg-[#0a0a0a] px-4 text-sm text-white outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/35"
                onChange={(event) => setRequestType(event.target.value)}
                required
                value={requestType}
              >
                {requestTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.labels[activeLanguage]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              {t.amount}
              <input
                className="h-12 rounded border border-zinc-800 bg-[#0a0a0a] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/35"
                min="0"
                onChange={(event) => setAmount(event.target.value)}
                required
                type="number"
                value={amount}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              {t.justification}
              <textarea
                className="min-h-40 resize-y rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/35"
                minLength={50}
                onChange={(event) => setJustification(event.target.value)}
                placeholder={t.justificationPlaceholder}
                required
                value={justification}
              />
              <span className="text-xs text-zinc-500">
                {justification.trim().length}/50 · {t.minimum}
              </span>
            </label>

            <div className="grid gap-2 text-sm font-medium text-zinc-200">
              {t.attachFile}
              <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-zinc-300 transition hover:border-[#7c3aed]">
                <span className="truncate">
                  {attachment ? attachment.name : t.chooseFile}
                </span>
                <span className="rounded border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                  {t.browse}
                </span>
                <input className="sr-only" onChange={handleFileChange} type="file" />
              </label>
            </div>

            {message ? (
              <p
                className={[
                  "rounded border px-4 py-3 text-sm",
                  isSubmittedMessage
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : "border-red-400/20 bg-red-400/10 text-red-200",
                ].join(" ")}
                role="status"
              >
                {message}
              </p>
            ) : null}

            <button
              className="h-12 rounded border border-[#7c3aed] bg-[#7c3aed] px-5 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
              type="submit"
            >
              {t.submit}
            </button>
          </form>
        </section>

        <section
          className="rounded border border-zinc-800 bg-[#111111] p-5 sm:p-6"
          id="my-requests"
        >
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                {t.sectionTwo}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal text-white">
                {t.myRequests}
              </h2>
            </div>
            <p className="text-sm text-zinc-500">{t.records}</p>
          </div>

          <div className="grid gap-4">
            {mockRequests.map((request) => {
              const requestTypeLabel =
                requestTypes.find((type) => type.value === request.type)?.labels[
                  activeLanguage
                ] ?? request.type;

              return (
                <article
                  className="rounded border border-zinc-800 bg-zinc-950/60 p-4"
                  key={request.id}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-medium text-zinc-500">{request.id}</p>
                      <h3 className="mt-1 text-lg font-semibold tracking-normal text-white">
                        {requestTypeLabel}
                      </h3>
                    </div>
                    <span
                      className={[
                        "w-fit rounded-full border px-3 py-1 text-xs font-semibold",
                        statusStyles[request.status],
                      ].join(" ")}
                    >
                      {t[request.status]}
                    </span>
                  </div>

                  <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-zinc-500">{t.dateSubmitted}</dt>
                      <dd className="mt-1 text-zinc-200">{request.submittedAt}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-500">{t.currentApprover}</dt>
                      <dd className="mt-1 text-zinc-200">
                        {t.approvers[request.approverLevel as keyof typeof t.approvers]}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-zinc-500">{t.timeRemaining}</dt>
                      <dd className="mt-1 text-zinc-200">{request.timeRemaining}</dd>
                    </div>
                  </dl>

                  <div className="mt-5">
                    <p className="mb-3 text-xs text-zinc-500">{t.approvalChain}</p>
                    <div className="flex items-center gap-2">
                      {approvalLevels.map((level, index) => {
                        const isActive = index === request.activeLevel;
                        const isComplete = index < request.activeLevel;

                        return (
                          <div
                            className="flex min-w-0 flex-1 items-center gap-2"
                            key={level}
                          >
                            <div className="flex min-w-0 flex-col items-center gap-2">
                              <span
                                className={[
                                  "h-3 w-3 rounded-full border",
                                  isActive
                                    ? "border-[#7c3aed] bg-[#7c3aed] shadow-[0_0_0_4px_rgba(124,58,237,0.22)]"
                                    : isComplete
                                      ? "border-zinc-500 bg-zinc-500"
                                      : "border-zinc-700 bg-[#0a0a0a]",
                                ].join(" ")}
                              />
                              <span
                                className={[
                                  "truncate text-[11px]",
                                  isActive ? "text-violet-200" : "text-zinc-500",
                                ].join(" ")}
                              >
                                {t.approvers[level]}
                              </span>
                            </div>
                            {index < approvalLevels.length - 1 ? (
                              <div className="h-px flex-1 bg-zinc-800" />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
