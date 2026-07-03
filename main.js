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
})();
