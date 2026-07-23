/**
 * main.js — Core site utilities for BDIB Solutions
 * Hamburger navigation, scroll reveal animations, newsletter form
 */
(function () {
  'use strict';

  /* ---- Hamburger Navigation Toggle ---- */
  const hamburger = document.getElementById('hamburger-toggle');
  const navLinks  = document.getElementById('nav-links-menu');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close drawer when a nav link is tapped
    navLinks.querySelectorAll('a:not(.btn)').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  /* ---- Hero Video: No Loop, Restart on Scroll Back ---- */
  const heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          heroVideo.currentTime = 0;
          heroVideo.play();
        }
      });
    }, { threshold: 0.3 });
    heroObserver.observe(heroVideo);
  }

  /* ---- Scroll Reveal Observer ---- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-right');

  if (revealEls.length) {
    // Assign stagger delay indices
    document.querySelectorAll('.stagger-group').forEach((group) => {
      group.querySelectorAll('.reveal, .reveal-right').forEach((el, i) => {
        el.style.setProperty('--index', i);
      });
    });

    const revealIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealIO.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealEls.forEach((el) => revealIO.observe(el));
  }

  /* ---- Newsletter Form Handler ---- */
  const nlForm  = document.getElementById('newsletter-email-form');
  const nlToast = document.getElementById('newsletter-success-toast');

  if (nlForm && nlToast) {
    nlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      nlToast.style.display = 'block';
      nlForm.reset();
      setTimeout(() => { nlToast.style.display = 'none'; }, 6000);
    });
  }

  /* ---- Active Navigation Highlighting ---- */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach((link) => {
    const href = (link.getAttribute('href') || '').split('#')[0];
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active-nav');
    }
  });

  /* ---- FAQ Accordion Handler ---- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      
      // Close all others
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        otherItem.querySelector('.faq-answer').style.maxHeight = null;
        otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });
      
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---- Comparison Table Expand Handler ---- */
  const btnExpandCompare = document.getElementById('btn-expand-compare');
  const expandableRows = document.querySelectorAll('.expandable-row');
  
  if (btnExpandCompare && expandableRows.length > 0) {
    let isExpanded = false;
    btnExpandCompare.addEventListener('click', () => {
      isExpanded = !isExpanded;
      expandableRows.forEach(row => {
        row.style.display = isExpanded ? 'table-row' : 'none';
      });
      btnExpandCompare.textContent = isExpanded ? 'Hide Full Comparison' : 'See Full Comparison';
      btnExpandCompare.setAttribute('aria-expanded', isExpanded.toString());
    });
  }

  /* ---- Interactive Reveal Cards (Click/Tap Handler for Mobile) ---- */
  const interactiveCards = document.querySelectorAll('.interactive-card');
  interactiveCards.forEach(card => {
    card.addEventListener('click', () => {
      const isAlreadyActive = card.classList.contains('is-active');
      interactiveCards.forEach(c => c.classList.remove('is-active'));
      if (!isAlreadyActive) {
        card.classList.add('is-active');
      }
    });
  });

  /* ---- 3D Coverflow Gallery Carousel ---- */
  const galleryTrack = document.getElementById('gallery-track');
  const gallerySlides = document.querySelectorAll('.gallery-slide');
  const prevBtn = document.getElementById('gallery-prev-btn');
  const nextBtn = document.getElementById('gallery-next-btn');
  const dotsContainer = document.getElementById('gallery-dots');

  if (galleryTrack && gallerySlides.length > 0) {
    let currentIndex = 0;
    const totalSlides = gallerySlides.length;
    let autoSlideTimer = null;

    // Create pagination dots
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      gallerySlides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `gallery-dot ${idx === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}`);
        dot.addEventListener('click', () => {
          goToSlide(idx);
          resetAutoSlide();
        });
        dotsContainer.appendChild(dot);
      });
    }

    function updateSlidePositions() {
      gallerySlides.forEach((slide, idx) => {
        slide.classList.remove('slide-center', 'slide-left', 'slide-right', 'slide-far-left', 'slide-far-right');

        let diff = idx - currentIndex;
        if (diff < -Math.floor(totalSlides / 2)) diff += totalSlides;
        if (diff > Math.floor(totalSlides / 2)) diff -= totalSlides;

        if (diff === 0) {
          slide.classList.add('slide-center');
        } else if (diff === -1 || (currentIndex === 0 && idx === totalSlides - 1)) {
          slide.classList.add('slide-left');
        } else if (diff === 1 || (currentIndex === totalSlides - 1 && idx === 0)) {
          slide.classList.add('slide-right');
        } else if (diff < -1) {
          slide.classList.add('slide-far-left');
        } else {
          slide.classList.add('slide-far-right');
        }
      });

      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.gallery-dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === currentIndex);
        });
      }
    }

    function goToSlide(index) {
      currentIndex = (index + totalSlides) % totalSlides;
      updateSlidePositions();
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoSlide();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoSlide();
      });
    }

    gallerySlides.forEach((slide) => {
      slide.addEventListener('click', () => {
        if (slide.classList.contains('slide-left')) {
          prevSlide();
          resetAutoSlide();
        } else if (slide.classList.contains('slide-right')) {
          nextSlide();
          resetAutoSlide();
        }
      });
    });

    function startAutoSlide() {
      stopAutoSlide();
      autoSlideTimer = setInterval(nextSlide, 5000);
    }

    function stopAutoSlide() {
      if (autoSlideTimer) {
        clearInterval(autoSlideTimer);
        autoSlideTimer = null;
      }
    }

    function resetAutoSlide() {
      stopAutoSlide();
      startAutoSlide();
    }

    const galleryWrapper = document.querySelector('.coverflow-stage-wrapper');
    if (galleryWrapper) {
      galleryWrapper.addEventListener('mouseenter', stopAutoSlide);
      galleryWrapper.addEventListener('mouseleave', startAutoSlide);
    }

    let touchStartX = 0;
    let touchEndX = 0;

    if (galleryWrapper) {
      galleryWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoSlide();
      }, { passive: true });

      galleryWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoSlide();
      }, { passive: true });
    }

    function handleSwipe() {
      const swipeDistance = touchEndX - touchStartX;
      if (swipeDistance < -40) {
        nextSlide();
      } else if (swipeDistance > 40) {
        prevSlide();
      }
    }

    updateSlidePositions();
    startAutoSlide();
  }
})();

