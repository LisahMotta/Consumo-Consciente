# 🌐 Guia: Domínio Próprio para seu App

Transforme `consumo-consciente-mvp.onrender.com` em `consumoconsciente.com.br`!

---

## 📋 O que você precisa

1. ✅ App já publicado no Render
2. 💰 R$ 40-80/ano para registrar o domínio
3. ⏱️ 10-30 minutos para configurar
4. 🕐 24-48h para propagação DNS (funcionar completamente)

---

## 🎯 Passo a Passo Completo

### Etapa 1️⃣: Escolher e registrar o domínio

#### **Opções de domínio:**

**Popular e recomendado:**
- `consumoconsciente.com.br` (R$ 40/ano)
- `consumoconsciente.app` (R$ 70/ano)
- `consumoconsciente.online` (R$ 30/ano)
- `consumoconsciente.eco` (R$ 100/ano) - Ideal para sustentabilidade!

**Criativo:**
- `economizeenergia.com.br`
- `energia.eco.br`
- `ajudaenergia.com.br`

#### **Onde comprar (Registradores brasileiros):**

##### 🥇 **1. Registro.br** (Oficial - Recomendado!)
- 🔗 [registro.br](https://registro.br)
- 💰 Preço: R$ 40/ano (.com.br)
- ✅ Oficial do Brasil
- ✅ Mais barato
- ✅ Interface simples
- ✅ Confiável
- ⏱️ Renovação anual

**Como comprar:**
1. Acesse [registro.br](https://registro.br)
2. Pesquise o domínio desejado (ex: consumoconsciente.com.br)
3. Se estiver disponível, clique em "Adicionar ao carrinho"
4. Crie uma conta (CPF necessário)
5. Pague via PIX, boleto ou cartão
6. Aguarde confirmação (imediato com PIX)

##### 🥈 **2. HostGator**
- 🔗 [hostgator.com.br](https://hostgator.com.br)
- 💰 Preço: R$ 40-50/ano
- ✅ Interface amigável
- ✅ Suporte em português
- 📧 Email profissional incluso

##### 🥉 **3. Locaweb**
- 🔗 [locaweb.com.br](https://locaweb.com.br)
- 💰 Preço: R$ 40-60/ano
- ✅ Tradicional
- ✅ Suporte 24/7

##### **4. GoDaddy** (Internacional)
- 🔗 [godaddy.com](https://godaddy.com)
- 💰 Preço: R$ 50-80/ano
- ✅ Maior registrador do mundo
- ⚠️ Interface em inglês
- ⚠️ Preço pode aumentar na renovação

##### **5. Namecheap** (Internacional - Barato)
- 🔗 [namecheap.com](https://namecheap.com)
- 💰 Preço: R$ 30-50/ano
- ✅ Muito barato
- ✅ Privacy protection grátis
- ⚠️ Interface em inglês

---

### Etapa 2️⃣: Configurar DNS no registrador

Depois de comprar o domínio, você precisa **apontar** ele para o Render.

#### **Opção A: Usando CNAME (Recomendado)**

1. Acesse o painel do seu registrador (Registro.br, HostGator, etc)
2. Vá em "Gerenciar DNS" ou "Zona DNS"
3. Adicione os seguintes registros:

```
Tipo: CNAME
Nome: www
Valor: seu-app.onrender.com
TTL: 3600 (ou automático)

Tipo: A
Nome: @  (ou deixe em branco)
Valor: 216.24.57.1
TTL: 3600
```

#### **Opção B: Registros A (Alternativa)**

```
Tipo: A
Nome: @
Valor: 216.24.57.1
TTL: 3600

Tipo: A
Nome: www
Valor: 216.24.57.1
TTL: 3600
```

**⚠️ Importante:**
- Remova quaisquer registros A ou CNAME antigos
- O IP `216.24.57.1` é do Render (pode mudar, verifique na documentação)

---

### Etapa 3️⃣: Configurar domínio no Render

1. Acesse o dashboard do Render
2. Vá no seu site → **"Settings"**
3. Role até **"Custom Domain"**
4. Clique em **"Add Custom Domain"**
5. Digite seu domínio: `consumoconsciente.com.br`
6. Clique em **"Save"**

O Render vai:
- ✅ Verificar a conexão DNS
- ✅ Gerar certificado SSL/HTTPS automático
- ✅ Configurar redirecionamentos

---

### Etapa 4️⃣: Configurar www (opcional mas recomendado)

Para que tanto `consumoconsciente.com.br` quanto `www.consumoconsciente.com.br` funcionem:

**No Render:**
1. Adicione ambos os domínios:
   - `consumoconsciente.com.br`
   - `www.consumoconsciente.com.br`

**No registrador (DNS):**
```
# Domínio raiz
Tipo: A
Nome: @
Valor: 216.24.57.1

# Subdomínio www
Tipo: CNAME
Nome: www
Valor: consumoconsciente.com.br
```

O Render vai redirecionar automaticamente um para o outro.

---

## 📊 Exemplo prático (Registro.br)

### Passo 1: Comprar o domínio

1. Acesse [registro.br](https://registro.br)
2. Pesquise: `consumoconsciente.com.br`
3. Adicione ao carrinho: R$ 40/ano
4. Faça cadastro com CPF
5. Pague via PIX (instantâneo)
6. ✅ Domínio registrado!

### Passo 2: Configurar DNS

1. No painel do Registro.br, vá em "Meus Domínios"
2. Clique em `consumoconsciente.com.br`
3. Vá em "Editar Zona DNS"
4. Adicione os registros:

```
# Registro A (domínio principal)
Tipo: A
Nome: (deixe vazio ou @)
Conteúdo: 216.24.57.1
TTL: 300

# Registro CNAME (www)
Tipo: CNAME
Nome: www
Conteúdo: consumo-consciente-mvp.onrender.com
TTL: 300
```

5. Clique em "Salvar"

### Passo 3: Configurar no Render

1. Dashboard do Render → seu site
2. Settings → Custom Domain
3. Add Custom Domain: `consumoconsciente.com.br`
4. Add Custom Domain: `www.consumoconsciente.com.br`
5. Aguarde ✅ aparecer ao lado dos domínios

### Passo 4: Aguardar propagação

- ⏱️ 5-15 minutos: Provavelmente já funciona
- ⏱️ 1-4 horas: Deve estar funcionando
- ⏱️ 24-48 horas: Funcionando em todo mundo

---

## 🔍 Verificar se está funcionando

### Teste 1: Ping
Abra o terminal:
```bash
ping consumoconsciente.com.br
```

Deve retornar o IP do Render: `216.24.57.1`

### Teste 2: Navegador
Acesse: `http://consumoconsciente.com.br`

Se funcionar, você verá seu app! 🎉

### Teste 3: HTTPS
Aguarde 5-10 minutos, depois acesse:
`https://consumoconsciente.com.br`

Se funcionar com cadeado 🔒, está perfeito!

---

## 💡 Dicas importantes

### ✅ HTTPS automático
O Render gera certificado SSL/HTTPS **grátis** automaticamente via Let's Encrypt.
Nenhuma configuração adicional necessária!

### ✅ Redirecionamento
Configure para redirecionar:
- `http://` → `https://` (automático no Render)
- `www.` → sem www (ou vice-versa)

No Render:
Settings → Redirects → HTTP → HTTPS: **Enabled**

### ✅ Email profissional (opcional)
Se quiser email tipo `contato@consumoconsciente.com.br`:

**Opções gratuitas:**
- Zoho Mail: 5 contas grátis
- ImprovMX: Forward grátis para seu Gmail

**Opções pagas:**
- Google Workspace: R$ 25/mês
- Microsoft 365: R$ 30/mês

### ✅ Renovação
- Domínios expiram! Marque no calendário
- Configure renovação automática
- Registro.br: renovação 30 dias antes

---

## 🐛 Solução de problemas

### "Domínio não encontrado"
❌ **Problema:** DNS ainda não propagou
✅ **Solução:** Aguarde mais tempo (até 48h)

### "Conexão não é segura"
❌ **Problema:** SSL ainda não foi gerado
✅ **Solução:** 
1. Aguarde 10-15 minutos
2. No Render: Settings → Custom Domain → Refresh

### "Site não carrega"
❌ **Problema:** Registros DNS incorretos
✅ **Solução:**
1. Verifique os registros DNS no registrador
2. Use ferramenta: [dnschecker.org](https://dnschecker.org)
3. Confirme IP do Render está correto

### "Funciona sem www mas não com www"
❌ **Problema:** Falta registro CNAME para www
✅ **Solução:** Adicione registro CNAME:
```
Tipo: CNAME
Nome: www
Valor: seu-dominio.com.br
```

---

## 💰 Custos totais

### Mínimo (Registro.br + Render gratuito):
```
Domínio .com.br:  R$ 40/ano
Hosting (Render):  R$ 0 (grátis)
SSL/HTTPS:         R$ 0 (grátis)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:            R$ 40/ano
                  ~R$ 3,33/mês
```

### Completo (com email profissional):
```
Domínio:           R$ 40/ano
Hosting (Render):  R$ 0
Email (Zoho):      R$ 0 (grátis)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:            R$ 40/ano
                  ~R$ 3,33/mês
```

### Premium (sempre online + email):
```
Domínio:           R$ 40/ano
Render Pro:        R$ 35/mês (app sempre ativo)
Google Workspace:  R$ 25/mês
━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:            R$ 760/ano
                  ~R$ 63/mês
```

---

## 🎯 Sugestões de domínios disponíveis

Algumas ideias criativas e memoráveis:

### Diretos:
- `consumoconsciente.com.br` ⭐
- `consumoconsciente.app`
- `consumo-consciente.com.br`

### Criativos:
- `economizeenergia.com.br` ⚡
- `minhaenergia.com.br` 💡
- `energiaconsciente.com.br` 🌱
- `gastomenosenergia.com.br` 💰
- `contabarata.com.br` 💚

### Curtos e memoráveis:
- `conenergia.com.br`
- `ecoenergia.app`
- `meuconsumo.eco.br`

Verifique disponibilidade em: [registro.br/busca](https://registro.br)

---

## 📚 Links úteis

- [Registro.br](https://registro.br) - Registrar .com.br
- [Render - Custom Domains](https://render.com/docs/custom-domains) - Documentação oficial
- [DNS Checker](https://dnschecker.org) - Verificar propagação DNS
- [WhatsMyDNS](https://whatsmydns.net) - Verificar DNS global
- [SSL Checker](https://www.sslshopper.com/ssl-checker.html) - Verificar certificado

---

## 🎉 Resultado final

Depois de configurar tudo:

**Antes:**
`https://consumo-consciente-mvp.onrender.com`

**Depois:**
`https://consumoconsciente.com.br` 🔒✨

Profissional, memorável e confiável! 💚

---

## 🚀 Próximos passos

Após ter seu domínio próprio:

1. ✅ Compartilhe nas redes sociais
2. ✅ Configure Google Analytics
3. ✅ Adicione no Google Search Console
4. ✅ Configure email profissional
5. ✅ Crie logo/favicon personalizado
6. ✅ Configure Open Graph (preview bonito no WhatsApp)

---

**Dúvidas? Precisa de ajuda? Me avise!** 😊

**Boa sorte com seu domínio próprio!** 🌐🎉

