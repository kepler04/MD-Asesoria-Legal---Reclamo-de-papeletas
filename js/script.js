(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * Menú a pantalla completa: dos botones (nav del hero y nav fijo)
   * abren el mismo panel.
   * ------------------------------------------------------------------ */
  var siteMenu = document.getElementById('siteMenu');
  var siteMenuClose = document.getElementById('siteMenuClose');
  var menuToggles = Array.prototype.slice.call(document.querySelectorAll('#navToggle, #compactNavToggle'));
  var lastMenuTrigger = null;

  function closeSiteMenu() {
    if (!siteMenu.classList.contains('is-open')) return;
    siteMenu.classList.remove('is-open');
    document.body.classList.remove('site-menu-open');
    menuToggles.forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'Abrir menú');
    });
    if (lastMenuTrigger) lastMenuTrigger.focus();
  }

  function openSiteMenu(trigger) {
    lastMenuTrigger = trigger || null;
    siteMenu.classList.add('is-open');
    document.body.classList.add('site-menu-open');
    menuToggles.forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'Cerrar menú');
    });
    if (siteMenuClose) siteMenuClose.focus();
  }

  if (siteMenu && menuToggles.length) {
    menuToggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var isOpen = siteMenu.classList.contains('is-open');
        if (isOpen) {
          closeSiteMenu();
        } else {
          openSiteMenu(btn);
        }
      });
    });

    if (siteMenuClose) siteMenuClose.addEventListener('click', closeSiteMenu);

    siteMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeSiteMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && siteMenu.classList.contains('is-open')) closeSiteMenu();
    });
  }

  /* ------------------------------------------------------------------
   * Carrusel del hero: rota entre 3 mensajes reales del estudio
   * ------------------------------------------------------------------ */
  var heroSlides = [
    {
      eyebrow: 'Multas de tránsito',
      line1: 'RECLAMO DE',
      line2: 'PAPELETAS',
      subhead: 'Defendemos tus derechos, protegemos tu tiempo y tu bolsillo.'
    },
    {
      eyebrow: 'Licencia de conducir',
      line1: 'PROTEGE TU',
      line2: 'LICENCIA',
      subhead: 'Casos por infracción M01, M04 o acumulación de puntos'
    },
    {
      eyebrow: 'Modalidad actual',
      line1: 'ATENCIÓN',
      line2: '100% VIRTUAL',
      subhead: 'Resuelve tu caso sin salir de casa mientras remodelamos el local'
    }
  ];

  var heroEyebrow = document.getElementById('heroEyebrow');
  var heroLine1 = document.getElementById('heroLine1');
  var heroLine2 = document.getElementById('heroLine2');
  var heroSubhead = document.getElementById('heroSubhead');
  var heroDotsWrap = document.getElementById('heroDots');

  if (heroEyebrow && heroDotsWrap) {
    var currentSlide = 0;
    var autoplayTimer = null;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var dotButtons = [];

    function renderSlide(index) {
      var slide = heroSlides[index];
      heroEyebrow.textContent = slide.eyebrow;
      heroLine1.textContent = slide.line1;
      heroLine2.textContent = slide.line2;
      heroSubhead.textContent = slide.subhead;

      dotButtons.forEach(function (dot, i) {
        var active = i === index;
        dot.classList.toggle('hero__dot--active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    function goToSlide(index) {
      currentSlide = index;
      renderSlide(currentSlide);
    }

    function nextSlide() {
      goToSlide((currentSlide + 1) % heroSlides.length);
    }

    heroSlides.forEach(function (slide, index) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'hero__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', 'Ver mensaje ' + (index + 1) + ' de ' + heroSlides.length);
      dot.addEventListener('click', function () {
        goToSlide(index);
        resetAutoplay();
      });
      heroDotsWrap.appendChild(dot);
      dotButtons.push(dot);
    });

    function startAutoplay() {
      if (prefersReducedMotion) return;
      autoplayTimer = window.setInterval(nextSlide, 5500);
    }

    function resetAutoplay() {
      if (autoplayTimer) window.clearInterval(autoplayTimer);
      startAutoplay();
    }

    renderSlide(currentSlide);
    startAutoplay();
  }

  /* ------------------------------------------------------------------
   * FAQ: acordeón animado (una sola pregunta abierta a la vez)
   * ------------------------------------------------------------------ */
  var faqItems = document.querySelectorAll('.faq__item');
  var faqReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (faqReducedMotion || typeof Element.prototype.animate !== 'function') {
    faqItems.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        faqItems.forEach(function (other) {
          if (other !== item) other.open = false;
        });
      });
    });
  } else {
    faqItems.forEach(function (item) {
      item.dataset.animating = '';
      var summary = item.querySelector('summary');

      summary.addEventListener('click', function (event) {
        event.preventDefault();
        if (item.dataset.animating === 'true') return;

        if (item.open) {
          closeFaqItem(item);
        } else {
          faqItems.forEach(function (other) {
            if (other !== item && other.open) closeFaqItem(other);
          });
          openFaqItem(item);
        }
      });
    });
  }

  function openFaqItem(item) {
    item.style.overflow = 'hidden';
    var summaryHeight = item.querySelector('summary').offsetHeight;
    item.open = true;
    var fullHeight = item.scrollHeight;
    item.style.height = summaryHeight + 'px';
    runFaqAnimation(item, summaryHeight, fullHeight, true);
  }

  function closeFaqItem(item) {
    item.style.overflow = 'hidden';
    var startHeight = item.offsetHeight;
    var summaryHeight = item.querySelector('summary').offsetHeight;
    runFaqAnimation(item, startHeight, summaryHeight, false);
  }

  function runFaqAnimation(item, from, to, opening) {
    if (item._faqAnim) item._faqAnim.cancel();
    item.dataset.animating = 'true';
    var anim = item.animate(
      { height: [from + 'px', to + 'px'] },
      { duration: 240, easing: 'ease' }
    );
    item._faqAnim = anim;
    anim.onfinish = function () {
      item._faqAnim = null;
      item.style.height = '';
      item.style.overflow = '';
      item.dataset.animating = '';
      if (!opening) item.open = false;
    };
    anim.oncancel = function () {
      item._faqAnim = null;
      item.dataset.animating = '';
    };
  }

  /* ------------------------------------------------------------------
   * Nav fijo: aparece al bajar, para no perder acceso a la navegación
   * ------------------------------------------------------------------ */
  var compactNav = document.getElementById('compactNav');
  var heroWrap = document.querySelector('.hero-wrap');

  if (compactNav && heroWrap) {
    var compactNavThreshold = 0;

    function updateCompactNavThreshold() {
      var rect = heroWrap.getBoundingClientRect();
      compactNavThreshold = window.scrollY + rect.bottom - 100;
    }

    updateCompactNavThreshold();
    window.addEventListener('resize', updateCompactNavThreshold);

    var compactNavTicking = false;
    function onCompactNavScroll() {
      if (compactNavTicking) return;
      compactNavTicking = true;
      window.requestAnimationFrame(function () {
        compactNav.classList.toggle('compact-nav--visible', window.scrollY > compactNavThreshold);
        compactNavTicking = false;
      });
    }

    window.addEventListener('scroll', onCompactNavScroll, { passive: true });
    onCompactNavScroll();
  }

  /* ------------------------------------------------------------------
   * Procedimiento: mientras nadie interactúa, el riel se reproduce solo
   * en bucle (recorre los 4 pasos, se mantiene 5s en el último y
   * reinicia) — pensado para móvil, donde no existe hover. En equipos
   * con mouse, pasar el cursor sobre un paso lo activa al instante. En
   * cualquier dispositivo, tocar/clickear un paso toma el control y
   * detiene el bucle automático.
   * ------------------------------------------------------------------ */
  var processRail = document.querySelector('.process__rail-wrap');
  if (processRail) {
    var processReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var processHoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var processSteps = Array.prototype.slice.call(processRail.querySelectorAll('.process__step'));
    var processSegments = Array.prototype.slice.call(processRail.querySelectorAll('.process__rail-segment'));
    var processTimers = [];
    var processInteracted = false;
    var processVisible = false;

    function applyProcessStep(targetIndex) {
      processSteps.forEach(function (step, index) {
        step.classList.toggle('is-lit', index < targetIndex);
        step.classList.toggle('is-active', index === targetIndex);
      });
      processSegments.forEach(function (segment, index) {
        segment.classList.toggle('is-lit', index < targetIndex);
      });
    }

    function clearProcessTimers() {
      processTimers.forEach(function (id) { window.clearTimeout(id); });
      processTimers = [];
    }

    // Recorre los 4 pasos y, si se le pasa onComplete, lo llama tras
    // mantenerse ~5s en el último paso (para encadenar el bucle).
    function playProcessSequence(onComplete) {
      processSteps.forEach(function (step, index) {
        var id = window.setTimeout(function () {
          applyProcessStep(index);
        }, 350 + index * 320);
        processTimers.push(id);
      });
      if (onComplete) {
        var holdUntil = 350 + (processSteps.length - 1) * 320 + 5000;
        var id2 = window.setTimeout(onComplete, holdUntil);
        processTimers.push(id2);
      }
    }

    function runAutoplayLoop() {
      if (processReducedMotion || processInteracted || !processVisible) return;
      playProcessSequence(function () {
        if (processReducedMotion || processInteracted || !processVisible) return;
        applyProcessStep(-1);
        var id = window.setTimeout(runAutoplayLoop, 450);
        processTimers.push(id);
      });
    }

    // Llamado por hover/clic/teclado: toma el control manual y detiene
    // el bucle automático para siempre (en esta carga de página).
    function setProcessStep(targetIndex) {
      processInteracted = true;
      clearProcessTimers();
      applyProcessStep(targetIndex);
    }

    if (processHoverCapable) {
      processSteps.forEach(function (step, index) {
        step.addEventListener('mouseenter', function () { setProcessStep(index); });
      });
    }

    processSteps.forEach(function (step, index) {
      step.setAttribute('tabindex', '0');
      step.setAttribute('role', 'button');
      step.setAttribute('aria-label', 'Ver paso ' + (index + 1) + ' de ' + processSteps.length);

      step.addEventListener('click', function () { setProcessStep(index); });
      step.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setProcessStep(index);
        }
      });
    });

    if ('IntersectionObserver' in window) {
      var processObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          processVisible = entry.isIntersecting;
          if (processVisible) {
            if (processReducedMotion) {
              applyProcessStep(processSteps.length - 1);
            } else if (!processInteracted) {
              runAutoplayLoop();
            }
          } else {
            clearProcessTimers();
          }
        });
      }, { threshold: 0.35 });
      processObserver.observe(processRail);
    } else {
      processVisible = true;
      if (processReducedMotion) {
        applyProcessStep(processSteps.length - 1);
      } else {
        runAutoplayLoop();
      }
    }
  }

  /* ------------------------------------------------------------------
   * Revelado al hacer scroll: las secciones aparecen con un fade + subida
   * suave la primera vez que entran en pantalla.
   * ------------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('[data-reveal]');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealEls.length) {
    if (reducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var groupCounts = {};
      revealEls.forEach(function (el) {
        var group = el.getAttribute('data-reveal-group');
        if (!group) return;
        groupCounts[group] = groupCounts[group] || 0;
        el.style.transitionDelay = (groupCounts[group] * 90) + 'ms';
        groupCounts[group] += 1;
      });

      var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  /* ------------------------------------------------------------------
   * Menú: resalta el link de la sección que se está viendo (scrollspy)
   * ------------------------------------------------------------------ */
  var trackedSections = document.querySelectorAll('main [id], .hero[id]');
  var navLinks = document.querySelectorAll('.navbar__link');

  if (trackedSections.length && navLinks.length && 'IntersectionObserver' in window) {
    var linkBySectionId = {};
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.charAt(0) === '#') linkBySectionId[href.slice(1)] = link;
    });

    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = linkBySectionId[entry.target.id];
        if (!link || !entry.isIntersecting) return;
        navLinks.forEach(function (l) { l.classList.remove('navbar__link--active'); });
        link.classList.add('navbar__link--active');
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    trackedSections.forEach(function (section) { spyObserver.observe(section); });
  }
})();
