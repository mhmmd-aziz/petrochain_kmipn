const fs = require('fs');
const filePath = 'web_portal/resources/js/Pages/Welcome.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Hide Daftar Kendaraan Subsidi button
code = code.replace(
    'className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-[#980f12] px-5 sm:px-6 py-3.5 rounded-lg font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap"',
    'className="hidden inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-[#980f12] px-5 sm:px-6 py-3.5 rounded-lg font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all whitespace-nowrap"'
);

// 2. Remove Depot Kilang icon
code = code.replace(
    '<div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl font-black mb-5 border border-amber-100 group-hover:scale-105 transition-transform">\n                                    <FiDatabase />\n                                </div>',
    '{/* <div className="w-14 h-14 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl font-black mb-5 border border-amber-100 group-hover:scale-105 transition-transform">\n                                    <FiDatabase />\n                                </div> */}'
);

// 3. Remove 4 Lapisan Teknologi section
const startTech = '<section id="teknologi"';
const endTech = '            {/* ========================================================================= */}\n            {/* LIVE SPBU FUEL STOCK LOCATOR MINI-PREVIEW (BRIGHT SPBU IMAGE BACKGROUND)  */}';
const idxStartTech = code.indexOf(startTech);
const idxEndTech = code.indexOf(endTech, idxStartTech);
if (idxStartTech > -1 && idxEndTech > -1) {
    code = code.substring(0, idxStartTech) + code.substring(idxEndTech);
}

// 4. Update Stock Database API
const stateInsert = `    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const [spbus, setSpbus] = useState<any[]>([]);
    useEffect(() => {
        fetch('/api/public/spbus')
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    setSpbus(data.data.slice(0, 3));
                }
            })
            .catch(err => console.error('Error fetching SPBU stock:', err));
    }, []);
`;
code = code.replace('    const [activeFaq, setActiveFaq] = useState<number | null>(null);', stateInsert);

const stockCardsStart = '{/* Edge-to-Edge SPBU Mini Sample Cards: 0 Gap, Straight Corners, Flush with Screen */}';
const stockCardsEnd = '                </div>\n            </section>\n\n\n            {/* ========================================================================= */}\n            {/* FAQ ACCORDION SECTION (EXPANDED LEFT COLUMN, STRAIGHT CORNERS, FLUSH TIGHT) */}';
const idxCardsStart = code.indexOf(stockCardsStart);
const idxCardsEnd = code.indexOf(stockCardsEnd, idxCardsStart);

const newStockCards = `
                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-b border-gray-200 divide-y md:divide-y-0 md:divide-x divide-gray-200 bg-white/95 backdrop-blur-md">
                        {spbus.length > 0 ? spbus.map((spbu: any) => {
                            const pertalite = spbu.fuel_stocks?.find((s: any) => s.fuel_type === 'pertalite');
                            const biosolar = spbu.fuel_stocks?.find((s: any) => s.fuel_type === 'solar' || s.fuel_type === 'biosolar');
                            
                            return (
                                <div key={spbu.id} className="bg-transparent p-6 sm:p-8 rounded-none hover:bg-white transition-colors">
                                    <div className="text-xs font-bold text-gray-950 flex items-center justify-between">
                                        <span>{spbu.name}</span>
                                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    </div>
                                    <div className="mt-4 space-y-2 font-mono text-xs">
                                        <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                                            <span className="text-gray-600">Pertalite:</span>
                                            <strong className={\`font-bold \${pertalite?.status === 'empty' ? 'text-red-600' : (pertalite?.status === 'limited' ? 'text-amber-600' : 'text-emerald-700')}\`}>
                                                {pertalite?.status === 'empty' ? 'Habis' : (pertalite?.status === 'limited' ? 'Menipis' : 'Tersedia')}
                                            </strong>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Biosolar:</span>
                                            <strong className={\`font-bold \${biosolar?.status === 'empty' ? 'text-red-600' : (biosolar?.status === 'limited' ? 'text-amber-600' : 'text-emerald-700')}\`}>
                                                {biosolar?.status === 'empty' ? 'Habis' : (biosolar?.status === 'limited' ? 'Menipis' : 'Tersedia')}
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="col-span-3 p-8 text-center text-gray-500 text-sm">Memuat data stok SPBU...</div>
                        )}
                    </div>
`;

if (idxCardsStart > -1 && idxCardsEnd > -1) {
    code = code.substring(0, idxCardsStart) + stockCardsStart + newStockCards + '\n' + code.substring(idxCardsEnd);
}

// 5. Replace Tim Inovator section
const timStart = '<section id="tim"';
const timEnd = '            {/* ========================================================================= */}\n            {/* FOOTER (FULL-WIDTH)                                                       */}';
const idxTimStart = code.indexOf(timStart);
const idxTimEnd = code.indexOf(timEnd, idxTimStart);

const newTim = `<section id="tim" className="py-20 bg-white border-b border-gray-100 scroll-mt-24 px-4 sm:px-6 lg:px-10 xl:px-14">
                <div className="w-full max-w-5xl mx-auto">
                    <div className="flex items-center gap-3 mb-8 border-b pb-4">
                        <FiUsers className="text-[#3b82f6] text-2xl" />
                        <h2 className="text-xl font-bold text-gray-900">Informasi Tim</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {/* Kolom Kiri */}
                        <div className="space-y-6">
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">NAMA TIM</div>
                                <div className="text-base font-semibold text-gray-900">TimBerapa</div>
                            </div>
                            
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">KATEGORI KOMPETISI</div>
                                <div className="text-base font-semibold text-gray-900">E-Government</div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">KETUA TIM</div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#3b82f6] text-white flex items-center justify-center font-bold text-lg">
                                        M
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-gray-900">Muhammad Aziz</div>
                                        <div className="text-xs text-gray-500">NIM: 2024573010089</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">DOSEN PEMBIMBING</div>
                                <div className="text-sm font-bold text-gray-900">Dr. Rahmad Hidayat, S.Kom., M.Cs</div>
                                <div className="text-xs text-gray-500">NIDN: 0120048303 | NIP: 198304202012121003</div>
                            </div>
                        </div>

                        {/* Kolom Kanan */}
                        <div className="space-y-6">
                            <div>
                                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">ANGGOTA TIM</div>
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold text-lg">
                                            D
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">Deswita Nazwa Ariani</div>
                                            <div className="text-xs text-gray-500">NIM: 2024573010003</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-[#10b981] text-white flex items-center justify-center font-bold text-lg">
                                            A
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">Amirullah</div>
                                            <div className="text-xs text-gray-500">NIM: 2024573010089</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
`;

if (idxTimStart > -1 && idxTimEnd > -1) {
    code = code.substring(0, idxTimStart) + newTim + '\n' + code.substring(idxTimEnd);
}

fs.writeFileSync(filePath, code);
console.log("Welcome.tsx modified successfully");
