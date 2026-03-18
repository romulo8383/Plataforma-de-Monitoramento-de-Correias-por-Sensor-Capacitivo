# 🏫 Configuração WiFi IFES (WPA2-Enterprise)

## ✅ ATUALIZAÇÃO REALIZADA

Os códigos **ESP32.ino** e **ESP32_Teste.ino** foram atualizados com as credenciais do WiFi do IFES.

---

## 🔐 Credenciais Configuradas

### Rede do IFES (WPA2-Enterprise)
```cpp
const char* WIFI_SSID = "ws_wlan";
const char* WIFI_IDENTITY = "20212ceca0210";  // Usuário/identidade
const char* WIFI_PASSWORD = "#RUte8320";       // Senha
```

### Rede Alternativa (Casa)
```cpp
// Descomente estas linhas se quiser usar rede de casa:
// const char* WIFI_SSID = "PALMEIRAS";
// const char* WIFI_PASSWORD = "Rute8320";
// #define USE_SIMPLE_WIFI
```

---

## 🔧 Como Funciona

### WPA2-Enterprise (IFES)

A rede do IFES usa **WPA2-Enterprise**, que é diferente de redes domésticas:

**Rede Doméstica (WPA2-Personal):**
```cpp
WiFi.begin(ssid, password);  // Simples
```

**Rede IFES (WPA2-Enterprise):**
```cpp
// Requer autenticação com usuário + senha
esp_wifi_sta_wpa2_ent_set_identity(...);
esp_wifi_sta_wpa2_ent_set_username(...);
esp_wifi_sta_wpa2_ent_set_password(...);
esp_wifi_sta_wpa2_ent_enable();
WiFi.begin(ssid);
```

---

## 📝 O Que Foi Alterado

### 1. Includes Adicionados
```cpp
#include "esp_wpa2.h"  // Biblioteca para WPA2-Enterprise
```

### 2. Credenciais Atualizadas
```cpp
// ANTES:
const char* WIFI_SSID = "SEU_WIFI_SSID";
const char* WIFI_PASSWORD = "SUA_SENHA_WIFI";

// DEPOIS:
const char* WIFI_SSID = "ws_wlan";
const char* WIFI_IDENTITY = "20212ceca0210";
const char* WIFI_PASSWORD = "#RUte8320";
```

### 3. Função de Conexão Atualizada
```cpp
void connectWiFi() {
  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA);
  
  #ifdef USE_SIMPLE_WIFI
    // Rede simples (casa)
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  #else
    // WPA2-Enterprise (IFES)
    esp_wifi_sta_wpa2_ent_set_identity((uint8_t *)WIFI_IDENTITY, strlen(WIFI_IDENTITY));
    esp_wifi_sta_wpa2_ent_set_username((uint8_t *)WIFI_IDENTITY, strlen(WIFI_IDENTITY));
    esp_wifi_sta_wpa2_ent_set_password((uint8_t *)WIFI_PASSWORD, strlen(WIFI_PASSWORD));
    esp_wifi_sta_wpa2_ent_enable();
    WiFi.begin(WIFI_SSID);
  #endif
  
  // Aguardar conexão...
}
```

---

## 🚀 Como Usar

### Opção 1: Usar WiFi do IFES (Padrão)

**Não precisa fazer nada!** O código já está configurado.

```bash
1. Abrir ESP32.ino ou ESP32_Teste.ino
2. Upload para ESP32
3. Abrir Monitor Serial (115200 baud)
4. Aguardar conexão
```

**Saída esperada:**
```
🏫 Conectando ao WiFi do IFES: ws_wlan
.....
✅ WiFi conectado com sucesso!
📍 IP da ESP32: 172.19.xxx.xxx
```

---

### Opção 2: Usar Rede de Casa

Se quiser testar em casa, **descomente** estas linhas:

```cpp
// Localizar no início do código:

// ⚠️ REDE ALTERNATIVA (descomente se precisar usar outra rede)
const char* WIFI_SSID = "PALMEIRAS";      // ← Descomentar
const char* WIFI_PASSWORD = "Rute8320";   // ← Descomentar
#define USE_SIMPLE_WIFI                   // ← Descomentar

// E COMENTE as linhas do IFES:
// const char* WIFI_SSID = "ws_wlan";
// const char* WIFI_IDENTITY = "20212ceca0210";
// const char* WIFI_PASSWORD = "#RUte8320";
```

---

## 🔍 Verificação

### Monitor Serial - Conexão Bem-Sucedida

```
=== ESP32 - Sistema de Monitoramento de Correias ===
✓ Pinos dos sensores configurados
✓ Encoder configurado
🏫 Conectando ao WiFi do IFES: ws_wlan
.....
✅ WiFi conectado com sucesso!
📍 IP da ESP32: 172.19.146.xxx
✓ Configuração atualizada
✓ Sistema inicializado com sucesso!
```

### Monitor Serial - Falha na Conexão

```
🏫 Conectando ao WiFi do IFES: ws_wlan
..............................
❌ Falha ao conectar WiFi do IFES!
Verifique as credenciais e reinicie a ESP32.
```

**Possíveis causas:**
- Credenciais incorretas
- Fora do alcance da rede IFES
- Rede IFES temporariamente indisponível

---

## 🌐 Configuração do Backend

### No IFES

O backend deve estar rodando em um computador conectado à mesma rede:

```cpp
// No código ESP32, configurar:
const char* BACKEND_URL = "http://172.19.146.XXX:8000";  // IP do PC no IFES
```

**Como descobrir o IP no IFES:**
```bash
# Windows
ipconfig

# Procurar adaptador "Wi-Fi" ou "Ethernet"
# IPv4 Address: 172.19.146.XXX
```

### Em Casa

```cpp
const char* WIFI_SSID = "PALMEIRAS";
const char* WIFI_PASSWORD = "Rute8320";
#define USE_SIMPLE_WIFI

const char* BACKEND_URL = "http://192.168.1.XXX:8000";  // IP do PC em casa
```

---

## 🔧 Troubleshooting

### Erro: "esp_wpa2.h: No such file or directory"

**Solução:** Atualizar ESP32 Arduino Core

```bash
# Arduino IDE:
1. Tools > Board > Boards Manager
2. Procurar "ESP32"
3. Atualizar para versão 2.0.0 ou superior
```

### Erro: Não conecta no IFES

**Verificar:**
1. ✅ Credenciais corretas (usuário: 20212ceca0210, senha: #RUte8320)
2. ✅ Dentro do alcance da rede ws_wlan
3. ✅ Biblioteca esp_wpa2.h disponível
4. ✅ ESP32 Arduino Core atualizado

### Erro: Conecta mas não acessa backend

**Verificar:**
1. ✅ Backend rodando: `python manage.py runserver 0.0.0.0:8000`
2. ✅ IP do backend correto no código
3. ✅ Firewall do Windows não está bloqueando
4. ✅ ESP32 e PC na mesma rede

---

## 📊 Comparação: IFES vs Casa

| Aspecto | IFES (ws_wlan) | Casa (PALMEIRAS) |
|---------|----------------|------------------|
| Tipo | WPA2-Enterprise | WPA2-Personal |
| Autenticação | Usuário + Senha | Apenas Senha |
| Biblioteca | esp_wpa2.h | WiFi.h padrão |
| Complexidade | Média | Simples |
| Faixa IP | 172.19.x.x | 192.168.x.x |

---

## ✅ Checklist de Validação

### Antes de fazer upload:

- [ ] Código compilou sem erros
- [ ] Biblioteca esp_wpa2.h disponível
- [ ] Credenciais do IFES corretas
- [ ] Backend rodando (se for testar comunicação)
- [ ] IP do backend configurado

### Após upload:

- [ ] Monitor Serial aberto (115200 baud)
- [ ] WiFi conectou com sucesso
- [ ] IP da ESP32 exibido
- [ ] Configuração atualizada (se backend rodando)

---

## 🎯 Próximos Passos

1. ✅ Credenciais configuradas
2. ⏳ Testar conexão WiFi (ESP32_Teste.ino)
3. ⏳ Configurar IP do backend
4. ⏳ Testar comunicação completa
5. ⏳ Montar hardware

---

## 📞 Suporte

### Problemas com WiFi IFES?
- Verificar com TI do IFES se credenciais estão ativas
- Testar conexão em outro dispositivo primeiro
- Verificar se rede ws_wlan está disponível

### Problemas com código?
- Consultar README.md
- Verificar Monitor Serial para erros
- Testar com rede de casa primeiro

---

**Última atualização:** Configuração WiFi IFES implementada
**Status:** ✅ Pronto para uso no IFES
