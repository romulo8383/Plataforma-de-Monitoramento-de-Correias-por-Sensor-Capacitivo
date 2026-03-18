# Diagrama de Conexões - ESP32

## 🔌 Esquema de Conexão Completo

```
┌─────────────────────────────────────────────────────────────────────┐
│                            ESP32 DevKit                              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    SENSORES CAPACITIVOS                       │  │
│  │                                                               │  │
│  │  GPIO 36 (ADC1_CH0) ◄─── Sensor 1  (0-3.3V)                 │  │
│  │  GPIO 39 (ADC1_CH3) ◄─── Sensor 2  (0-3.3V)                 │  │
│  │  GPIO 34 (ADC1_CH6) ◄─── Sensor 3  (0-3.3V)                 │  │
│  │  GPIO 35 (ADC1_CH7) ◄─── Sensor 4  (0-3.3V)                 │  │
│  │  GPIO 32 (ADC1_CH4) ◄─── Sensor 5  (0-3.3V)                 │  │
│  │  GPIO 33 (ADC1_CH5) ◄─── Sensor 6  (0-3.3V)                 │  │
│  │  GPIO 25 (ADC2_CH8) ◄─── Sensor 7  (0-3.3V)                 │  │
│  │  GPIO 26 (ADC2_CH9) ◄─── Sensor 8  (0-3.3V)                 │  │
│  │  GPIO 27 (ADC2_CH7) ◄─── Sensor 9  (0-3.3V)                 │  │
│  │  GPIO 14 (ADC2_CH6) ◄─── Sensor 10 (0-3.3V)                 │  │
│  │  GPIO 12 (ADC2_CH5) ◄─── Sensor 11 (0-3.3V)                 │  │
│  │  GPIO 13 (ADC2_CH4) ◄─── Sensor 12 (0-3.3V)                 │  │
│  │  GPIO 15 (ADC2_CH3) ◄─── Sensor 13 (0-3.3V)                 │  │
│  │  GPIO 2  (ADC2_CH2) ◄─── Sensor 14 (0-3.3V)                 │  │
│  │  GPIO 4  (ADC2_CH0) ◄─── Sensor 15 (0-3.3V)                 │  │
│  │  GPIO 0  (ADC2_CH1) ◄─── Sensor 16 (0-3.3V)                 │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                         ENCODER                               │  │
│  │                                                               │  │
│  │  GPIO 23 ◄─── Encoder Pulso (com pull-up interno)           │  │
│  │  (Opcional: GPIO 22 para canal B - quadratura)              │  │
│  │  (Opcional: GPIO 21 para canal Z - índice)                  │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                      ALIMENTAÇÃO                              │  │
│  │                                                               │  │
│  │  5V  ◄─── Fonte 5V / USB                                     │  │
│  │  GND ◄─── Terra comum                                        │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## 🔧 Circuito do Sensor Capacitivo (Exemplo)

Cada sensor capacitivo deve ter um circuito que converte capacitância em tensão (0-3.3V).

```
Circuito Sugerido: 555 Timer em modo astável

         +5V
          │
          ├─────┐
          │     │
         R1    C1 (Capacitor Fixo)
          │     │
          ├─────┤
          │     │
    ┌─────┴─────┴─────┐
    │                  │
    │   555 Timer      │
    │                  │
    └─────┬─────┬──────┘
          │     │
         R2    C2 (Capacitor Variável - Sensor)
          │     │
          └─────┤
                │
               GND

Saída: Frequência proporcional à capacitância
Converter frequência → tensão com filtro RC
```

**Componentes por sensor:**
- 1x CI 555
- 2x Resistores (R1=10kΩ, R2=100kΩ)
- 1x Capacitor fixo (C1=100pF)
- 1x Placa capacitiva (sensor)
- 1x Filtro RC para conversão F→V

## 📐 Layout Físico Sugerido

```
Vista Superior da Correia Transportadora:

    ┌─────────────────────────────────────────────────────────┐
    │                                                          │
    │  S1   S2   S3   S4   S5   S6   S7   S8                 │ ◄── Linha 1
    │   ●    ●    ●    ●    ●    ●    ●    ●                  │
    │                                                          │
    │  S9   S10  S11  S12  S13  S14  S15  S16                │ ◄── Linha 2
    │   ●    ●    ●    ●    ●    ●    ●    ●                  │
    │                                                          │
    │                    [ENCODER]                             │
    │                        ⚙                                 │
    │                                                          │
    └─────────────────────────────────────────────────────────┘
                    Direção do movimento ──►

S1-S16: Sensores capacitivos (placas quadradas)
⚙: Encoder acoplado ao rolo da correia
```

## 🔌 Conexão do Encoder

### Encoder Simples (1 canal)
```
Encoder          ESP32
───────          ─────
  A    ────────► GPIO 23
 GND   ────────► GND
 VCC   ────────► 3.3V (se necessário)
```

### Encoder Quadratura (2 canais)
```
Encoder          ESP32
───────          ─────
  A    ────────► GPIO 23
  B    ────────► GPIO 22
 GND   ────────► GND
 VCC   ────────► 3.3V
```

### Encoder com Índice (3 canais)
```
Encoder          ESP32
───────          ─────
  A    ────────► GPIO 23
  B    ────────► GPIO 22
  Z    ────────► GPIO 21
 GND   ────────► GND
 VCC   ────────► 3.3V
```

## ⚡ Considerações Elétricas

### Proteção dos Pinos Analógicos

**IMPORTANTE:** Os pinos ADC da ESP32 suportam apenas 0-3.3V!

Se o sensor fornecer 0-5V, use divisor de tensão:

```
Sensor (0-5V)
     │
     ├─── R1 (10kΩ)
     │
     ├─────────► GPIO ESP32 (0-3.3V)
     │
     └─── R2 (20kΩ)
     │
    GND

Vout = Vin × (R2 / (R1 + R2))
Vout = 5V × (20kΩ / 30kΩ) = 3.33V
```

### Filtragem de Ruído

Adicione capacitor de 100nF em cada entrada analógica:

```
GPIO ───┬─── Sensor
        │
       ═╪═ 100nF
        │
       GND
```

### Alimentação

- **ESP32:** 5V via USB ou Vin
- **Sensores:** Podem precisar de 5V ou 12V (depende do circuito)
- **Encoder:** Geralmente 5V ou 12V

**Fonte sugerida:** 12V 2A com reguladores para 5V e 3.3V

## 🛠️ Lista de Materiais (BOM)

| Qtd | Componente | Especificação | Uso |
|-----|------------|---------------|-----|
| 1 | ESP32 DevKit | 30 pinos | Microcontrolador principal |
| 16 | Sensor Capacitivo | Saída 0-3.3V | Medição de desgaste |
| 1 | Encoder Rotativo | 360-1024 PPR | Posição da correia |
| 16 | Capacitor | 100nF cerâmico | Filtro de ruído |
| 1 | Fonte | 12V 2A | Alimentação geral |
| 1 | Regulador | LM7805 | 5V para ESP32 |
| 1 | Protoboard/PCB | - | Montagem |
| - | Cabos | 22 AWG | Conexões |

## 📊 Especificações dos Pinos

### ADC1 (Pode ser usado com WiFi ativo)
- GPIO 36, 39, 34, 35, 32, 33
- Resolução: 12 bits (0-4095)
- Tensão: 0-3.3V

### ADC2 (Conflita com WiFi - usar com cuidado)
- GPIO 25, 26, 27, 14, 12, 13, 15, 2, 4, 0
- Resolução: 12 bits (0-4095)
- Tensão: 0-3.3V
- **Nota:** Leituras podem falhar quando WiFi está ativo

### Pinos Digitais (Encoder)
- GPIO 23, 22, 21
- Suportam interrupção
- Pull-up interno disponível

## 🔍 Teste de Conexões

### Teste 1: Verificar Sensores
```cpp
void loop() {
  for (int i = 0; i < 16; i++) {
    int value = analogRead(SENSOR_PINS[i]);
    float voltage = (value / 4095.0) * 3.3;
    Serial.printf("Sensor %d: %d (%.2fV)\n", i+1, value, voltage);
  }
  delay(1000);
}
```

### Teste 2: Verificar Encoder
```cpp
void loop() {
  Serial.printf("Encoder: %ld pulsos\n", encoderCount);
  delay(100);
}
```

## 🎯 Calibração

1. **Sem correia:** Todos os sensores devem ler ~0V
2. **Com correia nova:** Anotar valores de referência
3. **Com correia desgastada:** Valores devem aumentar

## 📞 Suporte Técnico

- Verifique sempre as conexões com multímetro
- Use osciloscópio para verificar sinais do encoder
- Teste cada sensor individualmente antes da montagem final
