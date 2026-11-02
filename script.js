(function () {
  'use strict';
  var ASSET_V = ((document.currentScript && document.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || '';
  var WA = '77076143368';
  var waUrl = function (text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); };

  /* Шапка: линия снизу после прокрутки */
  var hdr = document.querySelector('.hdr');
  var onScroll = function () { hdr.classList.toggle('is-scrolled', window.scrollY > 8); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Мобильное меню */
  var burger = document.querySelector('.burger');
  var setMenu = function (open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  document.querySelectorAll('.mnav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* Кнопки «Узнать цену» у услуг: текст сообщения с названием услуги */
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waUrl('Здравствуйте! Хочу узнать цену: ' + a.getAttribute('data-wa') + '.');
  });

  /* Ткань на свету: смена кадра в герое */
  var FABRICS = {
    len: { name: 'Лён с вуалью', note: 'днём мягкий рассеянный свет' },
    blackout: { name: 'Плотная портьера', note: 'приглушает свет, для спальни' },
    voile: { name: 'Вуаль', note: 'тёплый свет и лёгкость' },
    velvet: { name: 'Бархат', note: 'глубокий цвет и тишина в комнате' }
  };
  var win = document.getElementById('window');
  var imgs = win ? win.querySelectorAll('.win-img') : [];
  var chips = document.querySelectorAll('.chip');
  var fName = document.getElementById('f-name');
  var fNote = document.getElementById('f-note');
  var heroWa = document.querySelector('.hero-acts .btn-wa');
  var current = 'len';

  var ensureSrc = function (img) {
    if (img.getAttribute('data-src')) {
      img.setAttribute('srcset', img.getAttribute('data-srcset'));
      img.setAttribute('src', img.getAttribute('data-src'));
      img.removeAttribute('data-src'); img.removeAttribute('data-srcset');
    }
    return img.decode ? img.decode().catch(function () {}) : Promise.resolve();
  };

  var show = function (key) {
    if (key === current) return;
    var next = win.querySelector('.win-img[data-f="' + key + '"]');
    if (!next) return;
    current = key;
    chips.forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-f') === key ? 'true' : 'false'); });
    fName.textContent = t('f.' + key + '.name', FABRICS[key].name);
    fNote.textContent = t('f.' + key + '.note', FABRICS[key].note);
    if (heroWa) heroWa.href = waUrl('Здравствуйте! Хочу подобрать шторы. Понравилась ткань: ' + FABRICS[key].name + '.');
    ensureSrc(next).then(function () {
      if (current !== key) return;
      win.classList.remove('intro');
      /* уходящий кадр остаётся под новым, новый вытягивается слева направо как штора */
      imgs.forEach(function (im) {
        if (im === next) return;
        im.classList.toggle('is-prev', im.classList.contains('is-on'));
        im.classList.remove('is-on');
      });
      next.classList.add('is-on');
      var done = function () {
        imgs.forEach(function (im) { if (im !== next) im.classList.remove('is-prev'); });
      };
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) done(); else setTimeout(done, 720);
    });
  };
  /* Автопрокрутка тканей: пока герой в кадре и вкладка открыта; ручной выбор - пауза 12 с, наведение - пауза */
  var ORDER = Array.prototype.map.call(chips, function (c) { return c.getAttribute('data-f'); });
  var AUTO_MS = 4500, autoT = null, autoT2 = null, holdUntil = 0, hovered = false, heroIn = true;
  var sampleBox = document.querySelector('.sample');
  var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var setRun = function (on) { if (sampleBox) sampleBox.classList.toggle('is-auto', on); };
  var stopAuto = function () { clearTimeout(autoT); clearTimeout(autoT2); autoT = null; setRun(false); };
  var canAuto = function () { return win && heroIn && !hovered && !document.hidden && !reduceMq.matches; };
  var planAuto = function () {
    stopAuto();
    if (!canAuto()) return;
    var wait = Math.max(0, holdUntil - Date.now());
    autoT = setTimeout(function () {
      if (!canAuto()) return;
      var i = ORDER.indexOf(current);
      show(ORDER[(i + 1) % ORDER.length]);
      planAuto();
    }, wait + AUTO_MS);
    /* полоска прогресса под активной тканью перезапускается на каждом шаге */
    setRun(false); void (sampleBox && sampleBox.offsetWidth);
    if (sampleBox) sampleBox.style.setProperty('--auto-ms', AUTO_MS + 'ms');
    if (!wait) setRun(true); else autoT2 = setTimeout(function () { setRun(true); }, wait);
  };
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      show(c.getAttribute('data-f'));
      holdUntil = Date.now() + 12000; clearTimeout(autoT2); planAuto();
    });
  });
  [win, sampleBox].forEach(function (el) {
    if (!el) return;
    el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hovered = true; clearTimeout(autoT2); stopAuto(); } });
    el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hovered = false; planAuto(); } });
  });
  document.addEventListener('visibilitychange', planAuto);
  if (win && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { heroIn = en[0].isIntersecting; planAuto(); }, { threshold: 0.35 }).observe(win);
  } else if (win) { planAuto(); }

  if (win) {
    var first = win.querySelector('.win-img.is-on');
    var startIntro = function () { win.classList.add('intro'); };
    var skipIntro = location.hash || window.scrollY > 80 || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!skipIntro) { if (first.complete) startIntro(); else first.addEventListener('load', startIntro, { once: true }); }
    /* остальные ткани догружаем, когда страница уже показана */
    window.addEventListener('load', function () {
      var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1200); };
      idle(function () { imgs.forEach(function (im) { if (im.getAttribute('data-src')) ensureSrc(im); }); });
    });
  }

  /* Видео салона: играют только в кадре */
  var vids = document.querySelectorAll('video.loop');
  if ('IntersectionObserver' in window && vids.length) {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && !reduce) {
          if (!v.getAttribute('src')) v.setAttribute('src', v.getAttribute('data-src'));
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (!en.isIntersecting) {
          v.pause();
        }
      });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { io.observe(v); });
  }

  /* Лента работ: стрелки на мобильном */
  var strip = document.querySelector('.strip');
  var arws = document.querySelectorAll('.arw');
  if (strip && arws.length) {
    var step = function () {
      var card = strip.querySelector('.work');
      return card ? card.getBoundingClientRect().width + 12 : 300;
    };
    var upd = function () {
      var max = strip.scrollWidth - strip.clientWidth - 2;
      arws[0].disabled = strip.scrollLeft <= 2;
      arws[1].disabled = strip.scrollLeft >= max;
    };
    arws.forEach(function (b) {
      b.addEventListener('click', function () { strip.scrollBy({ left: step() * Number(b.getAttribute('data-dir')), behavior: 'smooth' }); });
    });
    strip.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  /* Форма: заявка уходит в WhatsApp */
  var form = document.getElementById('leadForm');
  if (form) {
    var err = document.getElementById('formErr');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.company && form.company.value) return;
      var phone = form.phone.value.replace(/[^\d+]/g, '');
      if (phone.replace(/\D/g, '').length < 10) {
        err.hidden = false; form.phone.focus(); return;
      }
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

  /* Липкая панель: после половины первого экрана, прячется на контактах */
  var mbar = document.querySelector('.mbar');
  var ct = document.getElementById('kontakty');
  if (mbar) {
    var ctVisible = false;
    var updBar = function () {
      mbar.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.55 && !ctVisible);
    };
    window.addEventListener('scroll', updBar, { passive: true });
    if ('IntersectionObserver' in window && ct) {
      new IntersectionObserver(function (en) { ctVisible = en[0].isIntersecting; updBar(); }, { threshold: 0.25 }).observe(ct);
    }
    updBar();
  }

  /* Язык: RU в разметке, KZ подгружается отдельным файлом по выбору человека */
  var I18N = { ru: {} };
  var nodes = document.querySelectorAll('[data-i]');
  nodes.forEach(function (el) { var k = el.getAttribute('data-i'); if (!(k in I18N.ru)) I18N.ru[k] = el.textContent; });
  document.querySelectorAll('[data-i-ph]').forEach(function (el) { I18N.ru[el.getAttribute('data-i-ph')] = el.getAttribute('placeholder'); });
  I18N.ru['meta.title'] = document.title;
  var metaDesc = document.querySelector('meta[name="description"]');
  I18N.ru['meta.desc'] = metaDesc ? metaDesc.getAttribute('content') : '';
  var curLang = 'ru';
  var t = function (key, fallback) {
    var d = I18N[curLang] || {};
    return key in d ? d[key] : (key in I18N.ru ? I18N.ru[key] : fallback);
  };
  var loadLang = function (lang, done) {
    if (I18N[lang] || lang !== 'kk') return done();
    var sc = document.createElement('script');
    sc.src = 'assets/lang/kk.js' + (ASSET_V ? '?v=' + ASSET_V : '');
    sc.onload = function () { if (window.SITE_KK) I18N.kk = window.SITE_KK; done(); };
    sc.onerror = function () { done(); };
    document.head.appendChild(sc);
  };
  var fitText = function () {
    document.querySelectorAll('.display').forEach(function (el) {
      el.style.fontSize = '';
      var size = parseFloat(getComputedStyle(el).fontSize), n = 0;
      while (el.scrollWidth > el.clientWidth + 1 && n < 8) { size *= 0.95; el.style.fontSize = size + 'px'; n++; }
    });
  };
  var applyLang = function (lang) {
    if (!I18N[lang]) lang = 'ru';
    curLang = lang;
    var d = I18N[lang];
    nodes.forEach(function (el) { var k = el.getAttribute('data-i'); if (k in d) el.textContent = d[k]; });
    document.querySelectorAll('[data-i-ph]').forEach(function (el) { var k = el.getAttribute('data-i-ph'); if (k in d) el.setAttribute('placeholder', d[k]); });
    document.title = d['meta.title'] || I18N.ru['meta.title'];
    if (metaDesc) metaDesc.setAttribute('content', d['meta.desc'] || I18N.ru['meta.desc']);
    document.documentElement.lang = lang;
    fName.textContent = t('f.' + current + '.name', FABRICS[current].name);
    fNote.textContent = t('f.' + current + '.note', FABRICS[current].note);
    langBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false'); });
    try { localStorage.setItem('lang', lang); } catch (err) {}
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitText); else fitText();
  };
  var langBtns = document.querySelectorAll('.lang button');
  var setLang = function (lang) { loadLang(lang, function () { applyLang(lang); }); };
  langBtns.forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
  var forced = (location.search.match(/[?&]lang=(ru|kk)/) || [])[1];
  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (err) {}
  var startLang = forced || saved || 'ru';
  if (startLang === 'kk') setLang('kk'); else if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitText);
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () { if (window.innerWidth === lastW) return; lastW = window.innerWidth; fitText(); });
})();
