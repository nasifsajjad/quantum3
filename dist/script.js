(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('.scroll-progress span');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');

  const updateScrollUI = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header?.classList.toggle('is-scrolled', y > 20);
    if (progress) progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  };

  updateScrollUI();
  window.addEventListener('scroll', updateScrollUI, { passive: true });

  const setMenu = (open) => {
    menuButton?.setAttribute('aria-expanded', String(open));
    mobileMenu?.setAttribute('aria-hidden', String(!open));
    mobileMenu?.classList.toggle('is-open', open);
    header?.classList.toggle('menu-active', open);
    document.body.classList.toggle('menu-open', open);
  };

  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton?.getAttribute('aria-expanded') === 'true') setMenu(false);
  });

  document.querySelectorAll('[data-delay]').forEach((element) => {
    element.style.setProperty('--delay', `${element.dataset.delay}ms`);
  });

  if (reduceMotion) {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  }

  const expertiseData = {
    build: {
      kicker: 'Custom software',
      title: 'Software shaped around your organisation.',
      copy: 'Custom software development for business needs that off-the-shelf tools do not address cleanly.',
      links: ['Custom software development', 'Cloud-based solutions', 'Business-focused delivery']
    },
    intelligence: {
      kicker: 'Applied intelligence',
      title: 'AI that supports useful work.',
      copy: 'Business-focused AI solutions and practical AI-related support, explained clearly and applied with purpose.',
      links: ['AI solutions', 'AI support', 'Business process intelligence']
    },
    operate: {
      kicker: 'Operational systems',
      title: 'The essential systems, working together.',
      copy: 'Cloud-first software for finance, people, healthcare, education and sales operations under one capable provider.',
      links: ['ERP & accounting', 'HR management', 'Hospital & school systems']
    }
  };

  const expertisePanel = document.querySelector('.expertise-panel');
  const updateExpertise = (key) => {
    const data = expertiseData[key];
    if (!data || !expertisePanel) return;
    expertisePanel.animate?.([
      { opacity: .55, transform: 'translateY(8px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: reduceMotion ? 1 : 360, easing: 'cubic-bezier(.2,.75,.2,1)' });
    expertisePanel.querySelector('[data-expertise-kicker]').textContent = data.kicker;
    expertisePanel.querySelector('[data-expertise-title]').textContent = data.title;
    expertisePanel.querySelector('[data-expertise-copy]').textContent = data.copy;
    expertisePanel.querySelector('[data-expertise-links]').innerHTML = data.links.map((item) => `<span>${item}</span>`).join('');
  };

  document.querySelectorAll('.expertise-tab').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.expertise-tab').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      updateExpertise(button.dataset.expertise);
    });
  });

  const systemData = {
    erp: {
      kicker: 'FINANCE / OVERVIEW', title: 'Business at a glance', chart: 'Cash flow', list: 'Recent activity',
      kpis: [['Cash position','Clear','74%'],['Receivables','Tracked','58%'],['Stock status','Current','86%']],
      rows: [['Invoice issued','Today'],['Supplier payment','Today'],['Stock movement','Yesterday'],['Bank transaction','Yesterday']]
    },
    hr: {
      kicker: 'PEOPLE / OVERVIEW', title: 'Your team, organised', chart: 'Attendance', list: 'People updates',
      kpis: [['Employee records','Current','82%'],['Payroll','Prepared','66%'],['Leave','Visible','72%']],
      rows: [['Attendance recorded','Today'],['Leave request','Today'],['Payroll review','This week'],['Employee record','Updated']]
    },
    hospital: {
      kicker: 'CARE / OPERATIONS', title: 'Care operations in view', chart: 'Appointments', list: 'Clinical workflow',
      kpis: [['Patient records','Ready','88%'],['Appointments','Scheduled','70%'],['Billing','Tracked','61%']],
      rows: [['Patient checked in','Now'],['Appointment confirmed','Today'],['Pharmacy request','Today'],['Billing record','Updated']]
    },
    school: {
      kicker: 'CLASSVEEW / SCHOOL', title: 'The school day, connected', chart: 'Attendance', list: 'Academic activity',
      kpis: [['Admissions','Organised','78%'],['Gradebook','Updated','83%'],['Timetable','Published','91%']],
      rows: [['Attendance posted','Today'],['Gradebook updated','Today'],['Timetable change','Tomorrow'],['Parent message','New']]
    }
  };

  const systemWindow = document.querySelector('[data-system-window]');
  const updateSystem = (key) => {
    const data = systemData[key];
    if (!data || !systemWindow) return;
    systemWindow.querySelector('[data-system-kicker]').textContent = data.kicker;
    systemWindow.querySelector('[data-system-title]').textContent = data.title;
    systemWindow.querySelector('[data-chart-label]').textContent = data.chart;
    systemWindow.querySelector('[data-list-label]').textContent = data.list;
    systemWindow.querySelector('[data-system-kpis]').innerHTML = data.kpis.map(([label,value,fill]) => `<article><span>${label}</span><strong>${value}</strong><i style="--fill:${fill}"></i></article>`).join('');
    systemWindow.querySelector('[data-system-list]').innerHTML = data.rows.map(([label,time]) => `<li><b>${label}</b><span>${time}</span></li>`).join('');
    systemWindow.animate?.([
      { opacity: .7, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: reduceMotion ? 1 : 320, easing: 'cubic-bezier(.2,.75,.2,1)' });
  };

  document.querySelectorAll('.system-tab').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.system-tab').forEach((item) => {
        const active = item === button;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      updateSystem(button.dataset.system);
    });
  });

  document.querySelectorAll('.faq-list details').forEach((detail) => {
    detail.addEventListener('toggle', () => {
      if (!detail.open) return;
      document.querySelectorAll('.faq-list details').forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });
})();
