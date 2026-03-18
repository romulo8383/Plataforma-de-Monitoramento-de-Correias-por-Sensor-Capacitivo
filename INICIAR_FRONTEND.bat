@echo off
echo ========================================
echo   INICIANDO FRONTEND REACT
echo ========================================
echo.

cd "c:\Users\Romulo Duani\OneDrive\Área de Trabalho\IC\software\Plataforma-de-Monitoramento-de-Correias-por-Sensor-Capacitivo\frontend"

echo Verificando dependencias...
if not exist "node_modules\" (
    echo Instalando dependencias do npm...
    call npm install
)

echo.
echo Iniciando servidor React...
echo Frontend disponivel em: http://localhost:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call npm start
