"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Lang = "jp" | "en";
type SortKey = "avgResponse" | "overdue" | "pending";

const jp = {
  logo: "Hanko 判子",
  logout: "ログアウト",
  title: "説明責任ダッシュボード",
  subtitle: "管理職別承認パフォーマンス · リアルタイム",
  bannerTitle: "今月の全社サマリー",
  totalRequests: "総申請数",
  onTimeRate: "期限内処理率",
  currentOverdue: "現在の期限超過",
  avgResponseTime: "平均応答時間",
  tableTitle: "管理職パフォーマンスランキング",
  tableSubtitle: "応答時間が速い順 · 最速が上位",
  rank: "順位",
  name: "氏名",
  role: "役職",
  avgResponse: "平均応答時間",
  pending: "保留中",
  overdue: "期限超過",
  breakdown: "承認 / 却下 / 差し戻し",
  bottleneck: "ボトルネック",
  sortBy: "並び替え",
  sortOptions: {
    avgResponse: "応答時間順",
    overdue: "期限超過順",
    pending: "保留数順",
  },
  hours: "時間",
  flagged: "🚨 コーポレートボトルネック",
  excellent: "優秀",
  good: "良好",
  slow: "遅延",
};

const en = {
  logo: "Hanko 判子",
  logout: "Logout",
  title: "説明責任 · Accountability Dashboard",
  subtitle: "Manager approval performance · Real-time",
  bannerTitle: "Company-wide Summary · This Month",
  totalRequests: "Total Requests",
  onTimeRate: "On-time Rate",
  currentOverdue: "Currently Overdue",
  avgResponseTime: "Avg Response Time",
  tableTitle: "Manager Performance Ranking",
  tableSubtitle: "Sorted by response time · Fastest first",
  rank: "Rank",
  name: "Name",
  role: "Role",
  avgResponse: "Avg Response",
  pending: "Pending",
  overdue: "Overdue",
  breakdown: "Approve / Reject / Revise",
  bottleneck: "Bottleneck",
  sortBy: "Sort by",
  sortOptions: {
    avgResponse: "Response time",
    overdue: "Overdue count",
    pending: "Pending count",
  },
  hours: "h",
  flagged: "🚨 Corporate Bottleneck",
  excellent: "Excellent",
  good: "Good",
  slow: "Slow",
};

interface Manager {
  id: string;
  name: string;
  role: string;
  roleLevel: number;
  avgResponseHours: number;
  pending: number;
  overdue: number;
  approved: number;
  rejected: number;
  revised: number;
  isBottleneck: boolean;
}

const MOCK_MANAGERS: Manager[] = [
  { id: "1", name: "佐藤 花子", role: "課長", roleLevel: 4, avgResponseHours: 4.2, pending: 2, overdue: 0, approved: 47, rejected: 3, revised: 2, isBottleneck: false },
  { id: "2", name: "高橋 健", role: "部長", roleLevel: 5, avgResponseHours: 6.8, pending: 3, overdue: 0, approved: 31, rejected: 5, revised: 4, isBottleneck: false },
  { id: "3", name: "中村 悠", role: "係長", roleLevel: 3, avgResponseHours: 9.1, pending: 1, overdue: 0, approved: 0, rejected: 8, revised: 0, isBottleneck: false },
  { id: "4", name: "伊藤 誠", role: "課長", roleLevel: 4, avgResponseHours: 14.5, pending: 4, overdue: 1, approved: 28, rejected: 2, revised: 6, isBottleneck: false },
  { id: "5", name: "渡辺 学", role: "部長", roleLevel: 5, avgResponseHours: 19.3, pending: 6, overdue: 1, approved: 19, rejected: 4, revised: 8, isBottleneck: false },
  { id: "6", name: "山田 次郎", role: "課長", roleLevel: 4, avgResponseHours: 24.7, pending: 8, overdue: 2, approved: 22, rejected: 1, revised: 3, isBottleneck: false },
  { id: "7", name: "鈴木 一郎", role: "部長", roleLevel: 5, avgResponseHours: 31.2, pending: 5, overdue: 3, approved: 15, rejected: 6, revised: 7, isBottleneck: false },
  { id: "8", name: "田中 太郎", role: "課長", roleLevel: 4, avgResponseHours: 39.8, pending: 9, overdue: 4, approved: 11, rejected: 2, revised: 5, isBottleneck: false },
  { id: "9", name: "小林 誠一", role: "部長", roleLevel: 5, avgResponseHours: 44.1, pending: 7, overdue: 5, approved: 8, rejected: 3, revised: 9, isBottleneck: true },
  { id: "10", name: "加藤 美咲", role: "課長", roleLevel: 4, avgResponseHours: 51.6, pending: 12, overdue: 7, approved: 6, rejected: 1, revised: 4, isBottleneck: true },
];

function getPerformanceLabel(hours: number, t: typeof en) {
  if (hours < 12) return { label: t.excellent, color: "#22c55e" };
  if (hours < 30) return { label: t.good, color: "#f59e0b" };
  return { label: t.slow, color: "#ef4444" };
}

function InlineBar({ approved, rejected, revised }: { approved: number; rejected: number; revised: number }) {
  const total = approved + rejected + revised || 1;
  const aw = (approved / total) * 100;
  const rw = (rejected / total) * 100;
  const vw = (revised / total) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: "120px" }}>
      <div style={{ display: "flex", height: "6px", borderRadius: "2px", overflow: "hidden", background: "#1f1f1f" }}>
        <div style={{ width: `${aw}%`, background: "#22c55e" }} />
        <div style={{ width: `${rw}%`, background: "#ef4444" }} />
        <div style={{ width: `${vw}%`, background: "#f59e0b" }} />
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <span style={{ fontSize: "10px", color: "#22c55e" }}>{approved}</span>
        <span style={{ fontSize: "10px", color: "#ef4444" }}>{rejected}</span>
        <span style={{ fontSize: "10px", color: "#f59e0b" }}>{revised}</span>
      </div>
    </div>
  );
}

export default function TransparencyDashboard() {
  const [lang, setLang] = useState<Lang>("en");
  const [sortKey, setSortKey] = useState<SortKey>("avgResponse");

  const t = lang === "jp" ? jp : en;

  const sorted = [...MOCK_MANAGERS].sort((a, b) => {
    if (sortKey === "avgResponse") return a.avgResponseHours - b.avgResponseHours;
    if (sortKey === "overdue") return b.overdue - a.overdue;
    return b.pending - a.pending;
  });

  const totalRequests = MOCK_MANAGERS.reduce((s, m) => s + m.approved + m.rejected + m.revised, 0);
  const totalOverdue = MOCK_MANAGERS.reduce((s, m) => s + m.overdue, 0);
  const onTimeCount = MOCK_MANAGERS.reduce((s, m) => s + m.approved + m.rejected + m.revised, 0) - totalOverdue;
  const onTimeRate = Math.round((onTimeCount / totalRequests) * 100);
  const avgResponse = (MOCK_MANAGERS.reduce((s, m) => s + m.avgResponseHours, 0) / MOCK_MANAGERS.length).toFixed(1);
  const router = useRouter();
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", background: "#0a0a0a", minHeight: "100vh", color: "#e5e5e5" }}>
      {/* Navbar */}
      <nav style={{ background: "#111", borderBottom: "1px solid #1f1f1f", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ color: "#7c3aed", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.5px" }}>{t.logo}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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

      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "36px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 4px", color: "#f5f5f5", letterSpacing: "-0.5px" }}>{t.title}</h1>
          <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>{t.subtitle}</p>
        </div>

        {/* Company summary banner */}
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "4px", padding: "24px", marginBottom: "32px" }}>
          <p style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 20px", fontWeight: 600 }}>{t.bannerTitle}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
            {[
              { label: t.totalRequests, value: totalRequests, color: "#a78bfa" },
              { label: t.onTimeRate, value: `${onTimeRate}%`, color: onTimeRate >= 90 ? "#22c55e" : onTimeRate >= 70 ? "#f59e0b" : "#ef4444" },
              { label: t.currentOverdue, value: totalOverdue, color: totalOverdue === 0 ? "#22c55e" : "#ef4444" },
              { label: t.avgResponseTime, value: `${avgResponse}${t.hours}`, color: "#e5e5e5" },
            ].map((stat) => (
              <div key={stat.label}>
                <p style={{ color: "#555", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>{stat.label}</p>
                <p style={{ color: stat.color, fontSize: "32px", fontWeight: 700, margin: 0, fontVariantNumeric: "tabular-nums", letterSpacing: "-1px" }}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Table header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <p style={{ color: "#e5e5e5", fontSize: "14px", fontWeight: 600, margin: "0 0 2px" }}>{t.tableTitle}</p>
            <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>{t.tableSubtitle}</p>
          </div>
          {/* Sort selector */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#555" }}>{t.sortBy}:</span>
            {(["avgResponse", "overdue", "pending"] as SortKey[]).map((key) => (
              <button key={key} onClick={() => setSortKey(key)} style={{ padding: "4px 10px", borderRadius: "3px", border: `1px solid ${sortKey === key ? "#7c3aed" : "#1f1f1f"}`, background: sortKey === key ? "#12073a" : "transparent", color: sortKey === key ? "#a78bfa" : "#666", cursor: "pointer", fontSize: "11px" }}>
                {t.sortOptions[key]}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "4px", overflow: "hidden" }}>
          {/* Table head */}
          <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 100px 110px 70px 70px 140px 100px", gap: "0", padding: "10px 20px", borderBottom: "1px solid #1f1f1f", background: "#0d0d0d" }}>
            {[t.rank, t.name, t.role, t.avgResponse, t.pending, t.overdue, t.breakdown, ""].map((h, i) => (
              <span key={i} style={{ fontSize: "10px", color: "#444", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {sorted.map((manager, index) => {
            const perf = getPerformanceLabel(manager.avgResponseHours, t);
            const isRed = manager.isBottleneck || manager.overdue >= 4;
            const rowBg = isRed ? "#0f0404" : index % 2 === 0 ? "#111" : "#0d0d0d";
            const rowBorder = isRed ? "1px solid #2a0a0a" : "none";

            return (
              <div key={manager.id} style={{ display: "grid", gridTemplateColumns: "48px 1fr 100px 110px 70px 70px 140px 100px", gap: "0", padding: "14px 20px", borderBottom: "1px solid #0f0f0f", background: rowBg, border: rowBorder, alignItems: "center" }}>
                {/* Rank */}
                <span style={{ fontSize: "14px", fontWeight: 700, color: index === 0 ? "#22c55e" : index <= 2 ? "#a78bfa" : isRed ? "#ef4444" : "#444", fontVariantNumeric: "tabular-nums" }}>
                  #{index + 1}
                </span>

                {/* Name + bottleneck flag */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "14px", color: isRed ? "#fca5a5" : "#e5e5e5", fontWeight: 600 }}>{manager.name}</span>
                    {manager.isBottleneck && (
                      <span style={{ fontSize: "10px", color: "#ef4444", background: "#1f0d0d", border: "1px solid #3a1a1a", borderRadius: "3px", padding: "1px 6px", fontWeight: 700 }}>{t.flagged}</span>
                    )}
                  </div>
                </div>

                {/* Role */}
                <span style={{ fontSize: "12px", color: "#666" }}>{manager.role}</span>

                {/* Avg response */}
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: perf.color, fontVariantNumeric: "tabular-nums" }}>{manager.avgResponseHours}{t.hours}</span>
                  <span style={{ fontSize: "10px", color: perf.color, background: `${perf.color}15`, padding: "1px 5px", borderRadius: "3px" }}>{perf.label}</span>
                </div>

                {/* Pending */}
                <span style={{ fontSize: "14px", color: manager.pending > 5 ? "#f59e0b" : "#888", fontWeight: manager.pending > 5 ? 700 : 400, fontVariantNumeric: "tabular-nums" }}>{manager.pending}</span>

                {/* Overdue */}
                <span style={{ fontSize: "14px", color: manager.overdue > 0 ? "#ef4444" : "#444", fontWeight: manager.overdue > 0 ? 700 : 400, fontVariantNumeric: "tabular-nums" }}>{manager.overdue}</span>

                {/* Breakdown bar */}
                <InlineBar approved={manager.approved} rejected={manager.rejected} revised={manager.revised} />

                {/* Performance badge */}
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "11px", color: perf.color, background: `${perf.color}10`, border: `1px solid ${perf.color}30`, borderRadius: "3px", padding: "2px 8px" }}>{perf.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "16px" }}>
          <span style={{ fontSize: "11px", color: "#333" }}>{lang === "en" ? "Breakdown bar:" : "内訳バー:"}</span>
          <span style={{ fontSize: "11px", color: "#22c55e" }}>■ {lang === "en" ? "Approved" : "承認"}</span>
          <span style={{ fontSize: "11px", color: "#ef4444" }}>■ {lang === "en" ? "Rejected" : "却下"}</span>
          <span style={{ fontSize: "11px", color: "#f59e0b" }}>■ {lang === "en" ? "Revised" : "差し戻し"}</span>
          <span style={{ fontSize: "11px", color: "#333", marginLeft: "12px" }}>■ {lang === "en" ? "Red row = bottleneck or 4+ overdue" : "赤行 = ボトルネックまたは期限超過4件以上"}</span>
        </div>
      </div>
    </div>
  );
}
