/**
 * ASKLY MOBILE INTERACTIONS
 * Handles mobile navigation, touch gestures, and responsive behaviors
 */

(function() {
    'use strict';

    // Check if mobile device
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

    if (!isMobile && !isTouchDevice) return;

    // ═══════════════════════════════════════════════════════════
    // MOBILE NAVIGATION
    // ═══════════════════════════════════════════════════════════

    class MobileNavigation {
        constructor() {
            this.menuBtn = document.querySelector('.mobile-menu-btn');
            this.mobileMenu = document.querySelector('.mobile-menu');
            this.mobileOverlay = document.querySelector('.mobile-menu-overlay');
            this.mobileLinks = document.querySelectorAll('.mobile-menu-links a');
            this.bottomNav = document.querySelector('.mobile-bottom-nav');
            
            this.init();
        }

        init() {
            if (!this.menuBtn) return;

            // Toggle menu on hamburger click
            this.menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMenu();
            });

            // Close menu on overlay click
            if (this.mobileOverlay) {
                this.mobileOverlay.addEventListener('click', () => this.closeMenu());
            }

            // Close menu on link click
            this.mobileLinks.forEach(link => {
                link.addEventListener('click', () => this.closeMenu());
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') this.closeMenu();
            });

            // Show bottom nav after scrolling past hero
            this.initBottomNav();
        }

        toggleMenu() {
            const isOpen = this.menuBtn.classList.contains('active');
            if (isOpen) {
                this.closeMenu();
            } else {
                this.openMenu();
            }
        }

        openMenu() {
            this.menuBtn.classList.add('active');
            this.mobileMenu?.classList.add('active');
            this.mobileOverlay?.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Haptic feedback
            this.triggerHaptic();
        }

        closeMenu() {
            this.menuBtn.classList.remove('active');
            this.mobileMenu?.classList.remove('active');
            this.mobileOverlay?.classList.remove('active');
            document.body.style.overflow = '';
        }

        initBottomNav() {
            if (!this.bottomNav) return;

            let lastScrollY = window.scrollY;
            let ticking = false;

            const updateBottomNav = () => {
                const scrollY = window.scrollY;
                const heroHeight = window.innerHeight * 0.8;

                // Show bottom nav after scrolling past hero
                if (scrollY > heroHeight) {
                    this.bottomNav.classList.add('visible');
                    document.body.classList.add('has-bottom-nav');
                } else {
                    this.bottomNav.classList.remove('visible');
                    document.body.classList.remove('has-bottom-nav');
                }

                lastScrollY = scrollY;
                ticking = false;
            };

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(updateBottomNav);
                    ticking = true;
                }
            }, { passive: true });

            // Set active state based on current section
            this.updateBottomNavActiveState();
        }

        updateBottomNavActiveState() {
            const sections = ['#hero', '#inputSection', '#features'];
            const navItems = document.querySelectorAll('.mobile-bottom-nav-item');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        navItems.forEach(item => {
                            item.classList.remove('active');
                            if (item.getAttribute('href') === `#${id}`) {
                                item.classList.add('active');
                            }
                        });
                    }
                });
            }, { threshold: 0.5 });

            sections.forEach(selector => {
                const section = document.querySelector(selector);
                if (section) observer.observe(section);
            });
        }

        triggerHaptic() {
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════
    // TOUCH GESTURES
    // ═══════════════════════════════════════════════════════════

    class TouchGestures {
        constructor() {
            this.touchStartY = 0;
            this.touchEndY = 0;
            this.minSwipeDistance = 50;
            
            this.init();
        }

        init() {
            // Pull to refresh prevention
            document.addEventListener('touchmove', (e) => {
                if (e.target.closest('.chat-body, .ai-body')) {
                    const element = e.target.closest('.chat-body, .ai-body');
                    if (element.scrollTop === 0 && e.touches[0].clientY > this.touchStartY) {
                        e.preventDefault();
                    }
                }
            }, { passive: false });

            // Swipe gestures for mobile menu
            document.addEventListener('touchstart', (e) => {
                this.touchStartY = e.touches[0].clientY;
            }, { passive: true });

            document.addEventListener('touchend', (e) => {
                this.touchEndY = e.changedTouches[0].clientY;
                this.handleSwipe();
            }, { passive: true });
        }

        handleSwipe() {
            const swipeDistance = this.touchEndY - this.touchStartY;
            const mobileNav = document.querySelector('.mobile-navigation');
            
            // Swipe up to close menu
            if (swipeDistance < -this.minSwipeDistance && mobileNav?.classList.contains('active')) {
                mobileNav.classList.remove('active');
            }
        }
    }

    // ═══════════════════════════════════════════════════════════
    // MOBILE INPUT OPTIMIZATIONS
    // ═══════════════════════════════════════════════════════════

    class MobileInput {
        constructor() {
            this.textarea = document.querySelector('.ai-textarea');
            this.inputSection = document.querySelector('#inputSection');
            
            this.init();
        }

        init() {
            if (!this.textarea) return;

            // Auto-resize textarea
            this.textarea.addEventListener('input', () => this.autoResize());

            // Handle keyboard appearance
            this.textarea.addEventListener('focus', () => this.onFocus());
            this.textarea.addEventListener('blur', () => this.onBlur());

            // Submit on enter (but allow shift+enter for new line)
            this.textarea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.submitForm();
                }
            });
        }

        autoResize() {
            this.textarea.style.height = 'auto';
            const maxHeight = 120;
            const newHeight = Math.min(this.textarea.scrollHeight, maxHeight);
            this.textarea.style.height = newHeight + 'px';
            this.textarea.style.overflowY = this.textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
        }

        onFocus() {
            // Scroll input into view after keyboard appears
            setTimeout(() => {
                this.inputSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }

        onBlur() {
            // Reset height
            this.textarea.style.height = 'auto';
        }

        submitForm() {
            const generateBtn = document.querySelector('#generateBtn');
            if (generateBtn) {
                generateBtn.click();
            }
        }
    }

    // ═══════════════════════════════════════════════════════════
    // MOBILE TOAST NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════

    class MobileToast {
        static show(message, type = 'default', duration = 3000) {
            // Remove existing toast
            const existingToast = document.querySelector('.mobile-toast');
            if (existingToast) {
                existingToast.remove();
            }

            // Create new toast
            const toast = document.createElement('div');
            toast.className = `mobile-toast ${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);

            // Trigger animation
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            // Remove after duration
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 400);
            }, duration);
        }

        static success(message) {
            this.show(message, 'success');
        }

        static error(message) {
            this.show(message, 'error');
        }
    }

    // ═══════════════════════════════════════════════════════════
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ═══════════════════════════════════════════════════════════

    class SmoothScroll {
        constructor() {
            this.init();
        }

        init() {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const targetId = anchor.getAttribute('href');
                    if (targetId === '#') return;

                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        e.preventDefault();
                        
                        // Close mobile menu if open
                        const mobileMenu = document.querySelector('.mobile-menu');
                        if (mobileMenu?.classList.contains('active')) {
                            mobileMenu.classList.remove('active');
                            document.querySelector('.mobile-menu-btn')?.classList.remove('active');
                            document.querySelector('.mobile-menu-overlay')?.classList.remove('active');
                            document.body.style.overflow = '';
                        }

                        // Smooth scroll to target
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // PERFORMANCE OPTIMIZATIONS
    // ═══════════════════════════════════════════════════════════

    class PerformanceOptimizer {
        constructor() {
            this.init();
        }

        init() {
            // Disable heavy animations on low battery
            if ('getBattery' in navigator) {
                navigator.getBattery().then(battery => {
                    if (battery.level < 0.2 && !battery.charging) {
                        this.enableLowPowerMode();
                    }
                });
            }

            // Pause animations when tab is hidden
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    document.body.classList.add('animations-paused');
                } else {
                    document.body.classList.remove('animations-paused');
                }
            });

            // Disable particle canvas on low-end devices
            const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
            if (isLowEnd) {
                const canvas = document.getElementById('particle-canvas');
                if (canvas) {
                    canvas.style.display = 'none';
                }
            }
        }

        enableLowPowerMode() {
            document.body.classList.add('low-power-mode');
            const canvas = document.getElementById('particle-canvas');
            if (canvas) {
                canvas.style.display = 'none';
            }
        }
    }

    // ═══════════════════════════════════════════════════════════
    // DOUBLE TAP TO PREVENT ZOOM
    // ═══════════════════════════════════════════════════════════

    class DoubleTapPreventer {
        constructor() {
            this.lastTouchEnd = 0;
            this.init();
        }

        init() {
            document.addEventListener('touchend', (e) => {
                const now = Date.now();
                if (now - this.lastTouchEnd <= 300) {
                    e.preventDefault();
                }
                this.lastTouchEnd = now;
            }, { passive: false });
        }
    }

    // ═══════════════════════════════════════════════════════════
    // INITIALIZE ALL MODULES
    // ═══════════════════════════════════════════════════════════

    document.addEventListener('DOMContentLoaded', () => {
        new MobileNavigation();
        new TouchGestures();
        new MobileInput();
        new SmoothScroll();
        new PerformanceOptimizer();
        new DoubleTapPreventer();

        // Override copy button behavior for mobile
        const copyBtn = document.querySelector('#copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const originalText = document.querySelector('#copyText')?.textContent;
                
                // Execute original copy function
                if (typeof copyText === 'function') {
                    copyText();
                }

                // Show mobile toast
                MobileToast.success('Copied to clipboard!');
            });
        }
    });

    // Expose MobileToast globally
    window.MobileToast = MobileToast;

})();
