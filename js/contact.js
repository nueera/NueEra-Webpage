/**
 * Contact Form Validation & Submission Logic
 * Works with the NueEra Premium Theme
 */

document.addEventListener('DOMContentLoaded', () => {
    // Select the form (supports ID or class)
    const contactForm = document.getElementById('contactForm') || document.querySelector('.contact-form form') || document.querySelector('form');
    
    if (!contactForm) return;

    // Create success message container dynamically
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.style.display = 'none';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <h3>Message Sent Successfully!</h3>
        <p>Thank you for reaching out. We'll get back to you within 24 hours.</p>
        <button class="btn btn-ghost mt-3" id="resetFormBtn">Send Another Message</button>
    `;
    
    // Insert success message before the form
    contactForm.parentNode.insertBefore(successMessage, contactForm);

    // Reset button logic
    successMessage.querySelector('#resetFormBtn').addEventListener('click', () => {
        successMessage.style.display = 'none';
        contactForm.style.display = 'block';
        contactForm.style.opacity = '0';
        contactForm.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'forwards' });
    });

    // Validation Logic
    const validateField = (field) => {
        const value = field.value.trim();
        const type = field.type;
        let error = '';

        // Remove existing error
        const formGroup = field.closest('.form-group');
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) existingError.remove();
        formGroup.classList.remove('error');

        // Check Required
        if (field.hasAttribute('required') && value === '') {
            error = 'This field is required';
        } 
        // Check Email
        else if (type === 'email' && value !== '') {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(value)) {
                error = 'Please enter a valid email address';
            }
        }

        // Display Error
        if (error) {
            formGroup.classList.add('error');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = error;
            field.parentNode.appendChild(errorDiv);
            return false;
        }

        return true;
    };

    // Attach Real-time Validation
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        // Validate on blur (when leaving the field)
        input.addEventListener('blur', () => validateField(input));
        
        // Validate on input if it was previously errored (immediate feedback)
        input.addEventListener('input', () => {
            if (input.closest('.form-group').classList.contains('error')) {
                validateField(input);
            }
        });
    });

    // Handle Submission
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Validate all fields
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        if (isValid) {
            // Simulate Submission
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            setTimeout(() => {
                contactForm.style.display = 'none';
                successMessage.style.display = 'block';
                contactForm.reset();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }, 1500);
        }
    });
});