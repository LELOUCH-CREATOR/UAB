document.addEventListener('DOMContentLoaded', function() {
    const enrollmentForm = document.getElementById('enrollmentForm');

    // Check if user is logged in
    checkLoginStatus();

    async function checkLoginStatus() {
        try {
            const response = await fetch('/api/check-auth');
            const data = await response.json();
            
            if (!data.isLoggedIn) {
                window.location.href = '/login.html?redirect=enroll';
                return;
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    }

    enrollmentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const submitButton = this.querySelector('.form-btn');
        
        try {
            submitButton.disabled = true;
            submitButton.textContent = 'Submitting...';

            const response = await fetch('/api/enroll', {
                method: 'POST',
                body: formData,
                credentials: 'include' // Include cookies for authentication
            });

            const data = await response.json();

            if (response.ok) {
                alert('Enrollment submitted successfully!');
                window.location.href = 'dashboard.html';
            } else {
                alert(data.message || 'Failed to submit enrollment. Please try again.');
            }
        } catch (error) {
            alert('An error occurred. Please try again later.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Enrollment';
        }
    });

    // Form validation and dynamic behavior
    const inputs = enrollmentForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });

    // Add this to your existing enrollment form validation
    const termsCheckbox = document.getElementById('terms');
    const termsError = document.getElementById('termsError');

    function validateTerms() {
        if (!termsCheckbox.checked) {
            termsError.textContent = 'You must agree to the Terms & Conditions';
            termsError.style.display = 'block';
            termsCheckbox.parentElement.classList.add('error');
            return false;
        }
        termsError.style.display = 'none';
        termsCheckbox.parentElement.classList.remove('error');
        return true;
    }

    // Add to your form submission handler
    enrollmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Add terms validation to your existing validations
        const isTermsValid = validateTerms();
        
        // Only proceed if all validations pass
        if (isTermsValid /* && other validations */) {
            // Your form submission logic
        }
    });

    // Clear error on checkbox change
    termsCheckbox.addEventListener('change', function() {
        if (this.checked) {
            termsError.style.display = 'none';
            this.parentElement.classList.remove('error');
        }
    });
}); 