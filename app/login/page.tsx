"use client";

import { FormEvent, useState } from "react";

type Role = {
  id: string;
  title: string;
  romanized: string;
  english: string;
  japanese?: string;
};

const roles: Role[] = [
  {
    id: "submitter",
    title: "担当 / 主任",
    romanized: "Tantō / Shunin",
    english: "Submitter",
    japanese: "申請者",
  },
  {
    id: "team-supervisor",
    title: "係長",
    romanized: "Kakarichō",
    english: "Team Supervisor",
  },
  {
    id: "section-manager",
    title: "課長",
    romanized: "Kachō",
    english: "Section Manager",
  },
  {
    id: "department-head",
    title: "部長",
    romanized: "Buchō",
    english: "Department Head",
  },
  {
    id: "president",
    title: "社長",
    romanized: "Shachō",
    english: "President",
    japanese: "社長",
  },
];

export default function LoginPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRole || !username.trim() || !password.trim()) {
      setError("Please complete all fields. すべての項目を入力してください。");
      return;
    }

    setError("");
    console.log({
      role: selectedRole,
      credentials: {
        username,
        password,
      },
    });
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-8 text-zinc-50 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-lg border border-zinc-800 bg-[#111111] shadow-2xl shadow-black/40 lg:grid-cols-[0.82fr_1fr]">
        <aside className="flex flex-col justify-between gap-16 border-b border-zinc-800 bg-[#0d0d0d] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-950 text-xl font-bold text-violet-300">
            判
          </div>

          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
              Enterprise access · 企業向けアクセス
            </p>
            <h1 className="[font-family:Inter,var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif] text-5xl font-bold tracking-normal text-white sm:text-6xl">
              Hanko
              <span className="mt-3 block text-3xl text-zinc-300 sm:text-4xl">
                判子
              </span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-zinc-400 sm:text-base">
              Role-based sign in for approvals, requests, and executive review.
              承認、申請、決裁レビューのためのロール別ログイン。
            </p>
          </div>

          <div className="grid gap-3 text-xs text-zinc-500 sm:grid-cols-3 lg:grid-cols-1">
            <div className="border-t border-zinc-800 pt-3">
              <span className="block font-semibold text-zinc-300">Secure</span>
              安全
            </div>
            <div className="border-t border-zinc-800 pt-3">
              <span className="block font-semibold text-zinc-300">Auditable</span>
              監査可能
            </div>
            <div className="border-t border-zinc-800 pt-3">
              <span className="block font-semibold text-zinc-300">Role aware</span>
              権限対応
            </div>
          </div>
        </aside>

        <form
          className="[font-family:Inter,var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif] flex flex-col justify-center p-6 sm:p-8 lg:p-12"
          onSubmit={handleSubmit}
        >
          <div className="mb-8">
            <p className="text-sm font-medium text-violet-300">
              Step 1 · ステップ 1
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-white">
              Select your role · 役割を選択
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Choose one authorization level before entering credentials.
              認証情報を入力する前に、権限レベルを1つ選択してください。
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2" role="listbox" aria-label="Role">
            {roles.map((role) => {
              const isSelected = selectedRole?.id === role.id;

              return (
                <button
                  aria-selected={isSelected}
                  className={[
                    "min-h-28 rounded-lg border p-4 text-left transition",
                    "bg-zinc-950/70 hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]",
                    isSelected
                      ? "border-[#7c3aed] bg-[#7c3aed]/15"
                      : "border-zinc-800",
                  ].join(" ")}
                  key={role.id}
                  onClick={() => {
                    setSelectedRole(role);
                    setError("");
                  }}
                  role="option"
                  type="button"
                >
                  <span className="flex items-start justify-between gap-4">
                    <span>
                      <span className="block text-lg font-semibold text-white">
                        {role.title}
                      </span>
                      <span className="mt-2 block text-sm text-zinc-400">
                        {role.romanized}
                      </span>
                    </span>
                    <span
                      className={[
                        "mt-1 h-4 w-4 rounded-full border",
                        isSelected
                          ? "border-violet-300 bg-[#7c3aed] shadow-[0_0_0_3px_rgba(124,58,237,0.24)]"
                          : "border-zinc-600",
                      ].join(" ")}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="mt-4 block text-sm font-medium text-zinc-300">
                    {role.english}
                    {role.japanese ? ` · ${role.japanese}` : ""}
                  </span>
                </button>
              );
            })}
          </div>

          {selectedRole ? (
            <div className="mt-9 border-t border-zinc-800 pt-8">
              <div className="mb-6">
                <p className="text-sm font-medium text-violet-300">
                  Step 2 · ステップ 2
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-normal text-white">
                  Enter credentials · 認証情報を入力
                </h3>
              </div>

              <div className="grid gap-5">
                <label className="grid gap-2 text-sm font-medium text-zinc-200">
                  <span className="flex items-center justify-between gap-3">
                    Username
                    <span className="text-xs font-normal text-zinc-500">
                      ユーザー名
                    </span>
                  </span>
                  <input
                    className="h-12 rounded-lg border border-zinc-800 bg-[#0a0a0a] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/35"
                    onChange={(event) => setUsername(event.target.value)}
                    required
                    type="text"
                    value={username}
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium text-zinc-200">
                  <span className="flex items-center justify-between gap-3">
                    Password
                    <span className="text-xs font-normal text-zinc-500">
                      パスワード
                    </span>
                  </span>
                  <input
                    className="h-12 rounded-lg border border-zinc-800 bg-[#0a0a0a] px-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/35"
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    type="password"
                    value={password}
                  />
                </label>
              </div>

              {error ? (
                <p className="mt-4 text-sm text-red-300" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                className="mt-6 h-12 w-full rounded-lg border border-[#7c3aed] bg-[#7c3aed] px-5 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
                type="submit"
              >
                Sign in · ログイン
              </button>
            </div>
          ) : (
            <p className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950/60 px-4 py-3 text-sm text-zinc-400">
              Select a role to continue. 続行するには役割を選択してください。
            </p>
          )}
        </form>
      </section>
    </main>
  );
}
