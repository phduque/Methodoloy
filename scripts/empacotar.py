"""Gera o pacote para instalar no computador: dist/Metodo-Logico.zip.

Uso: python3 scripts/empacotar.py
"""
import os
import zipfile

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, "dist", "Metodo-Logico.zip")
PASTA = "Metodo-Logico/"
ITENS = ["index.html", "manifest.webmanifest", "sw.js", "README.md", "css", "js", "vendor", "icones"]
EXECUTAVEIS = (".command", ".sh")


def adicionar(z, origem, nome):
    info = zipfile.ZipInfo.from_file(origem, PASTA + nome)
    modo = 0o755 if nome.endswith(EXECUTAVEIS) else 0o644
    info.external_attr = (0o100000 | modo) << 16
    info.compress_type = zipfile.ZIP_DEFLATED
    with open(origem, "rb") as f:
        z.writestr(info, f.read())


os.makedirs(os.path.dirname(DESTINO), exist_ok=True)
with zipfile.ZipFile(DESTINO, "w") as z:
    for item in ITENS:
        caminho = os.path.join(RAIZ, item)
        if os.path.isdir(caminho):
            for base, _, arqs in os.walk(caminho):
                for a in sorted(arqs):
                    o = os.path.join(base, a)
                    adicionar(z, o, os.path.relpath(o, RAIZ).replace(os.sep, "/"))
        else:
            adicionar(z, caminho, item)
    for a in sorted(os.listdir(os.path.join(RAIZ, "atalhos"))):
        adicionar(z, os.path.join(RAIZ, "atalhos", a), a)
print(DESTINO, os.path.getsize(DESTINO), "bytes")
