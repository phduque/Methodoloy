@echo off
rem Abre o Metodo Logico numa janela propria (modo aplicativo) do Edge ou do Chrome.
set "PASTA=%~dp0"
set "URL=file:///%PASTA:\=/%index.html"
where msedge >nul 2>nul && (start "" msedge --app="%URL%" & exit /b)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%URL%" & exit /b)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="%URL%" & exit /b)
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%URL%" & exit /b)
if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" (start "" "%LocalAppData%\Google\Chrome\Application\chrome.exe" --app="%URL%" & exit /b)
start "" "%PASTA%index.html"
