import plans from './content/pricing/plans.json';

const toggle = document.getElementById('pricing-toggle');
const priceDisplay = document.getElementById('price-display');
const billingText = document.getElementById('billing-period-text');
const title = document.getElementById('billing-title');
const savings = document.getElementById('savings-callout');
const monthly = document.getElementById('label-monthly');
const annual = document.getElementById('label-annual');
const button = document.getElementById('cta-button');
const interval = priceDisplay.querySelector('.price-interval').cloneNode(true);

function updatePricing(isAnnual) {
  const plan = isAnnual ? plans.annual : plans.monthly;
  monthly.setAttribute('aria-pressed',String(!isAnnual));
  annual.setAttribute('aria-pressed',String(isAnnual));
  monthly.classList.toggle('active',!isAnnual);
  annual.classList.toggle('active',isAnnual);
  title.textContent = plan.title;
  const unit = interval.cloneNode(true);
  unit.textContent = plan.interval;
  priceDisplay.replaceChildren(document.createTextNode(plans.currency + plan.amount),unit);
  billingText.textContent = plan.billing;
  if (isAnnual && plans.savingsDetail) {
    const emphasis = document.createElement('strong');
    emphasis.className = 'billing-savings';
    emphasis.textContent = plans.savingsDetail;
    billingText.append(' ',emphasis);
  }
  savings.hidden = !isAnnual;
  savings.style.visibility = isAnnual ? 'visible' : 'hidden';
  savings.style.opacity = isAnnual ? '1' : '0';
  savings.style.transform = isAnnual ? 'translateY(0)' : 'translateY(5px)';
  button.textContent = plan.button.text;
  button.href = plan.button.url;
}

toggle.addEventListener('change',()=>updatePricing(toggle.checked));
monthly.addEventListener('click',()=> { toggle.checked=false; updatePricing(false); });
annual.addEventListener('click',()=> { toggle.checked=true; updatePricing(true); });
updatePricing(toggle.checked);
