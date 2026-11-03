/**
 * main.js — Core site utilities for BDIB Solutions
 * Hamburger navigation, scroll reveal animations, contact modal
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
      hamburger.setAttribute('aria-expanded', navLinks.classList.contains('active').toString());
    });

    // Close drawer when a nav link is tapped
    navLinks.querySelectorAll('a:not(.btn)').forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---- Hero Video: Playback Controls ---- */
  const heroVideo = document.getElementById('hero-video');
  const heroFallback = document.getElementById('hero-video-fallback');
  const heroMotionToggle = document.getElementById('hero-motion-toggle');
  if (heroVideo && heroFallback && heroMotionToggle) {
    const heroWrapper = heroVideo.closest('.hero-video-wrapper');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const posterSource = heroFallback.getAttribute('src');
    let isVisible = false;
    let userPaused = false;
    let hasLoadedVideo = false;
    let hasVideoAlpha = false;
    let playbackMode = 'video';

    const syncHeroPlayback = () => {
      const shouldPlay = isVisible && !document.hidden && !reducedMotion.matches && !userPaused;
      heroMotionToggle.hidden = reducedMotion.matches || !hasLoadedVideo;
      heroMotionToggle.textContent = userPaused ? 'Play animation' : 'Pause animation';
      heroMotionToggle.setAttribute('aria-label', userPaused ? 'Play hero animation' : 'Pause hero animation');

      if (playbackMode === 'image') {
        heroWrapper.classList.remove('has-alpha-video');
        const source = shouldPlay ? heroVideo.dataset.fallback : posterSource;
        if (heroFallback.getAttribute('src') !== source) heroFallback.src = source;
        return;
      }

      heroWrapper.classList.toggle('has-alpha-video', shouldPlay && hasVideoAlpha);
      if (!shouldPlay) {
        heroVideo.pause();
        return;
      }

      if (!hasLoadedVideo) {
        hasLoadedVideo = true;
        heroVideo.src = heroVideo.dataset.src;
        heroVideo.load();
      }

      const playAttempt = heroVideo.play();
      if (playAttempt) {
        playAttempt.catch((error) => {
          // A visibility change can interrupt play while media is loading.
          if (error.name !== 'NotAllowedError') return;
          userPaused = true;
          syncHeroPlayback();
        });
      }
    };

    const useTransparentImage = () => {
      if (playbackMode === 'image') return;
      playbackMode = 'image';
      heroVideo.pause();
      heroVideo.removeAttribute('src');
      heroVideo.load();
      syncHeroPlayback();
    };

    heroVideo.addEventListener('loadeddata', () => {
      if (playbackMode !== 'video') return;
      // Check an empty corner of the supplied animation. Some browsers decode
      // VP9 but discard its alpha; keep those browsers on transparent WebP.
      try {
        const sample = document.createElement('canvas');
        sample.width = sample.height = 1;
        const context = sample.getContext('2d', { willReadFrequently: true });
        context.drawImage(heroVideo, 0, 0, 1, 1, 0, 0, 1, 1);
        hasVideoAlpha = context.getImageData(0, 0, 1, 1).data[3] < 16;
      } catch {
        hasVideoAlpha = false;
      }
      if (hasVideoAlpha) syncHeroPlayback();
      else useTransparentImage();
    });

    heroVideo.addEventListener('error', useTransparentImage);
    heroFallback.addEventListener('error', () => {
      if (heroFallback.getAttribute('src') === posterSource) return;
      userPaused = true;
      heroFallback.src = posterSource;
      syncHeroPlayback();
    });
    heroMotionToggle.addEventListener('click', () => {
      userPaused = !userPaused;
      syncHeroPlayback();
    });
    reducedMotion.addEventListener('change', syncHeroPlayback);
    document.addEventListener('visibilitychange', syncHeroPlayback);

    const heroObserver = new IntersectionObserver((entries) => {
      isVisible = entries.some((entry) => entry.isIntersecting);
      syncHeroPlayback();
    }, { threshold: 0.15 });
    heroObserver.observe(heroWrapper);
  }

  /* ---- Homepage proof sequence ---- */
  const comparisonSection = document.getElementById('compare');
  const partnersSection = document.getElementById('partners');
  const spiderLightbox = document.getElementById('spider-lightbox');
  if (comparisonSection && partnersSection && spiderLightbox) {
    spiderLightbox.insertAdjacentElement('afterend', comparisonSection);
    comparisonSection.insertAdjacentElement('afterend', partnersSection);
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
  const gallerySlides = galleryTrack ? galleryTrack.querySelectorAll('.gallery-slide') : [];
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
    const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
    const lightboxNextBtn = document.getElementById('lightbox-next-btn');

    let currentLightboxIdx = 0;
    let isLightboxOpen = false;

    const allGalleryImages = Array.from(gallerySlides).map(slide => {
      const img = slide.querySelector('img');
      return {
        src: img ? img.src : '',
        alt: img ? img.alt : ''
      };
    }).filter(item => item.src);

    function updateLightboxContent(idx) {
      if (allGalleryImages.length === 0) return;
      currentLightboxIdx = (idx + allGalleryImages.length) % allGalleryImages.length;
      const item = allGalleryImages[currentLightboxIdx];
      if (lightboxImg) {
        lightboxImg.src = item.src;
        lightboxImg.alt = item.alt;
      }
      if (lightboxCaption) {
        lightboxCaption.textContent = item.alt;
      }
    }

    function openLightbox(idxOrSrc) {
      if (!lightbox || !lightboxImg) return;
      
      let targetIdx = 0;
      if (typeof idxOrSrc === 'number') {
        targetIdx = idxOrSrc;
      } else {
        const foundIdx = allGalleryImages.findIndex(item => item.src === idxOrSrc);
        targetIdx = foundIdx !== -1 ? foundIdx : 0;
      }
      
      updateLightboxContent(targetIdx);
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

    function nextLightboxImg() {
      updateLightboxContent(currentLightboxIdx + 1);
    }

    function prevLightboxImg() {
      updateLightboxContent(currentLightboxIdx - 1);
    }

    if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextLightboxImg(); });
    if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevLightboxImg(); });

    document.addEventListener('keydown', (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextLightboxImg();
      if (e.key === 'ArrowLeft') prevLightboxImg();
    });

    if (lightbox) {
      let lbTouchStart = 0;
      let lbTouchEnd = 0;

      lightbox.addEventListener('touchstart', (e) => {
        lbTouchStart = e.changedTouches[0].screenX;
      }, { passive: true });

      lightbox.addEventListener('touchend', (e) => {
        lbTouchEnd = e.changedTouches[0].screenX;
        const diff = lbTouchEnd - lbTouchStart;
        if (diff < -35) nextLightboxImg();
        else if (diff > 35) prevLightboxImg();
      }, { passive: true });
    }

    gallerySlides.forEach((slide, idx) => {
      slide.addEventListener('click', () => {
        if (slide.classList.contains('slide-center')) {
          openLightbox(idx);
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
  const spiderSlides = spiderCarouselTrack ? spiderCarouselTrack.querySelectorAll('.gallery-slide') : [];
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
        dot.className = `gallery-dot ${idx === 0 ? 'active' : ''}`;
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
        slide.classList.remove('slide-center', 'slide-left', 'slide-right', 'slide-far-left', 'slide-far-right');

        let diff = idx - spiderIndex;
        if (diff < -Math.floor(totalSpiderSlides / 2)) diff += totalSpiderSlides;
        if (diff > Math.floor(totalSpiderSlides / 2)) diff -= totalSpiderSlides;

        if (diff === 0) {
          slide.classList.add('slide-center');
        } else if (diff === -1 || (spiderIndex === 0 && idx === totalSpiderSlides - 1)) {
          slide.classList.add('slide-left');
        } else if (diff === 1 || (spiderIndex === totalSpiderSlides - 1 && idx === 0)) {
          slide.classList.add('slide-right');
        } else if (diff < -1) {
          slide.classList.add('slide-far-left');
        } else {
          slide.classList.add('slide-far-right');
        }
      });

      if (spiderDotsContainer) {
        const dots = spiderDotsContainer.querySelectorAll('.gallery-dot');
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

    /* ---- Dedicated Spider Ag Lightbox (completely separate from gallery) ---- */
    const spiderLightbox = document.getElementById('spider-lightbox');
    const spiderLbOverlay = document.getElementById('spider-lightbox-overlay');
    const spiderLbClose = document.getElementById('spider-lightbox-close');
    const spiderLbImg = document.getElementById('spider-lightbox-img');
    const spiderLbCaption = document.getElementById('spider-lightbox-caption');
    const spiderLbPrev = document.getElementById('spider-lightbox-prev');
    const spiderLbNext = document.getElementById('spider-lightbox-next');

    let spiderLbIdx = 0;
    let isSpiderLbOpen = false;

    const spiderImages = Array.from(spiderSlides).map(slide => {
      const img = slide.querySelector('img');
      return { src: img ? img.src : '', alt: img ? img.alt : '' };
    }).filter(item => item.src);

    function updateSpiderLb(idx) {
      if (spiderImages.length === 0) return;
      spiderLbIdx = (idx + spiderImages.length) % spiderImages.length;
      const item = spiderImages[spiderLbIdx];
      if (spiderLbImg) { spiderLbImg.src = item.src; spiderLbImg.alt = item.alt; }
      if (spiderLbCaption) spiderLbCaption.textContent = item.alt;
    }

    function openSpiderLb(idx) {
      if (!spiderLightbox || !spiderLbImg) return;
      updateSpiderLb(idx);
      spiderLightbox.classList.add('is-open');
      spiderLightbox.setAttribute('aria-hidden', 'false');
      isSpiderLbOpen = true;
      stopSpiderTimer();
    }

    function closeSpiderLb() {
      if (!spiderLightbox) return;
      spiderLightbox.classList.remove('is-open');
      spiderLightbox.setAttribute('aria-hidden', 'true');
      isSpiderLbOpen = false;
      startSpiderTimer();
    }

    if (spiderLbOverlay) spiderLbOverlay.addEventListener('click', closeSpiderLb);
    if (spiderLbClose) spiderLbClose.addEventListener('click', closeSpiderLb);
    if (spiderLbNext) spiderLbNext.addEventListener('click', (e) => { e.stopPropagation(); updateSpiderLb(spiderLbIdx + 1); });
    if (spiderLbPrev) spiderLbPrev.addEventListener('click', (e) => { e.stopPropagation(); updateSpiderLb(spiderLbIdx - 1); });

    document.addEventListener('keydown', (e) => {
      if (!isSpiderLbOpen) return;
      if (e.key === 'Escape') closeSpiderLb();
      if (e.key === 'ArrowRight') updateSpiderLb(spiderLbIdx + 1);
      if (e.key === 'ArrowLeft') updateSpiderLb(spiderLbIdx - 1);
    });

    if (spiderLightbox) {
      let sTouchStart = 0;
      spiderLightbox.addEventListener('touchstart', (e) => { sTouchStart = e.changedTouches[0].screenX; }, { passive: true });
      spiderLightbox.addEventListener('touchend', (e) => {
        const diff = e.changedTouches[0].screenX - sTouchStart;
        if (diff < -35) updateSpiderLb(spiderLbIdx + 1);
        else if (diff > 35) updateSpiderLb(spiderLbIdx - 1);
      }, { passive: true });
    }

    spiderSlides.forEach((slide, idx) => {
      slide.addEventListener('click', () => {
        if (slide.classList.contains('slide-center')) {
          openSpiderLb(idx);
        } else if (slide.classList.contains('slide-left')) {
          prevSpiderSlide();
          resetSpiderTimer();
        } else if (slide.classList.contains('slide-right')) {
          nextSpiderSlide();
          resetSpiderTimer();
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

  /* ---- Prezi-Style Interactive Infographic Controller ---- */
  const preziPins = document.querySelectorAll('.prezi-pin');
  const preziCanvas = document.getElementById('prezi-canvas');
  const preziCardOverlay = document.getElementById('prezi-card-overlay');
  const preziCardClose = document.getElementById('prezi-card-close');
  const preziResetBtn = document.getElementById('prezi-reset-view');
  const preziPrevPin = document.getElementById('prezi-prev-pin');
  const preziNextPin = document.getElementById('prezi-next-pin');
  const preziMobileInsights = document.querySelectorAll('[data-prezi-mobile-pin]');

  const preziImg = document.getElementById('prezi-card-img');
  const preziTag = document.getElementById('prezi-step-tag');
  const preziTitle = document.getElementById('prezi-card-title');
  const preziDesc = document.getElementById('prezi-card-desc');
  const preziProgress = document.getElementById('prezi-card-progress');

  const infographicData = {
    1: {
      step: 'Field Records',
      title: 'Trace Records Back to Each Field',
      desc: 'Keep dated tasks, input records, and receipts linked to the field they belong to, so you can find the record behind each activity.',
      img: '/assets/infographic/pin1_earnings.png',
      origin: { x: 46.05, y: 42.30 }
    },
    2: {
      step: 'Farm Organization',
      title: 'Built Around Your Farm',
      desc: 'Organize notes, photos, and paper logs by farm, field, plot, and subplot, using the names and boundaries you already know.',
      img: '/assets/infographic/pin2_connected.png',
      origin: { x: 84.03, y: 71.73 }
    },
    3: {
      step: 'Field Diary & Story',
      title: 'Preserve the Story Behind the Numbers',
      desc: 'Say what happened in the field and turn it into a dated task. Review and confirm the details, keeping the context behind the record.',
      img: '/assets/infographic/pin3_story.png',
      origin: { x: 68.18, y: 24.20 }
    },
    4: {
      step: 'Field Observations',
      title: 'Record What You See in the Field',
      desc: 'Record field conditions in a voice note or photo, even offline. Sync when connected, then review and confirm the captured details.',
      img: '/assets/infographic/pin4_truth.png',
      origin: { x: 17.00, y: 17.60 }
    },
    5: {
      step: 'Audit Preparation',
      title: 'Prepare Audit-Ready Records',
      desc: 'Find records linked to your land, select a NOP template, and generate a report. Review and confirm the details before your certification review.',
      img: '/assets/infographic/pin5_decisions.png',
      origin: { x: 20.00, y: 75.98 }
    }
  };

  let activePinId = null;

  function activatePreziPin(pinId, scrollToCard = false) {
    const data = infographicData[pinId];
    if (!data) return;

    activePinId = parseInt(pinId, 10);

    preziPins.forEach(p => {
      p.classList.toggle('is-active', parseInt(p.getAttribute('data-pin'), 10) === activePinId);
    });
    preziMobileInsights.forEach(button => {
      button.classList.toggle('is-active', parseInt(button.getAttribute('data-prezi-mobile-pin'), 10) === activePinId);
    });
    if (preziCanvas) {
      preziCanvas.classList.add('has-active-pin');
      preziCanvas.dataset.activePin = activePinId.toString();
    }

    if (preziImg) {
      preziImg.onerror = function() {
        this.onerror = null;
        this.src = `/infographic/${data.img.split('/').pop()}`;
      };
      preziImg.src = data.img;
    }
    if (preziTag) preziTag.textContent = data.step;
    if (preziTitle) preziTitle.textContent = data.title;
    if (preziDesc) preziDesc.textContent = data.desc;
    if (preziProgress) preziProgress.textContent = `${activePinId} of 5`;

    if (preziCardOverlay) {
      preziCardOverlay.classList.add('is-active');
      preziCardOverlay.setAttribute('aria-hidden', 'false');

      if (scrollToCard && window.matchMedia('(max-width: 768px)').matches) {
        window.requestAnimationFrame(() => {
          preziCardOverlay.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
            block: 'end'
          });
        });
      }
    }
  }

  function resetPreziView() {
    activePinId = null;
    preziPins.forEach(p => p.classList.remove('is-active'));
    preziMobileInsights.forEach(button => button.classList.remove('is-active'));
    if (preziCanvas) {
      preziCanvas.classList.remove('has-active-pin');
      delete preziCanvas.dataset.activePin;
    }
    if (preziCardOverlay) {
      preziCardOverlay.classList.remove('is-active');
      preziCardOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  preziPins.forEach(pin => {
    const pinId = pin.getAttribute('data-pin');

    // Open a detail card only on an intentional selection.
    pin.addEventListener('click', (e) => {
      e.stopPropagation();
      activatePreziPin(pinId, true);
    });
  });

  preziMobileInsights.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      activatePreziPin(button.getAttribute('data-prezi-mobile-pin'), true);
    });
  });

  // Card Close & Reset View Buttons
  if (preziCardClose) {
    preziCardClose.addEventListener('click', (e) => {
      e.stopPropagation();
      resetPreziView();
    });
  }

  if (preziResetBtn) {
    preziResetBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resetPreziView();
    });
  }

  // Skip Map Button
  const preziSkipMap = document.getElementById('prezi-skip-map');
  if (preziSkipMap) {
    preziSkipMap.addEventListener('click', (e) => {
      e.stopPropagation();
      resetPreziView();
      const nextSec = document.getElementById('partner-to-profit') || document.getElementById('onboarding');
      if (nextSec) {
        nextSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Prev Node Button
  if (preziPrevPin) {
    preziPrevPin.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!activePinId) return activatePreziPin(1);
      let prevId = activePinId - 1;
      if (prevId < 1) prevId = 5;
      activatePreziPin(prevId);
    });
  }

  // Next Node Button
  if (preziNextPin) {
    preziNextPin.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!activePinId) return activatePreziPin(1);
      let nextId = activePinId + 1;
      if (nextId > 5) nextId = 1;
      activatePreziPin(nextId);
    });
  }

  // Dismiss/close active pin card when clicking off of an open node or card tile
  document.addEventListener('click', (e) => {
    if (!activePinId) return;
    
    const preziCard = document.getElementById('prezi-card');
    const isClickInsideCard = preziCard && preziCard.contains(e.target);
    const isClickOnPin = Array.from(preziPins).some(pin => pin.contains(e.target));

    if (!isClickInsideCard && !isClickOnPin) {
      resetPreziView();
    }
  });

  // Touch dismissal support for mobile devices
  document.addEventListener('touchstart', (e) => {
    if (!activePinId) return;

    const preziCard = document.getElementById('prezi-card');
    const targetEl = e.target;
    const isClickInsideCard = preziCard && preziCard.contains(targetEl);
    const isClickOnPin = Array.from(preziPins).some(pin => pin.contains(targetEl));

    if (!isClickInsideCard && !isClickOnPin) {
      resetPreziView();
    }
  }, { passive: true });

  /* ---- Schedule Demo Modal Handler ---- */
  (function setupDemoModal() {
    let modal = document.getElementById('schedule-demo-modal');

    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'schedule-demo-modal';
      modal.className = 'demo-modal-overlay';
      modal.setAttribute('aria-hidden', 'true');
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-labelledby', 'demo-modal-title');
      
      modal.innerHTML = `
        <div class="demo-modal-backdrop" id="demo-modal-backdrop"></div>
        <div class="demo-modal-container">
          <button type="button" class="demo-modal-close" id="demo-modal-close" aria-label="Close Contact Us Modal">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="demo-modal-header">
            <span class="demo-modal-eyebrow">BDIB Solutions</span>
            <h3 id="demo-modal-title" class="demo-modal-title">Contact Us</h3>
            <p class="demo-modal-subtitle">Tell us how you keep farm records today. Ask about voice and photo capture, organizing your farm, or preparing for an audit.</p>
          </div>
          <div class="demo-modal-body">
            <div class="demo-modal-loader" id="demo-modal-loader">
              <div class="spinner"></div>
            </div>
            <iframe id="modal_ziframe_787725" name="modal_ziframe_787725" aria-label="Contact" frameborder="0" style="height:550px;width:100%;border:none;border-radius:12px;" src="https://forms.zohopublic.com/bigdatainaboxinc1/form/Contact/formperma/WYv3jZRHHIv_q55kIAIoiF4ONy8hI17TYppR-AXSo2Y"></iframe>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    const iframe = document.getElementById('modal_ziframe_787725');
    const loader = document.getElementById('demo-modal-loader');
    const closeBtn = document.getElementById('demo-modal-close');
    const backdrop = document.getElementById('demo-modal-backdrop');

    if (iframe && loader) {
      iframe.addEventListener('load', () => {
        loader.style.display = 'none';
      });
    }

    function applyZohoReferrer(frameEl) {
      if (!frameEl) return;
      try {
        var ifrmSrc = frameEl.src;
        if (!((new RegExp("[?&]referrername=")).test(ifrmSrc))) {
          var rfr = window.location.href;
          try {
            rfr = window.self !== window.top ?
              window.top.location.href :
              (/^https?:\/\/[\w.-]+\.[a-zA-Z]{2,}/i.test(rfr) ? rfr : "");
          } catch (e) {}

          if (rfr && rfr !== "") {
            if (rfr.length > 1800) {
              var queryIndex = rfr.indexOf('?');
              if (queryIndex > -1) {
                rfr = rfr.substring(0, queryIndex);
              }
              if (rfr.length > 1800) {
                rfr = rfr.substring(0, 1800);
              }
            }
            ifrmSrc += ((ifrmSrc.indexOf('?') > 0) ? '&' : '?') + 'referrername=' + encodeURIComponent(rfr);
          }
        }
        if (frameEl.src !== ifrmSrc) {
          frameEl.src = ifrmSrc;
        }
      } catch (e) {}
    }

    function openModal() {
      applyZohoReferrer(iframe);
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-open-contact-modal], [data-open-demo-modal], .btn-contact-us, .btn-schedule-demo, .js-open-contact-modal, .js-open-demo-modal');
      if (trigger) {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return;
        e.preventDefault();
        openModal();
      }
    });
  })();
})();
