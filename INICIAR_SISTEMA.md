# 🚀 GUIA RÁPIDO - Iniciar Sistema Completo

> Última validação: sistema testado ponta a ponta (ESP32 → Backend → Frontend) com sensor físico no GPIO35, calibração real aplicada (0% = ar, 100% = correia nova).

## ⚠️ PASSO 0 — Descobrir o IP atual da máquina

O IP muda a cada conexão na rede (DHCP). **Sempre confira antes de iniciar:**

```bash
ipconfig
# Procure "Endereço IPv4" no adaptador Wi-Fi (rede ws_wlan / IFES)
```

Se o IP for **diferente** do último usado, atualize em 2 lugares antes de seguir:

1. `backend/belt_monitor/belt_monitor/settings.py` → adicione o novo IP em `ALLOWED_HOSTS`
2. `Dispositivo/ESP32.ino` → linha `const char* BACKEND_URL = "http://SEU_IP:8000";`

Se o `Dispositivo/ESP32.ino` mudar, é necessário regravar o firmware na ESP32 (passo 3).

---

## 1️⃣ BACKEND (Django)

Ferramentas já instaladas nesta máquina (Python 3.11 + Django 5.2 LTS). Não precisa reinstalar.

```bash
cd backend/belt_monitor
python manage.py runserver 0.0.0.0:8000
```

- Rodar em `0.0.0.0:8000` (não `localhost`) para que a ESP32 na rede consiga acessar.
- Na primeira vez em uma máquina nova: `python manage.py migrate` e `python setup_initial_data.py` antes de subir o servidor.

**✅ Backend deve estar rodando em:** `http://SEU_IP:8000` e `http://localhost:8000`

---

## 2️⃣ FRONTEND (React)

Node.js já instalado (v24 LTS). Abra outro terminal:

```bash
cd frontend
npm start
```

**✅ Frontend abre em:** `http://localhost:3000`

---

## 3️⃣ ESP32

**Só é necessário regravar o firmware se o IP do backend mudou** (passo 0). Caso contrário, a ESP32 já está com o firmware certo — só ligar via USB.

### Se precisar regravar (via arduino-cli, já configurado nesta máquina):

```powershell
$env:Path += ";C:\Program Files\Arduino CLI"

# 1. Descobrir a porta COM (chip CP2102, driver já instalado)
arduino-cli board list

# 2. Copiar o sketch pra uma pasta com o mesmo nome do arquivo (exigência do Arduino)
#    (já existe um exemplo em C:\Users\...\scratchpad\ESP32\ESP32.ino de sessões anteriores,
#    ou recrie copiando Dispositivo/ESP32.ino para uma pasta ESP32/ESP32.ino)

# 3. Compilar e gravar (troque COM7 pela porta encontrada)
arduino-cli upload -p COM7 --fqbn esp32:esp32:esp32 "CAMINHO\PARA\PASTA\ESP32"
```

⚠️ Esta placa **não tem auto-reset**: durante o upload, segure o botão **BOOT/IO0** na placa até aparecer "Connecting..." no terminal, aí pode soltar.

### Verificar leitura (Serial Monitor, 115200 baud):
```
[OK] WiFi conectado com sucesso!
[OK] Configuracao atualizada
[OK] Dados enviados com sucesso
```

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

| Camada | Como checar | Esperado |
|---|---|---|
| Backend | `http://SEU_IP:8000/api/configuration/sensors/?belt_id=1` | JSON com 16 sensores |
| Frontend | `http://localhost:3000` | Dashboard carrega, sem rolagem |
| ESP32 → Backend | Serial Monitor | `[OK] Dados enviados com sucesso` a cada ~100ms |
| Dashboard | Sensor 1 (GPIO35) | Estado muda para "Online", célula preta/100% com a correia nova entre as placas |

---

## ⚙️ Configuração atual conhecida

- **Sensor físico:** apenas o Sensor 1, conectado no **GPIO35** da ESP32
- **Sensores 2 e 3:** habilitados no banco mas sem hardware conectado (leitura = ruído, ignorar)
- **Calibração ativa:** "Calibração física - Ar/Correia nova" (0% = 0,60V / 100% = 2,57V), já salva no `db.sqlite3` local — não precisa refazer, a menos que o circuito ou o segmento de referência mude
- **Ativar/desativar sensores:** tela "Configuração Sensores" no Dashboard (já sincroniza direto com o backend)

---

## ❌ PROBLEMAS COMUNS

### Dashboard fica em "Aguardando dados"
- Confirme que o IP no `ESP32.ino` bate com o IP atual da máquina (passo 0) — causa mais comum
- Backend precisa estar em `0.0.0.0:8000`, não `127.0.0.1`
- Veja o Serial Monitor da ESP32 para erros de HTTP/WiFi

### ESP32 não aparece porta COM / "Access denied" ao gravar
- Driver CP2102 já instalado nesta máquina; se aparecer erro, segure o botão BOOT durante o upload

### Frontend não conecta
- `frontend/src/api/apiClient.js` aponta para `http://localhost:8000/api` — só funciona se o navegador estiver na mesma máquina do backend

---

## 📊 ORDEM DE INICIALIZAÇÃO

1. Conferir IP (passo 0)
2. **BACKEND**
3. **FRONTEND**
4. **ESP32** (ligar via USB; regravar só se o IP mudou)
