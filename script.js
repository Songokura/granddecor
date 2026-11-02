/* Granddecor - салон штор, Астана.
   Плиты и образец ткани в герое · ткани в окне с автопрокруткой · видео по видимости ·
   лента категорий · лента работ с кнопками · перевод RU/KZ · меню · форма в WhatsApp. Библиотек нет. */
(function () {
  'use strict';
  var ASSET_V = ((document.currentScript && document.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || '';
  var WA = '77076143368';
  var waUrl = function (text) { return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); };
  var root = document.documentElement;
  var reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var RED = reduceMq.matches;
  var mobileMq = window.matchMedia('(max-width: 760px)');
  var clamp = function (v) { return v < 0 ? 0 : (v > 1 ? 1 : v); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 2.6); };
  var easeInOut = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

  /* Шапка: линия снизу после прокрутки */
  var hdr = document.querySelector('.hdr');
  var hh = function () { return hdr ? hdr.offsetHeight : 80; };

  /* Мобильное меню */
  var burger = document.querySelector('.burger');
  var setMenu = function (open) {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  burger.addEventListener('click', function () { setMenu(!document.body.classList.contains('menu-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  /* Кнопки «Узнать цену» у услуг: текст сообщения с названием услуги (ставится в href заранее, LeadBot дописывает код) */
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waUrl('Здравствуйте! Хочу узнать цену: ' + a.getAttribute('data-wa') + '.');
  });

  /* ---------- Ткань на свету: смена кадра в герое ---------- */
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
  var heroWa = document.querySelector('.hero-acts .btn-gold');
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
      /* уходящий кадр остаётся под новым, новый вытягивается слева направо */
      imgs.forEach(function (im) {
        if (im === next) return;
        im.classList.toggle('is-prev', im.classList.contains('is-on'));
        im.classList.remove('is-on');
      });
      next.classList.add('is-on');
      var done = function () { imgs.forEach(function (im) { if (im !== next) im.classList.remove('is-prev'); }); };
      if (reduceMq.matches) done(); else setTimeout(done, 720);
    });
  };
  /* Автопрокрутка тканей: пока герой в кадре и вкладка открыта; ручной выбор - пауза 12 с, наведение - пауза */
  var ORDER = Array.prototype.map.call(chips, function (c) { return c.getAttribute('data-f'); });
  var AUTO_MS = 4500, autoT = null, autoT2 = null, holdUntil = 0, hovered = false, heroIn = true;
  var sampleBox = document.querySelector('.sample');
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
    new IntersectionObserver(function (en) { heroIn = en[0].isIntersecting; planAuto(); }, { threshold: 0.3 }).observe(win);
  } else if (win) { planAuto(); }
  if (win) {
    window.addEventListener('load', function () {
      var idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 1200); };
      idle(function () { imgs.forEach(function (im) { if (im.getAttribute('data-src')) ensureSrc(im); }); });
    });
  }

  /* ---------- Плиты ----------
     Один слушатель scroll через rAF. Для каждой .pw считаем --enter/--exit/--stay/--open
     относительно зоны под шапкой; герою - геометрию образца (--cl/--ct/--cr/--cb, --sop). */
  var pws = [].slice.call(document.querySelectorAll('.pw'));
  var heroPw = document.getElementById('top');
  var hero = heroPw ? heroPw.querySelector('.hero') : null;
  var mbar = document.querySelector('.mbar');
  var kont = document.getElementById('kontakty');
  var introK = 1, introDone = true;
  var cache = {};
  var setVar = function (el, name, val) {
    var key = (el.id || el.className) + name;
    if (cache[key] === val) return;
    cache[key] = val; el.style.setProperty(name, val);
  };
  var HERO_VARS = ['--cl', '--ct', '--cr', '--cb', '--fl', '--ft', '--fr', '--fb', '--sop', '--r0l', '--r0t', '--r0w'];
  var heroGeom = function (stay) {
    if (!hero) return;
    if (mobileMq.matches) {
      HERO_VARS.forEach(function (n) { setVar(hero, n, ''); });
      return;
    }
    var W = hero.clientWidth, H = hero.clientHeight, TICK = 44;
    var gut = Math.min(48, Math.max(20, W * 0.04));
    var free = H - TICK;
    var h0 = Math.min(600, free - 148);
    var left = W * 0.54, right = W - gut;
    var w0 = Math.min(right - left, h0 * 1.25, 640);
    var cx = (left + right) / 2, cy = (free - 100) / 2 + 8;
    var wF = 2 * Math.max(cx, W - cx) + 40, hF = 2 * Math.max(cy, H - cy) + 40;
    var p = easeInOut(clamp(stay / 0.8));
    var s = easeOut(introK);
    var w = (w0 + (wF - w0) * p) * s, h = (h0 + (hF - h0) * p) * s;
    /* клип окна не уходит в минус, а рамка зубцов - уходит за край и прячется под клипом */
    var fl = cx - w / 2, fr = W - cx - w / 2, ft = cy - h / 2, fb = H - cy - h / 2;
    setVar(hero, '--cl', Math.max(0, fl).toFixed(1) + 'px');
    setVar(hero, '--cr', Math.max(0, fr).toFixed(1) + 'px');
    setVar(hero, '--ct', Math.max(0, ft).toFixed(1) + 'px');
    setVar(hero, '--cb', Math.max(0, fb).toFixed(1) + 'px');
    setVar(hero, '--fl', fl.toFixed(1) + 'px');
    setVar(hero, '--fr', fr.toFixed(1) + 'px');
    setVar(hero, '--ft', ft.toFixed(1) + 'px');
    setVar(hero, '--fb', fb.toFixed(1) + 'px');
    setVar(hero, '--sop', p.toFixed(3));
    setVar(hero, '--r0l', (cx - w0 / 2).toFixed(0) + 'px');
    setVar(hero, '--r0t', (cy + h0 / 2 + 16).toFixed(0) + 'px');
    setVar(hero, '--r0w', w0.toFixed(0) + 'px');
  };
  var update = function () {
    var HH = hh();
    var H = (window.innerHeight || root.clientHeight) - HH;
    var heroStay = 0;
    pws.forEach(function (pw) {
      var r = pw.getBoundingClientRect();
      var top = r.top - HH, bottom = r.bottom - HH;
      if (top > H * 1.5 || bottom < -H * 0.5) {
        /* далеко от экрана: только состояния */
        var gone = bottom < -H * 0.5;
        pw.classList.toggle('gone', gone);
        if (gone) { setVar(pw, '--exit', '1'); setVar(pw, '--enter', '1'); }
        else { setVar(pw, '--enter', '0'); setVar(pw, '--exit', '0'); setVar(pw, '--open', '0'); }
        return;
      }
      var enter = clamp(1 - top / H);
      var exit = clamp(1 - bottom / H);
      var stay = r.height > H + 1 ? clamp(-top / (r.height - H)) : enter;
      setVar(pw, '--enter', enter.toFixed(3));
      setVar(pw, '--exit', exit.toFixed(3));
      setVar(pw, '--stay', stay.toFixed(3));
      setVar(pw, '--open', easeInOut(clamp((enter - 0.28) / 0.62)).toFixed(3));
      pw.classList.toggle('gone', exit >= 1);
      pw.classList.toggle('on', enter > 0.6);
      if (pw === heroPw) heroStay = stay;
    });
    heroGeom(heroStay);
    if (hdr) hdr.classList.toggle('is-scrolled', window.scrollY > 8);
    if (mbar) {
      var onKont = kont && kont.getBoundingClientRect().top < window.innerHeight * 0.6;
      mbar.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.55 && !onKont && !document.body.classList.contains('menu-open'));
    }
  };
  var ticking = false;
  var onScroll = function () {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  };
  var plateSync = function () { introDone = true; introK = 1; if (heroPw) heroPw.classList.add('on'); update(); };
  if (RED) {
    root.classList.add('no-plate');
    if (heroPw) heroPw.classList.add('on');
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('load', update);
    /* интро 1250 мс: образец ткани вырезается из центра окна, текст поднимается.
       Пропускаем при хэше и прокрутке - человек из рекламы сразу видит собранный экран. */
    var skip = location.hash || window.scrollY > 80 || mobileMq.matches;
    if (skip) {
      plateSync();
      if (win && !location.hash && window.scrollY <= 80) win.classList.add('intro');
    } else {
      introK = 0; introDone = false; update();
      var t0 = null;
      var step = function (ts) {
        if (introDone) return;
        if (t0 === null) t0 = ts;
        var p = clamp((ts - t0) / 1250);
        introK = easeInOut(p);
        update();
        if (p < 1) requestAnimationFrame(step); else introDone = true;
      };
      var start = function () {
        if (win) win.classList.add('intro');
        requestAnimationFrame(function () { if (heroPw) heroPw.classList.add('on'); requestAnimationFrame(step); });
      };
      var first = win ? win.querySelector('.win-img.is-on') : null;
      if (first && !first.complete) first.addEventListener('load', start, { once: true }); else start();
      /* страховка: если rAF не тикает (фоновая вкладка), собрать экран по таймеру */
      setTimeout(function () { if (heroPw) heroPw.classList.add('on'); }, 500);
      setTimeout(function () { if (!introDone) plateSync(); }, 2600);
    }
  }
  window.addEventListener('hashchange', plateSync);

  /* Переходы по якорям: своим скроллом, с учётом шапки; плиты встают под шапку вплотную */
  var scrollToEl = function (el) {
    var HH = hh();
    var isPlate = el.classList.contains('pw') || el.id === 'uslugi';
    var y = el.getBoundingClientRect().top + window.scrollY - HH - (isPlate ? 0 : 16);
    plateSync();
    window.scrollTo({ top: Math.max(0, y), behavior: reduceMq.matches ? 'auto' : 'smooth' });
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var el = id ? document.getElementById(id) : null;
    if (!el) return;
    e.preventDefault();
    setMenu(false);
    scrollToEl(el);
    if (history.pushState) history.pushState(null, '', '#' + id);
  });

  /* Лента категорий внизу героя: копии до двойной ширины экрана, шаг цикла - одна копия */
  var tickTrack = document.querySelector('.tick-track');
  var fillTicker = function () {
    if (!tickTrack) return;
    var list = tickTrack.querySelector('.tick-list');
    tickTrack.querySelectorAll('.tick-list[aria-hidden]').forEach(function (c) { c.remove(); });
    var w = list.getBoundingClientRect().width;
    if (!w) return;
    var need = Math.ceil((window.innerWidth * 2) / w) + 1;
    for (var i = 0; i < need; i++) {
      var c = list.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.querySelectorAll('a').forEach(function (a) { a.setAttribute('tabindex', '-1'); });
      tickTrack.appendChild(c);
    }
    tickTrack.style.setProperty('--cw', w.toFixed(1) + 'px');
    tickTrack.style.setProperty('--tick-s', (w / 48).toFixed(1) + 's');
  };

  /* Видео салона: играют только в кадре */
  var vids = document.querySelectorAll('video.loop');
  if ('IntersectionObserver' in window && vids.length) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting && !RED) {
          if (!v.getAttribute('src')) v.setAttribute('src', v.getAttribute('data-src'));
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (!en.isIntersecting) { v.pause(); }
      });
    }, { threshold: 0.3 });
    vids.forEach(function (v) { vio.observe(v); });
  }

  /* Лента работ: стрелки, шаг - одна карточка, крайняя гаснет, обе прячутся, если всё влезло */
  var strip = document.querySelector('.strip');
  var arws = document.querySelectorAll('.arw');
  var ctl = document.querySelector('.strip-ctl');
  if (strip && arws.length) {
    var step = function () {
      var card = strip.querySelector('.work');
      var gap = parseFloat(getComputedStyle(strip).columnGap || getComputedStyle(strip).gap) || 12;
      return card ? card.getBoundingClientRect().width + gap : 300;
    };
    var upd = function () {
      var max = strip.scrollWidth - strip.clientWidth;
      if (ctl) ctl.hidden = max <= 1;
      arws[0].disabled = strip.scrollLeft <= 2;
      arws[1].disabled = strip.scrollLeft >= max - 2;
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
    document.querySelectorAll('.display .h1a').forEach(function (el) {
      el.style.fontSize = '';
      var box = el.closest('.hero-text') || el.parentElement;
      var size = parseFloat(getComputedStyle(el).fontSize), n = 0;
      while (el.scrollWidth > box.clientWidth + 1 && n < 10) { size *= 0.95; el.style.fontSize = size + 'px'; n++; }
    });
  };
  var layout = function () { fillTicker(); fitText(); update(); };
  var applyLang = function (lang) {
    if (!I18N[lang]) lang = 'ru';
    curLang = lang;
    var d = I18N[lang];
    nodes.forEach(function (el) { var k = el.getAttribute('data-i'); if (k in d) el.textContent = d[k]; });
    document.querySelectorAll('[data-i-ph]').forEach(function (el) { var k = el.getAttribute('data-i-ph'); if (k in d) el.setAttribute('placeholder', d[k]); });
    document.title = d['meta.title'] || I18N.ru['meta.title'];
    if (metaDesc) metaDesc.setAttribute('content', d['meta.desc'] || I18N.ru['meta.desc']);
    root.lang = lang;
    fName.textContent = t('f.' + current + '.name', FABRICS[current].name);
    fNote.textContent = t('f.' + current + '.note', FABRICS[current].note);
    langBtns.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false'); });
    try { localStorage.setItem('lang', lang); } catch (e2) {}
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout); else layout();
  };
  var langBtns = document.querySelectorAll('.lang button');
  var setLang = function (lang) { loadLang(lang, function () { applyLang(lang); }); };
  langBtns.forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
  var forced = (location.search.match(/[?&]lang=(ru|kk)/) || [])[1];
  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e3) {}
  var startLang = forced || saved || 'ru';
  if (startLang === 'kk') setLang('kk');
  else if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
  else layout();
  /* пересчёт только при смене ширины: iOS шлёт resize при сворачивании адресной строки */
  var lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth === lastW) { update(); return; }
    lastW = window.innerWidth; cache = {}; layout();
  });
})();
