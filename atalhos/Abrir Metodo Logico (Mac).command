#!/bin/bash
# Abre o Método Lógico numa janela própria (modo aplicativo) do Chrome ou do Edge.
DIR="$(cd "$(dirname "$0")" && pwd)"
URL="file://$DIR/index.html"
if [ -d "/Applications/Google Chrome.app" ]; then
  open -na "Google Chrome" --args --app="$URL"
elif [ -d "/Applications/Microsoft Edge.app" ]; then
  open -na "Microsoft Edge" --args --app="$URL"
else
  open "$DIR/index.html"
fi
