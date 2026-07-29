// ═══════════ KNOWLY RESUMOS — catálogo dinâmico de livros ═══════════
// As capas nunca são fixas no HTML: vêm sempre desta camada de dados.
// Enquanto não houver projeto Supabase, lê de data/livros.json com o mesmo
// formato de registro — basta preencher SUPABASE abaixo para trocar a fonte.

const SUPABASE = {
  url: '',   // ex.: https://xxxxxxxx.supabase.co
  chave: '', // chave publishable (anon), nunca a service_role
  tabela: 'livros',
  bucket: 'capas'
};

const ARQUIVO_LOCAL = 'data/livros.json';

// Só os campos que a home precisa — evita trafegar o catálogo inteiro.
const CAMPOS = 'id,titulo,categoria,imagem_da_capa,slug,descricao,paginas,destaque,data_criacao,largura,altura,blur';

const usandoSupabase = () => Boolean(SUPABASE.url && SUPABASE.chave);

/** Resolve o caminho da capa: no Supabase é o nome do arquivo no bucket. */
function urlDaCapa(livro) {
  const valor = livro.imagem_da_capa || '';
  if (/^https?:\/\//.test(valor) || valor.includes('/')) return valor;
  return `${SUPABASE.url}/storage/v1/object/public/${SUPABASE.bucket}/${valor}`;
}

async function consultarSupabase(filtro, limite) {
  const params = new URLSearchParams({ select: CAMPOS, order: 'data_criacao.desc', limit: limite });
  if (filtro) params.append('destaque', 'is.true');
  const resposta = await fetch(`${SUPABASE.url}/rest/v1/${SUPABASE.tabela}?${params}`, {
    headers: { apikey: SUPABASE.chave, Authorization: `Bearer ${SUPABASE.chave}` }
  });
  if (!resposta.ok) throw new Error(`Supabase respondeu ${resposta.status}`);
  return resposta.json();
}

// Guarda a promessa, não o resultado: as montagens da home rodam em paralelo
// e sem isso o catálogo seria baixado duas vezes.
let cacheLocal = null;
async function consultarLocal() {
  if (!cacheLocal) {
    cacheLocal = fetch(ARQUIVO_LOCAL).then((resposta) => {
      if (!resposta.ok) throw new Error(`Não foi possível ler ${ARQUIVO_LOCAL}`);
      return resposta.json();
    });
    cacheLocal.catch(() => { cacheLocal = null; }); // permite nova tentativa
  }
  const todos = await cacheLocal;
  return todos.slice().sort((a, b) => b.data_criacao.localeCompare(a.data_criacao));
}

/**
 * Livros em destaque. Sem nenhum marcado como destaque, cai para os mais
 * recentes — a home nunca fica vazia.
 */
export async function buscarDestaques(limite = 8) {
  if (usandoSupabase()) {
    const destaques = await consultarSupabase(true, limite);
    return destaques.length ? destaques : consultarSupabase(false, 3);
  }
  const todos = await consultarLocal();
  const destaques = todos.filter((l) => l.destaque).slice(0, limite);
  return destaques.length ? destaques : todos.slice(0, 3);
}

/** Livros mais recentes, para a vitrine de amostras. */
export async function buscarRecentes(limite = 20) {
  if (usandoSupabase()) return consultarSupabase(false, limite);
  return (await consultarLocal()).slice(0, limite);
}

/** Um livro pelo slug, para a página de detalhe. */
export async function buscarPorSlug(slug) {
  if (usandoSupabase()) {
    const params = new URLSearchParams({ select: `${CAMPOS},autor,preco`, slug: `eq.${slug}`, limit: 1 });
    const resposta = await fetch(`${SUPABASE.url}/rest/v1/${SUPABASE.tabela}?${params}`, {
      headers: { apikey: SUPABASE.chave, Authorization: `Bearer ${SUPABASE.chave}` }
    });
    if (!resposta.ok) throw new Error(`Supabase respondeu ${resposta.status}`);
    return (await resposta.json())[0] || null;
  }
  return (await consultarLocal()).find((l) => l.slug === slug) || null;
}

// ─────────────────── Capa individual ───────────────────

/**
 * Monta uma capa clicável. `prioridade` marca a capa da frente, que é
 * carregada imediatamente; as demais ficam em lazy loading.
 */
export function criarCapa(livro, { prioridade = false, clicavel = true } = {}) {
  const link = document.createElement(clicavel ? 'a' : 'div');
  link.className = 'capa-livro';
  if (clicavel) {
    link.href = `/livro/${livro.slug}`;
    link.setAttribute('aria-label', `${livro.titulo} — ver detalhes do PDF`);
  }

  if (livro.blur) link.style.backgroundImage = `url("${livro.blur}")`;
  if (livro.largura && livro.altura) {
    link.style.aspectRatio = `${livro.largura} / ${livro.altura}`;
  }

  const img = document.createElement('img');
  img.src = urlDaCapa(livro);
  img.alt = `Capa do PDF de ${livro.titulo}`;
  img.width = livro.largura || 640;
  img.height = livro.altura || 905;
  img.decoding = 'async';
  if (prioridade) {
    img.loading = 'eager';
    img.fetchPriority = 'high';
  } else {
    img.loading = 'lazy';
  }
  img.addEventListener('load', () => link.classList.add('carregada'), { once: true });
  if (img.complete) link.classList.add('carregada');

  link.appendChild(img);
  return link;
}

/** Pré-carrega a primeira capa o quanto antes, ainda no <head>. */
function precarregar(livro) {
  if (!livro || document.querySelector('link[data-capa-precarregada]')) return;
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = urlDaCapa(livro);
  link.setAttribute('data-capa-precarregada', '');
  document.head.appendChild(link);
}

// ─────────────────── Pilha de capas ───────────────────

const POSICOES = 3; // capas visíveis na pilha

/**
 * Empilha as capas: a da frente inteira, as outras parcialmente atrás.
 * Devolve um controle para girar a pilha.
 */
export function montarPilha(container, livros) {
  container.innerHTML = '';
  const cartoes = livros.map((livro, i) => {
    const capa = criarCapa(livro, { prioridade: i === 0 });
    container.appendChild(capa);
    return capa;
  });

  function posicionar(atual) {
    cartoes.forEach((cartao, i) => {
      const desloc = (i - atual + cartoes.length) % cartoes.length;
      cartao.dataset.posicao = desloc < POSICOES ? desloc : 'oculta';
      cartao.setAttribute('aria-hidden', desloc === 0 ? 'false' : 'true');
      cartao.tabIndex = desloc === 0 ? 0 : -1;
    });
  }

  posicionar(0);
  return { cartoes, posicionar };
}

// ─────────────────── Carrossel automático ───────────────────

const INTERVALO = 5000;

/**
 * Troca a capa da frente a cada 5s. Pausa no hover, no foco do teclado,
 * com a aba em segundo plano e para quem pede menos animação.
 */
export function iniciarCarrossel(container, pilha, total) {
  if (total <= POSICOES) return;

  const menosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
  let atual = 0;
  let timer = null;

  const girar = () => {
    atual = (atual + 1) % total;
    pilha.posicionar(atual);
  };

  function tocar() {
    if (timer || menosMovimento.matches || document.hidden) return;
    timer = setInterval(girar, INTERVALO);
  }

  function pausar() {
    clearInterval(timer);
    timer = null;
  }

  container.addEventListener('mouseenter', pausar);
  container.addEventListener('mouseleave', tocar);
  container.addEventListener('focusin', pausar);
  container.addEventListener('focusout', tocar);
  document.addEventListener('visibilitychange', () => (document.hidden ? pausar() : tocar()));
  menosMovimento.addEventListener('change', () => (menosMovimento.matches ? pausar() : tocar()));

  tocar();
}

// ─────────────────── Montagem da home ───────────────────

async function montarDestaques() {
  const container = document.querySelector('[data-pilha-capas]');
  if (!container) return;

  const livros = await buscarDestaques();
  if (!livros.length) {
    container.closest('.hero-visual')?.remove();
    return;
  }

  precarregar(livros[0]);
  const pilha = montarPilha(container, livros);
  iniciarCarrossel(container, pilha, livros.length);
  container.classList.add('pronta');
}

async function montarAmostras() {
  const trilho = document.querySelector('[data-trilho-amostras]');
  if (!trilho) return;

  const livros = await buscarRecentes();
  trilho.innerHTML = '';
  livros.forEach((livro) => trilho.appendChild(criarCapa(livro)));
}

Promise.allSettled([montarDestaques(), montarAmostras()]).then((resultados) => {
  resultados
    .filter((r) => r.status === 'rejected')
    .forEach((r) => console.error('[knowly] falha ao carregar capas:', r.reason));
});
