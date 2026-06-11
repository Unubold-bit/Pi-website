"use client";

import { ChangeEvent, FormEvent, useState } from "react";

type RequestType = {
  value: string;
  label: string;
};

type MockRequest = {
  id: string;
  type: string;
  submittedAt: string;
  approver: string;
  status: "Pending" | "Approved" | "Rejected";
  statusJa: string;
  activeLevel: number;
};

const requestTypes: RequestType[] = [
  { value: "expense", label: "経費申請 · Expense" },
  { value: "document", label: "文書承認 · Document" },
  { value: "contract", label: "契約承認 · Contract" },
  { value: "other", label: "その他 · Other" },
];

const approvalLevels = ["担当", "係長", "課長", "部長", "社長"];

const mockRequests: MockRequest[] = [
  {
    id: "REQ-2401",
    type: "経費申請 · Expense",
    submittedAt: "2026-06-08",
    approver: "係長 · Team Supervisor",
    status: "Pending",
    statusJa: "承認待ち",
    activeLevel: 1,
  },
  {
    id: "REQ-2398",
    type: "文書承認 · Document",
    submittedAt: "2026-06-03",
    approver: "課長 · Section Manager",
    status: "Approved",
    statusJa: "承認済み",
    activeLevel: 2,
  },
  {
    id: "REQ-2389",
    type: "契約承認 · Contract",
    submittedAt: "2026-05-29",
    approver: "部長 · Department Head",
    status: "Rejected",
    statusJa: "却下",
    activeLevel: 3,
  },
];

const statusStyles = {
  Pending: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  Approved: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Rejected: "border-red-400/30 bg-red-400/10 text-red-200",
};

export default function SubmitterDashboardPage() {
  const [requestType, setRequestType] = useState(requestTypes[0].value);
  const [justification, setJustification] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [message, setMessage] = useState("");

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setAttachment(event.target.files?.[0] ?? null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!requestType || justification.trim().length < 50) {
      setMessage(
        "Justification must be at least 50 characters. 申請理由は50文字以上で入力してください。",
      );
      return;
    }

    const selectedType = requestTypes.find((type) => type.value === requestType);

    console.log({
      requestType: selectedType?.label,
      justification,
      attachment: attachment?.name ?? null,
    });

    setMessage("Request submitted. 申請を送信しました。");
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-50">
      <nav className="border-b border-zinc-800 bg-[#0d0d0d]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 text-lg font-bold text-violet-300">
              判
            </div>
            <div>
              <p className="text-base font-semibold tracking-normal text-white">
                Hanko 判子
              </p>
              <p className="text-xs text-zinc-500">Approval workspace · 承認ワークスペース</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
              担当 · Submitter
            </div>
            <button
              className="h-10 rounded-lg border border-zinc-700 px-4 text-sm font-medium text-zinc-200 transition hover:border-[#7c3aed] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
              type="button"
            >
              Logout · ログアウト
            </button>
          </div>
        </div>
      </nav>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <section className="rounded-lg border border-zinc-800 bg-[#111111] p-5 sm:p-6">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
              Section 1 · セクション 1
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-normal text-white">
              新規申請 · New Request
            </h1>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit}>
            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              <span className="flex items-center justify-between gap-3">
                Request type
                <span className="text-xs font-normal text-zinc-500">申請種別</span>
              </span>
              <select
                className="h-12 rounded-lg border border-zinc-800 bg-[#0a0a0a] px-4 text-sm text-white outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/35"
                onChange={(event) => setRequestType(event.target.value)}
                required
                value={requestType}
              >
                {requestTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              <span className="flex items-center justify-between gap-3">
                Justification
                <span className="text-xs font-normal text-zinc-500">申請理由</span>
              </span>
              <textarea
                className="min-h-40 resize-y rounded-lg border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/35"
                minLength={50}
                onChange={(event) => setJustification(event.target.value)}
                placeholder="Provide business context, amount, vendor, or approval details. 業務上の背景、金額、取引先、承認内容を入力してください。"
                required
                value={justification}
              />
              <span className="text-xs text-zinc-500">
                {justification.trim().length}/50 minimum · 50文字以上
              </span>
            </label>

            <div className="grid gap-2 text-sm font-medium text-zinc-200">
              <span className="flex items-center justify-between gap-3">
                Attachment
                <span className="text-xs font-normal text-zinc-500">添付ファイル</span>
              </span>
              <label className="flex min-h-12 cursor-pointer items-center justify-between gap-4 rounded-lg border border-zinc-800 bg-[#0a0a0a] px-4 py-3 text-sm text-zinc-300 transition hover:border-[#7c3aed]">
                <span className="truncate">
                  {attachment ? attachment.name : "Choose file · ファイルを選択"}
                </span>
                <span className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-300">
                  Browse · 参照
                </span>
                <input className="sr-only" onChange={handleFileChange} type="file" />
              </label>
            </div>

            {message ? (
              <p
                className={[
                  "rounded-lg border px-4 py-3 text-sm",
                  message.startsWith("Request")
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                    : "border-red-400/20 bg-red-400/10 text-red-200",
                ].join(" ")}
                role="status"
              >
                {message}
              </p>
            ) : null}

            <button
              className="h-12 rounded-lg border border-[#7c3aed] bg-[#7c3aed] px-5 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
              type="submit"
            >
              申請する · Submit
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-zinc-800 bg-[#111111] p-5 sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                Section 2 · セクション 2
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-normal text-white">
                申請一覧 · My Requests
              </h2>
            </div>
            <p className="text-sm text-zinc-500">3 active records · 3件</p>
          </div>

          <div className="grid gap-4">
            {mockRequests.map((request) => (
              <article
                className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-4"
                key={request.id}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-medium text-zinc-500">{request.id}</p>
                    <h3 className="mt-1 text-lg font-semibold tracking-normal text-white">
                      {request.type}
                    </h3>
                  </div>
                  <span
                    className={[
                      "w-fit rounded-full border px-3 py-1 text-xs font-semibold",
                      statusStyles[request.status],
                    ].join(" ")}
                  >
                    {request.status} · {request.statusJa}
                  </span>
                </div>

                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-zinc-500">Date submitted · 申請日</dt>
                    <dd className="mt-1 text-zinc-200">{request.submittedAt}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-zinc-500">Current approver · 現在の承認者</dt>
                    <dd className="mt-1 text-zinc-200">{request.approver}</dd>
                  </div>
                </dl>

                <div className="mt-5">
                  <p className="mb-3 text-xs text-zinc-500">
                    Approval chain · 承認ルート
                  </p>
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
                              {level}
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
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
