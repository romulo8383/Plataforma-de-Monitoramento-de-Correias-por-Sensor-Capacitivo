# ESP32 - Sistema de Monitoramento de Correias

## 📋 Visão Geral

Este código permite que a ESP32 funcione como dispositivo de aquisição de dados para o sistema de monitoramento de correias transportadoras usando sensores capacitivos.

## 🔧 Hardware Necessário

### Componentes
- **1x ESP32 DevKit** (qualquer modelo com WiFi)
- **16x Sensores Capacitivos** (circuito com saída analógica 0-3.3V)
- **1x Encoder Rotativo** (saída digital)
- **Fonte de alimentação** 5V para ESP32

### Pinagem

#### Sensores Capacitivos (16 pinos analógicos)
| Sensor | GPIO | ADC Channel | Descrição |
|--------|------|-------------|-----------|
| 1      | 36   | ADC1_CH0    | Sensor capacitivo 1 |
| 2      | 39   | ADC1_CH3    | Sensor capacitivo 2 |
| 3      | 34   | ADC1_CH6    | Sensor capacitivo 3 |
| 4      | 35   | ADC1_CH7    | Sensor capacitivo 4 |
| 5      | 32   | ADC1_CH4    | Sensor capacitivo 5 |
| 6      | 33   | ADC1_CH5    | Sensor capacitivo 6 |
| 7      | 25   | ADC2_CH8    | Sensor capacitivo 7 |
| 8      | 26   | ADC2_CH9    | Sensor capacitivo 8 |
| 9      | 27   | ADC2_CH7    | Sensor capacitivo 9 |
| 10     | 14   | ADC2_CH6    | Sensor capacitivo 10 |
| 11     | 12   | ADC2_CH5    | Sensor capacitivo 11 |
| 12     | 13   | ADC2_CH4    | Sensor capacitivo 12 |
| 13     | 15   | ADC2_CH3    | Sensor capacitivo 13 |
| 14     | 2    | ADC2_CH2    | Sensor capacitivo 14 |
| 15     | 4    | ADC2_CH0    | Sensor capacitivo 15 |
| 16     | 0    | ADC2_CH1    | Sensor capacitivo 16 |

#### Encoder
| Função | GPIO | Descrição |
|--------|------|-----------|
| Encoder | 23  | Pulsos do encoder (com pull-up interno) |

**Nota:** Se o encoder precisar de mais pinos (A, B, Z), você pode usar:
- **Encoder A:** GPIO 23 (canal principal)
- **Encoder B:** GPIO 22 (direção - opcional)
- **Encoder Z:** GPIO 21 (índice/reset - opcional)

## 📦 Bibliotecas Necessárias

Instale as seguintes bibliotecas no Arduino IDE:

1. **WiFi** (já incluída no ESP32)
2. **HTTPClient** (já incluída no ESP32)
3. **ArduinoJson** (versão 6.x)
   - Instalar via: `Sketch > Include Library > Manage Libraries > ArduinoJson`

## ⚙️ Configuração

### 1. Configurar WiFi

Edite as seguintes linhas no arquivo `ESP32.ino`:

```cpp
const char* WIFI_SSID = "SEU_WIFI_SSID";           // Nome da sua rede WiFi
const char* WIFI_PASSWORD = "SUA_SENHA_WIFI";      // Senha da sua rede WiFi
```

### 2. Configurar Backend

Edite o endereço IP do seu servidor backend:

```cpp
const char* BACKEND_URL = "http://192.168.1.100:8000";  // IP do computador rodando Django
const int BELT_ID = 1;  // ID da correia configurada no backend
```

**Como descobrir o IP do backend:**
- Windows: `ipconfig` no CMD
- Linux/Mac: `ifconfig` no terminal

### 3. Upload do Código

1. Abra o arquivo `ESP32.ino` no Arduino IDE
2. Selecione a placa: `Tools > Board > ESP32 Dev Module`
3. Selecione a porta COM correta: `Tools > Port`
4. Clique em `Upload` (seta para direita)

## 🚀 Como Funciona

### Fluxo de Operação

```
┌─────────────────────────────────────────────────────────┐
│                    ESP32 INICIALIZA                      │
│  1. Conecta ao WiFi                                      │
│  2. Busca configuração do backend                        │
│  3. Configura sensores habilitados                       │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                    LOOP PRINCIPAL                        │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │ A cada 100ms:                              │         │
│  │  • Lê tensão dos sensores habilitados      │         │
│  │  • Captura contador do encoder             │         │
│  │  • Envia dados para backend                │         │
│  └────────────────────────────────────────────┘         │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │ A cada 5 segundos:                         │         │
│  │  • Atualiza configuração do backend        │         │
│  │  • Habilita/desabilita sensores            │         │
│  └────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

### Comunicação com Backend

#### 1. Buscar Configuração (GET)
```
GET http://BACKEND_URL/api/configuration/sensors/?belt_id=1

Resposta:
{
  "status": "success",
  "belt_id": 1,
  "belt_name": "Correia Principal",
  "encoder_pulses_per_revolution": 360,
  "sensors": [
    {"id": 1, "sensor_number": 1, "enabled": true, ...},
    {"id": 2, "sensor_number": 2, "enabled": false, ...},
    ...
  ]
}
```

#### 2. Enviar Dados (POST)
```
POST http://BACKEND_URL/api/acquisition/ingest/

Body:
{
  "belt_id": 1,
  "encoder_count": 12345,
  "sensors": [
    {"sensor_id": 1, "voltage": 2.31},
    {"sensor_id": 3, "voltage": 2.45},
    ...
  ]
}
```

## 🔍 Monitoramento e Debug

### Monitor Serial

Abra o Monitor Serial (`Tools > Serial Monitor`) com baud rate **115200**.

#### Comandos Disponíveis

Digite os seguintes comandos no Monitor Serial:

| Comando | Descrição |
|---------|-----------|
| `status` | Mostra status do sistema (sensores habilitados, encoder, WiFi) |
| `reset` | Reseta o contador do encoder para zero |
| `update` | Força atualização da configuração do backend |
| `read` | Força uma leitura imediata dos sensores |
| `help` | Mostra lista de comandos disponíveis |

#### Exemplo de Saída

```
=== ESP32 - Sistema de Monitoramento de Correias ===
✓ Pinos dos sensores configurados
✓ Encoder configurado
Conectando ao WiFi.....
✓ WiFi conectado!
IP: 192.168.1.150
✓ Configuração atualizada

--- Configuração Atual ---
Encoder: HABILITADO
Sensores habilitados:
  Sensor 1 (GPIO 36): HABILITADO
  Sensor 3 (GPIO 34): HABILITADO
  Sensor 5 (GPIO 32): HABILITADO
-------------------------

✓ Sistema inicializado com sucesso!

✓ Dados enviados com sucesso
✓ Dados enviados com sucesso
```

## 🎛️ Habilitando/Desabilitando Sensores

### Via Interface Web (Frontend)

1. Acesse a página de **Configuração de Sensores**
2. Marque/desmarque os sensores desejados
3. Clique em **Salvar**
4. A ESP32 atualizará automaticamente em até 5 segundos

### Via API (Manual)

```bash
# Habilitar sensor 1
curl -X POST http://localhost:8000/api/configuration/toggle-sensor/ \
  -H "Content-Type: application/json" \
  -d '{"sensor_id": 1, "enabled": true}'

# Desabilitar sensor 1
curl -X POST http://localhost:8000/api/configuration/toggle-sensor/ \
  -H "Content-Type: application/json" \
  -d '{"sensor_id": 1, "enabled": false}'
```

## 🔧 Ajustes Avançados

### Alterar Intervalo de Leitura

```cpp
const int READING_INTERVAL = 100;  // Altere para o intervalo desejado em ms
```

### Alterar Intervalo de Atualização de Configuração

```cpp
const int CONFIG_UPDATE_INTERVAL = 5000;  // Altere para o intervalo desejado em ms
```

### Ajustar Resolução do ADC

```cpp
const int ADC_RESOLUTION = 12;  // 12 bits = 0-4095 (padrão ESP32)
const float ADC_VREF = 3.3;     // Tensão de referência
```

### Encoder com Múltiplos Pinos (Quadratura)

Se você precisar usar encoder com quadratura (pinos A e B):

```cpp
// Adicionar no início do código
const int ENCODER_PIN_A = 23;
const int ENCODER_PIN_B = 22;

volatile int encoderDirection = 0;

void IRAM_ATTR encoderISR_A() {
  if (encoderEnabled) {
    if (digitalRead(ENCODER_PIN_B) == HIGH) {
      encoderCount++;  // Sentido horário
      encoderDirection = 1;
    } else {
      encoderCount--;  // Sentido anti-horário
      encoderDirection = -1;
    }
  }
}

// No setup()
pinMode(ENCODER_PIN_A, INPUT_PULLUP);
pinMode(ENCODER_PIN_B, INPUT_PULLUP);
attachInterrupt(digitalPinToInterrupt(ENCODER_PIN_A), encoderISR_A, RISING);
```

## 🐛 Troubleshooting

### ESP32 não conecta ao WiFi
- Verifique SSID e senha
- Certifique-se que a rede é 2.4GHz (ESP32 não suporta 5GHz)
- Aproxime a ESP32 do roteador

### Erro ao enviar dados
- Verifique se o backend está rodando
- Confirme o IP do backend está correto
- Teste o endpoint manualmente: `http://IP:8000/api/acquisition/ingest/`

### Leituras analógicas instáveis
- Adicione capacitores de 100nF nos pinos analógicos
- Use cabos blindados para os sensores
- Evite cabos longos (máximo 30cm)

### Encoder não conta pulsos
- Verifique conexão física
- Teste com LED: `digitalWrite(LED_BUILTIN, digitalRead(ENCODER_PIN))`
- Adicione resistor pull-up externo de 10kΩ se necessário

## 📊 Especificações Técnicas

- **Tensão de operação:** 3.3V (lógica) / 5V (alimentação)
- **Resolução ADC:** 12 bits (0-4095)
- **Faixa de tensão ADC:** 0-3.3V
- **Taxa de amostragem:** Configurável (padrão: 10 Hz)
- **Comunicação:** WiFi 802.11 b/g/n (2.4GHz)
- **Protocolo:** HTTP/REST JSON

## 📝 Próximos Passos

1. ✅ Código base da ESP32 implementado
2. ✅ API de configuração no backend
3. ⏳ Integração com frontend para controle visual
4. ⏳ Implementação de buffer local para perda de conexão
5. ⏳ Modo de calibração automática
6. ⏳ Dashboard em tempo real

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique o Monitor Serial para mensagens de erro
2. Use o comando `status` para diagnóstico
3. Consulte a documentação da API do backend
