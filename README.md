# Knowly Resumos — Landing Page de Vendas

Landing page estática (HTML + CSS + JS puro) para venda de PDFs de estudo com checkout na **Cakto**.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | A landing page completa |
| `obrigado.html` | Página de "compra confirmada" (configure como página de redirecionamento na Cakto) |
| `politica-de-privacidade.html` / `termos-de-uso.html` | Páginas legais |
| `livro.html` | Ficha de um PDF, servida em `/livro/[slug]` pelo rewrite do `.htaccess` |
| `css/style.css` | Estilos (cores da marca nas variáveis no topo do arquivo) |
| `js/config.js` | **Link do checkout e preço** — o único lugar a editar para trocar o pagamento |
| `js/main.js` | Contagem regressiva, carrosséis, CTA fixo e evento do Pixel |
| `js/livros.js` | Carrega o catálogo e monta as capas (ver `supabase/README.md`) |
| `data/livros.json` | Catálogo com as 100 personalidades (gerado por `scripts/`) |
| `img/capas/` | Capas reais, extraídas da primeira página de cada PDF |

## ✅ Checklist antes de publicar

Procure por `TROCAR` nos arquivos HTML (Ctrl+F) — cada ponto que precisa de edição está marcado com um comentário `<!-- TROCAR: ... -->`.

### 1. Checkout da Cakto ✅ (já configurado)
O site vende **uma oferta única**: a coleção completa por **R$ 24,90**, em pagamento único.

O link do checkout mora em **um único lugar**, no topo de `js/config.js`:

```js
// TROCAR: link do checkout da Cakto
var CHECKOUT = 'https://pay.cakto.com.br/4sf4c9d_1010445';

// TROCAR junto com o preço do produto na Cakto
var PRECO = 'R$ 24,90';
```

Todo botão de compra é marcado com o atributo `data-checkout`, e em cada carregamento o `config.js` reescreve o destino de todos eles a partir da constante acima — topbar, menu, hero, amostras, dores, benefícios, FAQ, card da oferta, barra fixa do celular e a ficha de cada livro.

> **Ao trocar o link, mude também os `href` do `index.html`.** Os botões trazem a URL escrita no HTML como rede de segurança, para continuarem funcionando caso o JavaScript falhe. Um `Localizar e substituir` da URL antiga pela nova no projeto inteiro resolve. Se esquecer, quem tem JS (praticamente todo mundo) vai para o link novo, mas o fallback ficaria desatualizado.

Os parâmetros de campanha da visita (`utm_*`, `gclid`, `fbclid`, `ttclid`, `sck`, `src`) são repassados automaticamente para o checkout, para a Cakto atribuir a venda à origem certa.

Na Cakto, configure a **página de obrigado** do produto para apontar para `https://SEU-DOMINIO/obrigado.html`.

### 2. WhatsApp ✅ (já configurado)
O botão de suporte já aponta para o número (16) 99777-3830 em `index.html` e `obrigado.html`. Se um dia mudar de número, procure por `wa.me/` nesses arquivos.

### 3. Imagens (obrigatório)
Substitua na pasta `img/`:
- as capas do catálogo são geradas automaticamente da primeira página de cada PDF (veja `scripts/`) — não precisa mexer
- `depoimento-1.svg` a `depoimento-3.svg` → prints reais de depoimentos de clientes (**use apenas depoimentos verdadeiros e com autorização**)

### 4. Textos
- Edite a lista de matérias no hero do `index.html` conforme os PDFs que você realmente tem
- Se tiver CNPJ/MEI, adicione no rodapé e nas páginas legais (passa confiança)

### 5. Pixel da Meta (para anúncios)
O código do Pixel **já está instalado** no `<head>` do `index.html` e do `obrigado.html` — falta só o ID:
1. No Gerenciador de Anúncios, vá em **Gerenciador de Eventos → Fontes de dados** e copie o ID do seu Pixel (só números)
2. Cole o ID entre as aspas de `var META_PIXEL_ID = "";` nos DOIS arquivos (`index.html` e `obrigado.html`)

Eventos que já ficam funcionando automaticamente:
- **PageView** — em todas as visitas à página
- **InitiateCheckout** — quando alguém clica em qualquer botão de compra (marcados com `data-checkout`)
- **Purchase** — quando alguém cai na página `obrigado.html` após a compra (configure a Cakto para redirecionar para ela)

Enquanto o ID estiver vazio, o Pixel fica desativado e o site funciona normalmente.

## 📈 Dicas de conversão (Cakto e anúncios)

O site já tem as alavancas de conversão implementadas (CTA fixo no celular, checkout a um clique de qualquer botão, seção "Como funciona", selos de confiança, FAQ de segurança). As maiores alavancas restantes ficam FORA do site:

- **Order bump na Cakto**: ofereça um complemento no próprio checkout. É a forma mais fácil de aumentar o ticket médio agora que existe uma oferta só.
- **Recuperação de Pix/carrinho abandonado**: ative na Cakto o e-mail/WhatsApp automático para quem gerou Pix e não pagou — em low ticket isso recupera muitas vendas.
- **Consistência anúncio → página**: use no criativo do anúncio a mesma promessa da headline do site ("Domine as personalidades que marcaram a história"). Anúncio e página falando a mesma língua aumentam a conversão.
- **Âncora no criativo**: teste anunciar "as 100 personalidades por menos de R$ 25" — é a oferta mais forte da página.
- **Ao mudar o preço**: atualize `PRECO` em `js/config.js` **e** o valor exibido no card da oferta em `index.html`, além do produto na Cakto. O `value: 24.90` do evento `Purchase` em `obrigado.html` também precisa acompanhar.

## 🚀 Como publicar (grátis)

**Netlify (mais fácil):**
1. Crie uma conta em [netlify.com](https://www.netlify.com)
2. Arraste a pasta inteira do projeto para o painel (Deploys → drag & drop)
3. Pronto — você recebe uma URL `*.netlify.app`; depois conecte seu domínio próprio em *Domain settings*

**Vercel:** mesmo processo em [vercel.com](https://vercel.com).

## ⚠️ Avisos importantes

- **Não use depoimentos falsos** nem prints inventados — além de ilegal (publicidade enganosa, CDC), plataformas de anúncio banem contas por isso.
- A **garantia de 7 dias** exibida no site é obrigatória por lei para vendas online (CDC, art. 49) — a Cakto processa os reembolsos.
- Venda apenas materiais **autorais ou licenciados** — revender PDF de terceiros viola direitos autorais.
- A contagem regressiva é "evergreen" (15 min por visitante, reinicia ao zerar). Se preferir uma promoção com data real, edite `js/main.js`.

## 🎨 Mudar as cores da marca

Edite as variáveis no topo de `css/style.css` (`--ink`, `--verde`, `--fundo`, etc.).
