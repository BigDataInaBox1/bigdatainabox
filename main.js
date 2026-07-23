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

    // Lightbox Modal elements
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    let isLightboxOpen = false;

    function openLightbox(imgSrc, imgAlt) {
      if (!lightbox || !lightboxImg) return;
      lightboxImg.src = imgSrc;
      lightboxImg.alt = imgAlt || '';
      if (lightboxCaption) {
        lightboxCaption.textContent = imgAlt || '';
      }
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      isLightboxOpen = true;
      stopAutoSlide();
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      isLightboxOpen = false;
      startAutoSlide();
    }

    if (lightboxOverlay) {
      lightboxOverlay.addEventListener('click', closeLightbox);
    }
    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        closeLightbox();
      }
    });

    gallerySlides.forEach((slide) => {
      slide.addEventListener('click', () => {
        if (slide.classList.contains('slide-center')) {
          const img = slide.querySelector('img');
          if (img) {
            openLightbox(img.src, img.alt);
          }
        } else if (slide.classList.contains('slide-left')) {
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

  /* ---- SPIDER Ag Feature Carousel Controller ---- */
  const spiderCarouselTrack = document.getElementById('spider-carousel-track');
  const spiderSlides = spiderCarouselTrack ? spiderCarouselTrack.querySelectorAll('.spider-slide') : [];
  const spiderPrevBtn = document.getElementById('spider-prev-btn');
  const spiderNextBtn = document.getElementById('spider-next-btn');
  const spiderDotsContainer = document.getElementById('spider-carousel-dots');

  if (spiderCarouselTrack && spiderSlides.length > 0) {
    let spiderIndex = 0;
    const totalSpiderSlides = spiderSlides.length;
    let spiderTimer = null;

    if (spiderDotsContainer) {
      spiderDotsContainer.innerHTML = '';
      spiderSlides.forEach((_, idx) => {
        const dot = document.createElement('button');
        dot.className = `spider-dot ${idx === 0 ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Go to SPIDER Ag slide ${idx + 1}`);
        dot.addEventListener('click', () => {
          goToSpiderSlide(idx);
          resetSpiderTimer();
        });
        spiderDotsContainer.appendChild(dot);
      });
    }

    function updateSpiderSlides() {
      spiderSlides.forEach((slide, idx) => {
        slide.classList.toggle('active', idx === spiderIndex);
      });
      if (spiderDotsContainer) {
        const dots = spiderDotsContainer.querySelectorAll('.spider-dot');
        dots.forEach((dot, idx) => {
          dot.classList.toggle('active', idx === spiderIndex);
        });
      }
    }

    function goToSpiderSlide(index) {
      spiderIndex = (index + totalSpiderSlides) % totalSpiderSlides;
      updateSpiderSlides();
    }

    function nextSpiderSlide() {
      goToSpiderSlide(spiderIndex + 1);
    }

    function prevSpiderSlide() {
      goToSpiderSlide(spiderIndex - 1);
    }

    if (spiderNextBtn) {
      spiderNextBtn.addEventListener('click', () => {
        nextSpiderSlide();
        resetSpiderTimer();
      });
    }

    if (spiderPrevBtn) {
      spiderPrevBtn.addEventListener('click', () => {
        prevSpiderSlide();
        resetSpiderTimer();
      });
    }

    spiderSlides.forEach((slide) => {
      slide.addEventListener('click', () => {
        const img = slide.querySelector('img');
        if (img && typeof openLightbox === 'function') {
          openLightbox(img.src, img.alt);
        }
      });
    });

    function startSpiderTimer() {
      stopSpiderTimer();
      spiderTimer = setInterval(nextSpiderSlide, 4500);
    }

    function stopSpiderTimer() {
      if (spiderTimer) {
        clearInterval(spiderTimer);
        spiderTimer = null;
      }
    }

    function resetSpiderTimer() {
      stopSpiderTimer();
      startSpiderTimer();
    }

    const spiderWrapper = document.getElementById('spider-carousel');
    if (spiderWrapper) {
      spiderWrapper.addEventListener('mouseenter', stopSpiderTimer);
      spiderWrapper.addEventListener('mouseleave', startSpiderTimer);

      let sTouchStart = 0;
      let sTouchEnd = 0;

      spiderWrapper.addEventListener('touchstart', (e) => {
        sTouchStart = e.changedTouches[0].screenX;
        stopSpiderTimer();
      }, { passive: true });

      spiderWrapper.addEventListener('touchend', (e) => {
        sTouchEnd = e.changedTouches[0].screenX;
        const diff = sTouchEnd - sTouchStart;
        if (diff < -30) nextSpiderSlide();
        else if (diff > 30) prevSpiderSlide();
        startSpiderTimer();
      }, { passive: true });
    }

    updateSpiderSlides();
    startSpiderTimer();
  }
})();


