/* DOXTER: comportamento do site. Sem bibliotecas. */
(function () {
  'use strict';
  var d = document, raiz = d.documentElement;
  var $ = function (s, c) { return (c || d).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); };
  var parado = function () { return raiz.dataset.movimento === 'off'; };
  window.dataLayer = window.dataLayer || [];

  /* interruptor «Reduzir movimento» */
  var botaoMov = $('[data-movimento]');
  if (botaoMov) {
    botaoMov.setAttribute('aria-pressed', String(parado()));
    botaoMov.addEventListener('click', function () {
      var off = !parado();
      if (off) raiz.dataset.movimento = 'off'; else delete raiz.dataset.movimento;
      raiz.classList.remove('abre');
      try { localStorage.setItem('doxter-movimento', off ? 'off' : 'on'); } catch (e) {}
      botaoMov.setAttribute('aria-pressed', String(off));
      medir();
    });
  }

  /* a abertura acaba e não volta a mexer */
  if (raiz.classList.contains('abre')) {
    /* durante a abertura a página fica no topo e não rola: só se vê a abertura até ao fim */
    window.scrollTo(0, 0);
    var trava = function (e) { if (raiz.classList.contains('abre')) e.preventDefault(); };
    var teclasRolar = { ArrowDown: 1, ArrowUp: 1, PageDown: 1, PageUp: 1, Home: 1, End: 1, ' ': 1 };
    var travaTecla = function (e) { if (teclasRolar[e.key]) trava(e); };
    window.addEventListener('wheel', trava, { passive: false });
    window.addEventListener('touchmove', trava, { passive: false });
    d.addEventListener('keydown', travaTecla);
    var fim = function () {
      raiz.classList.remove('abre');
      window.removeEventListener('wheel', trava); window.removeEventListener('touchmove', trava); d.removeEventListener('keydown', travaTecla);
      if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
    };
    setTimeout(fim, 2550);
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') fim(); });
  }
  window.addEventListener('load', function () { raiz.classList.add('suave'); });
  var rolar = function () { raiz.classList.toggle('rolou', window.scrollY > 24); };
  window.addEventListener('scroll', rolar, { passive: true }); rolar();

  /* menu do telemóvel */
  var botaoMenu = $('.menu-botao');
  if (botaoMenu) {
    var rotulo = $('[data-menu-rotulo]', botaoMenu), topo = $('.topo');
    var fechar = function () { raiz.classList.remove('menu-aberto'); botaoMenu.setAttribute('aria-expanded', 'false'); rotulo.textContent = 'Menu'; };
    botaoMenu.addEventListener('click', function () {
      var abrir = !raiz.classList.contains('menu-aberto');
      if (!abrir) return fechar();
      raiz.classList.add('menu-aberto'); botaoMenu.setAttribute('aria-expanded', 'true'); rotulo.textContent = 'Fechar';
    });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') fechar(); });
    $$('.nav a').forEach(function (a) { a.addEventListener('click', fechar); });
    topo.addEventListener('click', function (e) { if (e.target === topo) fechar(); });
  }

  /* o olhar: os olhos seguem o rato ou o dedo e voltam ao documento */
  var rosto = $('.rosto');
  if (rosto) {
    var alvo = { x: 0, y: 7 }, at = { x: 0, y: 7 }, volta, vivo = false;
    var passo = function () {
      at.x += (alvo.x - at.x) * 0.08; at.y += (alvo.y - at.y) * 0.08;
      rosto.style.setProperty('--ox', at.x.toFixed(2) + 'px'); rosto.style.setProperty('--oy', at.y.toFixed(2) + 'px');
      if (Math.abs(alvo.x - at.x) + Math.abs(alvo.y - at.y) > 0.05) requestAnimationFrame(passo); else vivo = false;
    };
    var olhar = function (x, y) { alvo.x = x; alvo.y = y; if (!vivo && !parado()) { vivo = true; requestAnimationFrame(passo); } };
    window.addEventListener('pointermove', function (e) {
      if (window.scrollY > window.innerHeight) return;
      var r = rosto.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height * 0.46;
      var dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
      var dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
      olhar(dx * 9, 3 + dy * 7);
      clearTimeout(volta); volta = setTimeout(function () { olhar(0, 7); }, 2500);
    }, { passive: true });

  }

  /* cenas puxadas pelo scroll, nos dois sentidos */
  var cenas = $$('[data-p]').map(function (el) { return { el: el, alvo: $('.palco', el) || el }; }), marcado = false;
  function medir() {
    marcado = false;
    if (parado()) return;
    var vh = window.innerHeight;
    cenas.forEach(function (c) {
      var r = c.alvo.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      var p = (vh * 0.92 - r.top) / (vh * 0.62);
      c.el.style.setProperty('--p', Math.max(0, Math.min(1, p)).toFixed(3));
    });
  }
  if (cenas.length) {
    var pedir = function () { if (!marcado) { marcado = true; requestAnimationFrame(medir); } };
    window.addEventListener('scroll', pedir, { passive: true }); window.addEventListener('resize', pedir); medir();
  }

  /* separador do ERP: o marcador patrulha sozinho até ao primeiro toque */
  var lista = $('[data-patrulha]');
  if (lista) {
    var itens = $$('button', lista), nome = $('[data-erp-nome]'), desc = $('[data-erp-desc]');
    var marcar = function (i) {
      itens.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
      if (nome) { nome.textContent = itens[i].textContent.trim(); desc.textContent = itens[i].dataset.d || ''; }
    };
    itens.forEach(function (b, i) { b.addEventListener('click', function () { marcar(i); }); });
  }

  /* seguinte, seguinte */
  var baralho = $('[data-baralho]');
  if (baralho) {
    var cartas = $$('.carta', baralho), tecla = $('[data-seguinte-carta]', baralho), conta = $('[data-conta]', baralho), fora = 0, tocado = false;
    var arrumar = function () {
      cartas.forEach(function (c, i) { if (i < fora) c.setAttribute('data-fora', ''); else c.removeAttribute('data-fora'); c.style.setProperty('--n', Math.max(0, i - fora)); });
      conta.textContent = cartas.length - fora;
      tecla.textContent = fora === cartas.length ? 'Repor' : 'Seguinte';
    };
    var seguinte = function () { fora = fora >= cartas.length ? 0 : fora + 1; arrumar(); };
    tecla.addEventListener('click', function () { tocado = true; seguinte(); });
    var x0 = null;
    baralho.addEventListener('pointerdown', function (e) { if (e.target.closest('.carta')) x0 = e.clientX; });
    baralho.addEventListener('pointerup', function (e) { if (x0 !== null && Math.abs(e.clientX - x0) > 40) { tocado = true; seguinte(); } x0 = null; });
    arrumar();
  }

  /* pedido de demonstração: dois passos, origem guardada, contacto fixo que sai da frente */
  var form = $('#pedido'), seccao = $('#pedir');
  $$('[data-cta]').forEach(function (a) {
    a.addEventListener('click', function () { if (form) form.elements.origem.value = a.dataset.cta; window.dataLayer.push({ event: 'cta_demonstracao', cta: a.dataset.cta }); });
  });
  var aVista = [];
  [seccao, $('.rodape')].forEach(function (el) {
    if (el) new IntersectionObserver(function (e) {
      var i = aVista.indexOf(el);
      if (e[0].isIntersecting) { if (i < 0) aVista.push(el); } else if (i >= 0) aVista.splice(i, 1);
      raiz.classList.toggle('sem-fixo', aVista.length > 0);
    }, { threshold: 0 }).observe(el);
  });
  if (form) {
    var e1 = $('[data-etapa="1"]', form), e2 = $('[data-etapa="2"]', form), estado = $('[data-estado]', form), resp = $('[data-resposta]', form);
    var frases = { Primavera: 'O Plug-in vive dentro do seu ERP.', Cegid: 'O Plug-in vive dentro do seu ERP.', Outro: 'O DOXTER funciona sem depender do ERP.', Nenhum: 'O DOXTER liga-se à AT sem software de gestão.' };
    $$('input[name="erp"]', form).forEach(function (r) { r.addEventListener('change', function () { resp.textContent = frases[r.value] || ''; $('[data-erro-erp]', form).hidden = true; }); });
    $('[data-seguinte]', form).addEventListener('click', function () {
      e1.hidden = true; e2.hidden = false; form.elements.nome.focus();
    });
    $('[data-voltar]', form).addEventListener('click', function () { e2.hidden = true; e1.hidden = false; });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var f = form.elements, mau = false;
      [f.nome, f.empresa, f.email].forEach(function (c) {
        var ok = c.value.trim() && (c.type !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.value.trim()));
        c.setAttribute('aria-invalid', String(!ok)); if (!ok) mau = true;
      });
      if (!f.consentimento.checked) mau = true;
      $('[data-erro-dados]', form).hidden = !mau;
      if (mau) return;
      window.dataLayer.push({ event: 'lead_demonstracao', cta: f.origem.value || 'formulario', erp: f.erp.value || 'por indicar' });
      var corpo = 'Nome: ' + f.nome.value + '\nEmpresa: ' + f.empresa.value + '\nE-mail: ' + f.email.value + '\nTelefone: ' + f.telefone.value + '\nERP: ' + (f.erp.value || 'por indicar');
      e2.hidden = true;
      estado.hidden = false;
      estado.innerHTML = '<span>Pedido pronto.</span> Abrimos o seu e-mail com os dados preenchidos para info@doxter.pt. Basta enviar.';
      if (!navigator.webdriver) location.href = 'mailto:info@doxter.pt?subject=' + encodeURIComponent('Demonstração do DOXTER') + '&body=' + encodeURIComponent(corpo);
    });
  }
})();

/* reels (v13): carrossel dos 3 reels, molde do site da Pantiera (js/47-reels.js). O do centro toca mudo quando está à
   vista; os vizinhos espreitam dos lados, mais pequenos e inclinados. Setas, contador, teclado, dedo, trackpad e som por
   reel. No telemóvel o carrossel muda-se para a secção própria entre o hero e a guarda. */
(function () {
  'use strict';
  var raiz = document.querySelector('[data-reels]'); if (!raiz) return;
  var web = document.querySelector('[data-reels-web]'), tel = document.querySelector('[data-reels-tel]');
  var mq = matchMedia('(min-width: 900px)');
  var casa = function () { var alvo = mq.matches ? web : tel; if (alvo && raiz.parentNode !== alvo) alvo.appendChild(raiz); };
  casa(); if (mq.addEventListener) mq.addEventListener('change', function () { casa(); pinta(); });
  var parado = function () { return document.documentElement.dataset.movimento === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches; };
  var palco = raiz.querySelector('[data-reels-palco]'), num = raiz.querySelector('[data-reels-num]');
  var reais = JSON.parse(document.getElementById('reels-dados').textContent), R = reais.length;
  var dados = reais.concat(reais), N = dados.length; // em roda: há sempre um cartão de cada lado
  var svgSom = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path class="on" d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/><path class="off" d="m16 9.5 5 5m0-5-5 5"/></svg>';
  var cur = 0, dentro = false, somLigado = false;
  var lis = dados.map(function (r, i) {
    var li = document.createElement('li');
    li.className = 'reels-cartao';
    li.innerHTML = '<video muted playsinline preload="none" poster="assets/reels/' + r.id + '.webp" data-src="assets/reels/' + r.id + '.mp4" width="540" height="960" aria-label="Reel: ' + r.t + '"></video>' +
      '<button type="button" class="reels-som" aria-pressed="false" aria-label="Ligar o som">' + svgSom + '</button>';
    li.addEventListener('click', function (e) { if (cur !== i && !e.target.closest('.reels-som')) { e.preventDefault(); vai(i); } });
    li.querySelector('video').addEventListener('ended', function () { if (cur === i) vai(i + 1); });
    palco.appendChild(li);
    return li;
  });
  function botao(li) {
    var v = li.querySelector('video'), b = li.querySelector('.reels-som'), ouve = !v.muted && !v.paused;
    b.setAttribute('aria-pressed', String(ouve)); b.setAttribute('aria-label', ouve ? 'Desligar o som' : 'Ligar o som');
  }
  function pinta() {
    var largo = mq.matches;
    lis.forEach(function (li, i) {
      var dd = i - cur; if (dd > N / 2) dd -= N; if (dd < -N / 2) dd += N; var a = Math.abs(dd);
      var x = dd * (largo ? 70 : 52), rot = a === 0 ? 1.5 : (dd < 0 ? -2 : 2.5);
      li.style.transform = 'translate(' + x + '%,0) scale(' + (a ? 0.84 : 1) + ') rotate(' + rot + 'deg)';
      li.style.zIndex = String(50 - a);
      li.style.opacity = a > 1 ? '0' : (a ? '.72' : '1');
      li.style.pointerEvents = a > 1 ? 'none' : 'auto';
      li.classList.toggle('frente', a === 0);
      li.setAttribute('aria-hidden', a ? 'true' : 'false');
      li.querySelectorAll('button').forEach(function (el) { el.tabIndex = a ? -1 : 0; });
      var v = li.querySelector('video');
      if (a <= 1 && !v.getAttribute('src')) v.src = v.dataset.src;
      if (a <= 1 && dentro) v.preload = a === 0 ? 'auto' : 'metadata';
      if (a === 0 && dentro && (!parado() || somLigado)) {
        v.muted = !somLigado;
        var p = v.play(); if (p) p.catch(function () { somLigado = false; v.muted = true; v.play().catch(function () {}); });
      } else { v.pause(); v.muted = true; }
      botao(li);
    });
    num.textContent = ('0' + ((cur % R) + 1)).slice(-2) + ' / ' + ('0' + R).slice(-2);
  }
  lis.forEach(function (li) { var v = li.querySelector('video'); ['volumechange', 'play', 'pause'].forEach(function (t) { v.addEventListener(t, function () { botao(li); }); }); });
  var vai = function (i) { cur = (i + N) % N; pinta(); };
  raiz.querySelector('[data-reels-ant]').addEventListener('click', function () { vai(cur - 1); });
  raiz.querySelector('[data-reels-seg]').addEventListener('click', function () { vai(cur + 1); });
  raiz.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') vai(cur - 1); if (e.key === 'ArrowRight') vai(cur + 1); });
  // o som liga-se dentro do próprio toque (o iOS só deixa aqui); o botão segue sempre o estado real do vídeo
  palco.addEventListener('click', function (e) {
    var b = e.target.closest('.reels-som'); if (!b) return;
    var v = b.closest('li').querySelector('video');
    somLigado = v.muted || v.paused;
    if (!v.getAttribute('src')) v.src = v.dataset.src;
    v.muted = !somLigado;
    if (somLigado) v.play().catch(function () { somLigado = false; v.muted = true; });
    pinta();
  });
  // rato a arrastar, dedo para o lado, trackpad na horizontal (um reel por gesto); o scroll vertical fica livre
  var x0 = null;
  palco.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse') x0 = e.clientX; }, { passive: true });
  addEventListener('pointerup', function (e) { if (x0 === null) return; var dx = e.clientX - x0; x0 = null; if (Math.abs(dx) > 40) vai(cur + (dx < 0 ? 1 : -1)); }, { passive: true });
  var trav = false, acum = 0, tAcum = 0;
  raiz.addEventListener('wheel', function (e) {
    if (e.ctrlKey) return;
    var dx = e.deltaX, dy = e.deltaY; if (Math.abs(dx) <= Math.abs(dy) * 1.1) return;
    e.preventDefault(); acum += dx;
    if (trav) acum = 0; else if (Math.abs(acum) > 28) { vai(cur + (acum > 0 ? 1 : -1)); acum = 0; trav = true; }
    clearTimeout(tAcum); tAcum = setTimeout(function () { acum = 0; trav = false; }, 200);
  }, { passive: false });
  var t0 = null;
  raiz.addEventListener('touchstart', function (e) { var t = e.touches[0]; t0 = { x: t.clientX, y: t.clientY }; }, { passive: true });
  raiz.addEventListener('touchend', function (e) { if (!t0) return; var t = e.changedTouches[0], dx = t.clientX - t0.x, dy = t.clientY - t0.y; t0 = null; if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) vai(cur + (dx < 0 ? 1 : -1)); }, { passive: true });
  // iPhone em poupança de energia: um toque com os reels à vista põe o do centro a andar
  addEventListener('touchend', function () { if (!dentro || parado()) return; var v = lis[cur].querySelector('video'); if (v.paused) v.play().catch(function () {}); }, { capture: true, passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { dentro = es[0].isIntersecting; pinta(); }, { threshold: 0.3 }).observe(raiz);
  document.addEventListener('visibilitychange', function () { if (document.hidden) lis[cur].querySelector('video').pause(); else pinta(); });
  pinta();
})();
