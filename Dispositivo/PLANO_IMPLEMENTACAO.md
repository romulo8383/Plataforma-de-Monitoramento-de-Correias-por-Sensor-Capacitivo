# 📋 PLANO DE IMPLEMENTAÇÃO - Sistema ESP32

## ✅ Status Atual

### Concluído
- ✅ **Etapa 1:** Estrutura de pastas criada (`Dispositivo/`)
- ✅ **Etapa 2:** Código principal ESP32 (`ESP32.ino`)
- ✅ **Etapa 3:** API de configuração no backend
- ✅ **Etapa 4:** Documentação completa
- ✅ **Etapa 5:** Código de teste de comunicação

### Arquivos Criados

```
Dispositivo/
├── ESP32.ino           # Código principal da ESP32
├── ESP32_Teste.ino     # Código de teste de comunicação
├── README.md           # Documentação completa
└── CONEXOES.md         # Diagrama de conexões e esquema elétrico
```

### Backend - Novos Endpoints

```
backend/belt_monitor/configuration/
├── serializers.py      # Serializers para API
├── views.py            # Views com endpoints para ESP32
└── urls.py             # Rotas da API
```

---

## 🚀 PRÓXIMOS PASSOS - Implementação Física

### Fase 1: Preparação (1-2 dias)

#### 1.1 Materiais
- [ ] Adquirir ESP32 DevKit
- [ ] Preparar 16 sensores capacitivos com circuito de saída 0-3.3V
- [ ] Adquirir encoder rotativo
- [ ] Preparar fonte de alimentação
- [ ] Cabos e conectores

#### 1.2 Software
- [ ] Instalar Arduino IDE
- [ ] Instalar suporte para ESP32 no Arduino IDE
  - Adicionar URL: `https://dl.espressif.com/dl/package_esp32_index.json`
  - Tools > Board > Boards Manager > ESP32
- [ ] Instalar biblioteca ArduinoJson (versão 6.x)

### Fase 2: Teste de Comunicação (1 dia)

#### 2.1 Configurar Backend
```bash
# 1. Iniciar backend Django
cd backend/belt_monitor
python manage.py runserver 0.0.0.0:8000

# 2. Criar correia no admin
# Acessar: http://localhost:8000/admin
# Criar Belt com ID=1

# 3. Criar sensores
# Criar 16 sensores associados à correia
```

#### 2.2 Testar ESP32
```bash
# 1. Editar ESP32_Teste.ino
#    - Configurar WIFI_SSID
#    - Configurar WIFI_PASSWORD
#    - Configurar BACKEND_URL (IP do computador)

# 2. Upload do código de teste
#    - Conectar ESP32 via USB
#    - Selecionar porta COM
#    - Upload

# 3. Abrir Monitor Serial (115200 baud)
#    - Verificar conexão WiFi
#    - Verificar testes de comunicação
```

**Resultado esperado:**
```
✓ WiFi conectado!
✓ TESTE 1: Configuração recebida
✓ TESTE 2: Dados enviados
✓ TESTE 3: Sensor alterado
```

### Fase 3: Montagem do Hardware (2-3 dias)

#### 3.1 Montagem em Protoboard (Teste)
```
Ordem de montagem:
1. Conectar ESP32 à protoboard
2. Conectar 1 sensor capacitivo (teste)
3. Conectar encoder
4. Testar leitura individual
5. Adicionar demais sensores gradualmente
```

#### 3.2 Teste Individual de Sensores
```cpp
// Usar código de teste para cada sensor
void testSensor(int sensorNum) {
  int pin = SENSOR_PINS[sensorNum];
  int value = analogRead(pin);
  float voltage = (value / 4095.0) * 3.3;
  Serial.printf("Sensor %d (GPIO %d): %d (%.2fV)\n", 
                sensorNum+1, pin, value, voltage);
}
```

#### 3.3 Teste do Encoder
```cpp
// Girar manualmente e verificar contagem
void testEncoder() {
  Serial.printf("Encoder: %ld pulsos\n", encoderCount);
  // Girar encoder e verificar incremento
}
```

### Fase 4: Integração Completa (1-2 dias)

#### 4.1 Upload do Código Principal
```bash
# 1. Editar ESP32.ino
#    - Configurar WiFi
#    - Configurar BACKEND_URL
#    - Configurar BELT_ID

# 2. Upload
# 3. Monitorar via Serial
```

#### 4.2 Configurar Sensores no Frontend
```bash
# 1. Acessar frontend
# 2. Ir para página de Configuração
# 3. Habilitar sensores desejados
# 4. Verificar ESP32 recebe configuração (Monitor Serial)
```

#### 4.3 Validar Fluxo Completo
```
1. ESP32 conecta ao WiFi ✓
2. ESP32 busca configuração ✓
3. ESP32 lê sensores habilitados ✓
4. ESP32 conta pulsos do encoder ✓
5. ESP32 envia dados ao backend ✓
6. Backend armazena no banco ✓
7. Frontend exibe dados ✓
```

### Fase 5: Calibração (1-2 dias)

#### 5.1 Calibração dos Sensores
```bash
# Para cada sensor:
1. Medir tensão sem correia (baseline)
2. Medir tensão com correia nova
3. Medir tensão com correia desgastada
4. Criar curva de calibração no backend
```

#### 5.2 Calibração do Encoder
```bash
1. Marcar posição inicial na correia
2. Girar correia uma volta completa
3. Contar pulsos do encoder
4. Configurar encoder_pulses_per_revolution no backend
```

### Fase 6: Otimização (Contínuo)

#### 6.1 Ajustes de Performance
- [ ] Ajustar intervalo de leitura (READING_INTERVAL)
- [ ] Ajustar intervalo de atualização (CONFIG_UPDATE_INTERVAL)
- [ ] Implementar buffer local para perda de conexão
- [ ] Adicionar watchdog timer

#### 6.2 Melhorias Futuras
- [ ] Modo de calibração automática
- [ ] OTA (Over-The-Air) updates
- [ ] Dashboard em tempo real
- [ ] Alertas via push notification
- [ ] Modo offline com SD card

---

## 🔧 COMANDOS ÚTEIS

### Backend Django
```bash
# Iniciar servidor
python manage.py runserver 0.0.0.0:8000

# Criar superusuário
python manage.py createsuperuser

# Aplicar migrações
python manage.py migrate

# Acessar shell
python manage.py shell
```

### ESP32 - Monitor Serial
```
Comandos disponíveis:
- status  : Mostra status do sistema
- reset   : Reseta contador do encoder
- update  : Atualiza configuração
- read    : Força leitura dos sensores
- help    : Lista comandos
```

### Testar API Manualmente
```bash
# Buscar configuração
curl http://localhost:8000/api/configuration/sensors/?belt_id=1

# Enviar dados
curl -X POST http://localhost:8000/api/acquisition/ingest/ \
  -H "Content-Type: application/json" \
  -d '{
    "belt_id": 1,
    "encoder_count": 12345,
    "sensors": [
      {"sensor_id": 1, "voltage": 2.31},
      {"sensor_id": 2, "voltage": 2.45}
    ]
  }'

# Toggle sensor
curl -X POST http://localhost:8000/api/configuration/toggle-sensor/ \
  -H "Content-Type: application/json" \
  -d '{"sensor_id": 1, "enabled": true}'
```

---

## 📊 CHECKLIST DE VALIDAÇÃO

### Hardware
- [ ] ESP32 conecta ao WiFi
- [ ] Todos os 16 sensores leem tensão (0-3.3V)
- [ ] Encoder conta pulsos corretamente
- [ ] Alimentação estável (sem resets)
- [ ] Cabos bem conectados (sem ruído)

### Software
- [ ] Backend rodando sem erros
- [ ] ESP32 busca configuração com sucesso
- [ ] ESP32 envia dados com sucesso
- [ ] Dados aparecem no banco de dados
- [ ] Frontend exibe dados em tempo real

### Funcionalidades
- [ ] Habilitar sensor via frontend funciona
- [ ] Desabilitar sensor via frontend funciona
- [ ] Encoder habilitado quando há sensores ativos
- [ ] Encoder desabilitado quando não há sensores
- [ ] Leituras consistentes e sem ruído

---

## 🐛 TROUBLESHOOTING RÁPIDO

| Problema | Solução |
|----------|---------|
| ESP32 não conecta WiFi | Verificar SSID/senha, usar rede 2.4GHz |
| Erro 404 ao buscar config | Verificar BELT_ID existe no banco |
| Erro 400 ao enviar dados | Verificar formato JSON, sensor_id válido |
| Leituras analógicas = 0 | Verificar conexão física, tensão do sensor |
| Encoder não conta | Verificar conexão, testar com LED |
| Backend não responde | Verificar firewall, IP correto |

---

## 📞 SUPORTE

### Logs Importantes

**ESP32 (Monitor Serial):**
```
✓ WiFi conectado!
✓ Configuração atualizada
✓ Dados enviados com sucesso
```

**Backend (Terminal):**
```
[timestamp] "GET /api/configuration/sensors/?belt_id=1 HTTP/1.1" 200
[timestamp] "POST /api/acquisition/ingest/ HTTP/1.1" 201
```

### Arquivos de Referência
- `Dispositivo/README.md` - Documentação completa
- `Dispositivo/CONEXOES.md` - Esquema elétrico
- `backend/belt_monitor/acquisition/API_DOCUMENTATION.md` - API docs

---

## 🎯 PRÓXIMA REUNIÃO

### Agenda Sugerida
1. Revisar materiais adquiridos
2. Testar comunicação ESP32-Backend
3. Validar leitura de 1 sensor
4. Planejar montagem completa
5. Definir cronograma de calibração

### Preparação
- [ ] Backend rodando
- [ ] ESP32 com código de teste
- [ ] 1 sensor capacitivo funcionando
- [ ] Encoder disponível

---

**Última atualização:** $(date)
**Status:** Pronto para implementação física
