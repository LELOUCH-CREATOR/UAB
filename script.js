document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navItems = document.querySelectorAll('.nav-item');

    // Add index to dropdown items for staggered animation
    const dropdownItems = document.querySelectorAll('.dropdown-menu li');
    dropdownItems.forEach((item, index) => {
        item.style.setProperty('--item-number', index);
    });

    // Toggle mobile menu
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : 'auto';
        });
    }

    // Mobile dropdown toggle
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && this.nextElementSibling) {
                e.preventDefault();
                const parent = this.parentElement;

                // Close other dropdowns
                navItems.forEach(item => {
                    if (item !== parent) {
                        item.classList.remove('active');
                    }
                });

                // Toggle current dropdown
                parent.classList.toggle('active');
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
            navItems.forEach(item => item.classList.remove('active'));
        }
    });
});