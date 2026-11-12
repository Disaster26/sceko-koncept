(function () {
  'use strict';
  var d = document;

  /* menu mobilne */
  var burger = d.getElementById('burger'), menu = d.getElementById('menu');
  function zamknij() { menu.classList.remove('otwarte'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Otwórz menu'); }
  burger.addEventListener('click', function () {
    var o = menu.classList.toggle('otwarte');
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    burger.setAttribute('aria-label', o ? 'Zamknij menu' : 'Otwórz menu');
  });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) zamknij(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') zamknij(); });

  /* aktywna pozycja menu */
  var linki = [].slice.call(menu.querySelectorAll(':scope > a'));
  var sekcje = linki.map(function (a) { return d.querySelector(a.getAttribute('href')); });
  function aktywna() {
    var y = window.scrollY + window.innerHeight * 0.35, ix = -1;
    sekcje.forEach(function (s, i) { if (s && s.offsetTop <= y) ix = i; });
    linki.forEach(function (a, i) { if (i === ix) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  }
  window.addEventListener('scroll', aktywna, { passive: true });
  aktywna();

  /* przeciąganie myszą dla torów */
  function ciagnij(tor) {
    var x0 = 0, s0 = 0, ruch = false, wcisniety = false;
    tor.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      wcisniety = true; ruch = false; x0 = e.clientX; s0 = tor.scrollLeft;
    });
    window.addEventListener('pointermove', function (e) {
      if (!wcisniety) return;
      var dx = e.clientX - x0;
      if (!ruch && Math.abs(dx) > 4) { ruch = true; tor.classList.add('ciagnie'); }
      if (ruch) { tor.scrollLeft = s0 - dx; e.preventDefault(); }
    });
    window.addEventListener('pointerup', function () {
      if (!wcisniety) return;
      wcisniety = false;
      if (ruch) {
        tor.classList.remove('ciagnie');
        var el = tor.firstElementChild, w = el ? el.getBoundingClientRect().width : tor.clientWidth;
        var gap = parseFloat(getComputedStyle(tor).columnGap) || 0;
        var krok = w + gap, cel = Math.round(tor.scrollLeft / krok) * krok;
        tor.scrollTo({ left: cel, behavior: 'smooth' });
      }
    });
    tor.addEventListener('click', function (e) { if (ruch) { e.preventDefault(); e.stopPropagation(); } }, true);
  }

  var strzalka = function (k) {
    return '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="' + (k < 0 ? 'M12.5 4 6.5 10l6 6' : 'M7.5 4l6 6-6 6') + '" fill="none" stroke="currentColor" stroke-width="2"/></svg>';
  };

  /* karuzele w kartach */
  d.querySelectorAll('[data-karuzela]').forEach(function (k) {
    var tor = k.querySelector('.tor'), n = tor.children.length;
    if (n < 2) return;
    tor.setAttribute('tabindex', '0');
    tor.setAttribute('aria-label', 'Zdjęcia realizacji, przewiń w bok');
    var licz = d.createElement('span'); licz.className = 'k-licznik'; licz.textContent = '1/' + n; k.appendChild(licz);
    [-1, 1].forEach(function (kier) {
      var b = d.createElement('button'); b.type = 'button';
      b.className = 'k-btn ' + (kier < 0 ? 'lewo' : 'prawo');
      b.setAttribute('aria-label', kier < 0 ? 'Poprzednie zdjęcie' : 'Następne zdjęcie');
      b.innerHTML = strzalka(kier);
      b.addEventListener('click', function () {
        var i = Math.round(tor.scrollLeft / tor.clientWidth) + kier;
        if (i < 0) i = n - 1; if (i >= n) i = 0;
        tor.scrollTo({ left: i * tor.clientWidth, behavior: 'smooth' });
      });
      k.appendChild(b);
    });
    tor.addEventListener('scroll', function () {
      licz.textContent = (Math.round(tor.scrollLeft / tor.clientWidth) + 1) + '/' + n;
    }, { passive: true });
    tor.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        tor.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * tor.clientWidth, behavior: 'smooth' });
      }
    });
    ciagnij(tor);
  });

  /* galeria realizacji */
  d.querySelectorAll('[data-galeria]').forEach(function (g) {
    var tor = g.querySelector('.gal-tor');
    tor.setAttribute('tabindex', '0');
    tor.setAttribute('aria-label', 'Galeria realizacji, przewiń w bok');
    g.querySelectorAll('.gal-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var f = tor.querySelector('figure'), w = f ? f.getBoundingClientRect().width + 16 : 300;
        tor.scrollBy({ left: parseInt(b.dataset.kier, 10) * w, behavior: 'smooth' });
      });
    });
    ciagnij(tor);
  });

  /* pasek mobilny po minięciu przycisku w hero */
  var mob = d.getElementById('mob'), heroCta = d.querySelector('.hero-cta'), kontakt = d.getElementById('kontakt');
  if ('IntersectionObserver' in window && heroCta) {
    var poHero = false, przyFormie = false;
    var ustaw = function () {
      var w = poHero && !przyFormie;
      mob.classList.toggle('widac', w);
      mob.setAttribute('aria-hidden', w ? 'false' : 'true');
      mob.querySelectorAll('a').forEach(function (a) { a.tabIndex = w ? 0 : -1; });
    };
    new IntersectionObserver(function (e) { poHero = !e[0].isIntersecting && e[0].boundingClientRect.top < 0; ustaw(); }).observe(heroCta);
    new IntersectionObserver(function (e) { przyFormie = e[0].isIntersecting; ustaw(); }, { rootMargin: '0px 0px -40% 0px' }).observe(d.getElementById('wycena'));
  }

  /* formularz pokazowy */
  var form = d.getElementById('wycena'), info = d.getElementById('formInfo');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var tel = form.querySelector('[name=tel]'), zg = form.querySelector('.zgoda input');
    if (!tel.value.trim()) { info.textContent = 'Proszę podać numer telefonu.'; tel.focus(); return; }
    if (!zg.checked) { info.textContent = 'Proszę zaznaczyć zgodę na kontakt.'; zg.focus(); return; }
    info.textContent = 'To podgląd strony - formularz nie wysyła danych. Na gotowej stronie zapytanie trafi od razu do biura.';
  });

  /* baner cookies - pojawia się po pierwszym przewinięciu */
  var ck = d.getElementById('cookies'), zapisana = null;
  try { zapisana = localStorage.getItem('sceko-zgoda'); } catch (err) { zapisana = null; }
  if (!zapisana && ck) {
    var pokaz = function () { if (window.scrollY > 200) { ck.hidden = false; window.removeEventListener('scroll', pokaz); } };
    window.addEventListener('scroll', pokaz, { passive: true });
    ck.addEventListener('click', function (e) {
      var b = e.target.closest('[data-zgoda]'); if (!b) return;
      try { localStorage.setItem('sceko-zgoda', b.dataset.zgoda); } catch (err) {}
      ck.hidden = true;
    });
  }
})();
