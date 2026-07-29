# Catálogo no Supabase

Hoje a home lê o catálogo de `data/livros.json`. O código já fala o protocolo do
Supabase — trocar a fonte é preencher 2 campos, sem mexer em mais nada.

## Por que ainda não está ligado

O plano gratuito do Supabase permite **2 projetos ativos** por administrador, e a
conta já tem `oficina-saas` e `benevento-veiculos` rodando. Para criar o projeto
do Knowly é preciso pausar um desses dois no painel do Supabase, ou assinar o
plano Pro.

## Como ativar

1. **Criar o projeto** no [painel do Supabase](https://supabase.com/dashboard),
   região `sa-east-1` (São Paulo).

2. **Rodar os SQLs** no SQL Editor, nesta ordem:
   - `01-schema.sql` — tabela `livros`, índices, RLS e o bucket público `capas`
   - `02-seed.sql` — os 97 livros do catálogo

3. **Subir as capas**: em Storage → bucket `capas`, enviar todos os arquivos de
   `img/capas/`. Os nomes precisam bater com a coluna `imagem_da_capa`
   (ex.: `albert-einstein.webp`).

4. **Apontar o site**: em `js/livros.js`, preencher o topo do arquivo:

   ```js
   const SUPABASE = {
     url: 'https://SEU-PROJETO.supabase.co',
     chave: 'sb_publishable_...',   // chave publishable (anon)
     tabela: 'livros',
     bucket: 'capas'
   };
   ```

A partir daí a home passa a ler do banco. Marcar `destaque = true` em qualquer
livro faz a capa aparecer na pilha do hero na próxima visita, sem tocar no código.

## Segurança

Use sempre a chave **publishable/anon** — ela é pública por natureza e o RLS já
limita o acesso anônimo a leitura. A chave `service_role` nunca deve entrar em
arquivo do site, porque ignora o RLS e daria escrita a qualquer visitante.

## Regerar o catálogo

As capas são a primeira página real de cada PDF, renderizada com `pypdfium2`.
Quando novos e-books forem gerados em `Criador de PDFS/output/`, é só rodar de
novo os dois scripts que produziram estes arquivos para atualizar
`img/capas/`, `data/livros.json` e `02-seed.sql`.
