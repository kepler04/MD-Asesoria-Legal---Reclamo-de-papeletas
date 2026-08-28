(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * Menú móvil
   * ------------------------------------------------------------------ */
  var navToggle = document.getElementById('navToggle');
  var navMenu = document.getElementById('navMenu');

  function closeMenu() {
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
  }

  function openMenu() {
    navMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Cerrar menú');
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = navMenu.classList.contains('is-open');
      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    navMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });

    document.addEventListener('click', function (event) {
      var clickedInsideMenu = navMenu.contains(event.target) || navToggle.contains(event.target);
      if (!clickedInsideMenu && navMenu.classList.contains('is-open')) closeMenu();
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
   * FAQ: al abrir una pregunta, cierra las demás
   * ------------------------------------------------------------------ */
  var faqItems = document.querySelectorAll('.faq__item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

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
