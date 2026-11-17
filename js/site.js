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
    var fim = function () { raiz.classList.remove('abre'); };
    setTimeout(fim, 4300);
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
