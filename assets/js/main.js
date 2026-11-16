// Magalhães | site
document.documentElement.classList.add('js');

// Promoção do Visual Creator: troque a data aqui. Quando o tempo acaba, a barra, o contador e o selo somem sozinhos.
const PROMO_FIM = '2026-11-30T23:59:59-03:00';

(function promo() {
  const end = new Date(PROMO_FIM).getTime();
  const pad = (n) => String(n).padStart(2, '0');
  const boxes = document.querySelectorAll('[data-countdown]');
  const inline = document.querySelectorAll('[data-countdown-inline]');
  function tick() {
    const left = end - Date.now();
    if (left <= 0) {
      document.documentElement.classList.add('promo-ended');
      return false;
    }
    const d = Math.floor(left / 86400000);
    const h = Math.floor((left % 86400000) / 3600000);
    const m = Math.floor((left % 3600000) / 60000);
    const s = Math.floor((left % 60000) / 1000);
    boxes.forEach((box) => {
      box.querySelector('[data-unit="d"]').textContent = pad(d);
      box.querySelector('[data-unit="h"]').textContent = pad(h);
      box.querySelector('[data-unit="m"]').textContent = pad(m);
      box.querySelector('[data-unit="s"]').textContent = pad(s);
    });
    inline.forEach((el) => (el.textContent = (d ? d + 'd ' : '') + pad(h) + 'h ' + pad(m) + 'm ' + pad(s) + 's'));
    return true;
  }
  if (tick()) {
    const timer = setInterval(() => { if (!tick()) clearInterval(timer); }, 1000);
  }
})();

// Menu no celular
const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('is-open', !open);
  });
  menu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      menuBtn.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
    })
  );
}

// Ano no rodapé
document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

// Notebook e celular: listas próprias, definidas no HTML (data-feed e data-phone)
const devices = document.querySelector('.devices');
if (devices) {
  const parse = (v) => { try { return JSON.parse(v || '[]'); } catch (e) { return []; } };
  const feed = parse(devices.dataset.feed);
  const stories = parse(devices.dataset.phone);
  const make = (src) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.decoding = 'async';
    if (/^https?:/.test(src)) img.referrerPolicy = 'no-referrer';
    return img;
  };

  const track = devices.querySelector('.feed-track');
  if (track && feed.length) {
    // Metade de cima e metade de baixo iguais: a rolagem volta ao início sem salto
    const half = feed.slice(0, Math.floor(feed.length / 3) * 3 || feed.length);
    track.innerHTML = '';
    half.concat(half).forEach((src) => track.appendChild(make(src)));
  }

  const phone = devices.querySelector('.phone-screen');
  const list = stories.length ? stories : feed;
  if (phone && list.length) {
    phone.innerHTML = '';
    const imgs = list.map((src, i) => {
      const img = make(src);
      if (i === 0) img.classList.add('is-on');
      phone.appendChild(img);
      return img;
    });
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce && imgs.length > 1) {
      let current = 0;
      setInterval(() => {
        imgs[current].classList.remove('is-on');
        current = (current + 1) % imgs.length;
        imgs[current].classList.add('is-on');
      }, 2600);
    }
  }

  // Abre o notebook quando a página carrega
  requestAnimationFrame(() => setTimeout(() => devices.classList.add('is-open'), 120));
}

// Projetos: abas (posts, stories, banners), rolagem pro lado e tela cheia
const panels = [...document.querySelectorAll('.works')];
if (panels.length) {
  const btns = document.querySelectorAll('.works-btn');
  const tabs = [...document.querySelectorAll('.works-tab')];
  const active = () => panels.find((p) => !p.hidden) || panels[0];
  const step = () => Math.max(240, active().clientWidth * 0.75);
  const update = () => {
    const w = active();
    const max = w.scrollWidth - w.clientWidth - 2;
    btns.forEach((b) => {
      const dir = Number(b.dataset.dir);
      b.disabled = dir < 0 ? w.scrollLeft <= 2 : w.scrollLeft >= max;
    });
  };
  btns.forEach((b) => b.addEventListener('click', () => active().scrollBy({ left: Number(b.dataset.dir) * step(), behavior: 'smooth' })));
  window.addEventListener('resize', update);

  const select = (tab, focus) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    active().scrollLeft = 0;
    update();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') select(tabs[(i + 1) % tabs.length], true);
      if (e.key === 'ArrowLeft') select(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });

  // Arrastar com o mouse (no celular o dedo já rola sozinho)
  let drag = null;
  panels.forEach((w) => {
    w.addEventListener('scroll', update, { passive: true });
    w.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'mouse') return;
      drag = { w, x: e.clientX, left: w.scrollLeft, moved: false };
    });
    w.addEventListener('keydown', (e) => {
      if (e.target !== w) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); w.scrollBy({ left: step(), behavior: 'smooth' }); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); w.scrollBy({ left: -step(), behavior: 'smooth' }); }
    });
  });
  let justDragged = false;
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 5) { drag.moved = true; drag.w.classList.add('is-dragging'); }
    if (drag.moved) drag.w.scrollLeft = drag.left - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    if (drag.moved) {
      drag.w.classList.remove('is-dragging');
      justDragged = true;
      setTimeout(() => (justDragged = false), 50);
    }
    drag = null;
  });
  update();

  // Pré-carrega as abas escondidas depois que a página termina de abrir
  window.addEventListener('load', () => setTimeout(() => {
    panels.forEach((p) => p.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager')));
  }, 2500));

  // Tela cheia
  const lb = document.getElementById('lightbox');
  if (lb) {
    const img = lb.querySelector('.lb-img');
    const count = lb.querySelector('.lb-count');
    let items = [], index = 0, opener = null;
    const show = (i) => {
      index = (i + items.length) % items.length;
      const card = items[index];
      const thumb = card.querySelector('img');
      img.src = card.dataset.full;
      img.alt = thumb.alt;
      if (/^https?:/.test(card.dataset.full)) img.referrerPolicy = 'no-referrer';
      count.textContent = (index + 1) + ' de ' + items.length;
    };
    const open = (card) => {
      items = [...card.parentElement.querySelectorAll('.work')];
      opener = card;
      show(items.indexOf(card));
      lb.hidden = false;
      document.documentElement.classList.add('lb-open');
      lb.querySelector('.lb-close').focus();
    };
    const close = () => {
      lb.hidden = true;
      img.removeAttribute('src');
      document.documentElement.classList.remove('lb-open');
      if (opener) opener.focus({ preventScroll: true });
    };
    document.querySelectorAll('.work').forEach((card) =>
      card.addEventListener('click', (e) => {
        if (justDragged) { e.preventDefault(); return; }
        open(card);
      })
    );
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
    lb.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(index + 1);
      if (e.key === 'ArrowLeft') show(index - 1);
    });
    let tx = null;
    lb.addEventListener('touchstart', (e) => (tx = e.touches[0].clientX), { passive: true });
    lb.addEventListener('touchend', (e) => {
      if (tx === null) return;
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
      tx = null;
    });
  }
}

// Motion: toca sem som quando aparece na tela; o botão liga o som (só de um vídeo por vez)
const motions = [...document.querySelectorAll('.motion')];
if (motions.length) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = motions.map((m) => ({ video: m.querySelector('video'), btn: m.querySelector('.motion-sound') }));
  const setSound = (item, on) => {
    item.video.muted = !on;
    item.btn.setAttribute('aria-pressed', String(on));
    const title = item.video.getAttribute('aria-label');
    item.btn.setAttribute('aria-label', (on ? 'Desativar som de ' : 'Ativar som de ') + title);
  };
  const play = (v) => { v.preload = 'auto'; const p = v.play(); if (p) p.catch(() => {}); };
  items.forEach((item) => {
    item.btn.addEventListener('click', () => {
      const on = item.video.muted;
      items.forEach((other) => { if (other !== item) setSound(other, false); });
      setSound(item, on);
      if (on) play(item.video);
    });
    item.video.addEventListener('click', () => (item.video.paused ? play(item.video) : item.video.pause()));
  });
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) play(v);
        else if (!v.paused) v.pause();
      });
    }, { threshold: 0.45 });
    items.forEach((item) => io.observe(item.video));
  }
}

// Logo do Visual Creator: se a imagem faltar, mostra o "V" desenhado
document.querySelectorAll('img[data-fallback]').forEach((img) => {
  const swap = () => {
    const div = document.createElement('div');
    div.className = img.className + ' vc-mark-fallback';
    div.setAttribute('role', 'img');
    div.setAttribute('aria-label', img.alt);
    div.textContent = 'V';
    img.replaceWith(div);
  };
  if (img.complete && img.naturalWidth === 0) swap();
  else img.addEventListener('error', swap);
});
