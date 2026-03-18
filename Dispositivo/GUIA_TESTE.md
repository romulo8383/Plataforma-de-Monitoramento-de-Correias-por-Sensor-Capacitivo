# 🚀 GUIA DE TESTE - ESP32 Conexão

## ✅ SISTEMA PRONTO PARA TESTE!

---

## 📊 STATUS ATUAL

### Backend Django
- ✅ Rodando em: `http://0.0.0.0:8000`
- ✅ Endpoint configuração: OK
- ✅ Banco de dados: Populado
  - 1 Correia (ID=1)
  - 16 Sensores (3 habilitados)
  - 1 Calibração

### Frontend React
- ✅ Rodando em: `http://localhost:3000`
- ✅ Conectado ao backend
- ✅ Aguardando dados da ESP32

### Rede
- ✅ WiFi IFES: `ws_wlan`
- ✅ IP do computador: `172.19.146.173`

---

## 🎯 TESTE 1: CONEXÃO (ESP32_Teste.ino)

### Objetivo
Verificar se a ESP32 consegue:
1. Conectar ao WiFi do IFES
2. Comunicar com o backend
3. Buscar configuração de sensores
4. Enviar dados de teste

---

### Passo 1: Configurar ESP32_Teste.ino

Abra o arquivo: `Dispositivo/ESP32_Teste.ino`

**Verificar se está configurado:**
```cpp
// Linha 8-10: WiFi IFES (JÁ CONFIGURADO)
const char* WIFI_SSID = "ws_wlan";
const char* WIFI_IDENTITY = "20212ceca0210";
const char* WIFI_PASSWORD = "#RUte8320";

// Linha 18: IP do backend (ALTERAR PARA SEU IP)
const char* BACKEND_URL = "http://172.19.146.173:8000";  // ← SEU IP
```

**⚠️ IMPORTANTE:** Altere apenas a linha 18 com o IP do seu computador!

---

### Passo 2: Upload para ESP32

1. **Arduino IDE:**
   - File > Open > `Dispositivo/ESP32_Teste.ino`

2. **Configurar Placa:**
   - Tools > Board > ESP32 Dev Module
   - Tools > Port > COM3 (ou sua porta)

3. **Upload:**
   - Clique em Upload (→)
   - Aguarde "Done uploading"

---

### Passo 3: Monitorar Teste

1. **Abrir Monitor Serial:**
   - Tools > Serial Monitor (Ctrl+Shift+M)
   - Baud Rate: **115200**

2. **Saída Esperada:**

```
=== ESP32 - Teste de Comunicação ===

🏫 Conectando ao WiFi do IFES: ws_wlan
.....
✅ WiFi conectado com sucesso!
📍 IP da ESP32: 172.19.146.150

--- Iniciando Testes ---

TESTE 1: Buscar configuração dos sensores
URL: http://172.19.146.173:8000/api/configuration/sensors/?belt_id=1
HTTP Code: 200
✅ Resposta recebida:
{"status":"success","belt_id":1,"belt_name":"Correia Principal",...}
✅ JSON parseado com sucesso!
Belt ID: 1
Belt Name: Correia Principal
Sensores encontrados: 16
  Sensor 1: HABILITADO
  Sensor 2: HABILITADO
  Sensor 3: HABILITADO
  Sensor 4: DESABILITADO
  ...

TESTE 2: Enviar dados simulados
URL: http://172.19.146.173:8000/api/acquisition/ingest/
JSON enviado:
{"belt_id":1,"encoder_count":12345,"sensors":[...]}
HTTP Code: 201
✅ Dados enviados com sucesso!
Resposta:
{"status":"success","message":"Data ingested successfully",...}

TESTE 3: Toggle sensor
URL: http://172.19.146.173:8000/api/configuration/toggle-sensor/
JSON enviado:
{"sensor_id":1,"enabled":true}
HTTP Code: 200
✅ Sensor 1 habilitado com sucesso!

--- Testes Concluídos ---

Se todos os testes passaram, o sistema está pronto!
Agora você pode fazer upload do código principal (ESP32.ino)
```

---

### ✅ TESTE 1 PASSOU SE:

- [ ] WiFi conectou (IP da ESP32 apareceu)
- [ ] TESTE 1: HTTP Code 200 (configuração recebida)
- [ ] TESTE 2: HTTP Code 201 (dados enviados)
- [ ] TESTE 3: HTTP Code 200 (sensor alterado)

---

### ❌ SE DER ERRO:

#### Erro: WiFi não conecta
```
❌ Falha ao conectar WiFi do IFES!
```

**Soluções:**
1. Verificar se está dentro do alcance da rede IFES
2. Verificar credenciais (usuário: 20212ceca0210)
3. Tentar reconectar WiFi do computador

---

#### Erro: HTTP Code -1
```
❌ Erro -1: Backend não está rodando ou IP incorreto!
```

**Soluções:**
1. Verificar se backend está rodando (deve estar!)
2. Verificar IP na linha 18 do código
3. Testar no navegador: `http://172.19.146.173:8000/api/configuration/sensors/?belt_id=1`

---

#### Erro: HTTP Code 404
```
❌ Erro na ativação: 404
```

**Soluções:**
1. Verificar se correia existe no banco (deve existir!)
2. Executar novamente: `python setup_initial_data.py`

---

## 🎯 TESTE 2: CÓDIGO PRINCIPAL (ESP32.ino)

### ⚠️ APENAS APÓS TESTE 1 PASSAR!

### Objetivo
Testar o código completo com:
- Leitura de 16 sensores analógicos
- Contador de encoder
- Envio de dados reais

---

### Passo 1: Configurar ESP32.ino

Abra o arquivo: `Dispositivo/ESP32.ino`

**Verificar configuração:**
```cpp
// Linhas 8-12: WiFi IFES (JÁ CONFIGURADO)
const char* WIFI_SSID = "ws_wlan";
const char* WIFI_IDENTITY = "20212ceca0210";
const char* WIFI_PASSWORD = "#RUte8320";

// Linha 27: IP do backend (ALTERAR)
const char* BACKEND_URL = "http://172.19.146.173:8000";  // ← SEU IP

// Linha 28: ID da correia
const int BELT_ID = 1;  // OK
```

---

### Passo 2: Upload para ESP32

1. File > Open > `Dispositivo/ESP32.ino`
2. Upload (→)
3. Abrir Monitor Serial (115200 baud)

---

### Passo 3: Monitorar Funcionamento

**Saída Esperada:**

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

---

### Comandos Disponíveis (Monitor Serial)

Digite no Monitor Serial:

| Comando | Descrição |
|---------|-----------|
| `status` | Mostra status do sistema |
| `reset` | Reseta contador do encoder |
| `update` | Força atualização de configuração |
| `read` | Força leitura dos sensores |
| `help` | Lista comandos |

---

### ✅ TESTE 2 PASSOU SE:

- [ ] WiFi conectou
- [ ] Configuração atualizada
- [ ] 3 sensores habilitados (1, 2, 3)
- [ ] Encoder habilitado
- [ ] Dados enviados com sucesso (a cada 100ms)

---

## 📊 VERIFICAR NO FRONTEND

### Abrir Dashboard
```
http://localhost:3000
```

**Deve mostrar:**
- Estado: ● Online (verde)
- Encoder: Valor atualizando
- Sensor 1, 2, 3: Valores de tensão e capacitância
- Gráficos atualizando em tempo real

---

## 🎓 RESUMO DOS TESTES

### Teste 1: ESP32_Teste.ino
- ✅ Verifica conexão WiFi
- ✅ Verifica comunicação com backend
- ✅ Testa todos os endpoints
- ⏱️ Duração: ~10 segundos

### Teste 2: ESP32.ino
- ✅ Sistema completo funcionando
- ✅ Leitura de sensores reais
- ✅ Encoder contando pulsos
- ✅ Dados em tempo real no frontend
- ⏱️ Duração: Contínuo

---

## 📞 CHECKLIST FINAL

Antes de começar o teste:

- [ ] Backend rodando (porta 8000)
- [ ] Frontend rodando (porta 3000)
- [ ] Banco de dados populado (1 correia, 16 sensores)
- [ ] ESP32 conectada via USB
- [ ] Arduino IDE instalado
- [ ] Biblioteca ArduinoJson instalada
- [ ] IP do computador anotado: `172.19.146.173`
- [ ] Dentro do alcance do WiFi IFES

---

## 🚀 PRONTO PARA COMEÇAR!

**Próximo passo:** 
1. Abrir `Dispositivo/ESP32_Teste.ino`
2. Alterar IP na linha 18
3. Upload para ESP32
4. Abrir Monitor Serial
5. Verificar se todos os 3 testes passam

**Boa sorte! 🎉**
