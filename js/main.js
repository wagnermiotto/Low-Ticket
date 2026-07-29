// ═══════════ KNOWLY RESUMOS — scripts da landing page ═══════════

// ─── Contagem regressiva da barra de urgência ───
// Contagem "evergreen": 15 minutos por visitante, guardada no navegador.
// Quando zera, reinicia (mantém a sensação de urgência sem travar em 00:00).
(function () {
  var el = document.getElementById('countdown');
  if (!el) return;

  var DURACAO = 15 * 60 * 1000; // 15 minutos
  var fim = parseInt(localStorage.getItem('knowly_fim_promo'), 10);

  if (!fim || fim < Date.now()) {
    fim = Date.now() + DURACAO;
    localStorage.setItem('knowly_fim_promo', fim);
  }

  function atualizar() {
    var resta = fim - Date.now();
    if (resta <= 0) {
      fim = Date.now() + DURACAO;
      localStorage.setItem('knowly_fim_promo', fim);
      resta = DURACAO;
    }
    var min = Math.floor(resta / 60000);
    var seg = Math.floor((resta % 60000) / 1000);
    el.textContent = (min < 10 ? '0' : '') + min + ':' + (seg < 10 ? '0' : '') + seg;
  }

  atualizar();
  setInterval(atualizar, 1000);
})();

// ─── Carrosséis (amostras e depoimentos) ───
document.querySelectorAll('[data-carrossel]').forEach(function (carrossel) {
  var trilho = carrossel.querySelector('.carrossel-trilho');
  var prev = carrossel.querySelector('.seta-prev');
  var next = carrossel.querySelector('.seta-next');

  function passo() {
    var img = trilho.querySelector('img');
    return img ? img.offsetWidth + 16 : 300;
  }

  prev.addEventListener('click', function () {
    trilho.scrollBy({ left: -passo(), behavior: 'smooth' });
  });

  next.addEventListener('click', function () {
    trilho.scrollBy({ left: passo(), behavior: 'smooth' });
  });
});

// ─── Ano atual no rodapé ───
var ano = document.getElementById('ano');
if (ano) ano.textContent = new Date().getFullYear();

// ─── Pixel da Meta: evento InitiateCheckout ───
// Dispara quando alguém clica no botão de um plano (só funciona se o Pixel
// estiver configurado no index.html; caso contrário, não faz nada).
document.querySelectorAll('.btn-plano').forEach(function (btn) {
  btn.addEventListener('click', function () {
    if (typeof fbq === 'function') {
      fbq('track', 'InitiateCheckout');
    }
  });
});

// ─── Barra de CTA fixa no mobile ───
// Aparece quando o visitante rola além do hero e some enquanto a seção
// de planos está na tela (para não cobrir os botões de compra).
(function () {
  var ctaFixo = document.getElementById('cta-fixo');
  var hero = document.querySelector('.hero');
  var secaoPlanos = document.getElementById('planos');
  if (!ctaFixo || !hero || !secaoPlanos) return;

  var aguardando = false;

  function atualizar() {
    aguardando = false;
    var heroRect = hero.getBoundingClientRect();
    var planosRect = secaoPlanos.getBoundingClientRect();
    var alturaJanela = window.innerHeight;
    var heroVisivel = heroRect.bottom > 0;
    var planosVisivel = planosRect.top < alturaJanela && planosRect.bottom > 0;
    ctaFixo.classList.toggle('visivel', !heroVisivel && !planosVisivel);
  }

  function aoRolar() {
    if (!aguardando) {
      aguardando = true;
      requestAnimationFrame(atualizar);
    }
  }

  window.addEventListener('scroll', aoRolar, { passive: true });
  window.addEventListener('resize', aoRolar);
  atualizar();
})();
