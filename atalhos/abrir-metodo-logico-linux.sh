#!/bin/sh
# Abre o Método Lógico numa janela própria (modo aplicativo) do Chrome, Chromium ou Edge.
DIR="$(cd "$(dirname "$0")" && pwd)"
URL="file://$DIR/index.html"
for b in google-chrome chromium chromium-browser microsoft-edge; do
  if command -v "$b" >/dev/null 2>&1; then exec "$b" --app="$URL"; fi
done
xdg-open "$DIR/index.html"
