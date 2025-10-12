# 📱 Guia: Progressive Web App (PWA)

Transforme seu site em um **app instalável** no celular e desktop!

---

## ✨ O que é PWA?

Progressive Web App é uma tecnologia que permite que sites funcionem como aplicativos nativos:

✅ **Instalável** - Adicionar à tela inicial  
✅ **Offline** - Funciona sem internet  
✅ **Rápido** - Cache inteligente  
✅ **Notificações** - Push notifications  
✅ **Ícone próprio** - Como app de verdade  
✅ **Sem loja** - Não precisa App Store/Play Store  

---

## 🎯 O que foi implementado

### ✅ Arquivos criados/modificados:

1. **`manifest.json`** - Define como o app aparece quando instalado
2. **`sw.js`** - Service Worker para cache e offline
3. **`index.html`** - Meta tags para PWA e Open Graph
4. **`main.tsx`** - Registro do Service Worker

### ✅ Funcionalidades:

- 📱 Instalável em Android, iOS e Desktop
- 🔄 Cache inteligente (funciona offline)
- ⚡ Carregamento rápido
- 🎨 Ícones e splash screen
- 🔗 Deep links e atalhos
- 📲 Compartilhamento nativo

---

## 🎨 Criando os ícones

Você precisa criar ícones para o PWA. Aqui estão 3 formas:

### Opção 1: Usar ferramenta online (Mais fácil) ⭐

1. **PWA Asset Generator**
   - 🔗 [pwa-asset-generator.js.org](https://pwa-asset-generator.js.org/)
   - Upload de um logo 512x512
   - Gera todos os tamanhos automaticamente

2. **Favicon.io**
   - 🔗 [favicon.io](https://favicon.io/)
   - Crie um ícone com emoji ou texto
   - Download de todos os tamanhos

3. **RealFaviconGenerator**
   - 🔗 [realfavicongenerator.net](https://realfavicongenerator.net/)
   - Mais completo e customizável

### Opção 2: Criar manualmente

**Tamanhos necessários:**
```
icon-72x72.png
icon-96x96.png
icon-128x128.png
icon-144x144.png
icon-152x152.png
icon-192x192.png
icon-384x384.png
icon-512x512.png
```

**Use:**
- Photoshop, Figma, Canva
- Fundo: Verde escuro (#14532d)
- Ícone: 💡 ou ⚡ branco centralizado
- Formato: PNG com transparência

### Opção 3: Usar emoji como ícone (Temporário)

```bash
# Instalar ferramenta
npm install -g emoji-to-png-cli

# Gerar ícones
emoji-to-png 💡 --size 72 --output public/icon-72x72.png
emoji-to-png 💡 --size 96 --output public/icon-96x96.png
emoji-to-png 💡 --size 128 --output public/icon-128x128.png
emoji-to-png 💡 --size 144 --output public/icon-144x144.png
emoji-to-png 💡 --size 152 --output public/icon-152x152.png
emoji-to-png 💡 --size 192 --output public/icon-192x192.png
emoji-to-png 💡 --size 384 --output public/icon-384x384.png
emoji-to-png 💡 --size 512 --output public/icon-512x512.png
```

**Ou crie um ícone simples:**
```html
<!-- Salve como icon.svg na pasta public -->
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#14532d"/>
  <text x="256" y="360" font-size="300" text-anchor="middle" fill="white">💡</text>
</svg>
```

Depois converta para PNG nos tamanhos necessários.

---

## 📱 Como instalar o PWA

### No Android (Chrome/Edge):

1. Abra o site no navegador
2. Aparecerá um banner "Adicionar à tela inicial" 
3. Ou: Menu (⋮) → **"Adicionar à tela inicial"**
4. Confirme a instalação
5. ✅ Ícone aparece na tela inicial!

**Atalho:**
- Aparece automaticamente se usar o site 2-3 vezes

### No iOS (Safari):

1. Abra o site no Safari
2. Toque no botão **Compartilhar** (🔗)
3. Role e toque em **"Adicionar à Tela de Início"**
4. Confirme
5. ✅ Ícone aparece na tela inicial!

**Nota:** iOS tem suporte limitado a PWAs

### No Desktop (Chrome/Edge):

1. Ícone de instalação aparece na barra de endereço (➕)
2. Ou: Menu → **"Instalar Consumo Consciente"**
3. Confirme
4. ✅ App abre em janela própria!

---

## 🧪 Testar o PWA

### 1. Lighthouse (Chrome DevTools)

```bash
1. Abra o site no Chrome
2. F12 → Aba "Lighthouse"
3. Marque "Progressive Web App"
4. Clique em "Analyze page load"
5. Veja a pontuação (alvo: 90+)
```

### 2. PWA Builder

🔗 [pwabuilder.com](https://pwabuilder.com)

1. Cole a URL do seu site
2. Clique em "Test"
3. Veja o relatório completo
4. Corrija problemas indicados

### 3. Chrome DevTools - Application

```bash
1. F12 → Aba "Application"
2. Sidebar esquerda → "Manifest"
   - Veja se o manifest.json carrega
   - Verifique ícones e configurações
3. Sidebar → "Service Workers"
   - Veja se está registrado
   - Teste offline
```

---

## 🔧 Configurações avançadas

### Cores personalizadas

Edite `manifest.json`:
```json
{
  "theme_color": "#14532d",      // Cor da barra superior
  "background_color": "#ffffff"  // Cor de fundo ao abrir
}
```

### Orientação da tela

```json
{
  "orientation": "portrait-primary"  // portrait | landscape | any
}
```

### Modos de exibição

```json
{
  "display": "standalone"  // standalone | fullscreen | minimal-ui | browser
}
```

**Opções:**
- `standalone`: Como app nativo (recomendado)
- `fullscreen`: Tela cheia sem barra
- `minimal-ui`: Barra mínima de navegação
- `browser`: Como site normal

### Atalhos rápidos

Já configurado no manifest! Ao pressionar e segurar o ícone:
- 📝 Registro Diário
- 📊 Ver Gráficos

---

## 🚀 Cache e Offline

### Estratégias implementadas:

1. **Network First** - Tenta buscar da internet primeiro
2. **Cache Fallback** - Se falhar, busca do cache
3. **Background Sync** - Sincroniza quando voltar online

### Como funciona:

```javascript
// 1ª vez: Busca da internet e salva no cache
// 2ª vez: Busca da internet (mais rápido)
// Offline: Usa o cache salvo
```

### Limpar cache:

```javascript
// Console do navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister());
});
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
```

---

## 📊 Checklist PWA

Use esta lista para verificar se tudo está funcionando:

### ✅ Básico
- [ ] Manifest.json carrega sem erros
- [ ] Service Worker registra
- [ ] HTTPS ativo (Render já faz isso)
- [ ] Ícones de todos os tamanhos
- [ ] Meta tags corretas

### ✅ Funcionalidade
- [ ] Banner de instalação aparece
- [ ] App instala no celular
- [ ] App instala no desktop
- [ ] Ícone aparece correto
- [ ] Nome aparece correto
- [ ] Cores corretas (theme/background)

### ✅ Offline
- [ ] Service Worker ativo
- [ ] Cache funciona
- [ ] App abre offline
- [ ] Dados salvos aparecem offline

### ✅ Performance
- [ ] Lighthouse score 90+ PWA
- [ ] Carregamento < 3s
- [ ] Responsivo (mobile/desktop)

---

## 🐛 Solução de problemas

### "Banner de instalação não aparece"

**Causas:**
- Precisa usar HTTPS (Render já tem)
- Service Worker não registrou
- Manifest.json com erro
- Usuário já instalou antes

**Solução:**
```bash
# DevTools → Application → Manifest
# Verifique se há erros

# DevTools → Console
# Procure por erros do Service Worker
```

### "Ícones não aparecem"

**Causas:**
- Arquivos PNG não existem
- Caminhos errados no manifest
- Tamanhos errados

**Solução:**
```bash
# Verifique se os arquivos existem:
app/public/icon-72x72.png
app/public/icon-96x96.png
... (todos os tamanhos)

# URLs no manifest devem começar com /
"/icon-192x192.png" ✅
"icon-192x192.png" ❌
```

### "Service Worker não registra"

**Causas:**
- Código com erro de sintaxe
- HTTPS não ativo
- Navegador não suporta

**Solução:**
```javascript
// Console do navegador
if ('serviceWorker' in navigator) {
  console.log('Service Worker suportado!');
} else {
  console.log('Service Worker NÃO suportado');
}
```

### "App instalado mas não abre"

**Causas:**
- start_url no manifest incorreta
- Ícones ausentes
- Manifest com erro

**Solução:**
```json
// manifest.json
{
  "start_url": "/",  // Deve ser / ou /?source=pwa
  "scope": "/"       // Adicione se não tiver
}
```

---

## 📱 Recursos extras

### Screenshots para loja

Adicione ao `manifest.json`:
```json
{
  "screenshots": [
    {
      "src": "/screenshot1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshot2.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ]
}
```

### Notificações Push (opcional)

```javascript
// Pedir permissão
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    console.log('Notificações permitidas!');
  }
});

// Enviar notificação local
new Notification('Consumo Consciente', {
  body: 'Lembre-se de registrar o consumo de hoje!',
  icon: '/icon-192x192.png'
});
```

### Share API (Compartilhar)

```javascript
// Botão de compartilhar
async function compartilhar() {
  if (navigator.share) {
    await navigator.share({
      title: 'Consumo Consciente',
      text: 'Economize energia com este app!',
      url: window.location.href
    });
  }
}
```

---

## 🎨 Design de ícones - Sugestões

### Ícone simples e eficaz:

```
Fundo: Verde escuro (#14532d)
Símbolo: 💡 (lâmpada) branco/amarelo
Estilo: Minimalista e limpo
```

### Variações criativas:

1. **Lâmpada LED com folha** 🌿💡
2. **Raio verde** ⚡ em círculo
3. **Medidor/Gauge** com agulha no verde
4. **Plug de energia** 🔌 com check ✅
5. **Casa com lâmpada** 🏠💡

### Ferramentas de design gratuitas:

- **Canva**: [canva.com](https://canva.com) - Template de ícone de app
- **Figma**: [figma.com](https://figma.com) - Design profissional
- **Photopea**: [photopea.com](https://photopea.com) - Photoshop online grátis

---

## 📚 Links úteis

- [PWA Builder](https://pwabuilder.com) - Testar e melhorar PWA
- [Manifest Generator](https://app-manifest.firebaseapp.com/) - Gerador de manifest
- [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) - Gerar ícones
- [Lighthouse](https://developers.google.com/web/tools/lighthouse) - Auditoria de PWA
- [Can I Use - Service Worker](https://caniuse.com/serviceworkers) - Compatibilidade

---

## 🎉 Resultado final

**Antes:** Site normal que só funciona no navegador

**Depois:**
- 📱 App instalável no celular
- 💻 App instalável no desktop
- 🔄 Funciona offline
- ⚡ Carregamento ultra-rápido
- 🏠 Ícone na tela inicial
- 🔔 Notificações (opcional)
- 📲 Compartilhamento nativo

**Experiência de app nativo sem precisar publicar na Play Store ou App Store!**

---

## 🚀 Próximos passos

Após implementar PWA:

1. ✅ Criar ícones nos tamanhos corretos
2. ✅ Fazer build e deploy
3. ✅ Testar no celular (Android/iOS)
4. ✅ Verificar Lighthouse score
5. ✅ Compartilhar link para instalação
6. ✅ Adicionar badge "Instale o app" no site

---

**Seu site agora é um Progressive Web App! 🎉📱**

**Desenvolvido com ❤️ - PWA ready! 💚**

