// ═══════════ KNOWLY RESUMOS — configuração ═══════════
// Ponto único de verdade do checkout. Para trocar de link de pagamento,
// altere APENAS a constante CHECKOUT abaixo: todos os botões de compra do
// site recebem o destino daqui, em todas as páginas.
//
// Carregado como script clássico no <head>, antes de js/main.js, para ficar
// visível tanto para os scripts clássicos quanto para os módulos ES.

var KNOWLY = (function () {

  // TROCAR: link do checkout da Cakto
  var CHECKOUT = 'https://pay.cakto.com.br/4sf4c9d_1010445';

  // TROCAR junto com o preço do produto na Cakto
  var PRECO = 'R$ 24,90';

  // Parâmetros de campanha repassados ao checkout para a venda ser atribuída
  // à origem certa. É uma lista fechada de propósito: repassar a query inteira
  // levaria lixo — e possivelmente dados do visitante — para dentro da Cakto.
  var RASTREIO = [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'utm_id', 'gclid', 'fbclid', 'ttclid', 'sck', 'src'
  ];

  // URL do checkout já com os parâmetros de campanha da visita atual.
  function checkoutUrl() {
    try {
      var atual = new URLSearchParams(window.location.search);
      var destino = new URL(CHECKOUT);
      RASTREIO.forEach(function (chave) {
        var valor = atual.get(chave);
        if (valor) destino.searchParams.set(chave, valor);
      });
      return destino.toString();
    } catch (erro) {
      // Se algo falhar, o visitante ainda precisa conseguir comprar.
      return CHECKOUT;
    }
  }

  // Aplica o destino em todo elemento marcado com data-checkout.
  // Os href já vêm preenchidos no HTML (funciona sem JS); aqui só
  // acrescentamos o rastreio da campanha.
  function aplicarCheckout(raiz) {
    var alvos = (raiz || document).querySelectorAll('[data-checkout]');
    var url = checkoutUrl();
    Array.prototype.forEach.call(alvos, function (el) {
      el.setAttribute('href', url);
      el.setAttribute('target', '_self');
    });
    return alvos.length;
  }

  document.addEventListener('DOMContentLoaded', function () {
    aplicarCheckout();
  });

  return {
    CHECKOUT: CHECKOUT,
    PRECO: PRECO,
    checkoutUrl: checkoutUrl,
    aplicarCheckout: aplicarCheckout
  };
})();
