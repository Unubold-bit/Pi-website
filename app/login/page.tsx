"use client";

import { FormEvent, useState } from "react";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();

    if (!isValidEmail(trimmedEmail)) {
      setError("Enter a valid corporate email. 有効な会社メールを入力してください。");
      return;
    }

    if (!password) {
      setError("Password is required. パスワードを入力してください。");
      return;
    }

    setError("");
    console.log({ email: trimmedEmail });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 py-8 text-zinc-50">
      <section className="w-full max-w-sm rounded border border-[#1f1f1f] bg-[#111111] p-6 shadow-xl shadow-black/30">
        <div className="mb-7 text-center">
          <h1 className="[font-family:Inter,var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif] text-2xl font-semibold tracking-normal text-white">
            Hanko 判子
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Corporate Approval Platform · 承認システム
          </p>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <label className="grid gap-2 text-sm font-medium text-zinc-200">
            Email · メール
            <input
              className="h-11 rounded border border-[#1f1f1f] bg-[#0a0a0a] px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30"
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              placeholder="corporate email · 会社メール"
              type="email"
              value={email}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-zinc-200">
            Password · パスワード
            <input
              className="h-11 rounded border border-[#1f1f1f] bg-[#0a0a0a] px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30"
              onChange={(event) => {
                setPassword(event.target.value);
                setError("");
              }}
              type="password"
              value={password}
            />
          </label>

          {error ? (
            <p className="text-sm leading-6 text-red-300" role="alert">
              {error}
            </p>
          ) : null}

          <button
            className="mt-1 h-11 w-full rounded border border-[#7c3aed] bg-[#7c3aed] px-4 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
            type="submit"
          >
            Sign in · ログイン
          </button>
        </form>

        <p className="mt-5 text-center text-xs leading-5 text-zinc-500">
          Access level is determined by your account · アクセス権限はアカウントで決定されます
        </p>
      </section>
    </main>
  );
}
