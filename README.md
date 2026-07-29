# Knowly Resumos — Landing Page de Vendas

Landing page estática (HTML + CSS + JS puro) para venda de PDFs de estudo com checkout na **Cakto**.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | A landing page completa |
| `obrigado.html` | Página de "compra confirmada" (configure como página de redirecionamento na Cakto) |
| `politica-de-privacidade.html` / `termos-de-uso.html` | Páginas legais |
| `css/style.css` | Estilos (cores da marca nas variáveis no topo do arquivo) |
| `js/main.js` | Contagem regressiva, carrosséis e ano do rodapé |
| `img/` | Imagens — **todas são placeholders** para você substituir |

## ✅ Checklist antes de publicar

Procure por `TROCAR` nos arquivos HTML (Ctrl+F) — cada ponto que precisa de edição está marcado com um comentário `<!-- TROCAR: ... -->`.

### 1. Links da Cakto (obrigatório)
Crie os 3 produtos no painel da Cakto:
- **Básico** — R$ 12,90 — pagamento único
- **Estudante** — R$ 24,90 — pagamento único
- **Premium** — R$ 49,90/mês — **assinatura (recorrência mensal)**

Depois, no `index.html`, substitua os 3 links dos botões dos planos:
- `#COLE-AQUI-LINK-CAKTO-BASICO`
- `#COLE-AQUI-LINK-CAKTO-ESTUDANTE`
- `#COLE-AQUI-LINK-CAKTO-PREMIUM`

Na Cakto, configure a **página de obrigado** de cada produto para apontar para `https://SEU-DOMINIO/obrigado.html`.

### 2. WhatsApp ✅ (já configurado)
O botão de suporte já aponta para o número (16) 99777-3830 em `index.html` e `obrigado.html`. Se um dia mudar de número, procure por `wa.me/` nesses arquivos.

### 3. Imagens (obrigatório)
Substitua na pasta `img/`:
- `amostra-1.svg` a `amostra-4.svg` → prints reais de páginas dos seus PDFs (pode usar .jpg/.png — atualize o `src` no HTML)
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
- **InitiateCheckout** — quando alguém clica no botão de um plano
- **Purchase** — quando alguém cai na página `obrigado.html` após a compra (configure a Cakto para redirecionar para ela)

Enquanto o ID estiver vazio, o Pixel fica desativado e o site funciona normalmente.

## 📈 Dicas de conversão (Cakto e anúncios)

O site já tem as alavancas de conversão implementadas (CTA fixo no celular, ancoragem de preço honesta, seção "Como funciona", selos de confiança, FAQ de segurança). As maiores alavancas restantes ficam FORA do site:

- **Order bump na Cakto**: no checkout do plano Básico, ofereça o upgrade para o Estudante por uma diferença pequena. É a forma mais fácil de aumentar o ticket médio.
- **Recuperação de Pix/carrinho abandonado**: ative na Cakto o e-mail/WhatsApp automático para quem gerou Pix e não pagou — em low ticket isso recupera muitas vendas.
- **Consistência anúncio → página**: use no criativo do anúncio a mesma promessa da headline do site ("Domine as personalidades que marcaram a história"). Anúncio e página falando a mesma língua aumentam a conversão.
- **Âncora no criativo**: teste anunciar "todos os PDFs por menos de R$ 25" — é a oferta mais forte da página.
- **Importante**: se mudar o preço do plano Básico (R$ 12,90) ou o nº de PDFs (16), atualize a linha de ancoragem "16 PDFs avulsos custariam R$ 206,40" no card Estudante para manter o cálculo verdadeiro (16 × R$ 12,90).

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
