/* ============================================================
   AURA SUDAN — Premium Technology Company Website
   script.js — Vanilla JS, no dependencies
   ============================================================ */

(function () {
  'use strict';

  /* ------------------------------------------------------------
     0. UTILITIES
     ------------------------------------------------------------ */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------
     1. THEME (Dark / Light) — persisted via in-memory state
        (localStorage avoided per artifact constraints; falls back
        to documented persistence when deployed outside this preview)
     ------------------------------------------------------------ */
  const root = document.documentElement;
  let currentTheme = 'dark';

  function applyTheme(theme) {
    currentTheme = theme;
    root.setAttribute('data-theme', theme);
  }

  function initTheme() {
    // Dark is the brand default. We only switch to light if the person
    // explicitly chose it on a previous visit — we do not infer it from
    // the OS/browser color-scheme preference, since the premium look of
    // this site is designed around the dark palette.
    let saved = null;
    try { saved = window.localStorage.getItem('aura-theme'); } catch (e) { /* sandboxed */ }
    applyTheme(saved === 'light' ? 'light' : 'dark');
  }

  function toggleTheme() {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { window.localStorage.setItem('aura-theme', next); } catch (e) { /* sandboxed */ }
  }

  const themeToggle = $('#themeToggle');
  if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
  initTheme();

  /* ------------------------------------------------------------
     2. NAVIGATION — scroll state, mobile drawer
     ------------------------------------------------------------ */
  const navbar = $('#navbar');
  function onScrollNav() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  const navToggle = $('#navToggle');
  const mobileDrawer = $('#mobileDrawer');
  function setDrawer(open) {
    if (!navToggle || !mobileDrawer) return;
    navToggle.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    mobileDrawer.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (navToggle) {
    navToggle.addEventListener('click', () => setDrawer(!mobileDrawer.classList.contains('open')));
  }
  $$('.mobile-drawer a').forEach(a => a.addEventListener('click', () => setDrawer(false)));

  /* Close mobile drawer on Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) setDrawer(false);
  });

  /* ------------------------------------------------------------
     3. BACK TO TOP
     ------------------------------------------------------------ */
  const backToTop = $('#backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------
     4. SCROLL REVEAL (IntersectionObserver)
     ------------------------------------------------------------ */
  function initReveal() {
    const revealEls = $$('[data-reveal]');
    if (!revealEls.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(el => el.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
      observer.observe(el);
    });
  }
  initReveal();

  /* ------------------------------------------------------------
     5. ANIMATED COUNTERS
     ------------------------------------------------------------ */
  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-counter'));
    const suffix = el.getAttribute('data-suffix') || '';
    const decimals = parseInt(el.getAttribute('data-decimal') || '0', 10);
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const value = target * eased;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target.toFixed(decimals) + suffix;
      }
    }
    requestAnimationFrame(tick);
  }

  function initCounters() {
    const counters = $$('[data-counter]');
    const staticCounters = $$('[data-text]');
    staticCounters.forEach(el => { el.textContent = el.getAttribute('data-text'); });
    if (!counters.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      counters.forEach(el => {
        const target = parseFloat(el.getAttribute('data-counter'));
        const decimals = parseInt(el.getAttribute('data-decimal') || '0', 10);
        el.textContent = target.toFixed(decimals) + (el.getAttribute('data-suffix') || '');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(el => observer.observe(el));
  }
  initCounters();

  /* ------------------------------------------------------------
     6. MARQUEE — duplicate track for seamless loop
     ------------------------------------------------------------ */
  function initMarquee() {
    const track = $('#marqueeTrack');
    if (!track) return;
    track.innerHTML += track.innerHTML; // duplicate once for seamless -50% loop
  }
  initMarquee();

  /* ------------------------------------------------------------
     7. FAQ ACCORDION
     ------------------------------------------------------------ */
  function initFaq() {
    const items = $$('.faq-item');
    items.forEach(item => {
      const btn = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      const inner = item.querySelector('.faq-answer-inner');
      if (!btn || !answer || !inner) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close any other open item (single-open accordion)
        items.forEach(other => {
          if (other !== item && other.classList.contains('open')) {
            other.classList.remove('open');
            other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            other.querySelector('.faq-answer').style.height = '0px';
          }
        });

        if (isOpen) {
          item.classList.remove('open');
          btn.setAttribute('aria-expanded', 'false');
          answer.style.height = '0px';
        } else {
          item.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
          answer.style.height = inner.scrollHeight + 'px';
        }
      });
    });
  }
  initFaq();

  /* ------------------------------------------------------------
     8. HERO PARTICLES (lightweight, decorative)
     ------------------------------------------------------------ */
  function initParticles() {
    const field = $('#particleField');
    if (!field || prefersReducedMotion) return;
    const count = window.innerWidth < 720 ? 10 : 22;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDuration = (10 + Math.random() * 10) + 's';
      p.style.animationDelay = (Math.random() * 6) + 's';
      field.appendChild(p);
    }
  }
  initParticles();

  /* ------------------------------------------------------------
     9. MOUSE PARALLAX ON HERO PHONES
     ------------------------------------------------------------ */
  function initParallax() {
    const stage = $('.hero-phones');
    const phones = $$('[data-tilt]');
    if (!stage || !phones.length || prefersReducedMotion) return;
    if (window.matchMedia('(pointer: coarse)').matches) return; // skip on touch

    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      phones.forEach((phone, i) => {
        const depth = (i + 1) * 6;
        phone.style.setProperty('--tiltX', `${x * depth}px`);
        phone.style.setProperty('--tiltY', `${y * depth}px`);
        phone.style.marginLeft = `${x * depth}px`;
        phone.style.marginTop = `${y * depth}px`;
      });
    });
    stage.addEventListener('mouseleave', () => {
      phones.forEach(phone => {
        phone.style.marginLeft = '0px';
        phone.style.marginTop = '0px';
      });
    });
  }
  initParallax();

  /* ------------------------------------------------------------
     10. CONTACT FORM — client-side validation (no backend wired;
         preserves existing functionality contract: validates &
         shows confirmation, ready to be pointed at a real endpoint)
     ------------------------------------------------------------ */
  function initContactForm() {
    const form = $('#contactForm');
    if (!form) return;
    const status = $('#formStatus');

    function setError(fieldEl, isInvalid) {
      const wrapper = fieldEl.closest('.field');
      if (wrapper) wrapper.classList.toggle('invalid', isInvalid);
    }

    function validEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#cf-name');
      const email = $('#cf-email');
      const subject = $('#cf-subject');
      const message = $('#cf-message');

      let valid = true;
      [
        [name, name.value.trim().length > 1],
        [email, validEmail(email.value.trim())],
        [subject, subject.value.trim().length > 1],
        [message, message.value.trim().length > 4],
      ].forEach(([fieldEl, ok]) => {
        setError(fieldEl, !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        if (status) {
          status.textContent = currentLang === 'ar'
            ? 'يرجى تصحيح الحقول المظللة.'
            : 'Please fix the highlighted fields.';
          status.classList.add('show');
          status.classList.remove('success');
        }
        return;
      }

      if (status) {
        status.textContent = currentLang === 'ar'
          ? 'تم إرسال رسالتك بنجاح. سنرد عليك قريبًا.'
          : 'Your message has been sent. We will get back to you shortly.';
        status.classList.add('show', 'success');
      }
      form.reset();
    });

    // Clear inline error state as the user types
    $$('input, textarea', form).forEach(field => {
      field.addEventListener('input', () => setError(field, false));
    });
  }
  initContactForm();

  /* ------------------------------------------------------------
     11. INTERNATIONALIZATION (EN / AR) + RTL
     ------------------------------------------------------------ */
  const translations = {
  "en": {
    "skip_link": "Skip to main content",
    "logo_sub": "Engineering Digital Products",
    "nav_products": "Products",
    "nav_services": "Services",
    "nav_why": "Why Us",
    "nav_process": "Process",
    "nav_faq": "FAQ",
    "nav_contact": "Contact",
    "nav_cta": "Start a Project",
    "hero_badge": "Building for the Sudanese diaspora & beyond",
    "hero_title": "Engineering <span class=\"grad\">Digital Products</span> ",
    "hero_lead": "AURA SUDAN designs and ships mobile apps, AI systems, and cloud infrastructure for the Sudanese community worldwide — from first line of code to App Store launch.",
    "hero_cta1": "Explore Our Products",
    "hero_cta2": "Start a Project",
    "hero_meta1": "Active Users",
    "hero_meta2": "Live Products",
    "hero_meta3": "Uptime",
    "scroll_cue": "Scroll",
    "tech_cloud_label": "Trusted technologies powering our products",
    "products_eyebrow": "Our Products",
    "products_title": "Software people in our community use every day",
    "products_desc": "Three live products serving the Sudanese community worldwide — built end-to-end by our team, from design to deployment.",
    "p1_title": "Sudanese Expats",
    "p1_sub": "Community & Marketplace",
    "p1_desc": "A modern social platform connecting Sudanese people around the world — community, commerce, and culture in one app.",
    "p1_f1": "Community",
    "p1_f2": "Marketplace",
    "p1_f3": "Marriage",
    "p1_f4": "Chat",
    "p1_f5": "Groups",
    "p1_f6": "AI",
    "p1_f7": "Library",
    "p1_f8": "Events",
    "p2_title": "AlKhattaba",
    "p2_sub": "Sudan Marriage Platform",
    "p2_desc": "A trusted AI-powered matchmaking platform designed specifically for Sudanese communities, built around privacy and verification.",
    "p2_f1": "AI Matching",
    "p2_f2": "Privacy",
    "p2_f3": "Verification",
    "p2_f4": "Smart Recommendations",
    "p2_f5": "Secure Chat",
    "p2_f6": "Identity Verification",
    "p3_title": "WE@OUS",
    "p3_sub": "Open University of Sudan",
    "p3_desc": "A smart university platform developed for Open University of Sudan students — study tools powered by AI.",
    "p3_f1": "AI Teacher",
    "p3_f2": "University Chat",
    "p3_f3": "Library",
    "p3_f4": "Flashcards",
    "p3_f5": "Exam Generator",
    "p3_f6": "Notifications",
    "p3_f7": "Book Summaries",
    "p3_f8": "AI Assistant",
    "gplay_get": "GET IT ON",
    "learn_more": "Learn More",
    "download_eyebrow": "Get The Apps",
    "download_title": "Download Our Apps",
    "download_desc": "Available now on Google Play. Join thousands of users already on the platform.",
    "services_eyebrow": "Services",
    "services_title": "End-to-end engineering, under one roof",
    "services_desc": "From a single mobile screen to a full enterprise platform — our team covers the whole stack.",
    "srv1_title": "Flutter Development",
    "srv1_desc": "Cross-platform mobile apps with native performance, built once and shipped everywhere.",
    "srv2_title": "Android Development",
    "srv2_desc": "Native Android engineering for performance-critical and hardware-integrated apps.",
    "srv3_title": "Backend Engineering",
    "srv3_desc": "Resilient APIs and services built with Python, FastAPI, and modern data stores.",
    "srv4_title": "AI Engineering",
    "srv4_desc": "Practical AI features — matching, recommendations, and assistants — powered by modern LLMs.",
    "srv5_title": "Cybersecurity",
    "srv5_desc": "Threat modeling, secure architecture, and verification systems for sensitive data.",
    "srv6_title": "Cloud Infrastructure",
    "srv6_desc": "Scalable, observable cloud systems on GCP with Docker, Redis, and NGINX.",
    "srv7_title": "UI/UX Design",
    "srv7_desc": "Interfaces designed around real user behavior — clean, accessible, and on-brand.",
    "srv8_title": "Enterprise Solutions",
    "srv8_desc": "Custom software and IT consulting for organizations modernizing their operations.",
    "why_eyebrow": "Why Choose Us",
    "why_title": "Engineering you can build a business on",
    "why1_title": "Fast Delivery",
    "why1_desc": "Tight build cycles get your product to real users quickly, without cutting corners.",
    "why2_title": "Modern Architecture",
    "why2_desc": "Systems designed to scale from day one, not retrofitted after they break.",
    "why3_title": "Clean Code",
    "why3_desc": "Readable, documented, and tested — built for the team that maintains it next.",
    "why4_title": "Scalable Systems",
    "why4_desc": "Infrastructure that handles ten users the same way it handles ten million.",
    "why5_title": "Enterprise Security",
    "why5_desc": "Security reviewed at every layer, from authentication to data storage.",
    "why6_title": "Reliable Support",
    "why6_desc": "We stay with what we build — monitoring, fixes, and updates after launch.",
    "why7_title": "Continuous Innovation",
    "why7_desc": "We track new tools and techniques so your product doesn't fall behind.",
    "why_stat1": "Users",
    "why_stat2": "Products",
    "why_stat3": "Uptime",
    "why_stat4": "Satisfaction",
    "stack_eyebrow": "Technology Stack",
    "stack_title": "Tools we trust in production",
    "stat1": "Users",
    "stat2": "Products",
    "stat3": "Uptime",
    "stat4": "Support",
    "stat5": "Client Satisfaction",
    "process_eyebrow": "How We Work",
    "process_title": "A process built for predictable delivery",
    "proc1_title": "Discover",
    "proc1_desc": "Understand the goal",
    "proc2_title": "Research",
    "proc2_desc": "Study the market",
    "proc3_title": "Planning",
    "proc3_desc": "Map the architecture",
    "proc4_title": "Design",
    "proc4_desc": "Shape the experience",
    "proc5_title": "Prototype",
    "proc5_desc": "Validate early",
    "proc6_title": "Development",
    "proc6_desc": "Build the product",
    "proc7_title": "Testing",
    "proc7_desc": "Verify every flow",
    "proc8_title": "Deployment",
    "proc8_desc": "Ship to production",
    "proc9_title": "Maintenance",
    "proc9_desc": "Support long-term",
    "testi_eyebrow": "Testimonials",
    "testi_title": "What people building with us say",
    "testi1_quote": "The AlKhattaba app feels safe and genuinely well thought out — the verification process gave my family confidence in it.",
    "testi1_name": "Mohammed A.",
    "testi1_role": "App User, London",
    "testi2_quote": "WE@OUS changed how I study for OUS exams. The AI flashcards and exam generator save me hours every week.",
    "testi2_name": "Sara I.",
    "testi2_role": "OUS Student",
    "testi3_quote": "Working with AURA SUDAN on our backend was smooth from day one — clear communication and solid architecture.",
    "testi3_name": "Omar K.",
    "testi3_role": "Partner Organization",
    "faq_eyebrow": "FAQ",
    "faq_title": "Questions, answered",
    "faq1_q": "What does AURA SUDAN actually build?",
    "faq1_a": "We design and build mobile apps, AI features, backend systems, and cloud infrastructure — end-to-end, from concept through to App Store and Play Store launch.",
    "faq2_q": "Can I download your apps right now?",
    "faq2_a": "Yes. Sudanese Expats, AlKhattaba, and WE@OUS are all live on Google Play today — see the Download section above for direct links.",
    "faq3_q": "Do you work with companies outside Sudan?",
    "faq3_a": "Yes. While much of our product work focuses on the Sudanese community, our engineering, AI, and consulting services are available to clients anywhere.",
    "faq4_q": "How long does a typical project take?",
    "faq4_a": "It depends on scope, but most mobile app projects move from discovery to a launchable v1 in 8–14 weeks. We'll give you a clear timeline after the discovery call.",
    "faq5_q": "Is my data secure with your applications?",
    "faq5_a": "Security is built into every layer of what we ship, including identity verification, encrypted communication, and regular review of our infrastructure.",
    "contact_eyebrow": "Contact",
    "contact_title": "Let's build something together",
    "contact_desc": "Tell us about your project — we typically reply within one business day.",
    "form_name": "Full Name",
    "form_email": "Email Address",
    "form_subject": "Subject",
    "form_message": "Message",
    "form_err_name": "Please enter your name.",
    "form_err_email": "Please enter a valid email.",
    "form_err_subject": "Please enter a subject.",
    "form_err_message": "Please enter a message.",
    "form_submit": "Send Message",
    "info_email_label": "Email",
    "info_phone_label": "Phone",
    "info_location_label": "Location",
    "info_location_value": "Khartoum, Sudan",
    "map_placeholder": "Map preview — Khartoum, Sudan",
    "footer_about": "Engineering digital products for Africa — mobile apps, AI, cybersecurity, and cloud infrastructure.",
    "footer_products": "Products",
    "footer_services": "Services",
    "footer_company": "Company",
    "footer_resources": "Resources",
    "footer_copy": "© 2026 AURA SUDAN. All rights reserved.",
    "footer_tagline": "Engineering Digital Products for Africa"
  },
  "ar": {
    "skip_link": "تخطي إلى المحتوى الرئيسي",
    "logo_sub": "هندسة المنتجات الرقمية",
    "nav_products": "المنتجات",
    "nav_services": "الخدمات",
    "nav_why": "لماذا نحن",
    "nav_process": "آلية العمل",
    "nav_faq": "الأسئلة الشائعة",
    "nav_contact": "تواصل معنا",
    "nav_cta": "ابدأ مشروعك",
    "hero_badge": "نبني من أجل السودانيين حول العالم",
    "hero_title": "هندسة <span class=\"grad\">المنتجات الرقمية</span> ",
    "hero_lead": "تصمم أورا سودان وتطلق تطبيقات الهاتف وأنظمة الذكاء الاصطناعي والبنية السحابية لخدمة المجتمع السوداني حول العالم — من أول سطر كود حتى الإطلاق على المتاجر.",
    "hero_cta1": "استكشف منتجاتنا",
    "hero_cta2": "ابدأ مشروعك",
    "hero_meta1": "مستخدم نشط",
    "hero_meta2": "منتج فعّال",
    "hero_meta3": "نسبة التشغيل",
    "scroll_cue": "مرر للأسفل",
    "tech_cloud_label": "تقنيات موثوقة تشغّل منتجاتنا",
    "products_eyebrow": "منتجاتنا",
    "products_title": "برمجيات يستخدمها مجتمعنا كل يوم",
    "products_desc": "ثلاثة منتجات فعّالة تخدم المجتمع السوداني حول العالم — بناها فريقنا بالكامل، من التصميم إلى الإطلاق.",
    "p1_title": "Sudanese Expats",
    "p1_sub": "مجتمع وسوق تجاري",
    "p1_desc": "منصة اجتماعية حديثة تربط السودانيين حول العالم — مجتمع وتجارة وثقافة في تطبيق واحد.",
    "p1_f1": "مجتمع",
    "p1_f2": "سوق",
    "p1_f3": "زواج",
    "p1_f4": "محادثة",
    "p1_f5": "مجموعات",
    "p1_f6": "ذكاء اصطناعي",
    "p1_f7": "مكتبة",
    "p1_f8": "فعاليات",
    "p2_title": "الخطّابة",
    "p2_sub": "منصة الزواج السودانية",
    "p2_desc": "منصة تعارف موثوقة مدعومة بالذكاء الاصطناعي صُممت خصيصًا للمجتمعات السودانية، وتقوم على الخصوصية والتحقق من الهوية.",
    "p2_f1": "مطابقة ذكية",
    "p2_f2": "خصوصية",
    "p2_f3": "تحقق من الهوية",
    "p2_f4": "ترشيحات ذكية",
    "p2_f5": "محادثة آمنة",
    "p2_f6": "توثيق الهوية",
    "p3_title": "WE@OUS",
    "p3_sub": "جامعة السودان المفتوحة",
    "p3_desc": "منصة جامعية ذكية طُورت لطلاب جامعة السودان المفتوحة — أدوات دراسية مدعومة بالذكاء الاصطناعي.",
    "p3_f1": "معلّم ذكي",
    "p3_f2": "محادثة جامعية",
    "p3_f3": "مكتبة",
    "p3_f4": "بطاقات تعليمية",
    "p3_f5": "مولّد امتحانات",
    "p3_f6": "إشعارات",
    "p3_f7": "ملخصات كتب",
    "p3_f8": "مساعد ذكي",
    "gplay_get": "احصل عليه من",
    "learn_more": "اعرف أكثر",
    "download_eyebrow": "حمّل التطبيقات",
    "download_title": "حمّل تطبيقاتنا",
    "download_desc": "متوفرة الآن على Google Play. انضم إلى آلاف المستخدمين على المنصة.",
    "services_eyebrow": "الخدمات",
    "services_title": "هندسة شاملة تحت سقف واحد",
    "services_desc": "من شاشة هاتف واحدة إلى منصة مؤسسية كاملة — فريقنا يغطي كل طبقات التقنية.",
    "srv1_title": "تطوير Flutter",
    "srv1_desc": "تطبيقات هاتف متعددة المنصات بأداء قريب من الأصلي، تُبنى مرة وتُنشر في كل مكان.",
    "srv2_title": "تطوير أندرويد",
    "srv2_desc": "هندسة أندرويد أصلية للتطبيقات التي تتطلب أداءً عاليًا وتكاملاً مع العتاد.",
    "srv3_title": "هندسة الخلفية",
    "srv3_desc": "واجهات برمجية وخدمات متينة مبنية بـ Python وFastAPI وقواعد بيانات حديثة.",
    "srv4_title": "هندسة الذكاء الاصطناعي",
    "srv4_desc": "ميزات ذكاء اصطناعي عملية — مطابقة وترشيحات ومساعدين — مدعومة بنماذج لغوية حديثة.",
    "srv5_title": "الأمن السيبراني",
    "srv5_desc": "نمذجة التهديدات وبنية آمنة وأنظمة تحقق للبيانات الحساسة.",
    "srv6_title": "البنية السحابية",
    "srv6_desc": "أنظمة سحابية قابلة للتوسع وقابلة للمراقبة على GCP باستخدام Docker وRedis وNGINX.",
    "srv7_title": "تصميم واجهات وتجربة المستخدم",
    "srv7_desc": "واجهات مصممة حول سلوك المستخدم الحقيقي — نظيفة وسهلة الوصول ومتوافقة مع الهوية.",
    "srv8_title": "حلول المؤسسات",
    "srv8_desc": "برمجيات مخصصة واستشارات تقنية للمؤسسات التي تطوّر عملياتها.",
    "why_eyebrow": "لماذا تختارنا",
    "why_title": "هندسة يمكنك بناء عملك عليها",
    "why1_title": "تسليم سريع",
    "why1_desc": "دورات بناء مكثفة تصل بمنتجك إلى المستخدمين الحقيقيين بسرعة دون التضحية بالجودة.",
    "why2_title": "بنية حديثة",
    "why2_desc": "أنظمة مصممة للتوسع من اليوم الأول، لا تُعدَّل بعد أن تنكسر.",
    "why3_title": "كود نظيف",
    "why3_desc": "كود مقروء وموثّق ومختبَر — مبني من أجل الفريق الذي سيتولى صيانته بعدنا.",
    "why4_title": "أنظمة قابلة للتوسع",
    "why4_desc": "بنية تحتية تتعامل مع عشرة مستخدمين بنفس الطريقة التي تتعامل بها مع عشرة ملايين.",
    "why5_title": "أمان على مستوى المؤسسات",
    "why5_desc": "مراجعة أمنية في كل طبقة، من المصادقة حتى تخزين البيانات.",
    "why6_title": "دعم موثوق",
    "why6_desc": "نبقى مع ما نبنيه — مراقبة وإصلاحات وتحديثات بعد الإطلاق.",
    "why7_title": "ابتكار مستمر",
    "why7_desc": "نتابع الأدوات والتقنيات الجديدة كي لا يتأخر منتجك عن السوق.",
    "why_stat1": "مستخدم",
    "why_stat2": "منتج",
    "why_stat3": "نسبة التشغيل",
    "why_stat4": "رضا العملاء",
    "stack_eyebrow": "التقنيات المستخدمة",
    "stack_title": "أدوات نثق بها في الإنتاج",
    "stat1": "مستخدم",
    "stat2": "منتج",
    "stat3": "نسبة التشغيل",
    "stat4": "دعم",
    "stat5": "رضا العملاء",
    "process_eyebrow": "آلية عملنا",
    "process_title": "آلية عمل مصممة لتسليم موثوق",
    "proc1_title": "الاكتشاف",
    "proc1_desc": "فهم الهدف",
    "proc2_title": "البحث",
    "proc2_desc": "دراسة السوق",
    "proc3_title": "التخطيط",
    "proc3_desc": "رسم البنية",
    "proc4_title": "التصميم",
    "proc4_desc": "تشكيل التجربة",
    "proc5_title": "النموذج الأولي",
    "proc5_desc": "التحقق مبكرًا",
    "proc6_title": "التطوير",
    "proc6_desc": "بناء المنتج",
    "proc7_title": "الاختبار",
    "proc7_desc": "التحقق من كل مسار",
    "proc8_title": "الإطلاق",
    "proc8_desc": "النشر للإنتاج",
    "proc9_title": "الصيانة",
    "proc9_desc": "دعم طويل الأمد",
    "testi_eyebrow": "آراء العملاء",
    "testi_title": "ما يقوله من يبني معنا",
    "testi1_quote": "تطبيق الخطّابة يبدو آمنًا ومدروسًا بعناية — عملية التحقق أعطت عائلتي ثقة فيه.",
    "testi1_name": "محمد أ.",
    "testi1_role": "مستخدم التطبيق، لندن",
    "testi2_quote": "غيّر WE@OUS طريقة استعدادي لامتحانات الجامعة المفتوحة. البطاقات التعليمية ومولّد الامتحانات يوفران عليّ ساعات كل أسبوع.",
    "testi2_name": "سارة إ.",
    "testi2_role": "طالبة في الجامعة المفتوحة",
    "testi3_quote": "العمل مع أورا سودان على بنيتنا الخلفية كان سلسًا منذ اليوم الأول — تواصل واضح وبنية متينة.",
    "testi3_name": "عمر ك.",
    "testi3_role": "منظمة شريكة",
    "faq_eyebrow": "الأسئلة الشائعة",
    "faq_title": "أسئلتكم، مُجابة",
    "faq1_q": "ما الذي تبنيه أورا سودان فعليًا؟",
    "faq1_a": "نصمم ونبني تطبيقات الهاتف وميزات الذكاء الاصطناعي وأنظمة الخلفية والبنية السحابية — من الفكرة وحتى الإطلاق على متاجر التطبيقات.",
    "faq2_q": "هل يمكنني تحميل تطبيقاتكم الآن؟",
    "faq2_a": "نعم. تطبيقات Sudanese Expats والخطّابة وWE@OUS متوفرة جميعها على Google Play الآن — راجع قسم التحميل أعلاه للروابط المباشرة.",
    "faq3_q": "هل تتعاملون مع شركات خارج السودان؟",
    "faq3_a": "نعم. وبينما يتركز جزء كبير من منتجاتنا على المجتمع السوداني، فإن خدماتنا في الهندسة والذكاء الاصطناعي والاستشارات متاحة لعملاء في أي مكان.",
    "faq4_q": "كم تستغرق مدة المشروع النموذجي؟",
    "faq4_a": "يعتمد ذلك على حجم المشروع، لكن معظم مشاريع تطبيقات الهاتف تنتقل من مرحلة الاستكشاف إلى نسخة أولى قابلة للإطلاق في 8 إلى 14 أسبوعًا. سنزودك بجدول زمني واضح بعد مكالمة الاستكشاف.",
    "faq5_q": "هل بياناتي آمنة في تطبيقاتكم؟",
    "faq5_a": "الأمان مدمج في كل طبقة من ما نبنيه، بما في ذلك التحقق من الهوية والتواصل المشفّر والمراجعة الدورية لبنيتنا التحتية.",
    "contact_eyebrow": "تواصل معنا",
    "contact_title": "لنبنِ شيئًا معًا",
    "contact_desc": "أخبرنا عن مشروعك — نرد عادةً في غضون يوم عمل واحد.",
    "form_name": "الاسم الكامل",
    "form_email": "البريد الإلكتروني",
    "form_subject": "الموضوع",
    "form_message": "الرسالة",
    "form_err_name": "يرجى إدخال اسمك.",
    "form_err_email": "يرجى إدخال بريد إلكتروني صحيح.",
    "form_err_subject": "يرجى إدخال الموضوع.",
    "form_err_message": "يرجى إدخال رسالة.",
    "form_submit": "إرسال الرسالة",
    "info_email_label": "البريد الإلكتروني",
    "info_phone_label": "الهاتف",
    "info_location_label": "الموقع",
    "info_location_value": "الخرطوم، السودان",
    "map_placeholder": "معاينة الخريطة — الخرطوم، السودان",
    "footer_about": "نهندس المنتجات الرقمية لأفريقيا — تطبيقات الهاتف والذكاء الاصطناعي والأمن السيبراني والبنية السحابية.",
    "footer_products": "المنتجات",
    "footer_services": "الخدمات",
    "footer_company": "الشركة",
    "footer_resources": "موارد",
    "footer_copy": "© 2026 أورا سودان. جميع الحقوق محفوظة.",
    "footer_tagline": "هندسة المنتجات الرقمية لأفريقيا"
  }
};

  let currentLang = 'en';

  function applyTranslations(lang) {
    const dict = translations[lang];
    if (!dict) return;

    $$('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) {
        el.innerHTML = dict[key];
      }
    });

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }

  function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    applyTranslations(lang);

    $$('.lang-switch button').forEach(btn => {
      const isActive = btn.getAttribute('data-lang') === lang;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-pressed', String(isActive));
    });

    try { window.localStorage.setItem('aura-lang', lang); } catch (e) { /* sandboxed */ }
  }

  function initLanguage() {
    let saved = null;
    try { saved = window.localStorage.getItem('aura-lang'); } catch (e) { /* sandboxed */ }
    setLanguage(saved || 'en');

    $$('.lang-switch button').forEach(btn => {
      btn.addEventListener('click', () => setLanguage(btn.getAttribute('data-lang')));
    });
  }
  initLanguage();

})();
