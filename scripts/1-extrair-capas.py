# -*- coding: utf-8 -*-
"""Renderiza a capa (pagina 1) de cada PDF da colecao e coleta os metadados."""
import base64
import io
import json
import re
import unicodedata
from pathlib import Path

import pypdfium2 as pdfium
from PIL import Image

PROJETO = Path(__file__).resolve().parent.parent
RAIZ = PROJETO.parent / "Criador de PDFS"
SAIDA = PROJETO / "img" / "capas"
CATALOGO = PROJETO / "scripts" / ".catalogo.json"
SAIDA.mkdir(parents=True, exist_ok=True)

LARGURA_CAPA = 640      # 2x o slot de exibicao (~300px)
LARGURA_BLUR = 16       # placeholder base64

CATEGORIAS = {
    "01_Grandes_Filosofos": "Grandes Filósofos",
    "02_Grandes_Cientistas": "Grandes Cientistas",
    "03_Grandes_Lideres_Historicos": "Grandes Líderes Históricos",
    "04_Grandes_Escritores_e_Artistas": "Grandes Escritores e Artistas",
    "05_Grandes_Pensadores_e_Empreendedores": "Grandes Pensadores e Empreendedores",
}


def virar_slug(texto):
    texto = unicodedata.normalize("NFKD", texto).encode("ascii", "ignore").decode()
    texto = re.sub(r"[^a-zA-Z0-9]+", "-", texto).strip("-").lower()
    return texto


def ler_colecao():
    """Le COLECAO.md -> {numero: {'nome','slug_py','status'}}"""
    texto = (RAIZ / "COLECAO.md").read_text(encoding="utf-8")
    mapa = {}
    for linha in texto.splitlines():
        m = re.match(r"^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|$", linha)
        if m:
            mapa[int(m.group(1))] = {
                "nome": m.group(2).strip(),
                "slug_py": m.group(3).strip(),
                "status": m.group(4).strip(),
            }
    return mapa


def ler_meta(slug_py):
    """Executa o meta.py do livro e devolve o dict META."""
    caminho = RAIZ / "ebook" / "books" / slug_py / "meta.py"
    if not caminho.exists():
        return {}
    espaco = {}
    exec(compile(caminho.read_text(encoding="utf-8"), str(caminho), "exec"), espaco)
    return espaco.get("META", {})


def limpar_espacado(texto):
    """'A D A M   S M I T H' -> 'Adam Smith' quando o texto vem espacado na capa."""
    if not texto:
        return ""
    bruto = texto.strip()
    letras = [c for c in bruto if c != " "]
    if letras and (bruto.count("  ") > 2 or len(bruto) > 2 * len(letras) - 2):
        partes = [p for p in re.split(r"\s{2,}", bruto) if p.strip()]
        bruto = " ".join(p.replace(" ", "") for p in partes)
    return " ".join(bruto.split())


def main():
    colecao = ler_colecao()
    registros = []
    faltando = []

    for pasta, categoria in CATEGORIAS.items():
        dir_pdf = RAIZ / "output" / pasta
        if not dir_pdf.exists():
            continue
        for pdf_path in sorted(dir_pdf.glob("*.pdf")):
            m = re.match(r"^(\d+)\s*-\s*(.+)\.pdf$", pdf_path.name)
            if not m:
                faltando.append(f"nome fora do padrao: {pdf_path.name}")
                continue
            numero = int(m.group(1))
            info = colecao.get(numero)
            if not info:
                faltando.append(f"numero {numero} ausente no COLECAO.md")
                continue

            meta = ler_meta(info["slug_py"])
            slug = virar_slug(info["nome"])

            pdf = pdfium.PdfDocument(str(pdf_path))
            paginas = len(pdf)
            pagina = pdf[0]
            largura_pt = pagina.get_width()
            escala = LARGURA_CAPA / largura_pt
            imagem = pagina.render(scale=escala).to_pil().convert("RGB")

            arq_webp = SAIDA / f"{slug}.webp"
            imagem.save(arq_webp, "WEBP", quality=82, method=6)

            proporcao = imagem.height / imagem.width
            mini = imagem.resize((LARGURA_BLUR, max(1, round(LARGURA_BLUR * proporcao))), Image.LANCZOS)
            buf = io.BytesIO()
            mini.save(buf, "WEBP", quality=45)
            blur = "data:image/webp;base64," + base64.b64encode(buf.getvalue()).decode()

            pdf.close()

            registros.append({
                "numero": numero,
                "titulo": info["nome"],
                "slug": slug,
                "categoria": categoria,
                "descricao": limpar_espacado(meta.get("cover_subtitle", "")),
                "frase": (meta.get("cover_quote") or "").strip('"“” '),
                "paginas": paginas,
                "arquivo_capa": arq_webp.name,
                "largura": imagem.width,
                "altura": imagem.height,
                "bytes_capa": arq_webp.stat().st_size,
                "blur": blur,
            })
            print(f"[{numero:>3}] {info['nome']:<32} {paginas:>3}p  {arq_webp.stat().st_size/1024:>6.1f} KB")

    CATALOGO.write_text(json.dumps(registros, ensure_ascii=False, indent=2), encoding="utf-8")
    total_kb = sum(r["bytes_capa"] for r in registros) / 1024
    print(f"\n{len(registros)} capas -> {SAIDA} | {total_kb:.0f} KB no total")
    if faltando:
        print("AVISOS:")
        for aviso in faltando:
            print("  -", aviso)


if __name__ == "__main__":
    main()
