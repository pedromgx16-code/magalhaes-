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

// Notebook e celular: usam as mesmas artes da seção Projetos
const devices = document.querySelector('.devices');
if (devices) {
  const sources = [...document.querySelectorAll('.works img')].map((img) => ({
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt') || '',
  }));

  const track = devices.querySelector('.feed-track');
  if (track && sources.length) {
    // Metade de cima e metade de baixo iguais: a rolagem volta ao início sem salto
    let half = sources.slice();
    while (half.length < 8) half = half.concat(sources);
    if (half.length % 2) half = half.concat(sources[0]);
    track.innerHTML = '';
    half.concat(half).forEach((item, i) => {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = i < sources.length ? item.alt : '';
      img.referrerPolicy = 'no-referrer';
      img.decoding = 'async';
      track.appendChild(img);
    });
  }

  const phone = devices.querySelector('.phone-screen');
  if (phone && sources.length) {
    const order = sources.slice().reverse();
    phone.innerHTML = '';
    const imgs = order.map((item, i) => {
      const img = document.createElement('img');
      img.src = item.src;
      img.alt = '';
      img.referrerPolicy = 'no-referrer';
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
