# 🚀 GUIA RÁPIDO DE INÍCIO

## ⚡ Setup em 5 Minutos

### 1️⃣ Preparar Backend (2 min)

```bash
# Navegar para o backend
cd backend/belt_monitor

# Iniciar servidor (deixar rodando)
python manage.py runserver 0.0.0.0:8000
```

**✓ Backend rodando em:** `http://localhost:8000`

---

### 2️⃣ Criar Correia no Admin (1 min)

```bash
# Abrir navegador
http://localhost:8000/admin

# Login (criar superuser se necessário):
python manage.py createsuperuser

# Criar:
1. Belt (Correia)
   - Name: "Correia Principal"
   - Length: 100m
   - Width: 1000mm
   - Speed: 2.5 m/s
   - Encoder PPR: 360

2. Sensors (16 sensores)
   - Belt: Correia Principal
   - Sensor Number: 1 a 16
   - Enabled: False (inicialmente)
   - Plate Size: 50mm
```

---

### 3️⃣ Configurar ESP32 (1 min)

```cpp
// Abrir: Dispositivo/ESP32_Teste.ino

// Editar estas 3 linhas:
const char* WIFI_SSID = "SeuWiFi";              // ← Seu WiFi
const char* WIFI_PASSWORD = "SuaSenha";         // ← Sua senha
const char* BACKEND_URL = "http://192.168.1.X:8000";  // ← IP do PC
```

**Como descobrir o IP do PC:**
```bash
# Windows
ipconfig

# Procurar por "IPv4 Address"
# Exemplo: 192.168.1.100
```

---

### 4️⃣ Upload e Teste (1 min)

```bash
# Arduino IDE:
1. Tools > Board > ESP32 Dev Module
2. Tools > Port > COM3 (ou sua porta)
3. Upload (Ctrl+U)

# Abrir Monitor Serial (Ctrl+Shift+M)
# Baud Rate: 115200

# Aguardar mensagens:
✓ WiFi conectado!
✓ TESTE 1: Configuração recebida
✓ TESTE 2: Dados enviados
✓ TESTE 3: Sensor alterado
```

---

## ✅ Validação Rápida

### Backend OK?
```bash
# Testar endpoint
curl http://localhost:8000/api/configuration/sensors/?belt_id=1

# Deve retornar JSON com sensores
```

### ESP32 OK?
```
Monitor Serial deve mostrar:
✓ WiFi conectado!
✓ Testes concluídos
```

### Comunicação OK?
```bash
# Verificar logs do Django
# Deve aparecer:
"GET /api/configuration/sensors/?belt_id=1 HTTP/1.1" 200
"POST /api/acquisition/ingest/ HTTP/1.1" 201
```

---

## 🎯 Próximo Passo

### Usar Código Principal

```bash
# 1. Abrir: Dispositivo/ESP32.ino

# 2. Configurar WiFi e Backend (mesmas 3 linhas)

# 3. Upload

# 4. Monitor Serial:
Digite: status
```

**Saída esperada:**
```
--- Configuração Atual ---
Encoder: DESABILITADO
Sensores habilitados:
  Nenhum sensor habilitado
-------------------------
```

---

## 🔧 Habilitar Sensores

### Via API (Rápido)
```bash
# Habilitar sensor 1
curl -X POST http://localhost:8000/api/configuration/toggle-sensor/ \
  -H "Content-Type: application/json" \
  -d '{"sensor_id": 1, "enabled": true}'

# Aguardar 5 segundos
# ESP32 vai atualizar automaticamente
```

### Via Admin (Visual)
```bash
# 1. http://localhost:8000/admin/configuration/sensor/

# 2. Clicar no Sensor 1

# 3. Marcar "Enabled"

# 4. Salvar

# 5. Aguardar 5 segundos
```

### Verificar na ESP32
```
Monitor Serial:
Digite: status

Saída:
--- Configuração Atual ---
Encoder: HABILITADO
Sensores habilitados:
  Sensor 1 (GPIO 36): HABILITADO
-------------------------
```

---

## 📊 Ver Dados no Banco

### Via Admin
```bash
http://localhost:8000/admin/acquisition/encoderreading/
http://localhost:8000/admin/acquisition/sensorreading/
```

### Via API
```bash
# Última leitura
curl http://localhost:8000/api/acquisition/latest-reading/?belt_id=1

# Leituras do sensor 1
curl http://localhost:8000/api/acquisition/sensor-readings/?sensor_id=1&limit=10
```

---

## 🐛 Problemas Comuns

### ESP32 não conecta WiFi
```
Solução:
1. Verificar SSID e senha
2. Usar rede 2.4GHz (não 5GHz)
3. Aproximar ESP32 do roteador
```

### Erro 404 ao buscar configuração
```
Solução:
1. Verificar BELT_ID = 1 existe no banco
2. Criar correia no admin se necessário
```

### Erro 400 ao enviar dados
```
Solução:
1. Verificar sensores existem no banco
2. Criar 16 sensores no admin
```

### Monitor Serial não mostra nada
```
Solução:
1. Verificar Baud Rate = 115200
2. Pressionar botão RESET na ESP32
3. Reconectar USB
```

---

## 📱 Comandos Úteis

### Monitor Serial
```
status  - Ver status do sistema
reset   - Resetar contador encoder
update  - Forçar atualização de config
read    - Forçar leitura dos sensores
help    - Mostrar ajuda
```

### Backend
```bash
# Ver logs em tempo real
python manage.py runserver

# Criar superuser
python manage.py createsuperuser

# Shell interativo
python manage.py shell
```

---

## 📚 Documentação Completa

- **README.md** - Documentação completa da ESP32
- **CONEXOES.md** - Esquema elétrico e pinagem
- **PLANO_IMPLEMENTACAO.md** - Plano detalhado em 6 fases
- **API_EXEMPLOS.md** - Exemplos de uso da API
- **RESUMO_IMPLEMENTACAO.md** - Resumo de tudo implementado

---

## 🎓 Fluxo de Desenvolvimento

```
1. Testar comunicação (ESP32_Teste.ino)
   ↓
2. Validar endpoints funcionam
   ↓
3. Usar código principal (ESP32.ino)
   ↓
4. Habilitar sensores via API/Admin
   ↓
5. Verificar dados no banco
   ↓
6. Montar hardware físico
   ↓
7. Calibrar sensores
   ↓
8. Integrar com frontend
```

---

## ✨ Dica Final

**Sempre verifique nesta ordem:**
1. ✓ Backend rodando?
2. ✓ Correia criada no banco?
3. ✓ Sensores criados no banco?
4. ✓ ESP32 conectada ao WiFi?
5. ✓ IP do backend correto?

---

## 🆘 Precisa de Ajuda?

1. Consulte **README.md** para documentação completa
2. Use comando `status` no Monitor Serial
3. Verifique logs do Django
4. Teste endpoints com cURL

---

**Tempo total de setup:** ~5 minutos
**Dificuldade:** ⭐⭐☆☆☆ (Fácil)
**Status:** ✅ Pronto para uso
