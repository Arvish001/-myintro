// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Navigation scroll effect
    const nav = document.querySelector('nav');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links'); // Get the UL container
    const navLinks = document.querySelectorAll('.nav-links a');
    const sections = document.querySelectorAll('section');

    // Function to update the sliding indicator
    function updateIndicator() {
        const activeLink = navLinksContainer.querySelector('a.active');
        if (activeLink && window.innerWidth > 768) { // Only run if active link exists and not on mobile
            const left = activeLink.offsetLeft;
            const width = activeLink.offsetWidth;
            const parentPaddingLeft = parseFloat(window.getComputedStyle(navLinksContainer).paddingLeft) || 0;

            navLinksContainer.style.setProperty('--indicator-left', `${left}px`);
            navLinksContainer.style.setProperty('--indicator-width', `${width}px`);
            navLinksContainer.style.setProperty('--indicator-opacity', '1');
        } else {
            // Hide indicator if no active link or on mobile
            navLinksContainer.style.setProperty('--indicator-opacity', '0');
        }
    }

    // Initial indicator position setup
    updateIndicator();

    // Toggle menu for mobile
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
        
        // Update aria-expanded attribute for accessibility
        const isExpanded = navLinksContainer.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
        
        // Prevent body scroll when menu is open
        if (isExpanded) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    });

    // Close menu when clicking a nav link on mobile
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navLinksContainer.classList.contains('active')) {
                menuToggle.classList.remove('active');
                navLinksContainer.classList.remove('active');
                menuToggle.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
            }
            // Manually set active class and update indicator immediately on click (for desktop)
            if (window.innerWidth > 768) {
                navLinks.forEach(item => item.classList.remove('active'));
                link.classList.add('active');
                setTimeout(updateIndicator, 50); // Small delay for smoother transition
            }
        });
    });

    // Add scrolled class to nav on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Active nav link based on scroll position
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= (sectionTop - 150) && window.scrollY < (sectionTop + sectionHeight - 150)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        let activeLinkFound = false;
        navLinks.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSectionId}`) {
                item.classList.add('active');
                activeLinkFound = true;
            }
        });

        // If scrolled to top or no section is active, activate 'Home'
        if (!activeLinkFound && window.scrollY < sections[0].offsetTop - 150) {
            const homeLink = navLinksContainer.querySelector('a[href="#home"]');
            if (homeLink && !homeLink.classList.contains('active')) {
                homeLink.classList.add('active');
            }
        }

        // Update indicator position on scroll
        updateIndicator();
    });

    // Update indicator on window resize
    window.addEventListener('resize', () => {
        updateIndicator();
        
        // Reset mobile menu state on resize to desktop
        if (window.innerWidth > 768 && navLinksContainer.classList.contains('active')) {
            navLinksContainer.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
    });

    // Add reveal animations on scroll
    const revealElements = document.querySelectorAll('.section-header, .skill-card, .project-card, .contact-item, .about-text p, .about-stats');
    
    // Create IntersectionObserver
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                
                // Add staggered reveal for child elements
                if (entry.target.classList.contains('skills-grid') || 
                    entry.target.classList.contains('projects-grid') || 
                    entry.target.classList.contains('contact-info')) {
                    
                    const children = entry.target.children;
                    Array.from(children).forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('revealed');
                        }, 100 * index);
                    });
                }
                
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe each element
    revealElements.forEach(element => {
        element.classList.add('reveal-element');
        revealObserver.observe(element);
    });

    // Add container elements as well
    const revealContainers = document.querySelectorAll('.skills-grid, .projects-grid, .contact-info');
    revealContainers.forEach(container => {
        container.classList.add('reveal-container');
        
        // Make children invisible initially
        Array.from(container.children).forEach(child => {
            child.classList.add('reveal-element');
            child.style.opacity = '0';
        });
        
        revealObserver.observe(container);
    });

    // Form submission with validation
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form inputs
            const nameInput = contactForm.querySelector('input[name="name"]');
            const emailInput = contactForm.querySelector('input[name="email"]');
            const messageInput = contactForm.querySelector('textarea[name="message"]');
            
            // Validate form
            let isValid = true;
            const inputs = [nameInput, emailInput, messageInput];
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    highlightInvalidField(input);
                } else {
                    removeHighlight(input);
                }
            });
            
            // Additional email validation
            if (isValid && !isValidEmail(emailInput.value)) {
                isValid = false;
                highlightInvalidField(emailInput, 'Please enter a valid email address');
            }
            
            if (isValid) {
                // In a real application, you would send the form data to a server
                // For this demo, we'll show a success message
                showFormMessage('Thank you for your message! I will get back to you soon.', 'success');
                contactForm.reset();
            } else {
                showFormMessage('Please fill out all required fields correctly.', 'error');
            }
        });
        
        // Add input event listeners to clear validation styles on input
        contactForm.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => {
                removeHighlight(input);
                clearFormMessage();
            });
        });
    }
    
    // Helper functions for form validation
    function highlightInvalidField(field, message) {
        field.style.borderColor = 'var(--accent-primary)';
        field.style.backgroundColor = 'rgba(255, 107, 107, 0.05)';
    }
    
    function removeHighlight(field) {
        field.style.borderColor = '';
        field.style.backgroundColor = '';
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showFormMessage(message, type) {
        // Remove existing message if any
        clearFormMessage();
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `form-message ${type}`;
        messageEl.textContent = message;
        
        // Add to form
        contactForm.appendChild(messageEl);
        
        // Auto remove after 5 seconds
        setTimeout(clearFormMessage, 5000);
    }
    
    function clearFormMessage() {
        const existingMessage = contactForm.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }

    // Typing animation for hero section
    const roleElement = document.querySelector('.role');
    
    if (roleElement) {
        const roles = ['Developer', 'Designer', 'Content Creator', 'Video Editor'];
        let roleIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 150;
        
        const typeRole = () => {
            const currentRole = roles[roleIndex];
            
            if (isDeleting) {
                roleElement.textContent = currentRole.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                roleElement.textContent = currentRole.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 150;
            }
            
            if (!isDeleting && charIndex === currentRole.length) {
                // Pause at end of word
                isDeleting = true;
                typingSpeed = 1500;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                roleIndex = (roleIndex + 1) % roles.length;
                typingSpeed = 500;
            }
            
            setTimeout(typeRole, typingSpeed);
        };
        
        // Start typing animation
        setTimeout(typeRole, 1000);
    }

    // Add CSS for reveal animations
    const style = document.createElement('style');
    style.textContent = `
        .reveal-element {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s ease, transform 0.8s ease;
        }
        
        .revealed {
            opacity: 1 !important;
            transform: translateY(0);
        }
        
        .form-message {
            padding: 10px 15px;
            margin-top: 15px;
            border-radius: 8px;
            font-size: 0.9rem;
        }
        
        .form-message.success {
            background-color: rgba(78, 205, 196, 0.2);
            color: var(--accent-secondary);
        }
        
        .form-message.error {
            background-color: rgba(255, 107, 107, 0.2);
            color: var(--accent-primary);
        }
    `;
    document.head.appendChild(style);

    // 3D Tilt Effect for Profile Image
    const profileLink = document.getElementById('profile-link');

    if (profileLink) {
        profileLink.addEventListener('mousemove', (e) => {
            const { left, top, width, height } = profileLink.getBoundingClientRect();
            const x = e.clientX - left; // Mouse X position relative to element
            const y = e.clientY - top;  // Mouse Y position relative to element

            const centerX = width / 2;
            const centerY = height / 2;

            const deltaX = (x - centerX) / centerX;
            const deltaY = (y - centerY) / centerY;

            const rotateY = deltaX * 10; // Max rotation angle (adjust as needed)
            const rotateX = -deltaY * 10; // Max rotation angle (adjust as needed)

            profileLink.style.transform = `scale(1.05) perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        profileLink.addEventListener('mouseleave', () => {
            profileLink.style.transform = 'scale(1) perspective(1000px) rotateX(0deg) rotateY(0deg)';
        });
    }

    // Background Audio Control
    const audio = document.getElementById('background-audio');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playPauseIcon = playPauseBtn.querySelector('i');

    if (audio && playPauseBtn && playPauseIcon) {
        // Autoplay is likely muted, so we don't need the initial play/catch here
        // Icon is already set to 'play' in HTML

        playPauseBtn.addEventListener('click', () => {
            if (audio.paused || audio.muted) { // Check if paused OR muted
                audio.muted = false; // Unmute first
                audio.play().then(() => {
                    playPauseIcon.classList.remove('fa-play');
                    playPauseIcon.classList.add('fa-pause');
                    playPauseBtn.setAttribute('aria-label', 'Pause Background Audio');
                }).catch(error => {
                    console.error("Audio play failed:", error);
                    // Keep the play icon if play fails
                });
            } else {
                audio.pause();
                playPauseIcon.classList.remove('fa-pause');
                playPauseIcon.classList.add('fa-play');
                playPauseBtn.setAttribute('aria-label', 'Play Background Audio');
            }
        });

        // Update icon if audio is paused externally
        audio.addEventListener('pause', () => {
            if (!audio.ended && !audio.muted) { // Only if not ended and not muted
                playPauseIcon.classList.remove('fa-pause');
                playPauseIcon.classList.add('fa-play');
                playPauseBtn.setAttribute('aria-label', 'Play Background Audio');
            }
        });
    }

    // Custom cursor implementation
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    if (cursorDot && cursorOutline && window.innerWidth > 768) {
        let mouseX = 0;
        let mouseY = 0;
        let outlineX = 0;
        let outlineY = 0;
        
        // Mouse move event
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Position the dot immediately (no lag)
            cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
        });
        
        // Add hover effect to interactive elements
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, .skill-card, .project-card, .social-link, .profile-image-container');
        
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorOutline.classList.add('hover-effect');
            });
            
            el.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('hover-effect');
            });
        });
        
        // Animation loop for smooth outline movement
        function animateCursor() {
            // Smooth interpolation
            const ease = 0.2; // Lower = smoother but slower
            
            // Calculate the distance between the dot and outline
            const dx = mouseX - outlineX;
            const dy = mouseY - outlineY;
            
            // Move outline towards dot position using interpolation
            outlineX += dx * ease;
            outlineY += dy * ease;
            
            // Apply the position
            cursorOutline.style.transform = `translate(${outlineX}px, ${outlineY}px)`;
            
            // Call next frame
            requestAnimationFrame(animateCursor);
        }
        
        // Start animation
        animateCursor();
        
        // Show custom cursor
        document.documentElement.classList.add('custom-cursor');
    } else {
        // Hide custom cursor elements on mobile
        if (cursorDot) cursorDot.style.display = 'none';
        if (cursorOutline) cursorOutline.style.display = 'none';
    }
    
    // Scroll to section when clicking on scroll indicator
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', () => {
            const aboutSection = document.getElementById('about');
            if (aboutSection) {
                aboutSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});

// Particles background effect
function createParticles() {
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    document.body.appendChild(particlesContainer);
    
    const particlesCount = 50;
    
    for (let i = 0; i < particlesCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position
        const posX = Math.random() * 100;
        const posY = Math.random() * 100;
        
        // Random size
        const size = Math.random() * 5 + 2;
        
        // Random opacity
        const opacity = Math.random() * 0.5 + 0.1;
        
        // Random animation duration
        const duration = Math.random() * 20 + 10;
        
        particle.style.cssText = `
            position: absolute;
            top: ${posY}%;
            left: ${posX}%;
            width: ${size}px;
            height: ${size}px;
            background: white;
            border-radius: 50%;
            opacity: ${opacity};
            pointer-events: none;
            animation: float ${duration}s linear infinite;
        `;
        
        particlesContainer.appendChild(particle);
    }
    
    // Add CSS for particles
    const style = document.createElement('style');
    style.textContent = `
        .particles-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
            overflow: hidden;
        }
        
        @keyframes float {
            0% {
                transform: translateY(0) translateX(0) rotate(0deg);
            }
            25% {
                transform: translateY(-20px) translateX(10px) rotate(90deg);
            }
            50% {
                transform: translateY(-40px) translateX(0) rotate(180deg);
            }
            75% {
                transform: translateY(-20px) translateX(-10px) rotate(270deg);
            }
            100% {
                transform: translateY(0) translateX(0) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize particles
createParticles(); 