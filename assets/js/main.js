// Magalhães | site
document.documentElement.classList.add('js');

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
