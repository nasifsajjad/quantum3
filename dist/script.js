(() => {
  'use strict';

  const doc = document;
  const body = doc.body;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const menuButton = doc.querySelector('[data-menu-button]');
  const menuPanel = doc.querySelector('[data-menu-panel]');

  const closeMenu = () => {
    if (!menuButton || !menuPanel) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    menuPanel.classList.remove('is-open');
    menuPanel.setAttribute('aria-hidden', 'true');
    body.classList.remove('menu-open');
  };

  if (menuButton && menuPanel) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', String(!open));
      menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      menuPanel.classList.toggle('is-open', !open);
      menuPanel.setAttribute('aria-hidden', String(open));
      body.classList.toggle('menu-open', !open);
    });

    menuPanel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    doc.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
  }

  const activateTabs = (rootSelector, tabSelector, panelSelector, name) => {
    const root = doc.querySelector(rootSelector);
    if (!root) return;

    const tabs = [...root.querySelectorAll(tabSelector)];
    const panels = [...root.querySelectorAll(panelSelector)];

    const activate = (key, focus = false) => {
      tabs.forEach((tab) => {
        const selected = tab.dataset[name + 'Tab'] === key;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected && focus) tab.focus();
      });

      panels.forEach((panel) => {
        const selected = panel.dataset[name + 'Panel'] === key;
        panel.hidden = !selected;
        panel.classList.toggle('is-active', selected);
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(tab.dataset[name + 'Tab']));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        activate(tabs[next].dataset[name + 'Tab'], true);
      });
    });

    return { root, tabs, panels, activate };
  };

  activateTabs('[data-expertise]', '[data-expertise-tab]', '[data-expertise-panel]', 'expertise');

  const systems = activateTabs('[data-systems]', '[data-system-tab]', '[data-system-panel]', 'system');
  const systemProgress = doc.querySelector('[data-system-progress]');
  let systemIndex = 0;
  let systemTimer = null;
  let systemsInView = false;
  let systemsPaused = false;

  const restartProgress = () => {
    if (!systemProgress || reduceMotion || systemsPaused || !systemsInView) return;
    systemProgress.classList.remove('is-running');
    void systemProgress.offsetWidth;
    systemProgress.classList.add('is-running');
  };

  const selectSystem = (index, userInitiated = false) => {
    if (!systems) return;
    systemIndex = (index + systems.tabs.length) % systems.tabs.length;
    systems.activate(systems.tabs[systemIndex].dataset.systemTab);
    if (userInitiated) systemsPaused = true;
    restartProgress();
  };

  if (systems) {
    systems.tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectSystem(index, true));
      tab.addEventListener('focus', () => {
        if (tab.matches(':focus-visible')) systemsPaused = true;
      });
    });

    if (!reduceMotion) {
      const systemsObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          systemsInView = entry.isIntersecting && entry.intersectionRatio > 0.28;
          if (systemsInView && !systemsPaused) {
            restartProgress();
            clearInterval(systemTimer);
            systemTimer = setInterval(() => selectSystem(systemIndex + 1), 6000);
          } else {
            clearInterval(systemTimer);
            systemProgress?.classList.remove('is-running');
          }
        });
      }, { threshold: [0, 0.28, 0.6] });
      systemsObserver.observe(systems.root);
    }
  }

  const faqItems = [...doc.querySelectorAll('.faq-item')];
  faqItems.forEach((item) => {
    const button = item.querySelector('button');
    if (!button) return;
    button.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      faqItems.forEach((other) => {
        other.classList.remove('is-open');
        other.querySelector('button')?.setAttribute('aria-expanded', 'false');
      });
      if (willOpen) {
        item.classList.add('is-open');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });

  const revealTargets = [...doc.querySelectorAll('.reveal, .reveal-group')];
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.13, rootMargin: '0px 0px -7% 0px' });
    revealTargets.forEach((target) => revealObserver.observe(target));
  }

  const parallaxItems = [...doc.querySelectorAll('[data-parallax]')];
  let parallaxFrame = 0;

  const updateParallax = () => {
    parallaxFrame = 0;
    if (reduceMotion || window.innerWidth < 760) return;
    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
      const speed = Number(item.dataset.parallax || 0);
      const offset = (rect.top + rect.height * 0.5 - window.innerHeight * 0.5) * speed;
      item.style.transform = 'translate3d(0,' + offset.toFixed(2) + 'px,0)';
    });
  };

  const requestParallax = () => {
    if (parallaxFrame) return;
    parallaxFrame = requestAnimationFrame(updateParallax);
  };

  if (!reduceMotion) {
    window.addEventListener('scroll', requestParallax, { passive: true });
    window.addEventListener('resize', requestParallax);
    requestParallax();
  }

  const header = doc.querySelector('[data-header]');
  let lastScroll = window.scrollY;
  let headerFrame = 0;

  const updateHeader = () => {
    headerFrame = 0;
    if (!header) return;
    const current = window.scrollY;
    header.classList.toggle('is-scrolled', current > 24);
    if (window.innerWidth > 1100 && current > 700 && current > lastScroll + 10) {
      header.classList.add('is-hidden');
    } else if (current < lastScroll - 8 || current < 700) {
      header.classList.remove('is-hidden');
    }
    lastScroll = current;
  };

  window.addEventListener('scroll', () => {
    if (!headerFrame) headerFrame = requestAnimationFrame(updateHeader);
  }, { passive: true });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1100) closeMenu();
    header?.classList.remove('is-hidden');
  });

  doc.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = doc.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  });

  const year = doc.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
