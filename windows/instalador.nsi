; Instalador Windows do Método Lógico — Assistente de Pesquisa
; Gera: dist/Metodo-Logico-Instalador.exe  (ver scripts/gerar_instalador.sh)
;
; Instala por usuário (sem pedir administrador), cria atalhos no menu Iniciar
; e na área de trabalho que abrem o programa numa janela própria do Microsoft
; Edge (ou do Chrome), e registra o desinstalador em Configurações > Aplicativos.

Unicode true
SetCompressor /SOLID lzma

!define APP      "Método Lógico"
!define APPID    "MetodoLogico"
!define VERSAO   "1.0.0"
!define EDITOR   "Assistente de Pesquisa — Método Lógico"
!define RAIZ     ".."
!define UNINST   "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APPID}"

Name "${APP}"
OutFile "${RAIZ}/dist/Metodo-Logico-Instalador.exe"
InstallDir "$LOCALAPPDATA\Programs\${APPID}"
InstallDirRegKey HKCU "Software\${APPID}" "Pasta"
RequestExecutionLevel user
BrandingText "${APP} ${VERSAO}"

VIProductVersion "${VERSAO}.0"
VIAddVersionKey /LANG=1046 "ProductName" "${APP}"
VIAddVersionKey /LANG=1046 "FileDescription" "Instalador do ${APP} — Assistente de Pesquisa"
VIAddVersionKey /LANG=1046 "FileVersion" "${VERSAO}"
VIAddVersionKey /LANG=1046 "ProductVersion" "${VERSAO}"
VIAddVersionKey /LANG=1046 "LegalCopyright" "Uso acadêmico"

!include "MUI2.nsh"
!include "LogicLib.nsh"

!define MUI_ICON   "icone.ico"
!define MUI_UNICON "icone.ico"
!define MUI_ABORTWARNING
!define MUI_WELCOMEPAGE_TITLE "Instalar o ${APP}"
!define MUI_WELCOMEPAGE_TEXT "Assistente passo a passo do projeto à redação final de TCC, monografia, dissertação, tese ou artigo, pelo Método Lógico.$\r$\n$\r$\nO programa funciona sem internet e abre numa janela própria do Microsoft Edge. Não é preciso ser administrador.$\r$\n$\r$\nClique em Avançar para continuar."
!define MUI_FINISHPAGE_RUN
!define MUI_FINISHPAGE_RUN_TEXT "Abrir o ${APP} agora"
!define MUI_FINISHPAGE_RUN_FUNCTION AbrirAgora
!define MUI_FINISHPAGE_SHOWREADME "$INSTDIR\LEIA-ME.txt"
!define MUI_FINISHPAGE_SHOWREADME_TEXT "Ler as instruções (backup dos trabalhos)"
!define MUI_FINISHPAGE_SHOWREADME_NOTCHECKED

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "PortugueseBR"

Var Navegador
Var Endereco

; Troca "\" por "/" para montar o endereço file:///
Function BarrasParaFrente
  Exch $0
  Push $1
  Push $2
  Push $3
  StrCpy $1 ""
  StrCpy $2 0
  loop:
    StrCpy $3 $0 1 $2
    StrCmp $3 "" fim
    StrCmp $3 "\" 0 +3
      StrCpy $1 "$1/"
      Goto prox
    StrCpy $1 "$1$3"
  prox:
    IntOp $2 $2 + 1
    Goto loop
  fim:
  StrCpy $0 $1
  Pop $3
  Pop $2
  Pop $1
  Exch $0
FunctionEnd

; Localiza o Edge (ou o Chrome) pelo registro do Windows
Function AcharNavegador
  ReadRegStr $Navegador HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe" ""
  ${If} $Navegador == ""
    ReadRegStr $Navegador HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\msedge.exe" ""
  ${EndIf}
  ${If} $Navegador == ""
  ${AndIf} ${FileExists} "$PROGRAMFILES32\Microsoft\Edge\Application\msedge.exe"
    StrCpy $Navegador "$PROGRAMFILES32\Microsoft\Edge\Application\msedge.exe"
  ${EndIf}
  ${If} $Navegador == ""
    ReadRegStr $Navegador HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" ""
  ${EndIf}
  ${If} $Navegador == ""
    ReadRegStr $Navegador HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" ""
  ${EndIf}
  Push "$INSTDIR\index.html"
  Call BarrasParaFrente
  Pop $Endereco
  StrCpy $Endereco "file:///$Endereco"
FunctionEnd

!macro CriarAtalho ARQ
  ${If} $Navegador != ""
    CreateShortCut "${ARQ}" "$Navegador" '--app="$Endereco"' "$INSTDIR\icone.ico" 0 SW_SHOWNORMAL "" "Assistente de pesquisa pelo Método Lógico"
  ${Else}
    CreateShortCut "${ARQ}" "$INSTDIR\index.html" "" "$INSTDIR\icone.ico" 0 SW_SHOWNORMAL "" "Assistente de pesquisa pelo Método Lógico"
  ${EndIf}
!macroend

Section "Programa" SecPrograma
  SectionIn RO
  SetOutPath "$INSTDIR"
  ; remove arquivos de uma versão anterior (os trabalhos ficam no navegador e não são afetados)
  RMDir /r "$INSTDIR\js"
  RMDir /r "$INSTDIR\css"
  File "${RAIZ}/index.html"
  File "${RAIZ}/manifest.webmanifest"
  File "${RAIZ}/sw.js"
  File "${RAIZ}/atalhos/LEIA-ME.txt"
  File "icone.ico"
  File /r "${RAIZ}/css"
  File /r "${RAIZ}/js"
  File /r "${RAIZ}/vendor"
  File /r "${RAIZ}/icones"

  Call AcharNavegador
  CreateDirectory "$SMPROGRAMS\${APP}"
  !insertmacro CriarAtalho "$SMPROGRAMS\${APP}\${APP}.lnk"
  CreateShortCut "$SMPROGRAMS\${APP}\Desinstalar ${APP}.lnk" "$INSTDIR\Desinstalar.exe"
  !insertmacro CriarAtalho "$DESKTOP\${APP}.lnk"

  WriteUninstaller "$INSTDIR\Desinstalar.exe"
  WriteRegStr HKCU "Software\${APPID}" "Pasta" "$INSTDIR"
  WriteRegStr HKCU "${UNINST}" "DisplayName" "${APP} — Assistente de Pesquisa"
  WriteRegStr HKCU "${UNINST}" "DisplayVersion" "${VERSAO}"
  WriteRegStr HKCU "${UNINST}" "Publisher" "${EDITOR}"
  WriteRegStr HKCU "${UNINST}" "DisplayIcon" "$INSTDIR\icone.ico"
  WriteRegStr HKCU "${UNINST}" "InstallLocation" "$INSTDIR"
  WriteRegStr HKCU "${UNINST}" "UninstallString" '"$INSTDIR\Desinstalar.exe"'
  WriteRegDWORD HKCU "${UNINST}" "NoModify" 1
  WriteRegDWORD HKCU "${UNINST}" "NoRepair" 1
  WriteRegDWORD HKCU "${UNINST}" "EstimatedSize" 400
SectionEnd

Function AbrirAgora
  ${If} $Navegador != ""
    Exec '"$Navegador" --app="$Endereco"'
  ${Else}
    ExecShell "open" "$INSTDIR\index.html"
  ${EndIf}
FunctionEnd

Section "Uninstall"
  Delete "$DESKTOP\${APP}.lnk"
  RMDir /r "$SMPROGRAMS\${APP}"
  RMDir /r "$INSTDIR\css"
  RMDir /r "$INSTDIR\js"
  RMDir /r "$INSTDIR\vendor"
  RMDir /r "$INSTDIR\icones"
  Delete "$INSTDIR\index.html"
  Delete "$INSTDIR\manifest.webmanifest"
  Delete "$INSTDIR\sw.js"
  Delete "$INSTDIR\LEIA-ME.txt"
  Delete "$INSTDIR\icone.ico"
  Delete "$INSTDIR\Desinstalar.exe"
  RMDir "$INSTDIR"
  DeleteRegKey HKCU "${UNINST}"
  DeleteRegKey HKCU "Software\${APPID}"
SectionEnd
