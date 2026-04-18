// ENKOMOS-Power Tier A - Complete Calculator Logic
// Mobile Ready Version

// ========== PRICE DATABASE (ENKOMOS HQ Controlled) ==========
const PRICES = {
    // Solar (per kW)
    solar_enkomos: 100,
    solar_separate: 110,
    
    // Battery Sodium-ion (per kWh)
    battery_enkomos: 80,
    battery_separate: 88,
    
    // Inverter (per kW)
    inverter_enkomos: 90,
    inverter_separate: 100,
    
    // Wind (per kW)
    wind_enkomos: 350,
    wind_separate: 380,
    
    // BOS (per kW of solar)
    bos_enkomos: 25,
    bos_separate: 30,
    
    // Basic Backup
    basic_backup_enkomos: 150,
    basic_backup_separate: 170,
    
    // Pro Backup components
    pro_backup_lights_per_unit: 15,
    pro_backup_fan_per_unit: 30,
    pro_backup_fridge_150: 180,
    pro_backup_fridge_200: 260,
    pro_backup_fridge_250: 320,
    pro_backup_fridge_300: 380,
    pro_backup_ats: 120,
    pro_backup_panel: 85,
    pro_backup_monitor: 35,
    pro_backup_mobile: 25,
    pro_backup_surge: 30,
    pro_backup_wiring: 50,
    pro_backup_battery_per_kwh: 80,
    
    // Future development add-ons
    future_hydrogen: 120,
    future_hydro: 90,
    future_ev: 80,
    
    // Taxes and shipping (percent)
    tax_rate_default: 0.12,
    shipping_default: 0.08,
    
    // Software license
    software_gm: 25,
    software_tn: 100,
    software_en: 500
};

// ========== DOM Elements ==========
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateOnlineStatus();
    setInterval(updateOnlineStatus, 30000);
});

function initializeEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', function() {
            const nextStep = parseInt(this.dataset.next);
            showStep(nextStep);
        });
    });
    
    document.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', function() {
            const prevStep = parseInt(this.dataset.prev);
            showStep(prevStep);
        });
    });
    
    // Backup tier change
    document.querySelectorAll('input[name="backupTier"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const basicDiv = document.getElementById('basicOptions');
            const proDiv = document.getElementById('proOptions');
            
            if (this.value === 'basic') {
                basicDiv.style.display = 'block';
                proDiv.style.display = 'none';
            } else if (this.value === 'pro') {
                basicDiv.style.display = 'none';
                proDiv.style.display = 'block';
            } else {
                basicDiv.style.display = 'none';
                proDiv.style.display = 'none';
            }
        });
    });
    
    // Calculate button
    document.getElementById('calculateBtn').addEventListener('click', calculateAndShowReport);
    
    // New calculation button
    document.getElementById('newCalculationBtn').addEventListener('click', function() {
        document.getElementById('reportSection').style.display = 'none';
        document.querySelector('.form-step').classList.remove('active');
        document.getElementById('step1').classList.add('active');
        updateProgressIndicators(1);
    });
    
    // Download report button
    document.getElementById('downloadReportBtn').addEventListener('click', downloadReport);
    
    // Custom size handling
    document.getElementById('solarCustom').addEventListener('input', function() {
        if (this.value) document.getElementById('solarSize').value = '';
    });
    document.getElementById('solarSize').addEventListener('change', function() {
        if (this.value) document.getElementById('solarCustom').value = '';
    });
    
    document.getElementById('batteryCustom').addEventListener('input', function() {
        if (this.value) document.getElementById('batterySize').value = '';
    });
    document.getElementById('batterySize').addEventListener('change', function() {
        if (this.value) document.getElementById('batteryCustom').value = '';
    });
    
    document.getElementById('windCustom').addEventListener('input', function() {
        if (this.value) document.getElementById('windSize').value = '';
    });
    document.getElementById('windSize').addEventListener('change', function() {
        if (this.value) document.getElementById('windCustom').value = '';
    });
}

function showStep(stepNumber) {
    // Hide all steps
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        if (step) step.classList.remove('active');
    }
    
    // Show selected step
    const activeStep = document.getElementById(`step${stepNumber}`);
    if (activeStep) activeStep.classList.add('active');
    
    updateProgressIndicators(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgressIndicators(stepNumber) {
    for (let i = 1; i <= 4; i++) {
        const indicator = document.getElementById(`step${i}Indicator`);
        if (indicator) {
            if (i < stepNumber) {
                indicator.classList.add('completed');
                indicator.classList.remove('active');
            } else if (i === stepNumber) {
                indicator.classList.add('active');
                indicator.classList.remove('completed');
            } else {
                indicator.classList.remove('active', 'completed');
            }
        }
    }
}

function updateOnlineStatus() {
    const statusDiv = document.getElementById('onlineStatus');
    if (navigator.onLine) {
        statusDiv.innerHTML = '<i class="fas fa-circle"></i> Online';
        statusDiv.style.color = '#4ade80';
    } else {
        statusDiv.innerHTML = '<i class="fas fa-circle"></i> Offline (cached)';
        statusDiv.style.color = '#f87171';
    }
}

// ========== MAIN CALCULATION FUNCTION ==========
function calculateAndShowReport() {
    // Get user inputs
    const tier = document.querySelector('input[name="tier"]:checked').value;
    const backupTier = document.querySelector('input[name="backupTier"]:checked').value;
    const sunExposure = document.getElementById('sunExposure').value / 100;
    
    // Get solar size
    let solarKW = parseFloat(document.getElementById('solarSize').value);
    const solarCustom = parseFloat(document.getElementById('solarCustom').value);
    if (solarCustom && !isNaN(solarCustom)) solarKW = solarCustom;
    if (isNaN(solarKW)) solarKW = 5;
    
    // Get battery size
    let batteryKWH = parseFloat(document.getElementById('batterySize').value);
    const batteryCustom = parseFloat(document.getElementById('batteryCustom').value);
    if (batteryCustom && !isNaN(batteryCustom)) batteryKWH = batteryCustom;
    if (isNaN(batteryKWH)) batteryKWH = 5;
    
    // Get wind size
    let windKW = parseFloat(document.getElementById('windSize').value);
    const windCustom = parseFloat(document.getElementById('windCustom').value);
    if (windCustom && !isNaN(windCustom)) windKW = windCustom;
    if (isNaN(windKW)) windKW = 0;
    
    // Get component choices
    const solarSource = document.querySelector('input[name="solar_panels"]:checked').value;
    const mountingSource = document.querySelector('input[name="mounting"]:checked').value;
    const batterySource = document.querySelector('input[name="battery"]:checked').value;
    const inverterSource = document.querySelector('input[name="inverter"]:checked').value;
    const windSource = document.querySelector('input[name="wind_kit"]:checked').value;
    const bosSource = document.querySelector('input[name="bos"]:checked').value;
    
    // Future development
    const futureHydrogen = document.getElementById('futureHydrogen').checked;
    const futureHydro = document.getElementById('futureHydro').checked;
    const futureEV = document.getElementById('futureEV').checked;
    
    // Calculate main system cost
    let enkomosTotal = 0;
    let separateTotal = 0;
    let separateComponents = [];
    
    // Solar panels
    if (solarKW > 0) {
        if (solarSource === 'enkomos') enkomosTotal += solarKW * PRICES.solar_enkomos;
        else if (solarSource === 'separate') separateTotal += solarKW * PRICES.solar_separate;
    }
    
    // Mounting
    if (solarKW > 0) {
        if (mountingSource === 'enkomos') enkomosTotal += solarKW * 30;
        else if (mountingSource === 'separate') separateTotal += solarKW * 35;
    }
    
    // Battery
    if (batteryKWH > 0) {
        if (batterySource === 'enkomos') enkomosTotal += batteryKWH * PRICES.battery_enkomos;
        else if (batterySource === 'separate') separateTotal += batteryKWH * PRICES.battery_separate;
    }
    
    // Inverter
    const inverterKW = Math.max(solarKW, windKW);
    if (inverterKW > 0) {
        if (inverterSource === 'enkomos') enkomosTotal += inverterKW * PRICES.inverter_enkomos;
        else if (inverterSource === 'separate') separateTotal += inverterKW * PRICES.inverter_separate;
    }
    
    // Wind
    if (windKW > 0 && windSource !== 'none') {
        if (windSource === 'enkomos') enkomosTotal += windKW * PRICES.wind_enkomos;
        else if (windSource === 'separate') separateTotal += windKW * PRICES.wind_separate;
    }
    
    // BOS
    if (solarKW > 0) {
        if (bosSource === 'enkomos') enkomosTotal += solarKW * PRICES.bos_enkomos;
        else if (bosSource === 'separate') separateTotal += solarKW * PRICES.bos_separate;
    }
    
    // Future development
    if (futureHydrogen) enkomosTotal += PRICES.future_hydrogen;
    if (futureHydro) enkomosTotal += PRICES.future_hydro;
    if (futureEV) enkomosTotal += PRICES.future_ev;
    
    // Calculate backup cost
    let backupEnkomos = 0;
    let backupSeparate = 0;
    let backupDetails = {};
    
    if (backupTier === 'basic') {
        const lights = parseInt(document.getElementById('basicLights').value) || 2;
        backupEnkomos = PRICES.basic_backup_enkomos;
        backupSeparate = PRICES.basic_backup_separate;
        backupDetails = { type: 'Basic', lights: lights, hours: 4 };
    } else if (backupTier === 'pro') {
        const fans = parseInt(document.getElementById('proFans').value) || 0;
        const lights = parseInt(document.getElementById('proLights').value) || 3;
        const computers = parseInt(document.getElementById('proComputers').value) || 0;
        const fridgeModel = document.getElementById('proFridge').value;
        const hours = parseInt(document.getElementById('proHours').value) || 8;
        
        // Calculate backup battery needed (approx 0.5kWh per hour of typical load)
        let loadKW = (fans * 0.05) + (lights * 0.01) + (computers * 0.045);
        if (fridgeModel !== '0') loadKW += 0.04;
        const backupBatteryKWH = Math.ceil(loadKW * hours * 1.2);
        
        backupEnkomos += backupBatteryKWH * PRICES.pro_backup_battery_per_kwh;
        backupEnkomos += fans * PRICES.pro_backup_fan_per_unit;
        backupEnkomos += lights * PRICES.pro_backup_lights_per_unit;
        backupEnkomos += PRICES.pro_backup_ats;
        backupEnkomos += PRICES.pro_backup_panel;
        backupEnkomos += PRICES.pro_backup_monitor;
        backupEnkomos += PRICES.pro_backup_mobile;
        backupEnkomos += PRICES.pro_backup_surge;
        backupEnkomos += PRICES.pro_backup_wiring;
        
        if (fridgeModel === 'enkomos-chill-150') backupEnkomos += PRICES.pro_backup_fridge_150;
        else if (fridgeModel === 'enkomos-chill-200') backupEnkomos += PRICES.pro_backup_fridge_200;
        else if (fridgeModel === 'enkomos-chill-250') backupEnkomos += PRICES.pro_backup_fridge_250;
        else if (fridgeModel === 'enkomos-chill-300') backupEnkomos += PRICES.pro_backup_fridge_300;
        
        backupDetails = { type: 'Pro', fans: fans, lights: lights, computers: computers, 
                          fridge: fridgeModel, hours: hours, batteryKWH: backupBatteryKWH };
        
        // Add backup battery to total battery
        batteryKWH += backupBatteryKWH;
    }
    
    // Apply tier discount for Team/Co-op
    let discount = 1;
    if (tier === 'TN') discount = 0.9;
    else if (tier === 'EN') discount = 0.85;
    
    const enkomosAfterDiscount = (enkomosTotal + backupEnkomos) * discount;
    const totalEnkomos = enkomosAfterDiscount;
    const totalSeparate = separateTotal + backupSeparate;
    
    // Apply sun exposure factor
    const generationFactor = 0.7 + (sunExposure * 0.3);
    const estimatedDailyKWH = solarKW * 4.5 * generationFactor;
    
    // Taxes and shipping
    const tax = totalEnkomos * PRICES.tax_rate_default;
    const shipping = totalEnkomos * PRICES.shipping_default;
    
    // Software fee
    let softwareFee = PRICES.software_gm;
    if (tier === 'TN') softwareFee = PRICES.software_tn;
    if (tier === 'EN') softwareFee = PRICES.software_en;
    
    const grandTotal = totalEnkomos + tax + shipping + softwareFee;
    
    // Carbon offset estimate
    const carbonKgPerYear = solarKW * 800 * generationFactor;
    const treesEquivalent = Math.round(carbonKgPerYear / 62);
    
    // Generate report
    displayReport({
        tier: tier,
        solarKW: solarKW,
        batteryKWH: batteryKWH,
        windKW: windKW,
        backupTier: backupTier,
        backupDetails: backupDetails,
        totalEnkomos: totalEnkomos,
        totalSeparate: totalSeparate,
        tax: tax,
        shipping: shipping,
        softwareFee: softwareFee,
        grandTotal: grandTotal,
        estimatedDailyKWH: estimatedDailyKWH,
        carbonKgPerYear: carbonKgPerYear,
        treesEquivalent: treesEquivalent,
        futureHydrogen: futureHydrogen,
        futureHydro: futureHydro,
        futureEV: futureEV,
        sunExposure: sunExposure
    });
    
    // Show report and hide form
    document.querySelector('.form-step.active').classList.remove('active');
    document.getElementById('reportSection').style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function displayReport(data) {
    const tierName = data.tier === 'GM' ? 'General Member (Single)' : 
                     data.tier === 'TN' ? 'Team / Co-op / NGO' : 'Enterprise (Corporate)';
    const backupName = data.backupTier === 'none' ? 'None' :
                       data.backupTier === 'basic' ? 'Basic (Lights only)' : 'Pro (Full backup)';
    
    let backupHtml = '';
    if (data.backupTier === 'basic') {
        backupHtml = `
            <div class="report-section">
                <h3><i class="fas fa-lightbulb"></i> Basic Backup</h3>
                <p>Lights: ${data.backupDetails.lights} units | Backup: 4 hours manual</p>
            </div>
        `;
    } else if (data.backupTier === 'pro') {
        backupHtml = `
            <div class="report-section">
                <h3><i class="fas fa-star-of-life"></i> Pro Backup</h3>
                <p>Fans: ${data.backupDetails.fans} | Lights: ${data.backupDetails.lights} | Computers: ${data.backupDetails.computers}</p>
                <p>Refrigerator: ${data.backupDetails.fridge} | Backup: ${data.backupDetails.hours} hours (automatic)</p>
                <p>Dedicated backup battery: ${data.backupDetails.batteryKWH} kWh</p>
            </div>
        `;
    }
    
    const futureHtml = [];
    if (data.futureHydrogen) futureHtml.push('💧 Hydrogen ready');
    if (data.futureHydro) futureHtml.push('💦 Hydro interface');
    if (data.futureEV) futureHtml.push('🔌 EV charging');
    
    const reportHtml = `
        <div class="report-summary">
            <p><strong>Confirmation Code:</strong> ENK-${Date.now().toString().slice(-8)}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="report-section">
            <h3><i class="fas fa-user-circle"></i> User Details</h3>
            <p>Tier: ${tierName}</p>
            <p>Home Backup: ${backupName}</p>
            <p>Sun Exposure: ${Math.round(data.sunExposure * 100)}%</p>
        </div>
        
        <div class="report-section">
            <h3><i class="fas fa-solar-panel"></i> System Summary</h3>
            <p>Solar PV: ${data.solarKW} kW</p>
            <p>Sodium Battery: ${data.batteryKWH} kWh</p>
            <p>Wind Turbine: ${data.windKW > 0 ? data.windKW + ' kW' : 'None'}</p>
            <p>Estimated Daily Generation: ${data.estimatedDailyKWH.toFixed(1)} kWh</p>
        </div>
        
        ${backupHtml}
        
        <div class="report-section">
            <h3><i class="fas fa-microchip"></i> Future Development</h3>
            <p>${futureHtml.length > 0 ? futureHtml.join(' | ') : 'None selected'}</p>
        </div>
        
        <div class="report-section">
            <h3><i class="fas fa-dollar-sign"></i> Cost Summary (USD)</h3>
            <table class="cost-table">
                <tr><td>ENKOMOS Kit (after ${data.tier === 'TN' ? '10%' : data.tier === 'EN' ? '15%' : '0%'} discount):</td><td>$${data.totalEnkomos.toFixed(2)}</td></tr>
                <tr><td>Market reference (if all separate):</td><td>$${data.totalSeparate.toFixed(2)}</td></tr>
                <tr><td>Tax (${PRICES.tax_rate_default * 100}%):</td><td>$${data.tax.toFixed(2)}</td></tr>
                <tr><td>Shipping (estimated):</td><td>$${data.shipping.toFixed(2)}</td></tr>
                <tr><td>Software license:</td><td>$${data.softwareFee.toFixed(2)}</td></tr>
                <tr class="total-row"><td><strong>GRAND TOTAL:</strong></td><td><strong>$${data.grandTotal.toFixed(2)}</strong></td></tr>
            </table>
        </div>
        
        <div class="report-section">
            <h3><i class="fas fa-chart-line"></i> Comparison</h3>
            <p>Savings with ENKOMOS kit: $${(data.totalSeparate - data.totalEnkomos).toFixed(2)} (${Math.round((data.totalSeparate - data.totalEnkomos) / data.totalSeparate * 100)}%)</p>
        </div>
        
        <div class="report-section">
            <h3><i class="fas fa-leaf"></i> Environmental Impact</h3>
            <p>CO₂ saved per year: ~${data.carbonKgPerYear.toFixed(0)} kg</p>
            <p>Equivalent to planting ~${data.treesEquivalent} trees annually</p>
        </div>
        
        <div class="report-section">
            <h3><i class="fas fa-road"></i> Development Roadmap</h3>
            <div class="roadmap-mini">
                <span>Year 0: ${data.solarKW}kW + ${data.batteryKWH}kWh</span>
                <span>→ Year 2: +Wind</span>
                <span>→ Year 4: +Hydrogen</span>
            </div>
        </div>
        
        <div class="report-section">
            <h3><i class="fas fa-clipboard-list"></i> Next Steps</h3>
            <ul>
                <li>✓ Share this report with ENKOMOS distributor</li>
                <li>✓ ENKOMOS HQ will contact within 48 hours</li>
                <li>✓ Find local installer: directory.enkomos.com</li>
                <li>✓ Save this report (download button below)</li>
            </ul>
        </div>
        
        <div class="disclaimer">
            <small><i class="fas fa-info-circle"></i> Prices are base estimates. Final pricing confirmed by ENKOMOS HQ. 
            ENKOMOS warranty applies only to ENKOMOS-branded components. 
            Software pricing determined by ENKOMOS HQ and subject to change.</small>
        </div>
    `;
    
    document.getElementById('reportContent').innerHTML = reportHtml;
}

function downloadReport() {
    const reportContent = document.getElementById('reportContent').innerText;
    const reportText = `ENKOMOS-Power Tier A System Report
Generated: ${new Date().toLocaleString()}
----------------------------------------

${reportContent.replace(/<[^>]*>/g, '')}

----------------------------------------
ENKOMOS-Power Tier A | estrellahq.com
Report ID: ENK-${Date.now().toString().slice(-8)}`;
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ENKOMOS_Report_${Date.now().slice(-8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Add some CSS for report tables dynamically
const style = document.createElement('style');
style.textContent = `
    .report-section {
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid #e0e5dc;
    }
    .report-section h3 {
        font-size: 0.9rem;
        margin-bottom: 10px;
        color: #0a3d2f;
    }
    .report-section p, .report-section li {
        font-size: 0.8rem;
        margin: 6px 0;
        color: #1a2a2a;
    }
    .report-section ul {
        padding-left: 20px;
    }
    .cost-table {
        width: 100%;
        font-size: 0.8rem;
        border-collapse: collapse;
    }
    .cost-table td {
        padding: 8px 0;
        border-bottom: 1px solid #e0e5dc;
    }
    .cost-table td:last-child {
        text-align: right;
        font-weight: 600;
    }
    .total-row td {
        font-weight: 700;
        font-size: 0.9rem;
        border-top: 2px solid #0a3d2f;
        padding-top: 10px;
    }
    .report-summary {
        background: #e8f4f0;
        padding: 12px;
        border-radius: 12px;
        margin-bottom: 20px;
        font-size: 0.75rem;
    }
    .disclaimer {
        background: #fef3c7;
        padding: 12px;
        border-radius: 12px;
        font-size: 0.65rem;
        color: #92400e;
        margin-top: 16px;
    }
    .roadmap-mini {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        font-size: 0.7rem;
        background: #e8f4f0;
        padding: 10px;
        border-radius: 12px;
    }
`;
document.head.appendChild(style);
