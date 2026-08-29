const fs = require('fs');
const filePath = 'web_portal/resources/js/Pages/Welcome.tsx';
let code = fs.readFileSync(filePath, 'utf8');

const startTag = '<section id="alur" className="py-20 bg-gray-50/60 border-b border-gray-100 scroll-mt-24">';
const endTag = '                    {/* 3D Global Distributed Node Network Showcase Box: Full-Width Edge-to-Edge */}';

const idxStart = code.indexOf(startTag);
const idxEnd = code.indexOf(endTag, idxStart);

if (idxStart === -1 || idxEnd === -1) {
    console.error("Tags not found!");
    process.exit(1);
}

const newAlurContent = `<section id="alur" className="py-20 bg-gray-50/60 border-b border-gray-100 scroll-mt-24">
                <div className="w-full">
                    {/* Section Header: Left-Aligned, Large Typography */}
                    <div className="w-full text-left mb-10 px-4 sm:px-6 lg:px-10 xl:px-14">
                        <div className="text-xs sm:text-sm font-sans font-extrabold tracking-widest text-[#980f12] uppercase mb-2">
                            Keunggulan PETROCHAIN
                        </div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 mt-1 mb-3 tracking-tight">
                            5 Fitur Cerdas Anti-Kecurangan
                        </h2>
                        <p className="text-gray-800 text-base sm:text-lg max-w-3xl leading-relaxed font-medium">
                            Bagaimana PETROCHAIN mengunci celah kecurangan dari hulu registrasi hingga ke nozzle dispenser SPBU.
                        </p>
                    </div>

                    {/* 5 Features Flow: Grid Edge-to-Edge */}
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-0 border-t border-b border-gray-200 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 bg-white">
                        
                        {/* Feature 1 */}
                        <div className="bg-white rounded-none p-6 sm:p-8 hover:bg-gray-50/90 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl font-black mb-5 border border-blue-100 group-hover:scale-105 transition-transform">
                                    <FaMotorcycle />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-blue-700 uppercase tracking-wider">FITUR 01 • RODA 2 (MOTOR)</span>
                                <h3 className="text-base sm:text-lg font-black text-gray-900 mt-1.5 mb-2.5">AI CC Classification</h3>
                                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2">
                                    <p><strong className="text-gray-800">Masalah:</strong> Motor &gt;250cc masih berpotensi mengisi BBM subsidi di lapangan.</p>
                                    <p><strong className="text-gray-800">Solusi:</strong> Kamera YOLO mengklasifikasikan motor menjadi &lt;250cc atau ≥250cc. Kendaraan yang memenuhi syarat dapat mengisi BBM, sedangkan motor mewah otomatis ditolak.</p>
                                </div>
                            </div>
                            <div className="text-xs font-mono font-bold text-gray-500 pt-3 mt-4 border-t border-gray-100">
                                Engine: YOLOv8 Vision
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-white rounded-none p-6 sm:p-8 hover:bg-gray-50/90 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-red-50 text-[#980f12] flex items-center justify-center text-xl font-black mb-5 border border-red-100 group-hover:scale-105 transition-transform">
                                    <FaQrcode />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-[#980f12] uppercase tracking-wider">FITUR 02 • RODA 4 (MOBIL)</span>
                                <h3 className="text-base sm:text-lg font-black text-gray-900 mt-1.5 mb-2.5">Cross-Validation QR & Limit</h3>
                                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2">
                                    <p><strong className="text-gray-800">Masalah:</strong> Penyalahgunaan QR Code pinjaman dan pelanggaran kuota harian.</p>
                                    <p><strong className="text-gray-800">Solusi:</strong> YOLO + OCR membaca pelat nomor, lalu mencocokkannya dengan data QR Code. Jika sesuai dan kuota harian masih tersedia, pompa BBM diaktifkan.</p>
                                </div>
                            </div>
                            <div className="text-xs font-mono font-bold text-gray-500 pt-3 mt-4 border-t border-gray-100">
                                Validasi: Dual Cross-Check
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-white rounded-none p-6 sm:p-8 hover:bg-gray-50/90 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-xl font-black mb-5 border border-emerald-100 group-hover:scale-105 transition-transform">
                                    <FiCheckCircle />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-emerald-700 uppercase tracking-wider">FITUR 03 • REGISTRASI KENDARAAN</span>
                                <h3 className="text-base sm:text-lg font-black text-gray-900 mt-1.5 mb-2.5">AI-Assisted Registration</h3>
                                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2">
                                    <p><strong className="text-gray-800">Masalah:</strong> Verifikasi berkas fisik STNK masih sangat lambat dan rawan human error manual.</p>
                                    <p><strong className="text-gray-800">Solusi:</strong> AI mencocokkan pelat nomor pada STNK dan foto kendaraan. Jika ada ketidaksesuaian, sistem memberi flag otomatis untuk ditinjau operator.</p>
                                </div>
                            </div>
                            <div className="text-xs font-mono font-bold text-gray-500 pt-3 mt-4 border-t border-gray-100">
                                Verifikasi: Auto-Flag Anomaly
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="bg-white rounded-none p-6 sm:p-8 hover:bg-gray-50/90 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl font-black mb-5 border border-amber-100 group-hover:scale-105 transition-transform">
                                    <FiMapPin />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-amber-700 uppercase tracking-wider">FITUR 04 • PUBLIK & PENGEMUDI</span>
                                <h3 className="text-base sm:text-lg font-black text-gray-900 mt-1.5 mb-2.5">PetroLocator</h3>
                                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2">
                                    <p><strong className="text-gray-800">Masalah:</strong> Pengguna tidak mengetahui ketersediaan stok BBM riil di stasiun SPBU tujuan.</p>
                                    <p><strong className="text-gray-800">Solusi:</strong> Operator memperbarui status stok secara real-time sehingga pengguna dapat melihat ketersediaan BBM sebelum berangkat.</p>
                                </div>
                            </div>
                            <div className="text-xs font-mono font-bold text-gray-500 pt-3 mt-4 border-t border-gray-100">
                                Pembaruan: Real-time Telemetry
                            </div>
                        </div>

                        {/* Feature 5 */}
                        <div className="bg-white rounded-none p-6 sm:p-8 hover:bg-gray-50/90 transition-all flex flex-col justify-between group">
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-xl font-black mb-5 border border-purple-100 group-hover:scale-105 transition-transform">
                                    <FiLayers />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-mono font-bold text-purple-700 uppercase tracking-wider">FITUR 05 • BPH MIGAS & REGULATOR</span>
                                <h3 className="text-base sm:text-lg font-black text-gray-900 mt-1.5 mb-2.5">Blockchain Audit Trail</h3>
                                <div className="text-xs sm:text-sm text-gray-600 leading-relaxed space-y-2">
                                    <p><strong className="text-gray-800">Masalah:</strong> Audit penyaluran subsidi kurang transparan dan catatan buku rentan rekayasa.</p>
                                    <p><strong className="text-gray-800">Solusi:</strong> Seluruh transaksi BBM dicatat di blockchain sehingga data tidak dapat diubah dan mudah diaudit secara langsung oleh pemerintah.</p>
                                </div>
                            </div>
                            <div className="text-xs font-mono font-bold text-gray-500 pt-3 mt-4 border-t border-gray-100">
                                Ledger: Immutable Fabric
                            </div>
                        </div>

                    </div>

`;

code = code.substring(0, idxStart) + newAlurContent + code.substring(idxEnd);

fs.writeFileSync(filePath, code);
console.log("Alur section successfully replaced!");
