# -*- coding: utf-8 -*-
"""Gera data/livros.json e supabase/02-seed.sql a partir do catálogo extraído."""
import json
from datetime import date, timedelta
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent
CATALOGO = SITE / "scripts" / ".catalogo.json"
DIR_CAPAS = SITE / "img" / "capas"
DIR_DADOS = SITE / "data"
DIR_SUPABASE = SITE / "supabase"

# Não há preço por PDF: vende-se a coleção completa, e o valor mora numa
# constante única em js/config.js. A coluna `preco` continua existindo no
# schema do Supabase para uso futuro, mas o catálogo não a preenche.
AUTOR = "Edições Premium"
BASE = date(2026, 1, 1)

# Capas em destaque na home (numero da colecao)
DESTAQUES = {21, 45, 44, 65, 53, 42}


def main():
    DIR_DADOS.mkdir(parents=True, exist_ok=True)
    DIR_SUPABASE.mkdir(parents=True, exist_ok=True)

    origem = json.loads(CATALOGO.read_text(encoding="utf-8"))
    origem.sort(key=lambda r: r["numero"])

    livros = []
    for reg in origem:
        livros.append({
            "id": reg["numero"],
            "titulo": reg["titulo"],
            "autor": AUTOR,
            "categoria": reg["categoria"],
            "imagem_da_capa": f"img/capas/{reg['arquivo_capa']}",
            "slug": reg["slug"],
            "descricao": reg["descricao"],
            "paginas": reg["paginas"],
            "destaque": reg["numero"] in DESTAQUES,
            "data_criacao": (BASE + timedelta(days=reg["numero"])).isoformat(),
            "largura": reg["largura"],
            "altura": reg["altura"],
            "blur": reg["blur"],
        })

    (DIR_DADOS / "livros.json").write_text(
        json.dumps(livros, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Seed SQL pronto para rodar no Supabase assim que houver um projeto
    def esc(v):
        if v is None:
            return "null"
        if isinstance(v, bool):
            return "true" if v else "false"
        if isinstance(v, (int, float)):
            return str(v)
        return "'" + str(v).replace("'", "''") + "'"

    colunas = ["id", "titulo", "autor", "categoria", "imagem_da_capa", "slug",
               "descricao", "paginas", "destaque", "data_criacao",
               "largura", "altura", "blur"]
    linhas = []
    for L in livros:
        # No Supabase a capa vira URL publica do Storage
        registro = dict(L)
        registro["imagem_da_capa"] = L["imagem_da_capa"].replace("img/capas/", "")
        linhas.append("  (" + ", ".join(esc(registro[c]) for c in colunas) + ")")

    sql = (
        "insert into public.livros (" + ", ".join(colunas) + ") values\n"
        + ",\n".join(linhas)
        + "\non conflict (slug) do update set\n"
        + ",\n".join(f"  {c} = excluded.{c}" for c in colunas if c != "id" and c != "slug")
        + ";\n"
    )
    seed = DIR_SUPABASE / "02-seed.sql"
    seed.write_text(sql, encoding="utf-8")

    destaques = [L["titulo"] for L in livros if L["destaque"]]
    faltando = [L["slug"] for L in livros if not (DIR_CAPAS / Path(L["imagem_da_capa"]).name).exists()]
    print(f"{len(livros)} livros -> data/livros.json")
    print(f"Seed SQL  -> supabase/02-seed.sql ({seed.stat().st_size / 1024:.0f} KB)")
    print(f"Destaques: {', '.join(destaques)}")
    if faltando:
        print("AVISO — capas ausentes em img/capas/:", ", ".join(faltando))


if __name__ == "__main__":
    main()
