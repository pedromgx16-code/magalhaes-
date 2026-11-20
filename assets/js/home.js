// Magalhães | efeitos da página inicial (o main.js cuida da promoção, menu, tela cheia e vídeos)
(function () {
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasIO = 'IntersectionObserver' in window;

  // Blocos aparecem ao rolar
  const reveals = document.querySelectorAll('.reveal');
  if (hasIO && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => io.observe(el));
    root.classList.add('io-on');
  } else {
    root.classList.add('io-on', 'no-io');
  }

  // Menu: fundo mais forte depois de rolar e destaque da seção atual
  const nav = document.querySelector('.nav');
  if (nav) {
    let ticking = false;
    const onScroll = () => {
      ticking = false;
      nav.classList.toggle('is-scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
  }
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  if (hasIO && links.length) {
    const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const link = byId.get(e.target.id);
        if (!link) return;
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.toggle('is-active', l === link));
        } else {
          link.classList.remove('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
  }

  // Colagem do início acompanha o mouse
  const hero = document.querySelector('.hero');
  const collage = document.querySelector('.collage');
  if (hero && collage && finePointer && !reduce) {
    let raf = 0, mx = 0, my = 0;
    const apply = () => {
      raf = 0;
      collage.style.setProperty('--mx', mx.toFixed(3));
      collage.style.setProperty('--my', my.toFixed(3));
    };
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      mx = (e.clientX - r.left) / r.width - 0.5;
      my = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) raf = requestAnimationFrame(apply);
    });
    hero.addEventListener('pointerleave', () => { mx = 0; my = 0; if (!raf) raf = requestAnimationFrame(apply); });
  }

  // Celular do início: troca os stories (carrega depois da página, pra não pesar na abertura)
  const phone = document.querySelector('.phone[data-stories]');
  if (phone) {
    const screen = phone.querySelector('.phone-screen');
    const imgs = [...screen.querySelectorAll('img')];
    let list = [];
    try { list = JSON.parse(phone.dataset.stories || '[]'); } catch (e) { list = []; }
    const extra = list.filter((src) => !imgs.some((i) => i.getAttribute('src') === src));
    const loadExtra = () => extra.forEach((src) => {
      const img = new Image();
      img.alt = '';
      img.decoding = 'async';
      if (/^https?:/.test(src)) img.referrerPolicy = 'no-referrer';
      img.onload = () => { screen.appendChild(img); imgs.push(img); };
      img.src = src;
    });
    if (document.readyState === 'complete') loadExtra();
    else window.addEventListener('load', loadExtra, { once: true });
    if (!reduce) {
      let current = 0;
      setInterval(() => {
        if (imgs.length < 2 || document.hidden) return;
        imgs[current].classList.remove('is-on');
        current = (current + 1) % imgs.length;
        imgs[current].classList.add('is-on');
      }, 2800);
    }
  }

  // Números que contam
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && hasIO && !reduce) {
    const run = (el) => {
      const end = Number(el.dataset.count);
      const t0 = performance.now();
      const dur = 1400;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur);
        el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(step);
      };
      el.textContent = '0';
      requestAnimationFrame(step);
    };
    const co = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        const wait = root.classList.contains('is-ready') ? 0 : 1300;
        setTimeout(() => run(e.target), wait);
      });
    }, { threshold: 0.6 });
    counters.forEach((n) => co.observe(n));
  }

  // Projetos em perspectiva: a arte do meio fica de frente, as dos lados giram
  const cf = document.querySelector('.works.coverflow');
  if (cf) {
    const cards = [...cf.querySelectorAll('.work')];
    const total = cards.length;
    const countEl = document.querySelector('.cf-count');
    const lineEl = document.querySelector('.cf-line i');
    const pad = (n) => String(n).padStart(2, '0');
    const centerOf = (c) => c.offsetLeft + c.offsetWidth / 2;
    let current = -1, ticking = false;

    const layout = () => {
      ticking = false;
      const mid = cf.scrollLeft + cf.clientWidth / 2;
      const unit = Math.max(240, cf.clientWidth * 0.26);
      let best = 0, bestD = Infinity;
      cards.forEach((c, i) => {
        const d = (centerOf(c) - mid) / unit;
        const ad = Math.abs(d);
        if (ad < bestD) { bestD = ad; best = i; }
        if (!reduce) {
          const t = Math.max(-1.2, Math.min(1.2, d));
          c.style.setProperty('--t', t.toFixed(3));
          c.style.setProperty('--a', Math.abs(t).toFixed(3));
          c.style.zIndex = String(100 - Math.min(99, Math.round(ad * 10)));
        }
      });
      if (best !== current) {
        current = best;
        cards.forEach((c, i) => c.classList.toggle('is-center', i === best));
        if (countEl) countEl.innerHTML = '<b>' + pad(best + 1) + '</b> / ' + pad(total);
        if (lineEl) lineEl.style.setProperty('--p', ((best + 1) / total * 100).toFixed(2) + '%');
      }
    };
    const request = () => { if (!ticking) { ticking = true; requestAnimationFrame(layout); } };
    const go = (i) => {
      const idx = Math.max(0, Math.min(total - 1, i));
      cf.scrollTo({ left: centerOf(cards[idx]) - cf.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
    };

    cf.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    document.querySelectorAll('.cf-btn').forEach((b) => b.addEventListener('click', () => go(current + Number(b.dataset.dir))));

    // Clicar numa arte do lado traz ela pro meio; clicar na do meio abre em tela cheia (main.js)
    cf.addEventListener('click', (e) => {
      const card = e.target.closest('.work');
      if (!card || card.classList.contains('is-center')) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      go(cards.indexOf(card));
    }, true);

    // Começa na terceira arte, com artes dos dois lados
    let touched = false;
    ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach((ev) => cf.addEventListener(ev, () => { touched = true; }, { passive: true, once: true }));
    const start = () => {
      if (touched) return;
      const prev = cf.style.scrollSnapType;
      cf.style.scrollSnapType = 'none';
      cf.scrollLeft = centerOf(cards[Math.min(2, total - 1)]) - cf.clientWidth / 2;
      cf.style.scrollSnapType = prev;
      layout();
    };
    start();
    window.addEventListener('load', start, { once: true });
  }

  // Card do Texture inclina com o mouse
  const stage = document.querySelector('.vc-stage');
  const vcCard = stage && stage.querySelector('.vc-card');
  if (vcCard && finePointer && !reduce) {
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      vcCard.style.setProperty('--ry', (x * 34 - 6).toFixed(2) + 'deg');
      vcCard.style.setProperty('--rx', (-y * 26 + 6).toFixed(2) + 'deg');
      vcCard.style.setProperty('--shine', (x * 140).toFixed(1) + '%');
    });
    stage.addEventListener('pointerleave', () => {
      ['--ry', '--rx', '--shine'].forEach((p) => vcCard.style.removeProperty(p));
    });
  }

  // Dúvidas: uma aberta por vez
  const faqs = [...document.querySelectorAll('.faq-list details')];
  faqs.forEach((d) => d.addEventListener('toggle', () => {
    if (d.open) faqs.forEach((o) => { if (o !== d) o.open = false; });
  }));
})();
