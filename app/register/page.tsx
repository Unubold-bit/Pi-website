"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Language = "jp" | "en" | "mn";

type FormState = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: string;
  rank: string;
  manager: string;
};

const languages: { value: Language; label: string }[] = [
  { value: "jp", label: "JP" },
  { value: "en", label: "EN" },
  { value: "mn", label: "MN" },
];

const text = {
  jp: {
    logo: "Hanko 判子",
    title: "アカウント登録 · Register · Бүртгүүлэх",
    subtitle: "Corporate email required · 会社メールが必要です · Корпорацийн имэйл шаардлагатай",
    fullName: "氏名 · Full Name · Овог нэр",
    fullNamePlaceholder: "山田 太郎",
    email: "会社メール · Corporate Email · Корпорацийн имэйл",
    emailPlaceholder: "yourname@company.com",
    emailError: "Must use corporate email · 会社メールを使用してください · Корпорацийн имэйл ашиглана уу",
    password: "パスワード · Password · Нууц үг",
    confirmPassword: "パスワード確認 · Confirm Password · Нууц үг давтах",
    passwordLengthError: "Password must be at least 8 characters · 8文字以上で入力してください · Нууц үг 8-аас дээш тэмдэгттэй байна",
    passwordMatchError: "Passwords must match · パスワードが一致しません · Нууц үг таарах ёстой",
    department: "部署 · Department · Хэлтэс",
    rank: "役職 · Rank · Албан тушаал",
    manager: "直属上司 · Direct Manager · Шууд дарга",
    managerSubtitle: "This determines your approval chain · 承認チェーンが自動生成されます · Зөвшөөрлийн гинж автоматаар үүснэ",
    managerNote: "自動生成 · Auto-generated approval chain from org chart",
    selectPlaceholder: "選択してください · Select · Сонгоно уу",
    submit: "登録する · Register · Бүртгүүлэх",
    success: "Registration submitted · 登録完了 · Бүртгэл амжилттай",
    signInPrefix: "Already have an account?",
    signIn: "Sign in · ログイン · Нэвтрэх",
    showPassword: "パスワードを表示",
    hidePassword: "パスワードを非表示",
  },
  en: {
    logo: "Hanko 判子",
    title: "Register · アカウント登録 · Бүртгүүлэх",
    subtitle: "Corporate email required · 会社メールが必要です · Корпорацийн имэйл шаардлагатай",
    fullName: "Full Name · 氏名 · Овог нэр",
    fullNamePlaceholder: "Taro Yamada",
    email: "Corporate Email · 会社メール · Корпорацийн имэйл",
    emailPlaceholder: "yourname@company.com",
    emailError: "Must use corporate email · 会社メールを使用してください · Корпорацийн имэйл ашиглана уу",
    password: "Password · パスワード · Нууц үг",
    confirmPassword: "Confirm Password · パスワード確認 · Нууц үг давтах",
    passwordLengthError: "Password must be at least 8 characters · 8文字以上で入力してください · Нууц үг 8-аас дээш тэмдэгттэй байна",
    passwordMatchError: "Passwords must match · パスワードが一致しません · Нууц үг таарах ёстой",
    department: "Department · 部署 · Хэлтэс",
    rank: "Rank · 役職 · Албан тушаал",
    manager: "Direct Manager · 直属上司 · Шууд дарга",
    managerSubtitle: "This determines your approval chain · 承認チェーンが自動生成されます · Зөвшөөрлийн гинж автоматаар үүснэ",
    managerNote: "Auto-generated approval chain from org chart",
    selectPlaceholder: "Select · 選択してください · Сонгоно уу",
    submit: "Register · 登録する · Бүртгүүлэх",
    success: "Registration submitted · 登録完了 · Бүртгэл амжилттай",
    signInPrefix: "Already have an account?",
    signIn: "Sign in · ログイン · Нэвтрэх",
    showPassword: "Show password",
    hidePassword: "Hide password",
  },
  mn: {
    logo: "Hanko 判子",
    title: "Бүртгүүлэх · アカウント登録 · Register",
    subtitle: "Корпорацийн имэйл шаардлагатай · Corporate email required · 会社メールが必要です",
    fullName: "Овог нэр · 氏名 · Full Name",
    fullNamePlaceholder: "Taro Yamada",
    email: "Корпорацийн имэйл · 会社メール · Corporate Email",
    emailPlaceholder: "yourname@company.com",
    emailError: "Корпорацийн имэйл ашиглана уу · Must use corporate email · 会社メールを使用してください",
    password: "Нууц үг · パスワード · Password",
    confirmPassword: "Нууц үг давтах · パスワード確認 · Confirm Password",
    passwordLengthError: "Нууц үг 8-аас дээш тэмдэгттэй байна · Password must be at least 8 characters · 8文字以上で入力してください",
    passwordMatchError: "Нууц үг таарах ёстой · Passwords must match · パスワードが一致しません",
    department: "Хэлтэс · 部署 · Department",
    rank: "Албан тушаал · 役職 · Rank",
    manager: "Шууд дарга · 直属上司 · Direct Manager",
    managerSubtitle: "Зөвшөөрлийн гинж автоматаар үүснэ · This determines your approval chain · 承認チェーンが自動生成されます",
    managerNote: "Зөвшөөрлийн гинж байгууллагын бүтцээс автоматаар үүснэ · 自動生成 · Auto-generated approval chain from org chart",
    selectPlaceholder: "Сонгоно уу · 選択してください · Select",
    submit: "Бүртгүүлэх · 登録する · Register",
    success: "Бүртгэл амжилттай · Registration submitted · 登録完了",
    signInPrefix: "Бүртгэлтэй юу?",
    signIn: "Нэвтрэх · Sign in · ログイン",
    showPassword: "Нууц үг харуулах",
    hidePassword: "Нууц үг нуух",
  },
};

const departments = [
  { value: "sales", label: { jp: "営業部 · Sales", en: "Sales · 営業部", mn: "Борлуулалт · 営業部 · Sales" } },
  { value: "accounting", label: { jp: "経理部 · Accounting", en: "Accounting · 経理部", mn: "Нягтлан бодох · 経理部 · Accounting" } },
  { value: "hr", label: { jp: "人事部 · HR", en: "HR · 人事部", mn: "Хүний нөөц · 人事部 · HR" } },
  { value: "engineering", label: { jp: "技術部 · Engineering", en: "Engineering · 技術部", mn: "Инженерчлэл · 技術部 · Engineering" } },
  { value: "legal", label: { jp: "法務部 · Legal", en: "Legal · 法務部", mn: "Хууль · 法務部 · Legal" } },
  { value: "general-affairs", label: { jp: "総務部 · General Affairs", en: "General Affairs · 総務部", mn: "Ерөнхий хэрэг · 総務部 · General Affairs" } },
];

const ranks = [
  { value: "tanto", label: { jp: "担当 (Tantō) — General Staff", en: "General Staff — 担当 (Tantō)", mn: "Ерөнхий ажилтан — 担当 (Tantō) · General Staff" } },
  { value: "shunin", label: { jp: "主任 (Shunin) — Senior Staff", en: "Senior Staff — 主任 (Shunin)", mn: "Ахлах ажилтан — 主任 (Shunin) · Senior Staff" } },
  { value: "kakaricho", label: { jp: "係長 (Kakarichō) — Team Supervisor", en: "Team Supervisor — 係長 (Kakarichō)", mn: "Багийн ахлагч — 係長 (Kakarichō) · Team Supervisor" } },
  { value: "kacho", label: { jp: "課長 (Kachō) — Section Manager", en: "Section Manager — 課長 (Kachō)", mn: "Хэсгийн дарга — 課長 (Kachō) · Section Manager" } },
  { value: "bucho", label: { jp: "部長 (Buchō) — Department Head", en: "Department Head — 部長 (Buchō)", mn: "Газрын дарга — 部長 (Buchō) · Department Head" } },
  { value: "shacho", label: { jp: "社長 (Shachō) — President", en: "President — 社長 (Shachō)", mn: "Ерөнхийлөгч — 社長 (Shachō) · President" } },
];

const managers = [
  {
    value: "tanaka-bucho-sales",
    label: { jp: "田中 部長 — 部長 · 営業部", en: "Tanaka Buchō — Department Head · Sales Dept", mn: "Танака Бүчо — Газрын дарга · Борлуулалт" },
  },
  {
    value: "sato-kacho-engineering",
    label: { jp: "佐藤 課長 — 課長 · 技術部", en: "Sato Kachō — Section Manager · Engineering Dept", mn: "Сато Качо — Хэсгийн дарга · Инженерчлэл" },
  },
  {
    value: "yamada-kakaricho-accounting",
    label: { jp: "山田 係長 — 係長 · 経理部", en: "Yamada Kakarichō — Team Supervisor · Accounting Dept", mn: "Ямада Какаричо — Багийн ахлагч · Нягтлан бодох" },
  },
];

const initialForm: FormState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  department: "",
  rank: "",
  manager: "",
};

function isCorporateEmail(value: string) {
  return value.trim().toLowerCase().endsWith("@company.com");
}

export default function RegisterPage() {
  const [activeLanguage, setActiveLanguage] = useState<Language>("jp");
  const [form, setForm] = useState<FormState>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const t = text[activeLanguage];

  const emailIsInvalid = form.email.length > 0 && !isCorporateEmail(form.email);
  const passwordIsInvalid = form.password.length > 0 && form.password.length < 8;
  const confirmationIsInvalid =
    form.confirmPassword.length > 0 && form.confirmPassword !== form.password;

  const formIsValid = useMemo(
    () =>
      form.fullName.trim().length > 0 &&
      isCorporateEmail(form.email) &&
      form.password.length >= 8 &&
      form.confirmPassword === form.password &&
      form.department.length > 0 &&
      form.rank.length > 0 &&
      form.manager.length > 0,
    [form],
  );

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formIsValid) return;

    console.log({
      ...form,
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
    });
    setSubmitted(true);
  }

  return (
    <main className="[font-family:Inter,var(--font-geist-sans),ui-sans-serif,system-ui,sans-serif] min-h-screen bg-[#0a0a0a] text-zinc-50">
      <nav className="border-b border-[#1f1f1f] bg-[#0a0a0a]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-base font-semibold tracking-normal text-white">{t.logo}</p>

          <div className="flex rounded border border-[#1f1f1f] bg-[#111111] p-1">
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
                  onClick={() => setActiveLanguage(language.value)}
                  type="button"
                >
                  {language.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <section className="w-full max-w-xl rounded border border-[#1f1f1f] bg-[#111111] p-5 shadow-xl shadow-black/30 sm:p-6">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-normal text-white">
              {t.title}
            </h1>
            <p className="mt-2 text-sm leading-6 text-zinc-500">{t.subtitle}</p>
          </div>

          <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              {t.fullName}
              <input
                className="h-11 rounded border border-[#1f1f1f] bg-[#0a0a0a] px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30"
                onChange={(event) => updateField("fullName", event.target.value)}
                placeholder={t.fullNamePlaceholder}
                required
                type="text"
                value={form.fullName}
              />
            </label>

            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              {t.email}
              <input
                aria-invalid={emailIsInvalid}
                className="h-11 rounded border border-[#1f1f1f] bg-[#0a0a0a] px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30 aria-[invalid=true]:border-red-500"
                onChange={(event) => updateField("email", event.target.value)}
                placeholder={t.emailPlaceholder}
                required
                type="email"
                value={form.email}
              />
              {emailIsInvalid ? (
                <span className="text-xs font-medium text-red-300" role="alert">
                  {t.emailError}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              {t.password}
              <div className="flex h-11 rounded border border-[#1f1f1f] bg-[#0a0a0a] focus-within:border-[#7c3aed] focus-within:ring-2 focus-within:ring-[#7c3aed]/30">
                <input
                  aria-invalid={passwordIsInvalid}
                  className="min-w-0 flex-1 bg-transparent px-3 text-sm text-white outline-none placeholder:text-zinc-600"
                  minLength={8}
                  onChange={(event) => updateField("password", event.target.value)}
                  required
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                />
                <button
                  aria-label={showPassword ? t.hidePassword : t.showPassword}
                  className="flex h-full w-11 items-center justify-center rounded text-zinc-500 transition hover:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
                  onClick={() => setShowPassword((current) => !current)}
                  title={showPassword ? t.hidePassword : t.showPassword}
                  type="button"
                >
                  {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
                </button>
              </div>
              {passwordIsInvalid ? (
                <span className="text-xs font-medium text-red-300" role="alert">
                  {t.passwordLengthError}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              {t.confirmPassword}
              <input
                aria-invalid={confirmationIsInvalid}
                className="h-11 rounded border border-[#1f1f1f] bg-[#0a0a0a] px-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30 aria-[invalid=true]:border-red-500"
                minLength={8}
                onChange={(event) => updateField("confirmPassword", event.target.value)}
                required
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
              />
              {confirmationIsInvalid ? (
                <span className="text-xs font-medium text-red-300" role="alert">
                  {t.passwordMatchError}
                </span>
              ) : null}
            </label>

            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              {t.department}
              <select
                className="h-11 rounded border border-[#1f1f1f] bg-[#0a0a0a] px-3 text-sm text-white outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30"
                onChange={(event) => updateField("department", event.target.value)}
                required
                value={form.department}
              >
                <option value="">{t.selectPlaceholder}</option>
                {departments.map((department) => (
                  <option key={department.value} value={department.value}>
                    {department.label[activeLanguage]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              {t.rank}
              <select
                className="h-11 rounded border border-[#1f1f1f] bg-[#0a0a0a] px-3 text-sm text-white outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30"
                onChange={(event) => updateField("rank", event.target.value)}
                required
                value={form.rank}
              >
                <option value="">{t.selectPlaceholder}</option>
                {ranks.map((rank) => (
                  <option key={rank.value} value={rank.value}>
                    {rank.label[activeLanguage]}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-zinc-200">
              <span>{t.manager}</span>
              <span className="-mt-1 text-xs font-normal leading-5 text-zinc-500">
                {t.managerSubtitle}
              </span>
              <select
                className="h-11 rounded border border-[#1f1f1f] bg-[#0a0a0a] px-3 text-sm text-white outline-none transition focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30"
                onChange={(event) => updateField("manager", event.target.value)}
                required
                value={form.manager}
              >
                <option value="">{t.selectPlaceholder}</option>
                {managers.map((manager) => (
                  <option key={manager.value} value={manager.value}>
                    {manager.label[activeLanguage]}
                  </option>
                ))}
              </select>
              <span className="text-xs font-normal leading-5 text-zinc-500">{t.managerNote}</span>
            </label>

            <button
              className="mt-1 h-11 w-full rounded border border-[#7c3aed] bg-[#7c3aed] px-4 text-sm font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:ring-offset-2 focus:ring-offset-[#0a0a0a] disabled:cursor-not-allowed disabled:border-zinc-800 disabled:bg-zinc-800 disabled:text-zinc-500"
              disabled={!formIsValid}
              type="submit"
            >
              {t.submit}
            </button>

            {submitted ? (
              <p className="rounded border border-[#22c55e]/30 bg-[#22c55e]/10 px-3 py-2 text-sm font-medium text-green-200" role="status">
                {t.success}
              </p>
            ) : null}
          </form>

          <p className="mt-5 text-center text-sm leading-6 text-zinc-500">
            {t.signInPrefix}{" "}
            <Link className="font-semibold text-[#a78bfa] transition hover:text-white" href="/login">
              {t.signIn}
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

