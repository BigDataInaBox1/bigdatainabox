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
})();
