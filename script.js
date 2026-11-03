/* Granddecor - салон штор, Астана.
   Меню · перевод RU/KZ · тихое появление блоков · видео по видимости · фото крупно · форма в WhatsApp. Библиотек нет. */
(function () {
  'use strict';
  var ASSET_V = ((document.currentScript && document.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || '';
  var WA = '77076143368';
  var waUrl = function (text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); };
  var root = document.documentElement;
  var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  root.classList.add('js');

  /* Шапка и мобильное меню */
  var hdr = document.querySelector('.hdr');
  var burger = document.querySelector('.burger');
  var setMenu = function (open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  document.querySelectorAll('.mnav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });

  /* Кнопки у услуг: текст сообщения с названием услуги (ставится в href заранее, LeadBot дописывает код) */
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = a.getAttribute('data-wa-t') === 'fabric'
      ? waUrl('Здравствуйте! Хочу подобрать ткань для штор.')
      : waUrl('Здравствуйте! Хочу узнать цену: ' + a.getAttribute('data-wa') + '.');
  });

  /* Липкая панель и линия под шапкой */
  var mbar = document.querySelector('.mbar');
  var kont = document.getElementById('kontakty');
  var ticking = false;
  var onScroll = function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.scrollY;
      if (hdr) hdr.classList.toggle('is-scrolled', y > 8);
      if (mbar) {
        var onKont = kont && kont.getBoundingClientRect().top < window.innerHeight * 0.6;
        mbar.classList.toggle('is-on', y > window.innerHeight * 0.55 && !onKont);
      }
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Тихое появление блоков */
  var rvs = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduceMq.matches) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rvs.forEach(function (el) { rio.observe(el); });
  } else {
    rvs.forEach(function (el) { el.classList.add('in'); });
  }
  /* переход по якорю: блок цели показываем сразу, без ожидания */
  var showNear = function () {
    var id = location.hash.slice(1);
    var el = id && document.getElementById(id);
    if (el) el.querySelectorAll('.rv').forEach(function (r) { r.classList.add('in'); });
    if (el && el.classList.contains('rv')) el.classList.add('in');
  };
  window.addEventListener('hashchange', showNear);
  showNear();

  /* Видео: немая петля только в кадре */
  var vids = document.querySelectorAll('video.loop');
  if ('IntersectionObserver' in window && vids.length) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && !reduceMq.matches) {
          if (!v.getAttribute('src')) v.setAttribute('src', v.getAttribute('data-src'));
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (!en.isIntersecting) { v.pause(); }
      });
    }, { threshold: 0.4 });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* Фото крупно: стрелки, Esc, свайп, фокус внутри */
  var lb = document.getElementById('lb');
  var lbImg = lb.querySelector('.lb-img');
  var lbN = lb.querySelector('.lb-n');
  var lbPrev = lb.querySelector('.lb-p');
  var lbNext = lb.querySelector('.lb-nx');
  var lbClose = lb.querySelector('.lb-x');
  var group = [], idx = 0, opener = null;
  var showLb = function (i) {
    idx = (i + group.length) % group.length;
    var b = group[idx], im = b.querySelector('img');
    lbImg.src = b.getAttribute('data-full');
    lbImg.alt = im ? im.alt : '';
    lbN.textContent = (idx + 1) + ' / ' + group.length;
    lbPrev.hidden = lbNext.hidden = group.length < 2;
    var nx = group[(idx + 1) % group.length];
    if (nx) { var pre = new Image(); pre.src = nx.getAttribute('data-full'); }
  };
  var openLb = function (btn) {
    var g = btn.getAttribute('data-g');
    group = [].slice.call(document.querySelectorAll('.zoom[data-g="' + g + '"]'));
    opener = btn;
    showLb(group.indexOf(btn));
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lb-open');
    lbClose.focus();
  };
  var closeLb = function () {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lb-open');
    if (opener) opener.focus();
  };
  document.querySelectorAll('.zoom').forEach(function (b) {
    b.addEventListener('click', function () { openLb(b); });
  });
  lbClose.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', function () { showLb(idx - 1); });
  lbNext.addEventListener('click', function () { showLb(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-fig')) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.classList.contains('is-open')) {
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowLeft') showLb(idx - 1);
      else if (e.key === 'ArrowRight') showLb(idx + 1);
      else if (e.key === 'Tab') {
        var f = [lbClose, lbPrev, lbNext].filter(function (x) { return !x.hidden; });
        var k = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(k + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
      return;
    }
    if (e.key === 'Escape') setMenu(false);
  });
  var tx = null, ty = null;
  lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) showLb(idx + (dx < 0 ? 1 : -1));
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) closeLb();
    tx = ty = null;
  }, { passive: true });

  /* Форма: заявка уходит в WhatsApp */
  var form = document.getElementById('leadForm');
  if (form) {
    var err = document.getElementById('formErr');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.company && form.company.value) return;
      var phone = form.phone.value.replace(/[^\d+]/g, '');
      if (phone.replace(/\D/g, '').length < 10) { err.hidden = false; form.phone.focus(); return; }
      err.hidden = true;
      var need = Array.prototype.map.call(form.querySelectorAll('input[name="need"]:checked'), function (i) { return i.value; });
      var lines = ['Здравствуйте! Заявка с сайта.'];
      if (form.name.value.trim()) lines.push('Имя: ' + form.name.value.trim());
      lines.push('Телефон: ' + form.phone.value.trim());
      if (need.length) lines.push('Нужно: ' + need.join(', '));
      if (form.note.value.trim()) lines.push('Комментарий: ' + form.note.value.trim());
      window.open(waUrl(lines.join('\n')), '_blank', 'noopener');
      var ok = document.getElementById('formOk'); if (ok) ok.hidden = false;
    });
  }

  /* Язык: RU в разметке, KZ подгружается отдельным файлом по выбору человека */
  var I18N = { ru: {} };
  var nodes = document.querySelectorAll('[data-i]');
  nodes.forEach(function (el) { var k = el.getAttribute('data-i'); if (!(k in I18N.ru)) I18N.ru[k] = el.innerHTML; });
  document.querySelectorAll('[data-i-ph]').forEach(function (el) { I18N.ru[el.getAttribute('data-i-ph')] = el.getAttribute('placeholder'); });
  I18N.ru['meta.title'] = document.title;
  var metaDesc = document.querySelector('meta[name="description"]');
  I18N.ru['meta.desc'] = metaDesc ? metaDesc.getAttribute('content') : '';
  var loadLang = function (lang, done) {
    if (I18N[lang] || lang !== 'kk') return done();
    var sc = document.createElement('script');
    sc.src = 'assets/lang/kk.js' + (ASSET_V ? '?v=' + ASSET_V : '');
    sc.onload = function () { if (window.SITE_KK) I18N.kk = window.SITE_KK; done(); };
    sc.onerror = function () { done(); };
    document.head.appendChild(sc);
  };
  /* Заголовок первого экрана не вылезает за край: кегль вниз шагом 5% */
  var fitText = function () {
    document.querySelectorAll('.display .h1a').forEach(function (el) {
      el.style.fontSize = '';
      var box = el.parentElement;
      var size = parseFloat(getComputedStyle(el).fontSize), n = 0;
      el.style.whiteSpace = 'nowrap';
      while (el.scrollWidth > box.clientWidth + 1 && n < 10) { size *= 0.95; el.style.fontSize = size + 'px'; n++; }
      el.style.whiteSpace = '';
    });
  };
  var langBtns = document.querySelectorAll('.lang button');
  var applyLang = function (lang) {
    if (!I18N[lang]) lang = 'ru';
    var d = I18N[lang];
    nodes.forEach(function (el) { var k = el.getAttribute('data-i'); if (k in d) el.innerHTML = d[k]; });
    document.querySelectorAll('[data-i-ph]').forEach(function (el) { var k = el.getAttribute('data-i-ph'); if (k in d) el.setAttribute('placeholder', d[k]); });
    document.title = d['meta.title'] || I18N.ru['meta.title'];
    if (metaDesc) metaDesc.setAttribute('content', d['meta.desc'] || I18N.ru['meta.desc']);
    root.lang = lang;
    langBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false'); });
    try { localStorage.setItem('lang', lang); } catch (e2) {}
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitText); else fitText();
  };
  var setLang = function (lang) { loadLang(lang, function () { applyLang(lang); }); };
  langBtns.forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
  var forced = (location.search.match(/[?&]lang=(ru|kk)/) || [])[1];
  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e3) {}
  var startLang = forced || saved || 'ru';
  if (startLang === 'kk') setLang('kk');
  else if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitText);
  else fitText();
  /* пересчёт только при смене ширины: iOS шлёт resize при сворачивании адресной строки */
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) return;
    lastW = window.innerWidth; fitText();
  });
})();
