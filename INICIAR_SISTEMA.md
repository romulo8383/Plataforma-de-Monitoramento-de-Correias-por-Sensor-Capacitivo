# 🚀 GUIA RÁPIDO - Iniciar Sistema Completo

## ⚠️ PROBLEMA IDENTIFICADO
O frontend está configurado mas o backend não está rodando.

## 📋 PASSOS PARA INICIAR

### 1️⃣ BACKEND (Django)

Abra um terminal e execute:

```bash
# Navegar para o diretório do backend
cd "c:\Users\Romulo Duani\OneDrive\Área de Trabalho\IC\software\Plataforma-de-Monitoramento-de-Correias-por-Sensor-Capacitivo\backend"

# Instalar dependências (primeira vez)
pip install -r requirements.txt

# Navegar para o diretório do projeto Django
cd belt_monitor

# Executar migrações (primeira vez)
python manage.py migrate

# Criar dados iniciais (primeira vez)
python manage.py shell < setup_initial_data.py

# INICIAR O SERVIDOR
python manage.py runserver 172.19.146.173:8000
```

**✅ Backend deve estar rodando em:** `http://172.19.146.173:8000`

---

### 2️⃣ FRONTEND (React)

Abra OUTRO terminal e execute:

```bash
# Navegar para o diretório do frontend
cd "c:\Users\Romulo Duani\OneDrive\Área de Trabalho\IC\software\Plataforma-de-Monitoramento-de-Correias-por-Sensor-Capacitivo\frontend"

# Instalar dependências (primeira vez)
npm install

# INICIAR O FRONTEND
npm start
```

**✅ Frontend deve abrir automaticamente em:** `http://localhost:3000`

---

### 3️⃣ ESP32

1. Abra o Arduino IDE
2. Carregue o arquivo: `Dispositivo/ESP32.ino`
3. Selecione a placa ESP32
4. Faça upload do código
5. Abra o Serial Monitor (115200 baud)

**✅ ESP32 deve conectar ao WiFi e começar a enviar dados**

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### Backend:
- Acesse: `http://172.19.146.173:8000/api/configuration/sensors/?belt_id=1`
- Deve retornar JSON com configuração dos sensores

### Frontend:
- Acesse: `http://localhost:3000`
- Deve mostrar o dashboard
- Status deve mudar de "Aguardando dados" para "Online" quando ESP32 enviar dados

### ESP32:
- Serial Monitor deve mostrar:
  - `[OK] WiFi conectado com sucesso!`
  - `[OK] Configuracao atualizada`
  - `[OK] Dados enviados com sucesso`

---

## ❌ PROBLEMAS COMUNS

### Backend não inicia:
```bash
# Instalar Django
pip install django djangorestframework django-cors-headers
```

### Frontend não conecta:
- Verifique se o IP `172.19.146.173:8000` está correto
- Arquivo já foi corrigido: `frontend/src/api/apiClient.js`

### ESP32 não envia dados:
- Verifique credenciais WiFi no código
- Verifique IP do backend no código (linha 34)
- Abra Serial Monitor para ver logs

---

## 📊 ORDEM DE INICIALIZAÇÃO

1. **BACKEND** (primeiro)
2. **FRONTEND** (segundo)
3. **ESP32** (terceiro)

---

## 🎯 PRÓXIMOS PASSOS

Depois que tudo estiver rodando:

1. Habilite sensores no painel de controle (lado direito)
2. ESP32 vai buscar configuração automaticamente
3. Dados começam a aparecer no dashboard
4. Selecione sensores para ver gráficos individuais
