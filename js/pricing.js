/**
 * Pricing Toggle Logic
 * Swaps between Monthly and Yearly pricing
 */

document.addEventListener('DOMContentLoaded', () => {
    const toggle = document.getElementById('pricingToggle');
    const monthlyLabel = document.getElementById('monthlyLabel');
    const yearlyLabel = document.getElementById('yearlyLabel');
    const prices = document.querySelectorAll('.price-amount');
    const periods = document.querySelectorAll('.price-period');

    if (!toggle) return;

    toggle.addEventListener('change', () => {
        if (toggle.checked) {
            // Yearly Mode
            monthlyLabel.classList.remove('active');
            yearlyLabel.classList.add('active');
            
            prices.forEach(price => {
                // Animate change
                price.style.opacity = 0;
                setTimeout(() => {
                    price.textContent = price.dataset.yearly;
                    price.style.opacity = 1;
                }, 200);
            });
            
            periods.forEach(period => period.textContent = '/year');
        } else {
            // Monthly Mode
            monthlyLabel.classList.add('active');
            yearlyLabel.classList.remove('active');
            
            prices.forEach(price => {
                price.style.opacity = 0;
                setTimeout(() => {
                    price.textContent = price.dataset.monthly;
                    price.style.opacity = 1;
                }, 200);
            });
            
            periods.forEach(period => period.textContent = '/month');
        }
    });
});