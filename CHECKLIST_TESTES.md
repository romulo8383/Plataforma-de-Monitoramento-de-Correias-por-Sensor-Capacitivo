# ✅ CHECKLIST DE TESTES - ESP32

## 📊 STATUS DO SISTEMA

### ✅ Backend (Django)
- **Status:** RODANDO
- **Porta:** 8000
- **URL:** http://localhost:8000
- **Correia:** ID=1 "Correia Principal" ✅
- **Sensores:** 16 sensores criados ✅
- **Sensores habilitados:** 3 (Sensores 1, 2, 3) ✅

### ✅ Frontend (React)
- **Status:** RODANDO
- **Porta:** 3000
- **URL:** http://localhost:3000
- **Dashboard:** Aguardando dados da ESP32

### ⏳ ESP32
- **Status:** AGUARDANDO CONFIGURAÇÃO
- **WiFi:** ws_wlan (IFES)
- **Credenciais:** Configuradas ✅

---

## 🧪 FASE 1: TESTE DE CONEXÃO (ESP32_Teste.ino)

### Objetivo
Validar comunicação entre ESP32 e backend sem hardware físico.

### Pré-requisitos
- [ ] Backend rodando (porta 8000)
- [ ] ESP32 conectada via USB
- [ ] Arduino IDE instalado
- [ ] Biblioteca ArduinoJson instalada

### Passos

#### 1. Configurar ESP32_Teste.ino

```cpp
// Abrir: Dispositivo/ESP32_Teste.ino

// Verificar estas linhas (JÁ CONFIGURADAS):
const char* WIFI_SSID = "ws_wlan";
const char* WIFI_IDENTITY = "20212ceca0210";
const char* WIFI_PASSWORD = "#RUte8320";

// ALTERAR APENAS ESTA LINHA:
const char* BACKEND_URL = "http://172.19.146.XXX:8000";  // ← SEU IP NO IFES
```

**Como descobrir seu IP:**
```bash
# CMD
ipconfig

# Procurar: IPv4 Address: 172.19.146.XXX
```

#### 2. Upload para ESP32

```
Arduino IDE:
1. Tools > Board > ESP32 Dev Module
2. Tools > Port > COM3 (sua porta)
3. Upload (Ctrl+U)
```

#### 3. Abrir Monitor Serial

```
Tools > Serial Monitor
Baud Rate: 115200
```

#### 4. Verificar Saída Esperada

```
=== ESP32 - Teste de Comunicação ===

🏫 Conectando ao WiFi do IFES: ws_wlan
.....
✅ WiFi conectado com sucesso!
📍 IP da ESP32: 172.19.146.150

--- Iniciando Testes ---

TESTE 1: Buscar configuração dos sensores
URL: http://172.19.146.XXX:8000/api/configuration/sensors/?belt_id=1
HTTP Code: 200
✓ Resposta recebida:
{"status":"success","belt_id":1,"belt_name":"Correia Principal",...}
✓ JSON parseado com sucesso!
Belt ID: 1
Belt Name: Correia Principal
Sensores encontrados: 16
  Sensor 1: HABILITADO
  Sensor 2: HABILITADO
  Sensor 3: HABILITADO
  Sensor 4: DESABILITADO
  ...

TESTE 2: Enviar dados simulados
URL: http://172.19.146.XXX:8000/api/acquisition/ingest/
JSON enviado:
{"belt_id":1,"encoder_count":12345,"sensors":[...]}
HTTP Code: 201
✓ Dados enviados com sucesso!
Resposta:
{"status":"success","message":"Data ingested successfully",...}

TESTE 3: Toggle sensor
URL: http://172.19.146.XXX:8000/api/configuration/toggle-sensor/
JSON enviado:
{"sensor_id":1,"enabled":true}
HTTP Code: 200
✓ Sensor 1 habilitado com sucesso!

--- Testes Concluídos ---

Se todos os testes passaram, o sistema está pronto!
Agora você pode fazer upload do código principal (ESP32.ino)
```

### ✅ Validação Fase 1

- [ ] WiFi conectou (IP exibido)
- [ ] TESTE 1: HTTP 200 (configuração recebida)
- [ ] TESTE 2: HTTP 201 (dados enviados)
- [ ] TESTE 3: HTTP 200 (sensor alterado)
- [ ] Nenhum erro no Monitor Serial

### ❌ Troubleshooting Fase 1

| Erro | Causa | Solução |
|------|-------|---------|
| WiFi não conecta | Fora do alcance ou credenciais erradas | Verificar rede IFES disponível |
| HTTP Code: -1 | Backend não está rodando | Verificar porta 8000 |
| HTTP Code: 404 | Belt não existe | Executar setup_initial_data.py |
| HTTP Code: 400 | JSON inválido | Verificar formato dos dados |

---

## 🚀 FASE 2: CÓDIGO PRINCIPAL (ESP32.ino)

### Objetivo
Rodar sistema completo com leitura de sensores e encoder.

### Pré-requisitos
- [ ] Fase 1 concluída com sucesso
- [ ] Backend rodando
- [ ] Frontend rodando

### Passos

#### 1. Configurar ESP32.ino

```cpp
// Abrir: Dispositivo/ESP32.ino

// Verificar WiFi (JÁ CONFIGURADO):
const char* WIFI_SSID = "ws_wlan";
const char* WIFI_IDENTITY = "20212ceca0210";
const char* WIFI_PASSWORD = "#RUte8320";

// ALTERAR APENAS ESTA LINHA:
const char* BACKEND_URL = "http://172.19.146.XXX:8000";  // ← SEU IP
const int BELT_ID = 1;  // ← ID da correia (já está correto)
```

#### 2. Upload para ESP32

```
Arduino IDE:
1. Upload (Ctrl+U)
2. Aguardar "Done uploading"
```

#### 3. Monitorar Sistema

**Monitor Serial:**
```
=== ESP32 - Sistema de Monitoramento de Correias ===
✓ Pinos dos sensores configurados
✓ Encoder configurado
🏫 Conectando ao WiFi do IFES: ws_wlan
.....
✅ WiFi conectado com sucesso!
📍 IP da ESP32: 172.19.146.150
✓ Configuração atualizada

--- Configuração Atual ---
Encoder: HABILITADO
Sensores habilitados:
  Sensor 1 (GPIO 36): HABILITADO
  Sensor 2 (GPIO 39): HABILITADO
  Sensor 3 (GPIO 34): HABILITADO
-------------------------

✓ Sistema inicializado com sucesso!

✓ Dados enviados com sucesso
✓ Dados enviados com sucesso
✓ Dados enviados com sucesso
...
```

**Frontend (http://localhost:3000):**
```
Dashboard deve mostrar:
- Estado: ● Online
- Encoder: XXX mm (atualizando)
- Sensor 1: X.XXV | X.XXpF (atualizando)
- Sensor 2: X.XXV | X.XXpF (atualizando)
- Sensor 3: X.XXV | X.XXpF (atualizando)
```

#### 4. Comandos do Monitor Serial

Digite no Monitor Serial:

```
status  - Ver status do sistema
reset   - Resetar contador do encoder
update  - Forçar atualização de configuração
read    - Forçar leitura dos sensores
help    - Mostrar ajuda
```

### ✅ Validação Fase 2

- [ ] WiFi conectou
- [ ] Configuração atualizada
- [ ] Sensores habilitados exibidos
- [ ] Encoder habilitado
- [ ] Dados enviados a cada 100ms
- [ ] Frontend mostra "Online"
- [ ] Frontend atualiza em tempo real
- [ ] Comando "status" funciona

### ❌ Troubleshooting Fase 2

| Problema | Solução |
|----------|---------|
| Nenhum sensor habilitado | Habilitar sensores no backend/frontend |
| Encoder desabilitado | Habilitar pelo menos 1 sensor |
| Dados não enviados | Verificar IP do backend |
| Frontend não atualiza | Verificar console do navegador |

---

## 🔧 FASE 3: TESTES COM HARDWARE (Opcional)

### Quando tiver hardware físico montado:

#### 1. Conectar Sensores
- Conectar 16 sensores capacitivos aos pinos GPIO
- Verificar tensão de saída 0-3.3V

#### 2. Conectar Encoder
- Conectar encoder ao GPIO 23
- Verificar pulsos com LED de teste

#### 3. Validar Leituras
```
Monitor Serial > Digite: read

Saída esperada:
Sensor 1 (GPIO 36): 2.45V
Sensor 2 (GPIO 39): 2.31V
Sensor 3 (GPIO 34): 2.18V
Encoder: 12345 pulsos
```

---

## 📊 CHECKLIST COMPLETO

### Sistema
- [x] Backend rodando (porta 8000)
- [x] Frontend rodando (porta 3000)
- [x] Banco de dados populado
- [x] Correia criada (ID=1)
- [x] 16 sensores criados
- [x] 3 sensores habilitados

### ESP32
- [ ] Conectada via USB
- [ ] Arduino IDE configurado
- [ ] Biblioteca ArduinoJson instalada
- [ ] WiFi IFES configurado
- [ ] IP do backend configurado

### Fase 1 - Teste de Conexão
- [ ] ESP32_Teste.ino configurado
- [ ] Upload realizado
- [ ] WiFi conectou
- [ ] TESTE 1: Passou (HTTP 200)
- [ ] TESTE 2: Passou (HTTP 201)
- [ ] TESTE 3: Passou (HTTP 200)

### Fase 2 - Código Principal
- [ ] ESP32.ino configurado
- [ ] Upload realizado
- [ ] WiFi conectou
- [ ] Configuração atualizada
- [ ] Sensores habilitados
- [ ] Encoder habilitado
- [ ] Dados enviados
- [ ] Frontend mostra "Online"
- [ ] Frontend atualiza em tempo real

### Fase 3 - Hardware (Opcional)
- [ ] Sensores conectados
- [ ] Encoder conectado
- [ ] Leituras válidas
- [ ] Sistema completo funcionando

---

## 🎯 PRÓXIMOS PASSOS

### Após Fase 1 ✅
→ Prosseguir para Fase 2

### Após Fase 2 ✅
→ Sistema pronto para uso
→ Montar hardware físico (Fase 3)

### Após Fase 3 ✅
→ Calibrar sensores
→ Ajustar parâmetros
→ Testes em ambiente real

---

## 📞 SUPORTE

### Logs Importantes

**Backend (Terminal):**
```
"GET /api/configuration/sensors/?belt_id=1 HTTP/1.1" 200
"POST /api/acquisition/ingest/ HTTP/1.1" 201
```

**Frontend (Console do Navegador):**
```
✓ Dados recebidos: { belt_position_mm: 345.2, ... }
✓ Sensores atualizados: 3 ativos
```

**ESP32 (Monitor Serial):**
```
✓ WiFi conectado!
✓ Configuração atualizada
✓ Dados enviados com sucesso
```

---

**Status Atual:** ✅ PRONTO PARA FASE 1 (Teste de Conexão)
**Próximo Passo:** Configurar e fazer upload do ESP32_Teste.ino
