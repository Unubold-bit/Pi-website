'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

type Language = 'jp' | 'en' | 'mn';

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
    workspace: "Approval Workspace",
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

const requestTypes = [
  { value: "expense", labels: { jp: "経費申請", en: "Expense", mn: "Зардал" } },
  { value: "sop", labels: { jp: "SOP改訂", en: "SOP Update", mn: "SOP Өөрчлөлт" } },
  { value: "proposal", labels: { jp: "企画提案", en: "Proposal", mn: "Төсөл" } },
];

const approvalLevels = ["submitter", "supervisor", "manager", "head", "president"] as const;

const mockRequests = [
  { id: "REQ-2401", type: "expense", submittedAt: "2026-06-08", approverLevel: "supervisor", status: "pending", activeLevel: 1, timeRemaining: "18h" },
  { id: "REQ-2398", type: "sop", submittedAt: "2026-06-03", approverLevel: "manager", status: "approved", activeLevel: 2, timeRemaining: "0h" },
  { id: "REQ-2389", type: "proposal", submittedAt: "2026-05-29", approverLevel: "head", status: "rejected", activeLevel: 3, timeRemaining: "0h" },
] as const;

export default function SubmitterDashboard() {
  const router = useRouter();
  const [activeLanguage, setActiveLanguage] = useState<Language>('jp');
  const [requestType, setRequestType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [justification, setJustification] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const t = text[activeLanguage];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setAttachment(e.target.files?.[0] ?? null);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (justification.trim().length < 50) {
      setMessage(t.validation);
      setIsSuccess(false);
      return;
    }

    console.log({ requestType, amount, justification, attachment: attachment?.name });
    
    setMessage(t.submitted);
    setIsSuccess(true);
    setJustification('');
    setAmount('');
    setAttachment(null);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#e5e5e5', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Navbar */}
      <nav style={{ backgroundColor: '#111111', borderBottom: '1px solid #1f1f1f', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundColor: '#1f1f1f', border: '1px solid #3b1fa8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: '#7c3aed', fontWeight: 'bold' }}>
                判
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '700' }}>判子 Hanko</div>
                <div style={{ fontSize: '12px', color: '#666' }}>{t.workspace}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Language Toggle */}
              <div style={{ display: 'flex', backgroundColor: '#1f1f1f', borderRadius: '4px', padding: '4px' }}>
                {(['jp', 'en', 'mn'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setActiveLanguage(lang)}
                    style={{
                      padding: '6px 16px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor: activeLanguage === lang ? '#7c3aed' : 'transparent',
                      color: activeLanguage === lang ? '#fff' : '#aaa',
                    }}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>

              <div style={{ padding: '8px 16px', backgroundColor: '#1f1f1f', borderRadius: '4px', fontSize: '14px', color: '#aaa' }}>
                {t.role}
              </div>

              <button
                onClick={() => router.push('/login')}
                style={{
                  padding: '8px 20px',
                  border: '1px solid #ef4444',
                  color: '#ef4444',
                  backgroundColor: 'transparent',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {t.logout}
              </button>
            </div>
          </div>

          {/* Navigation Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                onClick={() => router.push('/request/new')}
                style={{ 
                  padding: '12px 28px', 
                  backgroundColor: '#7c3aed', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {t.navNewRequest || '新規申請'}
              </button>
              
              <a href="#my-requests" style={{ padding: '12px 24px', border: '1px solid #1f1f1f', borderRadius: '4px', color: '#ddd', textDecoration: 'none' }}>
                {t.navMyRequests}
              </a>
            </div>
        </div>
      </nav>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* New Request Form */}
        <section id="new-request" style={{ backgroundColor: '#111111', border: '1px solid #1f1f1f', borderRadius: '4px', padding: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: '#7c3aed', fontSize: '12px', fontWeight: '600', letterSpacing: '1px' }}>{t.sectionOne}</div>
            <h1 style={{ fontSize: '28px', margin: '8px 0 0' }}>{t.newRequest}</h1>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ddd' }}>{t.requestType}</label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                style={{ width: '100%', padding: '14px', backgroundColor: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '4px', color: '#fff' }}
              >
                {requestTypes.map(rt => (
                  <option key={rt.value} value={rt.value}>{rt.labels[activeLanguage]}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ddd' }}>{t.amount}</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{ width: '100%', padding: '14px', backgroundColor: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '4px', color: '#fff' }}
                placeholder="¥"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ddd' }}>{t.justification}</label>
              <textarea
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder={t.justificationPlaceholder}
                style={{ width: '100%', minHeight: '160px', padding: '14px', backgroundColor: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '4px', color: '#fff', resize: 'vertical' }}
                required
              />
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#666', marginTop: '4px' }}>
                {justification.trim().length}/50 {t.minimum}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#ddd' }}>{t.attachFile}</label>
              <label style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                padding: '14px', border: '1px solid #1f1f1f', borderRadius: '4px', backgroundColor: '#0a0a0a', cursor: 'pointer' 
              }}>
                <span style={{ color: attachment ? '#ddd' : '#666' }}>
                  {attachment ? attachment.name : t.chooseFile}
                </span>
                <span style={{ padding: '6px 16px', border: '1px solid #3b3b3b', borderRadius: '4px', fontSize: '13px' }}>
                  {t.browse}
                </span>
                <input type="file" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            </div>

            {message && (
              <div style={{
                padding: '16px',
                borderRadius: '4px',
                border: `1px solid ${isSuccess ? '#22c55e' : '#ef4444'}`,
                backgroundColor: isSuccess ? '#0a140a' : '#140a0a',
                color: isSuccess ? '#22c55e' : '#ef4444'
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              style={{
                padding: '14px',
                backgroundColor: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '15px'
              }}
            >
              {t.submit}
            </button>
          </form>
        </section>

        {/* My Requests */}
        <section id="my-requests" style={{ backgroundColor: '#111111', border: '1px solid #1f1f1f', borderRadius: '4px', padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
            <div>
              <div style={{ color: '#7c3aed', fontSize: '12px', fontWeight: '600' }}>{t.sectionTwo}</div>
              <h2 style={{ fontSize: '28px', margin: '8px 0 0' }}>{t.myRequests}</h2>
            </div>
            <div style={{ color: '#666' }}>{t.records}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {mockRequests.map((req) => {
              const typeLabel = requestTypes.find(r => r.value === req.type)?.labels[activeLanguage] || req.type;
              return (
                <div key={req.id} style={{ backgroundColor: '#0a0a0a', border: '1px solid #1f1f1f', borderRadius: '4px', padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '13px', color: '#666' }}>{req.id}</div>
                      <div style={{ fontSize: '18px', fontWeight: '600', marginTop: '4px' }}>{typeLabel}</div>
                    </div>
                    <div style={{
                      padding: '4px 14px',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      backgroundColor: req.status === 'approved' ? '#052e16' : req.status === 'rejected' ? '#450a0a' : '#422006',
                      color: req.status === 'approved' ? '#4ade80' : req.status === 'rejected' ? '#f87171' : '#fbbf24',
                      border: `1px solid ${req.status === 'approved' ? '#166534' : req.status === 'rejected' ? '#7f1d1d' : '#854d0e'}`
                    }}>
                      {t[req.status]}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '14px' }}>
                    <div>
                      <div style={{ color: '#666', fontSize: '12px' }}>{t.dateSubmitted}</div>
                      <div>{req.submittedAt}</div>
                    </div>
                    <div>
                      <div style={{ color: '#666', fontSize: '12px' }}>{t.currentApprover}</div>
                      <div>{t.approvers[req.approverLevel as keyof typeof t.approvers]}</div>
                    </div>
                    <div>
                      <div style={{ color: '#666', fontSize: '12px' }}>{t.timeRemaining}</div>
                      <div>{req.timeRemaining}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '24px' }}>
                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '12px' }}>{t.approvalChain}</div>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {approvalLevels.map((level, idx) => (
                        <div key={level} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{
                              width: '14px',
                              height: '14px',
                              borderRadius: '50%',
                              border: idx < req.activeLevel ? '2px solid #22c55e' : idx === req.activeLevel ? '2px solid #7c3aed' : '2px solid #444',
                              backgroundColor: idx < req.activeLevel ? '#22c55e' : idx === req.activeLevel ? '#7c3aed' : '#111',
                              margin: '0 auto 6px'
                            }} />
                            <div style={{ fontSize: '11px', color: idx === req.activeLevel ? '#7c3aed' : '#666' }}>
                              {t.approvers[level]}
                            </div>
                          </div>
                          {idx < approvalLevels.length - 1 && <div style={{ flex: 1, height: '1px', backgroundColor: '#1f1f1f', margin: '0 8px' }} />}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button
                      onClick={() => router.push(`/request/${req.id}`)}
                      style={{ padding: '8px 20px', border: '1px solid #1f1f1f', borderRadius: '4px', color: '#aaa', cursor: 'pointer' }}
                    >
                      View detail →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
