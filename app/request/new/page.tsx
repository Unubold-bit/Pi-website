"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Lang = "jp" | "en";
type RequestType = "expense" | "sop" | "proposal" | null;
type SopScope = "team" | "department" | "company";

const jp = {
  logo: "Hanko \u5224\u5b50",
  role: "\u62c5\u5f53 \u00b7 \u7533\u8acb\u8005",
  logout: "\u30ed\u30b0\u30a2\u30a6\u30c8",
  pageTitle: "\u65b0\u898f\u7533\u8acb",
  pageSubtitle: "\u7533\u8acb\u7a2e\u5225\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044",
  types: {
    expense: { title: "\u7d4c\u8cbb\u7533\u8acb", desc: "\u4ea4\u901a\u8cbb\u3001\u63a5\u5f85\u8cbb\u3001\u5099\u54c1\u8cfc\u5165\u306a\u3069" },
    sop: { title: "SOP\u6539\u8a02", desc: "\u793e\u5185\u898f\u5247\u30fb\u624b\u9806\u66f8\u306e\u5909\u66f4\u7533\u8acb" },
    proposal: { title: "\u4f01\u753b\u63d0\u6848", desc: "\u65b0\u898f\u30d7\u30ed\u30b8\u30a7\u30ad\u30c8\u30fb\u30c4\u30fc\u30eb\u5c0e\u5165\u306e\u627f\u8a8d\u7533\u8acb" },
  },
  amount: "\u91d1\u984d (\u00a5)",
  category: "\u8cbb\u76ee",
  categories: ["\u4ea4\u901a\u8cbb", "\u63a5\u5f85\u8cbb", "\u5099\u54c1\u8cfc\u5165", "\u51fa\u5f35\u8cbb", "\u305d\u306e\u4ed6"],
  receipt: "\u9818\u53ce\u66f8",
  receiptNote: "PDF\u307e\u305f\u306f\u753b\u50cf\u30d5\u30a1\u30a4\u30eb \u00b7 \u6700\u592710MB",
  uploading: "\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u4e2d...",
  uploaded: "\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9\u5b8c\u4e86",
  justification: "\u7533\u8acb\u7406\u7531",
  gps: "\u4f4d\u7f6e\u60c5\u5831",
  gpsNote: "\u5730\u56f3\u3092\u30af\u30ea\u30c3\u30af\u3057\u3066\u5834\u6240\u3092\u9078\u629e\u3057\u3066\u304f\u3060\u3055\u3044",
  gpsSelected: "\u5834\u6240\u304c\u9078\u629e\u3055\u308c\u307e\u3057\u305f",
  gpsNotSelected: "\u5730\u56f3\u4e0a\u3067\u5834\u6240\u3092\u30af\u30ea\u30c3\u30af\u3057\u3066\u304f\u3060\u3055\u3044",
  gpsSearchPlaceholder: "\u5834\u6240\u3092\u691c\u7d22...",
  gpsSearchBtn: "\u691c\u7d22",
  selfie: "\u672c\u4eba\u78ba\u8a8d",
  selfieBtn: "\u64ae\u5f71\u3059\u308b (\u30e9\u30a4\u30d6\u30ab\u30e1\u30e9\u306e\u307f)",
  selfieVerified: "\u78ba\u8a8d\u6e08\u307f",
  selfieNote: "\u30ae\u30e3\u30e9\u30ea\u30fc\u5199\u771f\u306f\u4f7f\u7528\u4e0d\u53ef",
  targetDoc: "\u5bfe\u8c61\u898f\u7a0b",
  targetDocs: ["\u7d4c\u8cbb\u898f\u7a0b", "\u52e4\u601d\u898f\u7a0b", "\u5b89\u5168\u898f\u7a0b", "\u305d\u306e\u4ed6"],
  scope: "\u9069\u7528\u7bc4\u56f2",
  scopeOptions: { team: "\u81ea\u5206\u306e\u30c1\u30fc\u30e0", department: "\u90e8\u7f72\u5168\u4f53", company: "\u4f1a\u793e\u5168\u4f53" },
  oldText: "\u73fe\u884c\u30c6\u30ad\u30b9\u30c8 (\u5909\u66f4\u524d)",
  newText: "\u6539\u8a02\u30c6\u30ad\u30b9\u30c8 (\u5909\u66f4\u5f8c)",
  projectTitle: "\u30d7\u30ed\u30b8\u30a7\u30ad\u30c8\u540d",
  summary: "\u6982\u8981 (\u6700\u5927200\u8a9e)",
  budget: "\u4e88\u7b97 (\u00a5)",
  attachment: "\u6dfb\u4ed8\u30d5\u30a1\u30a4\u30eb / \u30ea\u30f3\u30af",
  uploadPdf: "PDF\u3092\u30a2\u30c3\u30d7\u30ed\u30fc\u30c9",
  pasteLink: "\u30ea\u30f3\u30af\u3092\u8cbc\u308a\u4ed8\u3051",
  chainLabel: "\u627f\u8a8d\u30eb\u30fc\u30c8 (\u81ea\u52d5\u751f\u6210)",
  submit: "\u7533\u8acb\u3059\u308b",
  submitting: "\u9001\u4fe1\u4e2d...",
  submitted: "\u7533\u8acb\u3092\u9001\u4fe1\u3057\u307e\u3057\u305f",
  submitError: "\u9001\u4fe1\u306b\u5931\u6557\u3057\u307e\u3057\u305f",
  routing: {
    kacho: "\u2192 \u8ab2\u9577 (Kach\u014d) \u304c\u627f\u8a8d",
    bucho: "\u2192 \u90e8\u9577 (Buch\u014d) \u304c\u627f\u8a8d",
    shacho: "\u2192 \u793e\u9577 (Shach\u014d) \u304c\u627f\u8a8d",
    auto: "\u2192 \u81ea\u52d5\u627f\u8a8d\u306e\u53ef\u80fd\u6027\u3042\u308a",
  },
  chars: "\u6587\u5b57",
  words: "\u8a9e",
};

const en = {
  logo: "Hanko \u5224\u5b50",
  role: "\u62c5\u5f53 \u00b7 Submitter",
  logout: "Logout",
  pageTitle: "New Request",
  pageSubtitle: "Select a request type to begin",
  types: {
    expense: { title: "Expense Reimbursement", desc: "Travel, entertainment, office supplies" },
    sop: { title: "SOP / Rule Update", desc: "Internal rule or procedure change" },
    proposal: { title: "Project Proposal", desc: "New project or tool approval" },
  },
  amount: "Amount (\u00a5)",
  category: "Category",
  categories: ["Transportation", "Entertainment", "Office Supplies", "Business Trip", "Other"],
  receipt: "Receipt",
  receiptNote: "PDF or image file \u00b7 Max 10MB",
  uploading: "Uploading...",
  uploaded: "Uploaded",
  justification: "Justification",
  gps: "Location",
  gpsNote: "Click on the map to mark your location",
  gpsSelected: "Location selected",
  gpsNotSelected: "Click on the map to select a location",
  gpsSearchPlaceholder: "Search for a place...",
  gpsSearchBtn: "Search",
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
  budget: "Budget (\u00a5)",
  attachment: "Attachment / Link",
  uploadPdf: "Upload PDF",
  pasteLink: "Paste Link",
  chainLabel: "Approval Chain \u00b7 Auto-generated from org chart",
  submit: "Submit Request",
  submitting: "Submitting...",
  submitted: "Request submitted successfully",
  submitError: "Submission failed",
  routing: {
    kacho: "\u2192 Will be reviewed by Kach\u014d (\u8ab2\u9577)",
    bucho: "\u2192 Will be reviewed by Buch\u014d (\u90e8\u9577)",
    shacho: "\u2192 Will be reviewed by Shach\u014d (\u793e\u9577)",
    auto: "\u2192 May qualify for auto-approval",
  },
  chars: "chars",
  words: "words",
};

const CHAIN_NODES = ["\u62c5\u5f53", "\u4fc2\u9577", "\u8ab2\u9577", "\u90e8\u9577", "\u793e\u9577"];
const CHAIN_LEVELS = { kacho: 2, bucho: 3, shacho: 4 };

function countWords(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\\s+/).length;
}

// Default map center: Ulaanbaatar, Mongolia
const DEFAULT_LAT = 47.9184;
const DEFAULT_LNG = 106.9177;

export default function NewRequestPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [requestType, setRequestType] = useState<RequestType>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [justification, setJustification] = useState("");
  const [selfieVerified, setSelfieVerified] = useState(false);

  const [pickedLat, setPickedLat] = useState<number | null>(null);
  const [pickedLng, setPickedLng] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const leafletLoadedRef = useRef(false);

  const [targetDoc, setTargetDoc] = useState("");
  const [scope, setScope] = useState<SopScope | "">("");
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [sopJustification, setSopJustification] = useState("");

  const [projectTitle, setProjectTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [budget, setBudget] = useState("");
  const [attachmentMode, setAttachmentMode] = useState<"pdf" | "link">("pdf");
  const [attachmentValue, setAttachmentValue] = useState("");
  const [proposalJustification, setProposalJustification] = useState("");

  const t = lang === "jp" ? jp : en;

  useEffect(() => {
    if (requestType !== "expense") return;
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    function placeMarker(lat: number, lng: number) {
      const L = (window as any).L;
      if (!L || !mapInstanceRef.current) return;

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
      }
      setPickedLat(lat);
      setPickedLng(lng);
    }

    function initMap() {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current).setView([DEFAULT_LAT, DEFAULT_LNG], 12);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      map.on("click", (e: any) => {
        placeMarker(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
    }

    function loadLeaflet() {
      if (leafletLoadedRef.current) {
        initMap();
        return;
      }

      const cssId = "leaflet-css";
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link");
        link.id = cssId;
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const scriptId = "leaflet-js";
      const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (existing) {
        if ((window as any).L) {
          leafletLoadedRef.current = true;
          initMap();
        } else {
          existing.addEventListener("load", () => {
            leafletLoadedRef.current = true;
            initMap();
          });
        }
        return;
      }

      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        leafletLoadedRef.current = true;
        initMap();
      };
      document.body.appendChild(script);
    }

    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [requestType]);

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const results = await res.json();

      if (results.length > 0) {
        const lat = parseFloat(results[0].lat);
        const lng = parseFloat(results[0].lon);

        const L = (window as any).L;
        if (mapInstanceRef.current && L) {
          mapInstanceRef.current.setView([lat, lng], 14);
          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng]).addTo(mapInstanceRef.current);
          }
        }
        setPickedLat(lat);
        setPickedLng(lng);
      }
    } catch (err) {
      console.error("Geocoding search failed:", err);
    } finally {
      setSearching(false);
    }
  }

  async function handleReceiptUpload(file: File) {
    setReceiptFile(file);
    setReceiptUploading(true);
    setReceiptUrl(null);

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error } = await supabase.storage.from("receipts").upload(fileName, file);

    if (error) {
      console.error("Upload error:", error);
      setReceiptUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(fileName);
    setReceiptUrl(urlData.publicUrl);
    setReceiptUploading(false);
  }

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
    !!amount &&
    !!category &&
    !!receiptUrl &&
    justification.length >= 50 &&
    selfieVerified &&
    pickedLat !== null &&
    pickedLng !== null;
  const isSopValid =
    !!targetDoc && !!scope && oldText.length >= 10 && newText.length >= 10 && sopJustification.length >= 50;
  const isProposalValid =
    !!projectTitle && countWords(summary) >= 10 && !!budget && !!attachmentValue && proposalJustification.length >= 50;

  const isSubmitEnabled =
    (requestType === "expense" && isExpenseValid) ||
    (requestType === "sop" && isSopValid) ||
    (requestType === "proposal" && isProposalValid);

  async function handleSubmit() {
    if (!isSubmitEnabled || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    const userId = typeof window !== "undefined" ? localStorage.getItem("hanko_user_id") : null;

    const requestNumber = `REQ-${Date.now()}`;

    let insertPayload: Record<string, unknown> = {
      request_number: requestNumber,
      type: requestType,
      submitted_by: userId,
      justification:
        requestType === "expense" ? justification : requestType === "sop" ? sopJustification : proposalJustification,
      status: "pending",
    };

    if (requestType === "expense") {
      insertPayload = {
        ...insertPayload,
        amount: parseInt(amount),
        receipt_url: receiptUrl,
        gps_lat: pickedLat,
        gps_lng: pickedLng,
        gps_location: pickedLat && pickedLng ? `${pickedLat.toFixed(4)}\u00b0 N, ${pickedLng.toFixed(4)}\u00b0 E` : null,
        selfie_verified: selfieVerified,
      };
    } else if (requestType === "proposal") {
      insertPayload = {
        ...insertPayload,
        amount: parseInt(budget),
        title: projectTitle,
      };
    }

    const { error } = await supabase.from("requests").insert(insertPayload);

    setIsSubmitting(false);

    if (error) {
      console.error("Submit error:", error);
      setSubmitError(t.submitError);
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      router.push("/dashboard/submitter");
    }, 1500);
  }

  const s: React.CSSProperties = {
    fontFamily: "Inter, system-ui, sans-serif",
    background: "#0a0a0a",
    minHeight: "100vh",
    color: "#e5e5e5",
  };

  return (
    <div style={s}>
      <nav style={{ background: "#111", borderBottom: "1px solid #1f1f1f", padding: "0 24px", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <span style={{ color: "#7c3aed", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.5px" }}>{t.logo}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ background: "#1a1030", color: "#a78bfa", border: "1px solid #3b1fa8", borderRadius: "4px", padding: "2px 10px", fontSize: "12px", fontWeight: 600 }}>{t.role}</span>
          <button onClick={() => setLang(lang === "en" ? "jp" : "en")} style={{ background: "#1f1f1f", border: "1px solid #2f2f2f", color: "#aaa", borderRadius: "4px", padding: "4px 12px", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
            {lang === "en" ? "JP" : "EN"}
          </button>
          <button onClick={() => router.push("/login")} style={{ background: "transparent", border: "1px solid #2f2f2f", color: "#888", borderRadius: "4px", padding: "4px 12px", cursor: "pointer", fontSize: "12px" }}>{t.logout}</button>
        </div>
      </nav>

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: "#f5f5f5", letterSpacing: "-0.5px" }}>{t.pageTitle}</h1>
          <p style={{ color: "#666", marginTop: "6px", fontSize: "14px" }}>{t.pageSubtitle}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "40px" }}>
          {(["expense", "sop", "proposal"] as const).map((type) => (
            <button key={type} onClick={() => setRequestType(type)} style={{ background: requestType === type ? "#12073a" : "#111", border: `1px solid ${requestType === type ? "#7c3aed" : "#1f1f1f"}`, borderRadius: "4px", padding: "20px 16px", cursor: "pointer", textAlign: "left", transition: "border-color 0.15s" }}>
              <div style={{ fontSize: "22px", marginBottom: "8px" }}>
                {type === "expense" ? "\u00a5" : type === "sop" ? "📋" : "🚀"}
              </div>
              <div style={{ color: requestType === type ? "#a78bfa" : "#e5e5e5", fontWeight: 600, fontSize: "14px", marginBottom: "6px" }}>{t.types[type].title}</div>
              <div style={{ color: "#666", fontSize: "12px", lineHeight: "1.5" }}>{t.types[type].desc}</div>
            </button>
          ))}
        </div>

        {requestType && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

            {requestType === "expense" && (
              <>
                <Field label={t.amount}>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="45000" style={inputStyle} />
                  {routing && <p style={{ color: "#7c3aed", marginTop: "6px", fontSize: "13px" }}>{routing.label}</p>}
                </Field>

                <Field label={t.category}>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
                    <option value="">—</option>
                    {t.categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>

                <Field label={t.receipt} note={t.receiptNote}>
                  {receiptUrl ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#22c55e", fontSize: "13px" }}>
                      <span>✓</span><span>{receiptFile?.name} — {t.uploaded}</span>
                    </div>
                  ) : receiptUploading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f59e0b", fontSize: "13px" }}>
                      <span>⏳</span><span>{t.uploading}</span>
                    </div>
                  ) : (
                    <label style={{ ...inputStyle, display: "inline-block", cursor: "pointer", color: "#888", textAlign: "center" }}>
                      {lang === "en" ? "Choose file" : "\u30d5\u30a1\u30a4\u30eb\u3092\u9078\u629e"}
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        style={{ display: "none" }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleReceiptUpload(file);
                        }}
                      />
                    </label>
                  )}
                </Field>

                <Field label={t.justification}>
                  <textarea value={justification} onChange={(e) => setJustification(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical", border: `1px solid ${justification.length > 0 && justification.length < 50 ? "#ef4444" : "#1f1f1f"}` }} />
                  <p style={{ fontSize: "12px", color: justification.length >= 50 ? "#22c55e" : "#666", marginTop: "4px" }}>{justification.length}/50 {t.chars}</p>
                </Field>

                <Field label={t.gps} note={t.gpsNote}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder={t.gpsSearchPlaceholder}
                      style={{ ...inputStyle, flex: 1 }}
                    />
                    <button
                      onClick={handleSearch}
                      disabled={searching}
                      style={{ ...btnSecondary, borderColor: "#7c3aed", color: "#a78bfa", whiteSpace: "nowrap" }}
                    >
                      {searching ? "..." : t.gpsSearchBtn}
                    </button>
                  </div>

                  <div
                    ref={mapContainerRef}
                    style={{
                      width: "100%",
                      height: "280px",
                      borderRadius: "4px",
                      overflow: "hidden",
                      border: "1px solid #1f1f1f",
                      background: "#111",
                    }}
                  />

                  {pickedLat !== null && pickedLng !== null ? (
                    <div style={{ background: "#0d1f0d", border: "1px solid #1a3a1a", borderRadius: "4px", padding: "10px 14px", fontSize: "13px", color: "#22c55e", marginTop: "10px" }}>
                      📍 {pickedLat.toFixed(4)}\u00b0 N, {pickedLng.toFixed(4)}\u00b0 E \u00b7 {t.gpsSelected}
                    </div>
                  ) : (
                    <div style={{ background: "#1a1200", border: "1px solid #3a2800", borderRadius: "4px", padding: "10px 14px", fontSize: "13px", color: "#f59e0b", marginTop: "10px" }}>
                      {t.gpsNotSelected}
                    </div>
                  )}
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
                    {(["team", "department", "company"] as SopScope[]).map((sc) => (
                      <button key={sc} onClick={() => setScope(sc)} style={{ flex: 1, padding: "10px", borderRadius: "4px", border: `1px solid ${scope === sc ? "#7c3aed" : "#1f1f1f"}`, background: scope === sc ? "#12073a" : "#111", color: scope === sc ? "#a78bfa" : "#888", cursor: "pointer", fontSize: "13px" }}>
                        {t.scopeOptions[sc]}
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

            {requestType === "proposal" && (
              <>
                <Field label={t.projectTitle}>
                  <input type="text" value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} maxLength={100} placeholder={lang === "en" ? "e.g. Customer Portal v2" : "\u4f8b\uff1a\u9867\u5ba2\u30dd\u30fc\u30bf\u30ebv2"} style={inputStyle} />
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
                      {attachmentValue || (lang === "en" ? "Choose PDF" : "PDF\u3092\u9078\u629e")}
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

            {routing && (
              <div style={{ background: "#111", border: "1px solid #1f1f1f", borderRadius: "4px", padding: "20px" }}>
                <p style={{ color: "#666", fontSize: "12px", marginBottom: "16px", letterSpacing: "0.05em", textTransform: "uppercase" }}>{t.chainLabel}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
                  {CHAIN_NODES.map((node, i) => {
                    const isActive = i === activeNodeIndex;
                    const isPassed = activeNodeIndex !== null && i < activeNodeIndex;
                    return (
                      <div key={node} style={{ display: "flex", alignItems: "center", flex: i < CHAIN_NODES.length - 1 ? 1 : "none" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, border: `2px solid ${isActive ? "#7c3aed" : isPassed ? "#22c55e" : "#2f2f2f"}`, background: isActive ? "#12073a" : isPassed ? "#0d1f0d" : "#0a0a0a", color: isActive ? "#a78bfa" : isPassed ? "#22c55e" : "#444" }}>
                            {isPassed ? "✓" : i + 1}
                          </div>
                          <span style={{ fontSize: "10px", color: isActive ? "#a78bfa" : isPassed ? "#22c55e" : "#555", whiteSpace: "nowrap" }}>{node}</span>
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

            {submitError && (
              <div style={{ background: "#1f0d0d", border: "1px solid #3a1a1a", borderRadius: "4px", padding: "12px 16px", color: "#ef4444", fontSize: "14px", textAlign: "center" }}>
                ✕ {submitError}
              </div>
            )}

            <button onClick={handleSubmit} disabled={!isSubmitEnabled || isSubmitting} style={{ width: "100%", padding: "14px", borderRadius: "4px", border: "none", background: isSubmitEnabled && !isSubmitting ? "#7c3aed" : "#1a1a1a", color: isSubmitEnabled && !isSubmitting ? "#fff" : "#444", fontSize: "15px", fontWeight: 600, cursor: isSubmitEnabled && !isSubmitting ? "pointer" : "not-allowed", letterSpacing: "-0.2px", transition: "background 0.15s" }}>
              {isSubmitting ? t.submitting : t.submit}
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


