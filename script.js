// ENKOMOS-Power Tier A - Complete Calculator Logic
// Mobile Ready Version v1.1

// ========== PRICE DATABASE (ENKOMOS HQ Controlled) ==========
const PRICES = {
    solar_enkomos: 100,
    solar_separate: 110,
    battery_enkomos: 80,
    battery_separate: 88,
    inverter_enkomos: 90,
    inverter_separate: 100,
    wind_enkomos: 350,
    wind_separate: 380,
    bos_enkomos: 25,
    bos_separate: 30,
    basic_backup_enkomos: 150,
    basic_backup_separate: 170,
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
    future_hydrogen: 120,
    future_hydro: 90,
    future_ev: 80,
    future_cold_storage: 150,
    tax_rate_default: 0.12,
    shipping_default: 0.08,
    software_gm: 25,
    software_tn: 100,
    software_en: 500
};

// ========== DOM Elements ==========
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    updateOnlineStatus();
    setInterval(updateOnlineStatus, 30000);
    checkForSavedProgress();
});

function initializeEventListeners() {
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
    
    document.getElementById('calculateBtn').addEventListener('click', calculateAndShowReport);
    document.getElementById('newCalculationBtn').addEventListener('click', resetCalculator);
    document.getElementById('downloadReportBtn').addEventListener('click', downloadReport);
    document.getElementById('shareReportBtn').addEventListener('click', shareReport);
    document.getElementById('saveProgressBtn').addEventListener('click', saveProgress);
    document.getElementById('loadProgressBtn').addEventListener('click', loadProgress);
    
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
    for (let i = 1; i <= 4; i++) {
        const step = document.getElementById(`step${i}`);
        if (step) step.classList.remove('active');
    }
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

// ========== SAVE/LOAD PROGRESS ==========
function saveProgress() {
    const formData = {};
    formData.tier = document.querySelector('input[name="tier"]:checked')?.value || 'GM';
    formData.backupTier = document.querySelector('input[name="backupTier"]:checked')?.value || 'none';
    formData.sunExposure = document.getElementById('sunExposure').value;
    formData.solarSize = document.getElementById('solarSize').value;
    formData.solarCustom = document.getElementById('solarCustom').value;
    formData.batterySize = document.getElementById('batterySize').value;
    formData.batteryCustom = document.getElementById('batteryCustom').value;
    formData.windSize = document.getElementById('windSize').value;
    formData.windCustom = document.getElementById('windCustom').value;
    formData.backupPriority = document.querySelector('input[name="backupPriority"]:checked')?.value || 'critical';
    formData.basicLights = document.getElementById('basicLights')?.value || '2';
    formData.proFans = document.getElementById('proFans')?.value || '2';
    formData.proLights = document.getElementById('proLights')?.value || '3';
    formData.proComputers = document.getElementById('proComputers')?.value || '1';
    formData.proFridge = document.getElementById('proFridge')?.value || 'chill200';
    formData.proHours = document.getElementById('proHours')?.value || '8';
    
    // Component choices
    formData.solar_panels = document.querySelector('input[name="solar_panels"]:checked')?.value || 'enkomos';
    formData.mounting = document.querySelector('input[name="mounting"]:checked')?.value || 'enkomos';
    formData.battery = document.querySelector('input[name="battery"]:checked')?.value || 'enkomos';
    formData.inverter = document.querySelector('input[name="inverter"]:checked')?.value || 'enkomos';
    formData.wind_kit = document.querySelector('input[name="wind_kit"]:checked')?.value || 'none';
    formData.bos = document.querySelector('input[name="bos"]:checked')?.value || 'enkomos';
    
    // Future development
    formData.futureHydrogen = document.getElementById('futureHydrogen').checked;
    formData.futureHydro = document.getElementById('futureHydro').checked;
    formData.futureEV = document.getElementById('futureEV').checked;
    formData.futureColdStorage = document.getElementById('futureColdStorage')?.checked || false;
    
    localStorage.setItem('enkomosProgress', JSON.stringify(formData));
    const statusSpan = document.getElementById('saveStatus');
    statusSpan.innerHTML = '✓ Saved!';
    setTimeout(() => { statusSpan.innerHTML = ''; }, 2000);
}

function loadProgress() {
    const saved = localStorage.getItem('enkomosProgress');
    if (!saved) {
        alert('No saved progress found. Please save your progress first.');
        return;
    }
    const formData = JSON.parse(saved);
    
    // Restore tier
    const tierRadio = document.querySelector(`input[name="tier"][value="${formData.tier}"]`);
    if (tierRadio) tierRadio.checked = true;
    
    // Restore backup tier
    const backupRadio = document.querySelector(`input[name="backupTier"][value="${formData.backupTier}"]`);
    if (backupRadio) backupRadio.checked = true;
    backupRadio.dispatchEvent(new Event('change'));
    
    // Restore sun exposure
    document.getElementById('sunExposure').value = formData.sunExposure;
    
    // Restore sizes
    document.getElementById('solarSize').value = formData.solarSize;
    document.getElementById('solarCustom').value = formData.solarCustom;
    document.getElementById('batterySize').value = formData.batterySize;
    document.getElementById('batteryCustom').value = formData.batteryCustom;
    document.getElementById('windSize').value = formData.windSize;
    document.getElementById('windCustom').value = formData.windCustom;
    
    // Restore backup priority
    const priorityRadio = document.querySelector(`input[name="backupPriority"][value="${formData.backupPriority}"]`);
    if (priorityRadio) priorityRadio.checked = true;
    
    // Restore basic/pro details
    if (document.getElementById('basicLights')) document.getElementById('basicLights').value = formData.basicLights;
    if (document.getElementById('proFans')) document.getElementById('proFans').value = formData.proFans;
    if (document.getElementById('proLights')) document.getElementById('proLights').value = formData.proLights;
    if (document.getElementById('proComputers')) document.getElementById('proComputers').value = formData.proComputers;
    if (document.getElementById('proFridge')) document.getElementById('proFridge').value = formData.proFridge;
    if (document.getElementById('proHours')) document.getElementById('proHours').value = formData.proHours;
    
    // Restore component choices
    const solarPanelsRadio = document.querySelector(`input[name="solar_panels"][value="${formData.solar_panels}"]`);
    if (solarPanelsRadio) solarPanelsRadio.checked = true;
    const mountingRadio = document.querySelector(`input[name="mounting"][value="${formData.mounting}"]`);
    if (mountingRadio) mountingRadio.checked = true;
    const batteryRadio = document.querySelector(`input[name="battery"][value="${formData.battery}"]`);
    if (batteryRadio) batteryRadio.checked = true;
    const inverterRadio = document.querySelector(`input[name="inverter"][value="${formData.inverter}"]`);
    if (inverterRadio) inverterRadio.checked = true;
    const windKitRadio = document.querySelector(`input[name="wind_kit"][value="${formData.wind_kit}"]`);
    if (windKitRadio) windKitRadio.checked = true;
    const bosRadio = document.querySelector(`input[name="bos"][value="${formData.bos}"]`);
    if (bosRadio) bosRadio.checked = true;
    
    // Restore future development
    document.getElementById('futureHydrogen').checked = formData.futureHydrogen;
    document.getElementById('futureHydro').checked = formData.futureHydro;
    document.getElementById('futureEV').checked = formData.futureEV;
    if (document.getElementById('futureColdStorage')) {
        document.getElementById('futureColdStorage').checked = formData.futureColdStorage;
    }
    
    alert('Progress loaded successfully!');
    showStep(1);
}

function checkForSavedProgress() {
    const saved = localStorage.getItem('enkomosProgress');
    if (saved) {
        const statusSpan = document.getElementById('saveStatus');
        statusSpan.innerHTML = '💾 Saved progress available. Click "Load Saved" to restore.';
        setTimeout(() => { 
            if (statusSpan.innerHTML.includes('Saved progress')) {
                statusSpan.innerHTML = '';
            }
        }, 5000);
    }
}

function resetCalculator() {
    document.getElementById('reportSection').style.display = 'none';
    document.querySelector('.form-step.active')?.classList.remove('active');
    document.getElementById('step1').classList.add('active');
    updateProgressIndicators(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== SHARE REPORT ==========
async function shareReport() {
    const reportText = document.getElementById('reportContent').innerText;
    const shareData = {
        title: 'ENKOMOS-Power System Report',
        text: reportText.substring(0, 1000),
        url: window.location.href
    };
    
    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log('Share cancelled');
        }
    } else {
        navigator.clipboard.writeText(reportText);
        alert('Report copied to clipboard!');
    }
}

// ========== MAIN CALCULATION FUNCTION ==========
function calculateAndShowReport() {
    const tier = document.querySelector('input[name="tier"]:checked').value;
    const backupTier = document.querySelector('input[name="backupTier"]:checked').value;
    const sunExposure = document.getElementById('sunExposure').value / 100;
    
    let solarKW = parseFloat(document.getElementById('solarSize').value);
    const solarCustom = parseFloat(document.getElementById('solarCustom').value);
    if (solarCustom && !isNaN(solarCustom)) solarKW = solarCustom;
    if (isNaN(solarKW)) solarKW = 5;
    
    let batteryKWH = parseFloat(document.getElementById('batterySize').value);
    const batteryCustom = parseFloat(document.getElementById('batteryCustom').value);
    if (batteryCustom && !isNaN(batteryCustom)) batteryKWH = batteryCustom;
    if (isNaN(batteryKWH)) batteryKWH = 5;
    
    let windKW = parseFloat(document.getElementById('windSize').value);
    const windCustom = parseFloat(document.getElementById('windCustom').value);
    if (windCustom && !isNaN(windCustom)) windKW = windCustom;
    if (isNaN(windKW)) windKW = 0;
    
    const solarSource = document.querySelector('input[name="solar_panels"]:checked').value;
    const mountingSource = document.querySelector('input[name="mounting"]:checked').value;
    const batterySource = document.querySelector('input[name="battery"]:checked').value;
    const inverterSource = document.querySelector('input[name="inverter"]:checked').value;
    const windSource = document.querySelector('input[name="wind_kit"]:checked').value;
    const bosSource = document.querySelector('input[name="bos"]:checked').value;
    
    const futureHydrogen = document.getElementById('futureHydrogen').checked;
    const futureHydro = document.getElementById('futureHydro').checked;
    const futureEV = document.getElementById('futureEV').checked;
    const futureColdStorage = document.getElementById('futureColdStorage')?.checked || false;
    
    let enkomosTotal = 0;
    let separateTotal = 0;
    
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
    if (futureColdStorage) enkomosTotal += PRICES.future_cold_storage;
    
    let backupEnkomos = 0;
    let backupSeparate = 0;
    let backupDetails = {};
    let backupBatteryKWH = 0;
    
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
        
        let loadKW = (fans * 0.05) + (lights * 0.01) + (computers * 0.045);
        if (fridgeModel !== '0') loadKW += 0.04;
        backupBatteryKWH = Math.ceil(loadKW * hours * 1.2);
        
        backupEnkomos += backupBatteryKWH * PRICES.pro_backup_battery_per_kwh;
        backupEnkomos += fans * PRICES.pro_backup_fan_per_unit;
        backupEnkomos += lights * PRICES.pro_backup_lights_per_unit;
        backupEnkomos += PRICES.pro_backup_ats;
        backupEnkomos += PRICES.pro_backup_panel;
        backupEnkomos += PRICES.pro_backup_monitor;
        backupEnkomos += PRICES.pro_backup_mobile;
        backupEnkomos += PRICES.pro_backup_surge;
        backupEnkomos += PRICES.pro_backup_wiring;
        
        if (fridgeModel === 'chill150') backupEnkomos += PRICES.pro_backup_fridge_150;
        else if (fridgeModel === 'chill200') backupEnkomos += PRICES.pro_backup_fridge_200;
        else if (fridgeModel === 'chill250') backupEnkomos += PRICES.pro_backup_fridge_250;
        else if (fridgeModel === 'chill300') backupEnkomos += PRICES.pro_backup_fridge_300;
        
        backupDetails = { type: 'Pro', fans: fans, lights: lights, computers: computers, 
                          fridge: fridgeModel, hours: hours, batteryKWH: backupBatteryKWH };
        
        batteryKWH += backupBatteryKWH;
    }
    
    let discount = 1;
    if (tier === 'TN') discount = 0.9;
    else if (tier === 'EN') discount = 0.85;
    
    const enkomosAfterDiscount = (enkomosTotal + backupEnkomos) * discount;
    const totalEnkomos = enkomosAfterDiscount;
    const totalSeparate = separateTotal + backupSeparate;
    
    const generationFactor = 0.7 + (sunExposure * 0.3);
    const estimatedDailyKWH = solarKW * 4.5 * generationFactor;
    
    const tax = totalEnkomos * PRICES.tax_rate_default;
    const shipping = totalEnkomos * PRICES.shipping_default;
    
    let softwareFee = PRICES.software_gm;
    if (tier === 'TN') softwareFee = PRICES.software_tn;
    if (tier === 'EN') softwareFee = PRICES.software_en;
    
    const grandTotal = totalEnkomos + tax + shipping + softwareFee;
    const carbonKgPerYear = solarKW * 800 * generationFactor;
    const treesEquivalent = Math.round(carbonKgPerYear / 62);
    
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
        futureColdStorage: futureColdStorage,
        sunExposure: sunExposure
    });
    
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
        backupHtml = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🪔 BASIC BACKUP\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nLights: ${data.backupDetails.lights} units | Backup: 4 hours manual\n`;
    } else if (data.backupTier === 'pro') {
        backupHtml = `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⭐ PRO BACKUP\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nFans: ${data.backupDetails.fans} | Lights: ${data.backupDetails.lights} | Computers: ${data.backupDetails.computers}\nRefrigerator: ${data.backupDetails.fridge.replace('chill', 'ENKOMOS-Chill ')} | Backup: ${data.backupDetails.hours} hours (automatic)\nDedicated backup battery: ${data.backupDetails.batteryKWH} kWh\n`;
    }
    
    const futureList = [];
    if (data.futureHydrogen) futureList.push('💧 Hydrogen ready');
    if (data.futureHydro) futureList.push('💦 Hydro interface');
    if (data.futureEV) futureList.push('🔌 EV charging');
    if (data.futureColdStorage) futureList.push('❄️ Cold storage');
    const futureHtml = futureList.length > 0 ? `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🔮 FUTURE DEVELOPMENT\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${futureList.join(' | ')}\n` : '';
    
    const savings = data.totalSeparate - data.totalEnkomos;
    const savingsPercent = data.totalSeparate > 0 ? Math.round((savings) / data.totalSeparate * 100) : 0;
    
    const reportText = `
╔══════════════════════════════════════════════════════════════════╗
║              ENKOMOS-POWER TIER A – SYSTEM REPORT                ║
║                          [CONFIRMED]                             ║
║              Date: ${new Date().toLocaleDateString()}  |  Time: ${new Date().toLocaleTimeString()}   ║
╚══════════════════════════════════════════════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 USER DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Tier: ${tierName}
Home Backup: ${backupName}
Sun Exposure: ${Math.round(data.sunExposure * 100)}%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
☀️ SYSTEM SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Solar PV: ${data.solarKW} kW
Sodium Battery: ${data.batteryKWH} kWh
Wind Turbine: ${data.windKW > 0 ? data.windKW + ' kW' : 'None'}
Estimated Daily Generation: ${data.estimatedDailyKWH.toFixed(1)} kWh
${backupHtml}${futureHtml}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 COST SUMMARY (USD)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENKOMOS Kit (after ${data.tier === 'TN' ? '10%' : data.tier === 'EN' ? '15%' : '0%'} discount): $${data.totalEnkomos.toFixed(2)}
Market reference (if all separate):      $${data.totalSeparate.toFixed(2)}
Tax (${PRICES.tax_rate_default * 100}%):                            $${data.tax.toFixed(2)}
Shipping (estimated):                    $${data.shipping.toFixed(2)}
Software license:                        $${data.softwareFee.toFixed(2)}
────────────────────────────────────────────────────────────────
GRAND TOTAL:                             $${data.grandTotal.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 COMPARISON
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Savings with ENKOMOS kit: $${savings.toFixed(2)} (${savingsPercent}%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌿 ENVIRONMENTAL IMPACT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CO₂ saved per year: ~${data.carbonKgPerYear.toFixed(0)} kg
Equivalent to planting ~${data.treesEquivalent} trees annually

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🛤️ DEVELOPMENT ROADMAP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Year 0: ${data.solarKW}kW + ${data.batteryKWH}kWh
Year 2: + Wind Turbine
Year 4: + Hydrogen / Hydro / EV

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Share this report with ENKOMOS distributor
✓ ENKOMOS HQ will contact within 48 hours
✓ Find local installer: directory.enkomos.com
✓ Save this report (download button above)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 DISCLAIMER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Prices are base estimates. Final pricing confirmed by ENKOMOS HQ.
ENKOMOS warranty applies only to ENKOMOS-branded components.
Software pricing determined by ENKOMOS HQ and subject to change.

Report ID: ENK-${Date.now().toString().slice(-8)}
© ENKOMOS Head Office - All Rights Reserved
`;
    
    document.getElementById('reportContent').innerHTML = `<pre style="white-space: pre-wrap; font-family: monospace; font-size: 0.75rem;">${reportText}</pre>`;
}

function downloadReport() {
    const reportText = document.getElementById('reportContent').innerText;
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
