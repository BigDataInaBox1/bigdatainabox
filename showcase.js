/**
 * showcase.js
 * GSAP ScrollTrigger-powered 3D motion showcase for BDIB landing page.
 * Scroll-scrubbed slide-in animations AND smooth lerped video playback.
 */
(function () {
  'use strict';

  function initShowcase() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[Showcase] GSAP or ScrollTrigger not loaded.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    /* ---- Video elements ---- */
    const heroContainer = document.getElementById('hero-video-container');
    const heroVid = heroContainer ? heroContainer.querySelector('video') : null;

    const plotLandVid = document.getElementById('video-plot-land');
    const voiceVid    = document.getElementById('video-voice-memos');
    const uploadVid   = document.getElementById('video-upload-files');

    /* ---- Autoplay hero immediately on load ---- */
    if (heroVid) {
      heroVid.play().catch(err => console.log('Autoplay blocked:', err));
    }

    /* ---- Pause hero video when it scrolls off screen ---- */
    if (heroVid && heroContainer) {
      ScrollTrigger.create({
        trigger: '#top',
        start: 'top top',
        end: 'bottom top',
        onLeave: () => heroVid.pause(),
        onEnterBack: () => heroVid.play().catch(() => {}),
      });
    }

    /* ============================================================
       SMOOTH VIDEO SCRUB UTILITY
       Uses a rAF loop with lerp to smoothly glide video.currentTime
       toward the target progress. Avoids seek overload by checking
       video.seeking before issuing a new seek.
       ============================================================ */
    function createSmoothScrubber(video, reversed) {
      let targetProgress = 0;
      let currentProgress = reversed ? 1 : 0;
      let running = false;

      function tick() {
        if (video.duration && !isNaN(video.duration)) {
          currentProgress += (targetProgress - currentProgress) * 0.1;

          const t = reversed
            ? (1 - currentProgress) * video.duration
            : currentProgress * video.duration;

          if (!video.seeking && Math.abs(video.currentTime - t) > 0.01) {
            video.currentTime = Math.max(0, Math.min(video.duration - 0.01, t));
          }
        }
        requestAnimationFrame(tick);
      }

      return {
        /** Called by ScrollTrigger onUpdate with progress 0→1 */
        update: function (progress) {
          targetProgress = progress;
          if (!running) {
            running = true;
            // Start rAF loop on first call
            if (video.readyState >= 1) {
              requestAnimationFrame(tick);
            } else {
              video.addEventListener('loadedmetadata', () => requestAnimationFrame(tick), { once: true });
            }
          }
        }
      };
    }



    /* ============================================================
       3. PLOT YOUR LAND — Scroll-scrubbed slide + video
          Text LEFT ←  |  Video RIGHT →
       ============================================================ */
    if (plotLandVid) {
      plotLandVid.loop = false;
      plotLandVid.pause();

      const plotLandMedia = plotLandVid.closest('.showcase-media-col');
      const plotLandText  = document.querySelector('#row-plot-land .showcase-text-col');
      const scrubber      = createSmoothScrubber(plotLandVid, false);

      // Slide-in: video from right
      gsap.fromTo(plotLandMedia,
        { xPercent: 80, opacity: 0 },
        { xPercent: 0, opacity: 1, ease: 'none',
          scrollTrigger: {
            trigger: '#row-plot-land',
            start: 'top bottom',
            end: 'center center',
            scrub: 1,
          }
        }
      );

      // Slide-in: text from left
      if (plotLandText) {
        gsap.fromTo(plotLandText,
          { xPercent: -80, opacity: 0 },
          { xPercent: 0, opacity: 1, ease: 'none',
            scrollTrigger: {
              trigger: '#row-plot-land',
              start: 'top bottom',
              end: 'center center',
              scrub: 1,
            }
          }
        );
      }

      // Video scrub (separate ScrollTrigger so onUpdate is guaranteed)
      ScrollTrigger.create({
        trigger: '#row-plot-land',
        start: 'top bottom',
        end: 'center center',
        onUpdate: (self) => scrubber.update(self.progress),
      });
    }

    /* ============================================================
       4. VOICE MEMOS — Scroll-scrubbed slide + reversed video
          Video LEFT ←  |  Text RIGHT →
       ============================================================ */
    if (voiceVid) {
      voiceVid.loop = false;
      voiceVid.pause();

      const voiceMedia = voiceVid.closest('.showcase-media-col');
      const voiceText  = document.querySelector('#row-voice-memos .showcase-text-col');
      const scrubber   = createSmoothScrubber(voiceVid, true);

      // Slide-in: video from left
      gsap.fromTo(voiceMedia,
        { xPercent: -80, opacity: 0 },
        { xPercent: 0, opacity: 1, ease: 'none',
          scrollTrigger: {
            trigger: '#row-voice-memos',
            start: 'top bottom',
            end: 'center center',
            scrub: 1,
          }
        }
      );

      // Slide-in: text from right
      if (voiceText) {
        gsap.fromTo(voiceText,
          { xPercent: 80, opacity: 0 },
          { xPercent: 0, opacity: 1, ease: 'none',
            scrollTrigger: {
              trigger: '#row-voice-memos',
              start: 'top bottom',
              end: 'center center',
              scrub: 1,
            }
          }
        );
      }

      ScrollTrigger.create({
        trigger: '#row-voice-memos',
        start: 'top bottom',
        end: 'center center',
        onUpdate: (self) => scrubber.update(self.progress),
      });
    }

    /* ============================================================
       5. UPLOAD FILES — Scroll-scrubbed slide + reversed video
          Text LEFT ←  |  Video RIGHT →
       ============================================================ */
    if (uploadVid) {
      uploadVid.loop = false;
      uploadVid.pause();

      const uploadMedia = uploadVid.closest('.showcase-media-col');
      const uploadText  = document.querySelector('#row-upload-files .showcase-text-col');
      const scrubber    = createSmoothScrubber(uploadVid, true);

      // Slide-in: video from right
      gsap.fromTo(uploadMedia,
        { xPercent: 80, opacity: 0 },
        { xPercent: 0, opacity: 1, ease: 'none',
          scrollTrigger: {
            trigger: '#row-upload-files',
            start: 'top bottom',
            end: 'center center',
            scrub: 1,
          }
        }
      );

      // Slide-in: text from left
      if (uploadText) {
        gsap.fromTo(uploadText,
          { xPercent: -80, opacity: 0 },
          { xPercent: 0, opacity: 1, ease: 'none',
            scrollTrigger: {
              trigger: '#row-upload-files',
              start: 'top bottom',
              end: 'center center',
              scrub: 1,
            }
          }
        );
      }

      ScrollTrigger.create({
        trigger: '#row-upload-files',
        start: 'top bottom',
        end: 'center center',
        onUpdate: (self) => scrubber.update(self.progress),
      });
    }
  }

  /* ---- Boot ---- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShowcase);
  } else {
    initShowcase();
  }
})();
