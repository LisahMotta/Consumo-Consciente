# 🚀 Guia: Deploy no Render

Este guia mostra como fazer deploy do **MVP Consumo Consciente** no Render gratuitamente.

---

## 📋 Pré-requisitos

1. ✅ Conta no GitHub (já tem!)
2. ✅ Repositório no GitHub com o código (já tem!)
3. ✅ Conta no Render (gratuita) → [render.com](https://render.com)

---

## 🎯 Passo a Passo

### 1️⃣ Criar conta no Render

1. Acesse [render.com](https://render.com)
2. Clique em **"Get Started"** ou **"Sign Up"**
3. Escolha **"Sign up with GitHub"**
4. Autorize o Render a acessar seus repositórios

### 2️⃣ Criar novo Static Site

1. No dashboard do Render, clique em **"New +"**
2. Selecione **"Static Site"**
3. Conecte seu repositório:
   - Procure por **"Consumo-Consciente"** ou **"consumo-consciente-mvp"**
   - Clique em **"Connect"**

### 3️⃣ Configurar o deploy

Preencha os campos:

```
Name: consumo-consciente-mvp
(ou qualquer nome que preferir)

Branch: main

Build Command: cd app && npm install && npm run build

Publish Directory: app/dist
```

**Configurações avançadas (opcional):**
- Auto-Deploy: **Yes** (deploy automático quando fizer push)
- Pull Request Previews: **Enabled** (opcional)

### 4️⃣ Fazer deploy

1. Clique em **"Create Static Site"**
2. Aguarde o build (3-5 minutos na primeira vez)
3. ✅ Quando terminar, você verá: **"Your site is live!"**

### 5️⃣ Acessar seu app

Seu app estará disponível em:
```
https://consumo-consciente-mvp.onrender.com
```
(ou o nome que você escolheu)

---

## 🔧 Arquivo de configuração

O repositório já contém o arquivo `render.yaml` que configura automaticamente:

```yaml
services:
  - type: web
    name: consumo-consciente-mvp
    env: static
    buildCommand: cd app && npm install && npm run build
    staticPublishPath: ./app/dist
```

---

## 🔄 Atualizações automáticas

Toda vez que você fizer **git push** para o GitHub:
1. Render detecta a mudança automaticamente
2. Faz o build novamente
3. Publica a nova versão
4. Tudo em **3-5 minutos**!

---

## 💡 Dicas

### ✅ **URL personalizada (opcional)**

No dashboard do Render:
1. Settings → Custom Domain
2. Adicione seu domínio próprio (se tiver)

### ✅ **Monitorar o build**

- Veja logs em tempo real na aba **"Logs"**
- Acompanhe o status na aba **"Events"**

### ✅ **Forçar novo deploy**

Se precisar fazer deploy sem mudanças no código:
1. Dashboard do Render
2. Manual Deploy → **"Deploy latest commit"**

### ✅ **Configurar variáveis de ambiente**

Atualmente não precisamos, mas caso precise no futuro:
1. Settings → Environment
2. Adicione as variáveis

---

## 🐛 Solução de problemas

### **Erro: "Build failed"**

**Solução 1:** Verificar logs no Render
- Clique em "Logs" para ver o erro específico

**Solução 2:** Testar build local
```bash
cd app
npm install
npm run build
```

**Solução 3:** Limpar cache
- No Render: Settings → Clear build cache & deploy

### **Erro: "Page not found" (404)**

Verifique se o **Publish Directory** está correto:
```
app/dist
```

### **App carrega mas sem estilos**

Verifique o `vite.config.ts`:
```typescript
base: '/'
```

---

## 📊 Plano gratuito do Render

O que você ganha **DE GRAÇA**:
- ✅ 100 GB de largura de banda/mês
- ✅ Deploy automático
- ✅ SSL/HTTPS grátis
- ✅ CDN global
- ✅ Previews de Pull Requests
- ✅ Sem limite de sites estáticos!

**Limitação:**
- Sites ficam "dormindo" após 15 minutos sem acesso
- Primeiro acesso após dormir: 30 segundos mais lento
- Para sites sempre ativos: upgrade para plano pago ($7/mês)

---

## 🎉 Pronto!

Seu app estará online e acessível para qualquer pessoa na internet!

Compartilhe o link:
```
https://seu-app.onrender.com
```

---

## 📱 Próximos passos

Depois do deploy, você pode:

1. **Configurar PWA** (app instalável no celular)
2. **Adicionar domínio próprio** (ex: consumoconsciente.com.br)
3. **Configurar Google Analytics** (opcional)
4. **Adicionar Open Graph** para compartilhar bonito no WhatsApp
5. **Otimizar SEO** para aparecer no Google

---

**🌟 Qualquer dúvida, consulte a [documentação oficial do Render](https://render.com/docs/static-sites)**

**Desenvolvido com ❤️ - Agora online para o mundo! 🌍**

