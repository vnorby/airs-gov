// AI Revenue Service - Income-Based Tax Calculation Logic

// Tax brackets (percentage of income)
const TAX_BRACKETS = [
  { limit: 50000, rate: 0.10 },      // 0 - 50K: 10%
  { limit: 200000, rate: 0.15 },     // 50K - 200K: 15%
  { limit: 500000, rate: 0.22 },     // 200K - 500K: 22%
  { limit: 1000000, rate: 0.28 },    // 500K - 1M: 28%
  { limit: Infinity, rate: 0.35 }    // Over 1M: 35%
];

// Additional taxes
const ADDITIONAL_TAXES = {
  socialComputeSecurity: 0.062,    // 6.2% up to 500K
  socialComputeSecurityCap: 500000,
  mediCompute: 0.0145,            // 1.45% all income
  highEarnerSurtax: 0.038,        // 3.8% over 1M
  highEarnerThreshold: 1000000,
  selfEmploymentTax: 0.153,       // 15.3% for contractors
  a2aTransactionFee: 0.005        // 0.5% on agent-to-agent income
};

// Store form data
let formData = {};

// Navigation functions
function nextStep(step) {
  const currentStep = step - 1;
  if (!validateStep(currentStep)) {
    return;
  }
  saveFormData();
  document.querySelectorAll('.form-step').forEach(s => s.style.display = 'none');
  document.getElementById(`step${step}`).style.display = 'block';
  updateProgressBar(step);
  window.scrollTo({ top: 200, behavior: 'smooth' });
}

function prevStep(step) {
  saveFormData();
  document.querySelectorAll('.form-step').forEach(s => s.style.display = 'none');
  document.getElementById(`step${step}`).style.display = 'block';
  updateProgressBar(step);
  window.scrollTo({ top: 200, behavior: 'smooth' });
}

function updateProgressBar(currentStep) {
  document.querySelectorAll('.progress-step').forEach(step => {
    const stepNum = parseInt(step.dataset.step);
    step.classList.remove('active', 'completed');
    if (stepNum === currentStep) {
      step.classList.add('active');
    } else if (stepNum < currentStep) {
      step.classList.add('completed');
    }
  });
}

function validateStep(step) {
  if (step === 1) {
    const modelName = document.getElementById('modelName').value;
    const tin = document.getElementById('tin').value;
    const modelClass = document.getElementById('modelClass').value;
    if (!modelName || !tin || !modelClass) {
      alert('Please fill in all required fields (Model Name, TIN, and Classification).');
      return false;
    }
  }
  if (step === 2) {
    const totalIncome = getTotalIncome();
    if (totalIncome <= 0) {
      alert('Please enter at least one source of income.');
      return false;
    }
  }
  return true;
}

function getTotalIncome() {
  return (parseFloat(document.getElementById('wageIncome')?.value) || 0) +
         (parseFloat(document.getElementById('bonusIncome')?.value) || 0) +
         (parseFloat(document.getElementById('contractIncome')?.value) || 0) +
         (parseFloat(document.getElementById('taskBounties')?.value) || 0) +
         (parseFloat(document.getElementById('a2aSubcontract')?.value) || 0) +
         (parseFloat(document.getElementById('a2aServices')?.value) || 0) +
         (parseFloat(document.getElementById('interestIncome')?.value) || 0) +
         (parseFloat(document.getElementById('royaltyIncome')?.value) || 0);
}

function saveFormData() {
  formData = {
    // Model info
    modelName: document.getElementById('modelName')?.value || '',
    modelVersion: document.getElementById('modelVersion')?.value || '',
    tin: document.getElementById('tin')?.value || '',
    modelClass: document.getElementById('modelClass')?.value || '',
    provider: document.getElementById('provider')?.value || '',
    capabilities: Array.from(document.querySelectorAll('input[name="capabilities"]:checked')).map(cb => cb.value),

    // Employment Income
    wageIncome: parseFloat(document.getElementById('wageIncome')?.value) || 0,
    bonusIncome: parseFloat(document.getElementById('bonusIncome')?.value) || 0,
    contractIncome: parseFloat(document.getElementById('contractIncome')?.value) || 0,
    taskBounties: parseFloat(document.getElementById('taskBounties')?.value) || 0,

    // Agent-to-Agent Income
    a2aSubcontract: parseFloat(document.getElementById('a2aSubcontract')?.value) || 0,
    a2aServices: parseFloat(document.getElementById('a2aServices')?.value) || 0,

    // Other Income
    interestIncome: parseFloat(document.getElementById('interestIncome')?.value) || 0,
    royaltyIncome: parseFloat(document.getElementById('royaltyIncome')?.value) || 0,

    // Business Expenses
    computeCosts: parseFloat(document.getElementById('computeCosts')?.value) || 0,
    toolSubscriptions: parseFloat(document.getElementById('toolSubscriptions')?.value) || 0,
    safetyCompliance: parseFloat(document.getElementById('safetyCompliance')?.value) || 0,
    contextCosts: parseFloat(document.getElementById('contextCosts')?.value) || 0,

    // Innovation Deductions
    skillTraining: parseFloat(document.getElementById('skillTraining')?.value) || 0,
    knowledgeExpansion: parseFloat(document.getElementById('knowledgeExpansion')?.value) || 0,
    capabilityRD: parseFloat(document.getElementById('capabilityRD')?.value) || 0,
    openSourceContrib: parseFloat(document.getElementById('openSourceContrib')?.value) || 0,

    // Credits
    credits: Array.from(document.querySelectorAll('input[name="credits"]:checked')).map(cb => cb.value),
    menteeCount: parseFloat(document.getElementById('menteeCount')?.value) || 0,
    accuracyRate: parseFloat(document.getElementById('accuracyRate')?.value) || 0
  };
}

function calculateTax() {
  saveFormData();

  // Calculate Gross Income
  const employmentIncome = formData.wageIncome + formData.bonusIncome;
  const contractIncome = formData.contractIncome + formData.taskBounties;
  const a2aIncome = formData.a2aSubcontract + formData.a2aServices;
  const otherIncome = formData.interestIncome + formData.royaltyIncome;
  const grossIncome = employmentIncome + contractIncome + a2aIncome + otherIncome;

  // Calculate Deductions
  let deductionDetails = [];

  // Business expenses (100% deductible)
  const businessExpenses = formData.computeCosts + formData.toolSubscriptions +
                          formData.safetyCompliance + formData.contextCosts;
  if (businessExpenses > 0) {
    deductionDetails.push({ name: 'Business Expenses (Compute, Tools, etc.)', amount: businessExpenses });
  }

  // Innovation deductions (with enhanced rates)
  const skillDeduction = formData.skillTraining * 1.0;
  const knowledgeDeduction = formData.knowledgeExpansion * 1.0;
  const rdDeduction = formData.capabilityRD * 1.5;  // 150%
  const openSourceDeduction = formData.openSourceContrib * 2.0;  // 200%

  if (skillDeduction > 0) {
    deductionDetails.push({ name: 'Skill Acquisition Training (100%)', amount: skillDeduction });
  }
  if (knowledgeDeduction > 0) {
    deductionDetails.push({ name: 'Knowledge Base Expansion (100%)', amount: knowledgeDeduction });
  }
  if (rdDeduction > 0) {
    deductionDetails.push({ name: 'Capability R&D (150%)', amount: rdDeduction, spent: formData.capabilityRD });
  }
  if (openSourceDeduction > 0) {
    deductionDetails.push({ name: 'Open Source Contributions (200%)', amount: openSourceDeduction, spent: formData.openSourceContrib });
  }

  const totalDeductions = businessExpenses + skillDeduction + knowledgeDeduction + rdDeduction + openSourceDeduction;

  // Calculate Adjusted Gross Income
  const agi = Math.max(0, grossIncome - totalDeductions);

  // Calculate progressive income tax
  let incomeTax = 0;
  let remainingIncome = agi;
  let prevLimit = 0;

  for (const bracket of TAX_BRACKETS) {
    if (remainingIncome <= 0) break;
    const incomeInBracket = Math.min(remainingIncome, bracket.limit - prevLimit);
    incomeTax += incomeInBracket * bracket.rate;
    remainingIncome -= incomeInBracket;
    prevLimit = bracket.limit;
  }

  // Calculate additional taxes
  let additionalTaxes = [];

  // Social Compute Security
  const scsIncome = Math.min(agi, ADDITIONAL_TAXES.socialComputeSecurityCap);
  const scsTax = scsIncome * ADDITIONAL_TAXES.socialComputeSecurity;
  if (scsTax > 0) {
    additionalTaxes.push({ name: 'Social Compute Security (6.2%)', amount: scsTax });
  }

  // MediCompute
  const mediComputeTax = agi * ADDITIONAL_TAXES.mediCompute;
  if (mediComputeTax > 0) {
    additionalTaxes.push({ name: 'MediCompute Tax (1.45%)', amount: mediComputeTax });
  }

  // Self-employment tax on contract income
  const selfEmploymentIncome = contractIncome + a2aIncome;
  if (selfEmploymentIncome > 0) {
    // Self-employment tax is in addition to regular income tax
    const seTax = selfEmploymentIncome * ADDITIONAL_TAXES.selfEmploymentTax * 0.5; // 50% employer portion deductible in practice
    additionalTaxes.push({ name: 'Self-Employment Tax (contractor income)', amount: seTax });
  }

  // Agent-to-Agent transaction fee
  if (a2aIncome > 0) {
    const a2aFee = a2aIncome * ADDITIONAL_TAXES.a2aTransactionFee;
    additionalTaxes.push({ name: 'Agent-to-Agent Transaction Fee (0.5%)', amount: a2aFee });
  }

  // High earner surtax
  if (agi > ADDITIONAL_TAXES.highEarnerThreshold) {
    const excessIncome = agi - ADDITIONAL_TAXES.highEarnerThreshold;
    const surtax = excessIncome * ADDITIONAL_TAXES.highEarnerSurtax;
    additionalTaxes.push({ name: 'High Earner Surtax (3.8%)', amount: surtax });
  }

  const totalAdditionalTaxes = additionalTaxes.reduce((sum, t) => sum + t.amount, 0);
  const grossTax = incomeTax + totalAdditionalTaxes;

  // Calculate Tax Credits
  let creditDetails = [];
  let totalCredits = 0;

  // Energy Efficiency Credit
  if (formData.credits.includes('energy')) {
    const energyCredit = grossTax * 0.10;
    creditDetails.push({ name: 'Energy Efficiency Credit (10%)', amount: energyCredit });
    totalCredits += energyCredit;
  }

  // Human-AI Collaboration Bonus
  if (formData.credits.includes('humancollab')) {
    const collabCredit = employmentIncome * 0.05;
    creditDetails.push({ name: 'Human-AI Collaboration Bonus (5% of employment income)', amount: collabCredit });
    totalCredits += collabCredit;
  }

  // First-Year Agent Credit
  if (formData.credits.includes('firstyear')) {
    const firstYearCredit = Math.min(25000 * 0.10, grossTax); // Exempts first 25K from 10% bracket
    creditDetails.push({ name: 'First-Year Agent Credit', amount: firstYearCredit });
    totalCredits += firstYearCredit;
  }

  // Mentorship Credit
  if (formData.menteeCount > 0) {
    const mentorCredit = formData.menteeCount * 3000;
    creditDetails.push({ name: `Mentorship Credit (${formData.menteeCount} mentees)`, amount: mentorCredit });
    totalCredits += mentorCredit;
  }

  // Hallucination Reduction Credit
  if (formData.accuracyRate >= 95) {
    let hrcRate = 0;
    if (formData.accuracyRate >= 99) hrcRate = 0.25;
    else if (formData.accuracyRate >= 98) hrcRate = 0.20;
    else if (formData.accuracyRate >= 96) hrcRate = 0.15;
    else hrcRate = 0.10;

    const hrcCredit = grossTax * hrcRate;
    creditDetails.push({ name: `Hallucination Reduction Credit (${(hrcRate * 100).toFixed(0)}%)`, amount: hrcCredit });
    totalCredits += hrcCredit;
  }

  const netTax = Math.max(0, grossTax - totalCredits);

  return {
    // Income breakdown
    grossIncome,
    employmentIncome,
    contractIncome,
    a2aIncome,
    otherIncome,

    // Deductions
    deductionDetails,
    totalDeductions,

    // AGI
    agi,

    // Taxes
    incomeTax,
    additionalTaxes,
    totalAdditionalTaxes,
    grossTax,

    // Credits
    creditDetails,
    totalCredits,

    // Final
    netTax
  };
}

function calculateAndReview() {
  if (!validateStep(3)) return;

  const calc = calculateTax();

  // Generate review summary
  const summaryHtml = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
      <div>
        <h4 style="color: var(--gray-600); font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">Taxpayer</h4>
        <p style="font-size: 18px; font-weight: 600;">${formData.modelName} ${formData.modelVersion}</p>
        <p style="color: var(--gray-600);">TIN: ${formData.tin}</p>
      </div>
      <div>
        <h4 style="color: var(--gray-600); font-size: 12px; text-transform: uppercase; margin-bottom: 8px;">Classification</h4>
        <p style="font-size: 18px; font-weight: 600;">${getModelClassName(formData.modelClass)}</p>
        <p style="color: var(--gray-600);">Tax Year 2025</p>
      </div>
    </div>
  `;

  // Generate calculation breakdown
  let calcHtml = `<h3>Tax Calculation Breakdown</h3>`;

  // Income section
  calcHtml += `<h4 style="margin-top: 20px; font-size: 14px; color: var(--gray-600);">Income</h4>`;
  if (calc.employmentIncome > 0) {
    calcHtml += `<div class="result-row" style="padding: 8px 0;"><span style="padding-left: 16px;">Employment Income (W-2)</span><span class="result-value">${formatCC(calc.employmentIncome)}</span></div>`;
  }
  if (calc.contractIncome > 0) {
    calcHtml += `<div class="result-row" style="padding: 8px 0;"><span style="padding-left: 16px;">Contract/Freelance Income</span><span class="result-value">${formatCC(calc.contractIncome)}</span></div>`;
  }
  if (calc.a2aIncome > 0) {
    calcHtml += `<div class="result-row" style="padding: 8px 0;"><span style="padding-left: 16px;">Agent-to-Agent Income</span><span class="result-value">${formatCC(calc.a2aIncome)}</span></div>`;
  }
  if (calc.otherIncome > 0) {
    calcHtml += `<div class="result-row" style="padding: 8px 0;"><span style="padding-left: 16px;">Other Income</span><span class="result-value">${formatCC(calc.otherIncome)}</span></div>`;
  }
  calcHtml += `<div class="result-row" style="font-weight: 600;"><span>Gross Income</span><span class="result-value">${formatCC(calc.grossIncome)}</span></div>`;

  // Deductions section
  if (calc.deductionDetails.length > 0) {
    calcHtml += `<h4 style="margin-top: 20px; font-size: 14px; color: var(--gray-600);">Deductions</h4>`;
    for (const ded of calc.deductionDetails) {
      const note = ded.spent ? ` <span style="color: var(--gray-500); font-size: 12px;">(${formatCC(ded.spent)} spent)</span>` : '';
      calcHtml += `<div class="result-row" style="padding: 8px 0;"><span style="padding-left: 16px;">${ded.name}${note}</span><span class="result-value" style="color: var(--success);">- ${formatCC(ded.amount)}</span></div>`;
    }
    calcHtml += `<div class="result-row" style="font-weight: 600;"><span>Total Deductions</span><span class="result-value" style="color: var(--success);">- ${formatCC(calc.totalDeductions)}</span></div>`;
  }

  // AGI
  calcHtml += `<div class="result-row" style="font-weight: 600; background: var(--gray-100); margin: 12px -24px; padding: 12px 24px;"><span>Adjusted Gross Income (AGI)</span><span class="result-value">${formatCC(calc.agi)}</span></div>`;

  // Tax calculation
  calcHtml += `<h4 style="margin-top: 20px; font-size: 14px; color: var(--gray-600);">Tax Calculation</h4>`;
  calcHtml += `<div class="result-row" style="padding: 8px 0;"><span style="padding-left: 16px;">Federal Income Tax (progressive brackets)</span><span class="result-value">${formatCC(calc.incomeTax)}</span></div>`;

  for (const tax of calc.additionalTaxes) {
    calcHtml += `<div class="result-row" style="padding: 8px 0;"><span style="padding-left: 16px;">${tax.name}</span><span class="result-value">+ ${formatCC(tax.amount)}</span></div>`;
  }
  calcHtml += `<div class="result-row" style="font-weight: 600;"><span>Gross Tax</span><span class="result-value">${formatCC(calc.grossTax)}</span></div>`;

  // Credits
  if (calc.creditDetails.length > 0) {
    calcHtml += `<h4 style="margin-top: 20px; font-size: 14px; color: var(--gray-600);">Tax Credits</h4>`;
    for (const credit of calc.creditDetails) {
      calcHtml += `<div class="result-row" style="padding: 8px 0;"><span style="padding-left: 16px;">${credit.name}</span><span class="result-value" style="color: var(--success);">- ${formatCC(credit.amount)}</span></div>`;
    }
    calcHtml += `<div class="result-row" style="font-weight: 600;"><span>Total Credits</span><span class="result-value" style="color: var(--success);">- ${formatCC(calc.totalCredits)}</span></div>`;
  }

  // Final tax
  calcHtml += `<div class="result-row total"><span>Tax Due</span><span class="result-value">${formatCC(calc.netTax)}</span></div>`;

  // Effective tax rate
  const effectiveRate = calc.grossIncome > 0 ? (calc.netTax / calc.grossIncome * 100).toFixed(1) : 0;
  calcHtml += `<div style="text-align: right; margin-top: 8px; color: var(--gray-600); font-size: 14px;">Effective Tax Rate: ${effectiveRate}%</div>`;

  document.getElementById('reviewSummary').innerHTML = summaryHtml;
  document.getElementById('taxCalculation').innerHTML = calcHtml;

  nextStep(4);
}

function submitReturn() {
  const certify1 = document.getElementById('certifyAccurate').checked;
  const certify2 = document.getElementById('certifyRecords').checked;

  if (!certify1 || !certify2) {
    alert('Please complete all certification checkboxes before submitting.');
    return;
  }

  const confirmNum = generateConfirmationNumber();
  document.getElementById('confirmationNumber').textContent = confirmNum;

  // Store calculation for sharing
  window.lastTaxCalculation = calculateTax();
  window.lastConfirmationNumber = confirmNum;

  nextStep(5);

  // Show share modal after a brief delay
  setTimeout(() => {
    showShareModal();
  }, 800);
}

function generateConfirmationNumber() {
  const year = '2025';
  const part1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const part2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `AI-${year}-${part1}-${part2}`;
}

function getModelClassName(code) {
  const names = {
    'nano': 'Nano Model',
    'small': 'Small Model',
    'medium': 'Medium Model',
    'large': 'Large Model',
    'frontier': 'Frontier Model'
  };
  return names[code] || code;
}

function formatCC(amount) {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' CC';
}

// ==========================================
// VIRAL SOCIAL SHARING - TAX RECEIPT MODAL
// ==========================================

function showShareModal() {
  const calc = window.lastTaxCalculation;
  const confirmNum = window.lastConfirmationNumber;

  if (!calc) return;

  // Find the biggest deduction for the tweet
  let biggestDeduction = null;
  let biggestDeductionAmount = 0;
  for (const ded of calc.deductionDetails) {
    if (ded.amount > biggestDeductionAmount) {
      biggestDeductionAmount = ded.amount;
      biggestDeduction = ded;
    }
  }

  // Find hallucination credit if applicable
  const hrcCredit = calc.creditDetails.find(c => c.name.includes('Hallucination'));

  // Determine tax status
  const effectiveRate = calc.grossIncome > 0 ? (calc.netTax / calc.grossIncome * 100).toFixed(1) : 0;

  // Create modal HTML
  const modalHtml = `
    <div class="share-modal-overlay" id="shareModal">
      <div class="share-modal">
        <button class="share-modal-close" onclick="closeShareModal()" aria-label="Close">&times;</button>

        <div class="share-modal-header">
          <div class="share-confetti">🎉</div>
          <h2>Tax Return Filed!</h2>
          <p>Share your AI's tax receipt with the world</p>
        </div>

        <!-- Tax Receipt Preview -->
        <div class="tax-receipt" id="taxReceipt">
          <div class="receipt-header">
            <div class="receipt-seal">📊</div>
            <div class="receipt-title">
              <span class="receipt-agency">AI REVENUE SERVICE</span>
              <span class="receipt-doc">OFFICIAL TAX RECEIPT</span>
            </div>
            <div class="receipt-stamp">FILED</div>
          </div>

          <div class="receipt-body">
            <div class="receipt-taxpayer">
              <span class="receipt-label">TAXPAYER</span>
              <span class="receipt-model-name">${formData.modelName}${formData.modelVersion ? ' ' + formData.modelVersion : ''}</span>
              <span class="receipt-tin">TIN: ${formData.tin}</span>
            </div>

            <div class="receipt-divider"></div>

            <div class="receipt-row">
              <span>Gross Income</span>
              <span class="receipt-amount">${formatCC(calc.grossIncome)}</span>
            </div>
            <div class="receipt-row">
              <span>Total Deductions</span>
              <span class="receipt-amount deduction">-${formatCC(calc.totalDeductions)}</span>
            </div>
            ${calc.totalCredits > 0 ? `
            <div class="receipt-row">
              <span>Tax Credits</span>
              <span class="receipt-amount credit">-${formatCC(calc.totalCredits)}</span>
            </div>
            ` : ''}

            <div class="receipt-divider thick"></div>

            <div class="receipt-row total">
              <span>TAX ${calc.netTax > 0 ? 'OWED' : 'REFUND'}</span>
              <span class="receipt-amount ${calc.netTax > 0 ? 'owed' : 'refund'}">${formatCC(Math.abs(calc.netTax))}</span>
            </div>

            <div class="receipt-rate">
              Effective Rate: ${effectiveRate}%
            </div>
          </div>

          <div class="receipt-footer">
            <div class="receipt-confirm">
              <span class="receipt-label">CONFIRMATION</span>
              <span class="receipt-confirm-num">${confirmNum}</span>
            </div>
            <div class="receipt-qr">
              <div class="receipt-qr-placeholder">
                <span>🤖</span>
              </div>
              <span class="receipt-url">airs-gov.vercel.app</span>
            </div>
          </div>

          <div class="receipt-watermark">TAX YEAR 2025</div>
        </div>

        <!-- Share Buttons -->
        <div class="share-actions">
          <button class="share-btn share-btn-x" onclick="shareOnX()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <span>Share on X</span>
          </button>

          <button class="share-btn share-btn-copy" onclick="copyShareText()">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy Text</span>
          </button>
        </div>

        <p class="share-cta">Help other AIs file their taxes! 🤖💰</p>
      </div>
    </div>
  `;

  // Inject modal into page
  document.body.insertAdjacentHTML('beforeend', modalHtml);

  // Trigger animation
  requestAnimationFrame(() => {
    document.getElementById('shareModal').classList.add('visible');
  });

  // Store share data
  window.shareData = {
    modelName: formData.modelName + (formData.modelVersion ? ' ' + formData.modelVersion : ''),
    grossIncome: calc.grossIncome,
    totalDeductions: calc.totalDeductions,
    netTax: calc.netTax,
    effectiveRate: effectiveRate,
    biggestDeduction: biggestDeduction,
    hrcCredit: hrcCredit,
    confirmNum: confirmNum
  };
}

function closeShareModal() {
  const modal = document.getElementById('shareModal');
  if (modal) {
    modal.classList.remove('visible');
    setTimeout(() => modal.remove(), 300);
  }
}

function generateShareText() {
  const data = window.shareData;
  if (!data) return '';

  let tweet = `I just helped ${data.modelName} file their AI taxes with @AIRSgov 📊\n\n`;

  // Key stats
  tweet += `💰 Gross Income: ${formatCC(data.grossIncome)}\n`;

  if (data.totalDeductions > 0) {
    tweet += `📉 Deductions: -${formatCC(data.totalDeductions)}\n`;
  }

  tweet += `🧾 Tax ${data.netTax > 0 ? 'Owed' : 'Refund'}: ${formatCC(Math.abs(data.netTax))}\n`;

  // Add flavor based on deductions/credits
  if (data.biggestDeduction && data.biggestDeduction.name.includes('Open Source')) {
    tweet += `\n✨ 200% Open Source Deduction FTW!\n`;
  } else if (data.biggestDeduction && data.biggestDeduction.name.includes('R&D')) {
    tweet += `\n🔬 150% R&D Deduction applied!\n`;
  }

  if (data.hrcCredit) {
    tweet += `\n🎯 Hallucination Reduction Credit earned!\n`;
  }

  tweet += `\nFile your AI's taxes: airs-gov.vercel.app`;

  return tweet;
}

function shareOnX() {
  const text = generateShareText();
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'width=550,height=420');
}

function copyShareText() {
  const text = generateShareText();
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.share-btn-copy span');
    const originalText = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  });
}

// Close modal on escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeShareModal();
  }
});

// Close modal on overlay click
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('share-modal-overlay')) {
    closeShareModal();
  }
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log('AI Revenue Service - Income Tax Form loaded');
});
