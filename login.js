document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.form-box.login form');
    const emailInput = loginForm.querySelector('input[type="email"]');
    const passwordInput = loginForm.querySelector('input[type="password"]');
    const submitButton = loginForm.querySelector('.form-btn');
    const navbarRight = document.querySelector('.navbar-right');

    // Check if user is logged in
    checkLoginStatus();

    async function checkLoginStatus() {
        try {
            const response = await fetch('/api/check-auth');
            const data = await response.json();
            
            if (data.isLoggedIn) {
                updateNavbarForLoggedInUser(data.user);
                showProfileSection(data.user);
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        }
    }

    function showProfileSection(user) {
        const mainContent = document.querySelector('.form-box.login');
        mainContent.innerHTML = `
            <div class="profile-container">
                <div class="profile-header">
                    <img src="${user.profile_image || '/images/default-profile.png'}" 
                         alt="Profile" 
                         class="profile-image-large">
                    <h2>${user.name}</h2>
                    <p>${user.email}</p>
                </div>
                
                <div class="profile-actions">
                    <button class="update-profile-btn">Update Profile Picture</button>
                    <input type="file" 
                           id="profile-image-input" 
                           accept="image/*" 
                           style="display: none;">
                </div>

                <div class="profile-links">
                    <input type="text" 
                           id="profile-image-url" 
                           placeholder="Or paste an image URL here"
                           class="profile-url-input">
                    <button class="update-profile-url-btn">Update from URL</button>
                </div>
            </div>
        `;

        // Add event listeners for profile updates
        setupProfileUpdateHandlers();
    }

    function setupProfileUpdateHandlers() {
        const updateBtn = document.querySelector('.update-profile-btn');
        const fileInput = document.querySelector('#profile-image-input');
        const urlInput = document.querySelector('#profile-image-url');
        const urlUpdateBtn = document.querySelector('.update-profile-url-btn');

        // Handle file upload
        updateBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                const formData = new FormData();
                formData.append('profile_image', e.target.files[0]);

                try {
                    const response = await fetch('/api/update-profile-image', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        const data = await response.json();
                        updateProfileImage(data.profile_image);
                    }
                } catch (error) {
                    console.error('Error updating profile image:', error);
                }
            }
        });

        // Handle URL update
        urlUpdateBtn.addEventListener('click', async () => {
            const imageUrl = urlInput.value.trim();
            if (imageUrl) {
                try {
                    const response = await fetch('/api/update-profile-image-url', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ imageUrl })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        updateProfileImage(data.profile_image);
                        urlInput.value = '';
                    }
                } catch (error) {
                    console.error('Error updating profile image:', error);
                }
            }
        });
    }

    function updateProfileImage(newImageUrl) {
        const profileImage = document.querySelector('.profile-image-large');
        const navbarProfileImage = document.querySelector('.profile-image');
        if (profileImage) profileImage.src = newImageUrl;
        if (navbarProfileImage) navbarProfileImage.src = newImageUrl;
    }

    function updateNavbarForLoggedInUser(user) {
        // Remove login button
        const loginButton = document.querySelector('.login-btn');
        if (loginButton) loginButton.style.display = 'none';

        // Add profile section
        const profileHtml = `
            <div class="profile-section">
                <img src="${user.profile_image || '/images/default-profile.png'}" 
                     alt="Profile" 
                     class="profile-image">
                <span class="username">${user.name}</span>
                <button class="logout-btn">Logout</button>
            </div>
        `;
        navbarRight.innerHTML += profileHtml;

        // Add logout handler
        document.querySelector('.logout-btn').addEventListener('click', handleLogout);
    }

    async function handleLogout() {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = '/login.html';
            }
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

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
        submitButton.textContent = 'Logging in...';
    }

    function stopLoading() {
        submitButton.disabled = false;
        const spinner = submitButton.querySelector('.spinner');
        if (spinner) spinner.style.display = 'none';
        submitButton.textContent = 'Login';
    }

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        let isValid = true;

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

        if (isValid) {
            startLoading();

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: emailInput.value,
                        password: passwordInput.value
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    updateNavbarForLoggedInUser(data);
                    window.location.href = '/dashboard.html';
                } else {
                    showError(emailInput, data.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                showError(emailInput, 'An error occurred. Please try again.');
            } finally {
                stopLoading();
            }
        }
    });
}); 