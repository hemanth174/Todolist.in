// Scroll-triggered animations using Intersection Observer
document.addEventListener('DOMContentLoaded', function() {
    // Create intersection observer
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, observerOptions);

    // Observe elements for animations
    const animateElements = document.querySelectorAll('.animate-slide-left, .animate-slide-right, .animate-fade-up, .animate-zoom-in, .animate-rotate-in, .animate-bounce-in');

    animateElements.forEach(element => {
        observer.observe(element);
    });

    // Stagger animations for feature cards
    const featureCards = document.querySelectorAll('.Icon1, .Icon2, .Icon3, .Icon4');
    featureCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
    });

    // Add parallax effect to background elements
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax-element');

        parallaxElements.forEach(element => {
            const rate = scrolled * -0.5;
            element.style.transform = `translateY(${rate}px)`;
        });
    });

    // Smooth scroll for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Hide loader after page loads
    setTimeout(function() {
        const loader = document.querySelector('.loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(function() {
                loader.style.display = 'none';
            }, 500);
        }
    }, 2500);
});
