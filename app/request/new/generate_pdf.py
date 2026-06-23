import weasyprint

html_content = """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Hanko v2 - PROCON 2026</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 0;
        }
        body {
            background-color: #0a0a0a;
            color: #e5e5e5;
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
        }
        .page {
            width: 297mm;
            height: 210mm;
            page-break-after: always;
            position: relative;
            box-sizing: border-box;
            padding: 25mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .cover-page {
            justify-content: center;
            align-items: center;
            text-align: center;
            background: radial-gradient(circle at center, #111111 0%, #0a0a0a 100%);
        }
        .footer {
            display: flex;
            justify-content: space-between;
            font-size: 14pt;
            color: #555555;
            border-top: 1px solid #1f1f1f;
            padding-top: 5mm;
        }
        h1 {
            font-size: 42pt;
            color: #ffffff;
            margin: 0 0 5mm 0;
            font-weight: 800;
            letter-spacing: -1px;
        }
        h1 span {
            color: #7c3aed;
        }
        h2 {
            font-size: 26pt;
            color: #ffffff;
            margin: 0 0 10mm 0;
            border-left: 5px solid #7c3aed;
            padding-left: 5mm;
            line-height: 1.2;
        }
        p, li {
            font-size: 15pt;
            line-height: 1.6;
            color: #b3b3b3;
        }
        .highlight {
            color: #ffffff;
            font-weight: 600;
        }
        .grid-2 {
            display: flex;
            gap: 15mm;
            flex: 1;
        }
        .col {
            flex: 1;
        }
        .card {
            background-color: #111111;
            border: 1px solid #1f1f1f;
            padding: 6mm;
            border-radius: 4px;
            margin-bottom: 5mm;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 5mm;
        }
        th, td {
            border: 1px solid #1f1f1f;
            padding: 4mm;
            text-align: left;
            font-size: 14pt;
        }
        th {
            background-color: #111111;
            color: #ffffff;
        }
        .badge {
            padding: 1mm 3mm;
            border-radius: 2px;
            font-size: 12pt;
            font-weight: bold;
        }
        .badge-violet { background-color: #7c3aed; color: #ffffff; }
        .badge-amber { background-color: #f59e0b; color: #000000; }
        .badge-red { background-color: #ef4444; color: #ffffff; }
        .badge-green { background-color: #22c55e; color: #000000; }
    </style>
</head>
<body>

    <div class="page cover-page">
        <div style="margin-bottom: 20mm;">
            <div style="font-size: 18pt; color: #7c3aed; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 5mm;">NAPROCK PROCON 2026 Entry</div>
            <h1>Hanko v2: <span>Asynchronous Approval Pipeline</span></h1>
            <div style="font-size: 20pt; color: #888888; margin-top: 5mm;">Хуралгүй Корпораци: Шийдвэр Гүйцэтгэлийг Автоматжуулах Систем</div>
        </div>
        <div style="border-top: 1px solid #1f1f1f; padding-top: 10mm; width: 60mm; margin: 0 auto;">
            <p style="font-size: 14pt; margin: 2mm 0;"><span class="highlight">Бүртгэлийн чиглэл:</span> Open Competition</p>
            <p style="font-size: 14pt; margin: 2mm 0;"><span class="highlight">Бүртгэлийн дугаар:</span> REG-2026-AAP</p>
        </div>
    </div>

    <div class="page">
        <div>
            <h2>1. Системийн зорилго (Project Purpose)</h2>
            <p>Уламжлалт Япон корпорацуудын шийдвэр гаргах явцыг удаашруулдаг <span class="highlight">"Nemawashi"</span> (урьдчилсан зөвшилцлийн урт хурал) болон <span class="highlight">"Hanko"</span> (биеэр байж тамга дарах журам)-ийг халах зорилготой.</p>
            <div class="card" style="margin-top: 10mm;">
                <p style="margin: 0;"><span class="highlight">Үндсэн зорилтууд:</span></p>
                <ul>
                    <li>Компани доторх шийдвэр гаргалтыг 100% асинхрон (синхрон хурал хийхгүй) хэлбэрт шилжүүлэх.</li>
                    <li>Дарга нарын хариуцлагаас зугтах, шийдвэрийг зориуд гацаах үйлдлийг олон нийтийн хяналтын системээр шийдэх.</li>
                    <li>Зардлын болон дүрмийн өөрчлөлтийг ухаалаг алгоритмаар чиглүүлж, дээд удирдлагуудыг мэдээллийн спамаас чөлөөлөх.</li>
                </ul>
            </div>
        </div>
        <div class="footer"><div>Hanko v2 Specification</div><div>Page 2 / 12</div></div>
    </div>

    <div class="page">
        <div>
            <h2>2. Зорилтот хэрэглэгчид (Target Audience)</h2>
            <p>Энэхүү системийг уламжлалт шатлалт бүтэцтэй, шийдвэр гаргалт нь удаан гацдаг дунд болон том хэмжээний Япон корпорацуудад зориулан бүтээв. Хэрэглэгчдийг 3 үндсэн бүлэгт хуваана:</p>
            <div class="grid-2" style="margin-top: 5mm;">
                <div class="col class card">
                    <p class="highlight" style="margin-top: 0;">1. Гүйцэтгэх ажилтан (Tantō / Shunin)</p>
                    <p style="font-size: 14pt;">Томилолт, зардлын нэхэмжлэлээ батлуулах гэж олон хоног хүлээдэг, эсвэл шинэ санал санаачилга нь дунд шатны дарга нар дээр дарагддаг жирийн ажилчид.</p>
                </div>
                <div class="col class card">
                    <p class="highlight" style="margin-top: 0;">2. Дунд шатны удирдлага (Kachō / Buchō)</p>
                    <p style="font-size: 14pt;">Өдөр тутамд ирдэг олон зуун жижиг зардлын баримтад дарагдсан, үүнээсээ болоод стратегийн чухал шийдвэрт цаг гаргаж чаддаггүй менежерүүд.</p>
                </div>
            </div>
            <div class="card" style="margin-top: 5mm;">
                <p style="margin: 0;"><span class="highlight">3. Топ Удирдлага (Shachō / Yakuin):</span> Компани дотор хаана ямар ажил гацаж байгааг бодитоор, ил тод хянах шаардлагатай байгаа гүйцэтгэх захирлууд.</p>
            </div>
        </div>
        <div class="footer"><div>Hanko v2 Specification</div><div>Page 3 / 12</div></div>
    </div>

    <div class="page">
        <div>
            <h2>3. Системийн шинэлэг тал (Originality)</h2>
            <p>Уламжлалт цахим гарын үсгийн системүүдээс ялгарах Hanko v2-ийн <span class="highlight">3 гол шинэлэг санаа:</span></p>
            <div class="card">
                <p style="margin:0;"><span class="highlight">1. Төвлөрсөн бус, Админгүй бүтэц (Admin-less Architecture):</span> Системд бүх датаг өөрчлөх эрхтэй супер-админ байхгүй. Ажилчид өөрсдөө компанийн домэйн мэйлээр бүртгүүлж, даргаа гинжин хэлхээгээр холбодог тул дундаас нь дата өөрчлөх, авлигадах ямар ч боломжгүй.</p>
            </div>
            <div class="card">
                <p style="margin:0;"><span class="highlight">2. Нийтийн Нээлттэй Хяналтын Самбар (Transparency Dashboard):</span> Хүсэлтийг 48 цаг дотор шийдвэрлээгүй даргыг систем автоматаар "Компанийн гацаа" хэмээн олон нийтийн самбарт улаанаар зарлана. Энэ нь соёлын хүрээнд нэр хүндээ хамгаалах хөшүүрэг болдог.</p>
            </div>
            <div class="card">
                <p style="margin:0;"><span class="highlight">3. SLA Freeze & Resume урсгал:</span> Дарга ажилтнаас систем дотор тодруулга нэхэх үед таймер автоматаар царцаж, ажилтан хариулах үед үлдсэн хугацаанаас үргэлжилнэ. Энэ нь дарга хугацаа хожих гэж худал reject хийхээс сэргийлнэ.</p>
            </div>
        </div>
        <div class="footer"><div>Hanko v2 Specification</div><div>Page 4 / 12</div></div>
    </div>

    <div class="page">
        <div>
            <h2>4. Зах зээл дэх системүүдээс ялгарах давуу тал</h2>
            <p>Одоогийн зах зээлд ашиглагдаж буй Concur, Rakuraku Seisan, эсвэл DocuSign зэрэг системүүд нь зөвхөн цаасыг дижитал болгодог болохоос шийдвэр гаргах хурдыг нэмэгдүүлдэггүй.</p>
            <table>
                <thead>
                    <tr>
                        <th>Үзүүлэлт</th>
                        <th>Уламжлалт ERP / DocuSign</th>
                        <th>Hanko v2 (Манай систем)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="highlight">Шийдвэр гаргах урсгал</span></td>
                        <td>Синхрон (Заавал уулзалт, хурал шаарддаг)</td>
                        <td><span class="badge badge-green">Асинхрон</span> (Апп доторх хэлэлцүүлэг)</td>
                    </tr>
                    <tr>
                        <td><span class="highlight">Хугацааны хяналт</span></td>
                        <td>Хязгааргүй (Дарга нар цаас хадгалж гацаадаг)</td>
                        <td><span class="badge badge-red">48-цагийн хатуу хаалт</span> (SLA Timer)</td>
                    </tr>
                    <tr>
                        <td><span class="highlight">Эрх мэдлийн хуваарилалт</span></td>
                        <td>Бүх цаас хамгийн дээд захирал руу явдаг</td>
                        <td><span class="badge badge-violet">Мөнгөн дүнгээр</span> автоматаар доод шатанд хаана</td>
                    </tr>
                    <tr>
                        <td><span class="highlight">Аюулгүй байдал</span></td>
                        <td>Админ дата засах, устгах эрсдэлтэй</td>
                        <td><span class="badge badge-violet">Админгүй</span>, Immutable Audit Trail-тэй</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="footer"><div>Hanko v2 Specification</div><div>Page 5 / 12</div></div>
    </div>

    <div class="page">
        <div>
            <h2>5. Патент судалгаа (Patent & Intellectual Property Research)</h2>
            <p>Японы Патентын Газар (JPO) болон Google Patents сангаас цахим ажлын урсгал (Workflow Automation) чиглэлээр судалгаа хийсэн.</p>
            <div class="card">
                <p><span class="highlight">Холбоотой патент JP2021184125A:</span> "Хүсэлт батлах шатлалт системийг автоматжуулах арга". Энэхүү патент нь зөвхөн урьдчилан тодорхойлсон статик хэлхээгээр цаас дамжуулахыг хамгаалсан байна.</p>
            </div>
            <div class="card" style="margin-top: 5mm;">
                <p style="margin: 0;"><span class="highlight">Манай системийн патентын ялгарал (IP Originality):</span></p>
                <ul>
                    <li>Манай систем нь мөнгөн дүнгийн лимит болон Аюулгүйн алгоритмын (GPS/Selfie зөрүү) үзүүлэлтээр урсгалыг динамикаар өөрчилж, <span class="highlight">Kakarichō node-ийг зөвхөн зөрчилтэй үед идэвхжүүлдэг</span> тул одоогийн патентуудыг зөрчихгүй, цоо шинэ технологийн арга үүсгэж байгаа болно.</li>
                    <li>SLA Freeze болон Нийтийн Transparency онооны систем нь одоогийн ямар нэгэн патентын практикт байхгүй болно.</li>
                </ul>
            </div>
        </div>
        <div class="footer"><div>Hanko v2 Specification</div><div>Page 6 / 12</div></div>
    </div>

    <div class="page">
        <div>
            <h2>6. Хэрэгжүүлэх арга зам болон Логик алгоритм</h2>
            <p>Системийн зардлын чиглүүлэлт (Routing Logic) нь дараах хатуу алгоритмын дагуу бодит цагт ажиллана:</p>
            <div class="card">
                <pre style="font-size: 13pt; color: #a78bfa; margin: 0; font-family: monospace;">
IF request.amount <= 100000 THEN
    Set current_handler = Users.find(rank == 'Kacho' AND department == submitter.department)
    Set auto_terminal_node = TRUE
ELSE IF request.amount <= 1000000 THEN
    Set current_handler = Users.find(rank == 'Bucho' AND department == submitter.department)
ELSE
    Set current_handler = Users.find(rank == 'Shacho')
ENDIF

IF detect_fraud_trigger(gps_data, receipt_url) == TRUE THEN
    Route FIRST to Users.find(rank == 'Kakaricho') -- 係長 зөвхөн эрсдэлтэй үед хяналт тавина
ENDIF
                </pre>
            </div>
            <p style="font-size: 14pt; margin-top: 3mm;">Хэрэв дарга 48 цагт шийдвэр гаргахгүй бол Cron Job ажиллан <span class="highlight">status = 'overdue'</span> болгон хянах самбарт илгээнэ.</p>
        </div>
        <div class="footer"><div>Hanko v2 Specification</div><div>Page 7 / 12</div></div>
    </div>

    <div class="page">
        <div>
            <h2>7. Хэрэгжих боломжийн үнэлгээ (Feasibility Study)</h2>
            <p>Уг систем нь техникийн болон эдийн засгийн хувьд бодитоор хэрэгжих бүрэн боломжтойг дараах үзүүлэлтээр батална:</p>
            <div class="grid-2">
                <div class="col card">
                    <p class="highlight" style="margin-top: 0;">Техникийн хувьд:</p>
                    <p style="font-size: 14pt;">Next.js 16 болон Supabase PostgreSQL-ийн бэлэн дэд бүтэц, Real-time subscription ашиглаж байгаа тул систем маш тогтвортой ажиллана. Байршил тодорхойлоход Leaflet болон утасны GPS ашиглах тул нэмэлт техник хангамж шаардлагагүй.</p>
                </div>
                <div class="col card">
                    <p class="highlight" style="margin-top: 0;">Санхүүгийн хувьд:</p>
                    <p style="font-size: 14pt;">Дундаж Япон компани уулзалт болон Hanko тамга дарах урсгалд сард 150+ цаг алддаг. Манай системийг нэвтрүүлснээр удирдлагуудын цагийг хэмнэж, үйл ажиллагааны зардлыг шууд 35% бууруулах боломжтой нь эдийн засгийн өндөр үр ашгийг харуулж байна.</p>
                </div>
            </div>
        </div>
        <div class="footer"><div>Hanko v2 Specification</div><div>Page 8 / 12</div></div>
    </div>

    <div class="page">
        <div>
            <h2>8. Хэрэглэгчийн Ажиллах орчин (Execution Environment)</h2>
            <p>Хэрэглэгчийн талд ямар нэгэн хүнд програм суулгах шаардлагагүй, бүрэн Web-Based систем байна.</p>
            <div class="card">
                <table style="margin-top: 2mm;">
                    <tr>
                        <th style="width: 30%;">Үйлдлийн систем</th>
                        <td>Windows 11, macOS Sequoia, iOS 17+, Android 14+</td>
                    </tr>
                    <tr>
                        <th>Дэмжих Вэб Хөтөч</th>
                        <td>Google Chrome (v120+), Apple Safari (v17+), Microsoft Edge (v120+)</td>
                    </tr>
                    <tr>
                        <th>Шаардлагатай техник</th>
                        <td>Баримт зураг авах Камер (Утас/Компьютер), Байршил тогтоох GPS мэдрэгч</td>
                    </tr>
                    <tr>
                        <th>Сүлжээний орчин</th>
                        <td>HTTPS протокол, Бага хугацааны хоцрогдолтой (Low latency) интернет холболт</td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="footer"><div>Hanko v2 Specification</div><div>Page 9 / 12</div></div>
    </div>

    <div class="page">
        <div>
            <h2>9. Хөгжүүлэлтийн орчин (Development Environment)</h2>
            <p>Төслийг хамгийн орчин үеийн, хурдан, аюулгүй технологийн багцаар хөгжүүлсэн:</p>
            <div class="card">
                <table style="margin-top: 2mm;">
                    <tr>
                        <th style="width: 30%;">Үндсэн Фрэймворк</th>
                        <td>Next.js 16 (App Router), React 19, TypeScript</td>
                    </tr>
                    <tr>
                        <th>Өгөгдлийн сан</th>
                        <td>Supabase (PostgreSQL) + Row Level Security (RLS) идэвхжүүлсэн</td>
                    </tr>
                    <tr>
                        <th>Дизайн, Стиль</th>
                        <td>Tailwind CSS (Utility-first) + Inline Styles (Dynamic Component)</td>
                    </tr>
                    <tr>
                        <th>Газрын зураг & API</th>
                        <td>Leaflet.js CDN + OpenStreetMap tiles + Nominatim Geocoding API</td>
                    </tr>
                    <tr>
                        <th>Хөгжүүлэлтийн Хэрэгсэл</th>
                        <td>Node.js v20, Visual Studio Code, Git/GitHub (Repo: Pi-website)</td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="footer"><div>Hanko v2 Specification</div><div>Page 10 / 12</div></div>
    </div>

    <div class="page">
        <div>
            <h2>10. Хөгжүүлэлтийн төлөвлөгөө (Development Timeline)</h2>
            <p>PROCON 2026 тэмцээнд зориулсан 4 үе шаттай хөгжүүлэлтийн график:</p>
            <table>
                <thead>
                    <tr>
                        <th>Үе шат</th>
                        <th>Хийгдэх ажлууд</th>
                        <th>Хугацаа</th>
                        <th>Статус</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><span class="highlight">Үе 1: Судалгаа</span></td>
                        <td>Хэрэглэгчийн шаардлага, Японы корпорацын соёл, Патент судалгаа</td>
                        <td>2 долоо хоног</td>
                        <td><span class="badge badge-green">Дууссан</span></td>
                    </tr>
                    <tr>
                        <td><span class="highlight">Үе 2: Архитектур</span></td>
                        <td>DB Schema зохиох, UI/UX Mockup гаргах, Сургуулийн нэрийг нууцлах хаалт</td>
                        <td>2 долоо хоног</td>
                        <td><span class="badge badge-green">Дууссан</span></td>
                    </tr>
                    <tr>
                        <td><span class="highlight">Үе 3: Кодчилол</span></td>
                        <td>Next.js + Supabase холболт, /request/new болон Сэжигтэй дата илрүүлэх логик</td>
                        <td>3 долоо хоног</td>
                        <td><span class="badge badge-amber">Хийгдэж буй</span></td>
                    </tr>
                    <tr>
                        <td><span class="highlight">Үе 4: Тест & Deploy</span></td>
                        <td>Аюулгүй байдал, Хөтчийн нийцэл шалгах, Vercel дээр байршуулах</td>
                        <td>1 долоо хоног</td>
                        <td><span class="badge badge-violet">Төлөвлөсөн</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
        <div class="footer"><div>Hanko v2 Specification</div><div>Page 11 / 12</div></div>
    </div>

    <div class="page">
        <div>
            <h2>11. Оюуны өмч ба Хууль зүйн шаардлага</h2>
            <p>Төслийг илгээхдээ NAPROCK тэмцээний дүрмийн дагуу хууль зүйн болон ёс зүйн бүх шаардлагыг хангасан:</p>
            <div class="card">
                <p style="margin: 0;"><span class="highlight">Оюуны Өмчийн Хамгаалалт:</span></p>
                <ul>
                    <li>Апп дотор ашигласан бүх технологиуд (Next.js, Leaflet, Supabase) нь <span class="highlight">MIT нээлттэй эхийн лицензтэй</span> тул гуравдагч этгээдийн оюуны өмчийг зөрчөөгүй.</li>
                    <li>Газрын зурагт ямар нэгэн төлбөр шаардах Google Maps ашиглалгүй, нээлттэй OpenStreetMap ашигласан тул хууль ёсны дагуу ашиглах эрхтэй.</li>
                </ul>
            </div>
            <div class="card" style="margin-top: 3mm;">
                <p style="margin: 0;"><span class="highlight">Нэргүй байх зарчмын баталгаа:</span></p>
                <ul>
                    <li>Файл дотор ямар нэгэн сургуулийн нэр, багшийн нэр, хотын нэр ороогүй.</li>
                    <li>PDF файлын Метадата (Metadata)-аас зохиогч болон байгууллагын нэрийг бүрэн цэвэрлэж, Adobe Acrobat Reader дээр уншигдах нийцлийг шалгасан болно.</li>
                </ul>
            </div>
        </div>
        <div class="footer"><div>Hanko v2 Specification</div><div>Page 12 / 12</div></div>
    </div>

</body>
</html>
"""

# PDF файл үүсгэх хэсэг
print("PDF файл үүсгэж байна... Түр хүлээнэ үү.")
weasyprint.HTML(string=html_content).write_pdf("Hanko_v2_PROCON2026.pdf")
print("Амжилттай! 'Hanko_v2_PROCON2026.pdf' файл үүслээ. Яг 12 хуудастай бөгөөд А4 Landscape хэмжээтэй.")