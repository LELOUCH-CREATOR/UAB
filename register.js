document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('.form-box.register form');
    const nameInput = registerForm.querySelector('input[type="text"]');
    const emailInput = registerForm.querySelector('input[type="email"]');
    const passwordInput = registerForm.querySelector('input[type="password"]');
    const confirmPasswordInput = registerForm.querySelectorAll('input[type="password"]')[1];
    const submitButton = registerForm.querySelector('.form-btn');

    // Add file input for profile image
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.name = 'profile_image';
    fileInput.accept = 'image/*';
    registerForm.insertBefore(fileInput, submitButton);

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function showError(input, message) {
        const inputBox = input.parentElement;
        inputBox.classList.add('error');
        inputBox.classList.remove('success');
        
        let errorMessage = inputBox.querySelector('.error-message');
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            inputBox.appendChild(errorMessage);
        }
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function showSuccess(input) {
        const inputBox = input.parentElement;
        inputBox.classList.remove('error');
        inputBox.classList.add('success');
        const errorMessage = inputBox.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.style.display = 'none';
        }
    }

    function startLoading() {
        submitButton.disabled = true;
        const spinner = submitButton.querySelector('.spinner');
        if (spinner) spinner.style.display = 'block';
        submitButton.textContent = 'Creating Account...';
    }

    function stopLoading() {
        submitButton.disabled = false;
        const spinner = submitButton.querySelector('.spinner');
        if (spinner) spinner.style.display = 'none';
        submitButton.textContent = 'Register';
    }

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        let isValid = true;

        // Validate name
        if (nameInput.value.length < 2) {
            showError(nameInput, 'Name must be at least 2 characters');
            isValid = false;
        } else {
            showSuccess(nameInput);
        }

        // Validate email
        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        } else {
            showSuccess(emailInput);
        }

        // Validate password
        if (passwordInput.value.length < 6) {
            showError(passwordInput, 'Password must be at least 6 characters');
            isValid = false;
        } else {
            showSuccess(passwordInput);
        }

        // Validate confirm password
        if (passwordInput.value !== confirmPasswordInput.value) {
            showError(confirmPasswordInput, 'Passwords do not match');
            isValid = false;
        } else {
            showSuccess(confirmPasswordInput);
        }

        if (isValid) {
            startLoading();

            try {
                const formData = new FormData();
                formData.append('name', nameInput.value);
                formData.append('email', emailInput.value);
                formData.append('password', passwordInput.value);
                formData.append('profile_image', fileInput.files[0]);

                const response = await fetch('/api/register', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    window.location.href = '/login.html?registered=true';
                } else {
                    showError(emailInput, data.message || 'Registration failed');
                }
            } catch (error) {
                showError(emailInput, 'An error occurred. Please try again.');
            } finally {
                stopLoading();
            }
        }
    });
}); 