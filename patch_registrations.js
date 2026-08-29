const fs = require('fs');
const filePath = 'web_portal/resources/js/Pages/Admin/Registrations.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Update handleApproveClick
const approveTarget = `    const handleApproveClick = () => {
        if (!selectedApp) return;
        const ai = getAiConclusion(selectedApp);
        
        let isMismatch = false;
        
        const userCc = String(selectedApp.vehicle.engine_capacity_cc);
        const aiCc = ai?.stnk_cc || null;
        if (aiCc && aiCc !== userCc) {
            isMismatch = true;
        }

        const userPlate = selectedApp.vehicle.plate_number.replace(/\\s+/g, '').toUpperCase();
        const aiCarPlate = ai?.car_plate ? ai.car_plate.replace(/\\s+/g, '').toUpperCase() : null;
        const aiStnkPlate = ai?.stnk_plate ? ai.stnk_plate.replace(/\\s+/g, '').toUpperCase() : null;

        if ((aiCarPlate && aiCarPlate !== userPlate) || (aiStnkPlate && aiStnkPlate !== userPlate)) {
            isMismatch = true;
        }

        if (isMismatch) {
            setManualCc(userCc);
            setManualPlate(selectedApp.vehicle.plate_number);
            setCorrectionMode('user');
            setShowCorrectionModal(true);
        } else {
            handleReviewSubmit('approved');
        }
    };`;

const approveReplacement = `    const handleApproveClick = () => {
        if (!selectedApp) return;
        
        const userCc = String(selectedApp.vehicle.engine_capacity_cc);
        const userPlate = selectedApp.vehicle.plate_number;

        // Selalu tampilkan modal pemilihan data sebelum approval
        setManualCc(userCc);
        setManualPlate(userPlate);
        setCorrectionMode('user');
        setShowCorrectionModal(true);
    };`;

code = code.replace(approveTarget, approveReplacement);

// 2. Update isMatch / isMismatch logic
const matchTarget = `                                {(() => {
                                    const ai = getAiConclusion(selectedApp);
                                    const isMatch = ai?.conclusion === 'match';
                                    const isMismatch = ai?.conclusion === 'mismatch';`;

const matchReplacement = `                                {(() => {
                                    const ai = getAiConclusion(selectedApp);
                                    
                                    const userFuel = selectedApp.vehicle.fuel_type || '-';
                                    const aiFuel = ai?.stnk_fuel_type;
                                    const isPertaliteRuleViolated = 
                                        (userFuel.toLowerCase() === 'pertalite' || aiFuel?.toLowerCase() === 'pertalite' || aiFuel?.toLowerCase() === 'bensin') && 
                                        (ai?.stnk_cc && parseInt(ai.stnk_cc) > 1400);

                                    const isMatch = ai?.conclusion === 'match' && !isPertaliteRuleViolated;
                                    const isMismatch = ai?.conclusion === 'mismatch';`;

code = code.replace(matchTarget, matchReplacement);

// 3. Update the Banner block
const bannerTarget = `                                            {/* AI Verdict Highlight Box */}
                                            <div className={\`p-5 rounded-2xl border-2 flex items-center justify-between \${
                                                isMatch 
                                                    ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 ring-4 ring-emerald-500/10' 
                                                    : isMismatch 
                                                    ? 'bg-rose-50/80 border-rose-400 text-rose-950 ring-4 ring-rose-500/10' 
                                                    : 'bg-amber-50/80 border-amber-400 text-amber-950 ring-4 ring-amber-500/10'
                                            }\`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl \${
                                                        isMatch ? 'bg-emerald-500 text-white' : isMismatch ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                                                    }\`}>
                                                        {isMatch ? <FiCheckCircle /> : isMismatch ? <FiXCircle /> : <FiAlertTriangle />}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold uppercase tracking-wider opacity-75">
                                                            Keputusan Algoritma AI
                                                        </div>
                                                        <div className="text-lg font-black tracking-wide mt-0.5">
                                                            {isMatch ? 'VERIFIKASI LOLOS (MATCH)' : isMismatch ? 'PELAT KENDARAAN BERBEDA' : 'KUALITAS BURAM / PERLU REVIEW'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className={\`text-xs font-extrabold px-3 py-1.5 rounded-xl \${
                                                    isMatch ? 'bg-emerald-200 text-emerald-900' : isMismatch ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                                                }\`}>
                                                    Confidence: {ai?.stnk_confidence ? (ai.stnk_confidence * 100).toFixed(1) + '%' : (isMatch ? '98.8%' : isMismatch ? 'MISMATCH' : '65.2%')}
                                                </span>
                                            </div>`;

const bannerReplacement = `                                            {/* AI Verdict Highlight Box */}
                                            <div className={\`p-5 rounded-2xl border-2 flex items-center justify-between \${
                                                isMatch 
                                                    ? 'bg-emerald-50/80 border-emerald-400 text-emerald-950 ring-4 ring-emerald-500/10' 
                                                    : isPertaliteRuleViolated
                                                    ? 'bg-rose-50/80 border-rose-400 text-rose-950 ring-4 ring-rose-500/10'
                                                    : isMismatch 
                                                    ? 'bg-rose-50/80 border-rose-400 text-rose-950 ring-4 ring-rose-500/10' 
                                                    : 'bg-amber-50/80 border-amber-400 text-amber-950 ring-4 ring-amber-500/10'
                                            }\`}>
                                                <div className="flex items-center gap-4">
                                                    <div className={\`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl \${
                                                        isMatch ? 'bg-emerald-500 text-white' : (isMismatch || isPertaliteRuleViolated) ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'
                                                    }\`}>
                                                        {isMatch ? <FiCheckCircle /> : (isMismatch || isPertaliteRuleViolated) ? <FiXCircle /> : <FiAlertTriangle />}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold uppercase tracking-wider opacity-75">
                                                            Keputusan Algoritma AI
                                                        </div>
                                                        <div className="text-lg font-black tracking-wide mt-0.5">
                                                            {isMatch ? 'VERIFIKASI LOLOS (MATCH)' : isPertaliteRuleViolated ? 'PELANGGARAN: >1400 CC' : isMismatch ? 'PELAT KENDARAAN BERBEDA' : 'KUALITAS BURAM / PERLU REVIEW'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className={\`text-xs font-extrabold px-3 py-1.5 rounded-xl \${
                                                    isMatch ? 'bg-emerald-200 text-emerald-900' : (isMismatch || isPertaliteRuleViolated) ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                                                }\`}>
                                                    Confidence: {ai?.stnk_confidence ? (ai.stnk_confidence * 100).toFixed(1) + '%' : (isMatch ? '98.8%' : (isMismatch || isPertaliteRuleViolated) ? 'MISMATCH' : '65.2%')}
                                                </span>
                                            </div>`;

code = code.replace(bannerTarget, bannerReplacement);

fs.writeFileSync(filePath, code);
console.log("Registrations.tsx successfully patched.");
