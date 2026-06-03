document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            menuBtn.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile menu when a link is clicked
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            menuBtn.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // ===== Cinematic Video Hero =====
    const hero = document.querySelector('.hero');
    const bgVideo = document.querySelector('.hero-bg-video');
    const fgVideo = document.getElementById('hero-video');
    const muteBtn = document.getElementById('mute-btn');
    const playBtn = document.getElementById('play-btn');
    const tapBadge = document.getElementById('tap-sound-badge');
    const muteIcon = document.getElementById('mute-icon');
    const playIcon = document.getElementById('play-icon');

    // SVG icon templates
    const iconMuted = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line>';
    const iconUnmuted = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>';
    const iconPause = '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>';
    const iconPlay = '<polygon points="5 3 19 12 5 21 5 3"></polygon>';

    // Trigger entrance animations
    if (hero) {
        setTimeout(() => {
            hero.classList.add('is-loaded');
        }, 200);
    }

    // Mute / Unmute
    function setMuted(muted) {
        if (!fgVideo || !muteIcon) return;
        fgVideo.muted = muted;
        if (bgVideo) bgVideo.muted = true; // bg always muted
        muteIcon.innerHTML = muted ? iconMuted : iconUnmuted;
        if (muteBtn) muteBtn.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video');
        if (tapBadge) {
            if (muted) {
                tapBadge.classList.remove('hidden');
            } else {
                tapBadge.classList.add('hidden');
            }
        }
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            setMuted(!fgVideo.muted);
        });
    }

    // Unmute when clicking on the foreground video
    if (fgVideo) {
        fgVideo.addEventListener('click', () => {
            if (fgVideo.muted) {
                setMuted(false);
            }
        });

        // Support keyboard activation if video is focusable
        fgVideo.addEventListener('keydown', (e) => {
            if ((e.key === 'Enter' || e.key === ' ') && fgVideo.muted) {
                e.preventDefault();
                setMuted(false);
            }
        });
    }
    // Tap for Sound badge
    if (tapBadge) {
        tapBadge.addEventListener('click', () => setMuted(false));
        tapBadge.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setMuted(false);
            }
        });
    }

    // Play / Pause
    if (playBtn && fgVideo) {
        playBtn.addEventListener('click', () => {
            if (fgVideo.paused) {
                fgVideo.play();
                if (bgVideo) bgVideo.play();
                if (playIcon) playIcon.innerHTML = iconPause;
                playBtn.setAttribute('aria-label', 'Pause video');
            } else {
                fgVideo.pause();
                if (bgVideo) bgVideo.pause();
                if (playIcon) playIcon.innerHTML = iconPlay;
                playBtn.setAttribute('aria-label', 'Play video');
            }
        });
    }

    // Limit foreground video to play only twice, then stop
    if (fgVideo) {
        const maxPlays = 2;
        let playCount = 0;

        // Ensure the video doesn't loop automatically
        fgVideo.loop = false;

        fgVideo.addEventListener('ended', () => {
            playCount += 1;
            if (playCount < maxPlays) {
                // replay
                try {
                    fgVideo.currentTime = 0;
                    fgVideo.play();
                    if (bgVideo) {
                        bgVideo.currentTime = 0;
                        bgVideo.play();
                    }
                } catch (err) {
                    // ignore playback errors (browser autoplay policies)
                    console.warn('Could not restart video:', err);
                }
            } else {
                // final stop - ensure UI reflects paused state
                if (playIcon) playIcon.innerHTML = iconPlay;
                if (playBtn) playBtn.setAttribute('aria-label', 'Play video');
            }
        });
    }

    // Navbar Scroll Effect
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hero scroll parallax
        if (hero) {
            const heroHeight = hero.offsetHeight;
            const scrollProgress = Math.min(window.scrollY / heroHeight, 1);
            const videoContainer = hero.querySelector('.hero-video-container');
            const heroContent = hero.querySelector('.hero-content');
            const heroOverlay = hero.querySelector('.hero-overlay');

            if (videoContainer) {
                const scale = 1 - scrollProgress * 0.08;
                videoContainer.style.transform = `scale(${scale}) translateY(${scrollProgress * -20}px)`;
            }
            if (heroContent) {
                heroContent.style.opacity = 1 - scrollProgress * 1.2;
                heroContent.style.transform = `translateY(${scrollProgress * -30}px)`;
            }
            if (heroOverlay && heroOverlay.firstElementChild) {
                heroOverlay.style.opacity = 1 + scrollProgress * 0.3;
            }
        }
        
        // Active Navigation Link Update
        let current = '';
        const sections = document.querySelectorAll('section, header');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').substring(1) === current) {
                item.classList.add('active');
            }
        });
    });

    // Handle Form Submission
    const enquiryForm = document.getElementById('enquiry-form');
    const formStatus = document.getElementById('form-status');

    if (enquiryForm) {
        enquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            const submitBtn = enquiryForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<span>Sending...</span>';
            submitBtn.disabled = true;
            formStatus.style.display = 'block';

            try {
                // Sending data to Web3Forms API
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        // Important: Replace the string below with your Web3Forms Access Key
                        access_key: 'b704b1ef-21cd-4628-9354-426dd0fc17eb',
                        name: name,
                        email: email,
                        message: message,
                        subject: 'New Contact Enquiry from Portfolio'
                    })
                });

                const result = await response.json();

                if (response.status === 200) {
                    formStatus.className = 'form-status success';
                    formStatus.innerHTML = `Thank you, ${name}! Your message has been sent successfully.`;
                    enquiryForm.reset();
                } else {
                    formStatus.className = 'form-status error';
                    formStatus.innerHTML = result.message || 'Something went wrong. Please try again.';
                }
            } catch (error) {
                console.error(error);
                formStatus.className = 'form-status error';
                formStatus.innerHTML = 'Network error. Please check your connection and try again.';
            } finally {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Hide status message after 5 seconds
                setTimeout(() => {
                    formStatus.style.display = 'none';
                    formStatus.className = 'form-status';
                }, 5000);
            }
        });
    }

    // Initialize Particles.js
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            "particles": {
                "number": {
                    "value": 80,
                    "density": {
                        "enable": true,
                        "value_area": 800
                    }
                },
                "color": {
                    "value": ["#00F0FF", "#7000FF", "#ffffff"]
                },
                "shape": {
                    "type": "circle",
                    "stroke": {
                        "width": 0,
                        "color": "#000000"
                    },
                    "polygon": {
                        "nb_sides": 5
                    }
                },
                "opacity": {
                    "value": 0.5,
                    "random": true,
                    "anim": {
                        "enable": true,
                        "speed": 1,
                        "opacity_min": 0.1,
                        "sync": false
                    }
                },
                "size": {
                    "value": 3,
                    "random": true,
                    "anim": {
                        "enable": false,
                        "speed": 40,
                        "size_min": 0.1,
                        "sync": false
                    }
                },
                "line_linked": {
                    "enable": true,
                    "distance": 150,
                    "color": "#ffffff",
                    "opacity": 0.1,
                    "width": 1
                },
                "move": {
                    "enable": true,
                    "speed": 1.5,
                    "direction": "none",
                    "random": false,
                    "straight": false,
                    "out_mode": "out",
                    "bounce": false,
                    "attract": {
                        "enable": false,
                        "rotateX": 600,
                        "rotateY": 1200
                    }
                }
            },
            "interactivity": {
                "detect_on": "canvas",
                "events": {
                    "onhover": {
                        "enable": true,
                        "mode": "grab"
                    },
                    "onclick": {
                        "enable": true,
                        "mode": "push"
                    },
                    "resize": true
                },
                "modes": {
                    "grab": {
                        "distance": 140,
                        "line_linked": {
                            "opacity": 0.3
                        }
                    },
                    "bubble": {
                        "distance": 400,
                        "size": 40,
                        "duration": 2,
                        "opacity": 8,
                        "speed": 3
                    },
                    "repulse": {
                        "distance": 200,
                        "duration": 0.4
                    },
                    "push": {
                        "particles_nb": 4
                    },
                    "remove": {
                        "particles_nb": 2
                    }
                }
            },
            "retina_detect": true
        });
    }
});
