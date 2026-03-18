@echo off
echo ========================================
echo   INICIANDO BACKEND DJANGO
echo ========================================
echo.

cd "c:\Users\Romulo Duani\OneDrive\Área de Trabalho\IC\software\Plataforma-de-Monitoramento-de-Correias-por-Sensor-Capacitivo\backend\belt_monitor"

echo [1/2] Verificando banco de dados...
python manage.py migrate --no-input

echo.
echo [2/2] Iniciando servidor Django...
echo Backend disponivel em: http://172.19.146.173:8000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

python manage.py runserver 172.19.146.173:8000
