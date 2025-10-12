# 💡 MVP Consumo Consciente

Aplicativo web educacional para monitoramento e redução do consumo de energia elétrica residencial.

## 🚀 Funcionalidades

### ✨ Principais recursos

- **📄 Upload de Conta de Energia (PDF)**: Faça upload da sua conta em PDF e receba análise automática com dicas personalizadas
- **📊 Visualizações Interativas**: Gráficos de consumo diário, horário e comparação com metas
- **🎯 Metas Personalizadas**: Defina e acompanhe suas metas de economia
- **💰 Simulador de Economia**: Calcule economia potencial deslocando consumo do horário de pico
- **🏆 Sistema de Selos**: Conquiste badges ao atingir metas (Bronze, Prata, Ouro)
- **📅 Calendário de Consumo**: Visualize seu histórico mensal
- **💡 Dicas Inteligentes**: Recomendações personalizadas baseadas em seus dados reais
- **📥 Import CSV**: Suporte para importar dados históricos via CSV
- **🔐 Privacidade**: Todo processamento é local, seus dados não saem do navegador

## 🛠️ Tecnologias

- **React 19** + **TypeScript**
- **Vite** (build tool rápido)
- **Tailwind CSS v4** (estilização moderna)
- **Recharts** (gráficos interativos)
- **PDF.js** (parsing de PDFs)
- **Lucide React** (ícones)

## 📦 Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview
```

## 🎨 Estrutura do Projeto

```
app/
├── src/
│   ├── components/
│   │   ├── BatteryGauge.tsx       # Indicador visual de meta
│   │   ├── MonthCalendar.tsx      # Calendário mensal
│   │   ├── OnboardingForm.tsx     # Formulário inicial de hábitos
│   │   ├── PdfUploader.tsx        # Upload e análise de PDFs
│   │   └── Button.tsx             # Componentes UI
│   ├── App.tsx                    # Componente principal
│   ├── ui.tsx                     # Sistema de design
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Estilos globais
├── public/                        # Assets estáticos
└── GUIA_UPLOAD_PDF.md            # Guia detalhado do upload
```

## 📄 Como usar o Upload de PDF

1. **Prepare sua conta**: Tenha o PDF da conta de energia
2. **Upload**: Clique em "📤 Selecionar PDF" no topo da página
3. **Aguarde**: O processamento leva alguns segundos
4. **Visualize**: Veja as dicas personalizadas na aba "📄 Análise da Conta"

Veja o [Guia Completo de Upload](./GUIA_UPLOAD_PDF.md) para mais detalhes.

## 🔍 O que o sistema extrai do PDF

- Consumo mensal (kWh)
- Valor total da conta (R$)
- Mês de referência
- Histórico de consumo (quando disponível)
- Consumo diário médio (calculado)

## 💡 Dicas geradas automaticamente

O sistema analisa seus dados e gera:
- Alertas de consumo alto
- Análise de tarifa e horário de pico
- Comparação com mês anterior
- Potencial de economia (kWh e R$)
- Dicas práticas específicas

## 🌐 Navegação

- **🎯 Meta & Simulação**: Configure metas e simule economia
- **📊 Gráficos**: Visualize consumo histórico e horário
- **🏆 Selos**: Conquiste badges economizando
- **📅 Calendário**: Veja seu histórico diário
- **📄 Análise da Conta**: Resultados do PDF com dicas

## 🔒 Privacidade e Segurança

✅ **Processamento local**: Todo o parsing do PDF acontece no navegador  
✅ **Sem servidores**: Nenhum dado é enviado para a nuvem  
✅ **localStorage**: Dados salvos apenas no seu dispositivo  
✅ **Open Source**: Código transparente e auditável  

## 📈 Roadmap

- [x] Upload e análise de PDF
- [x] Sistema de dicas personalizadas
- [x] Gráficos interativos
- [x] Sistema de badges
- [ ] Integração com IoT (ESP32/Arduino)
- [ ] Notificações de pico de consumo
- [ ] Comparação com vizinhança
- [ ] Export de relatórios

## 🤝 Contribuindo

Contribuições são bem-vindas! Este é um MVP educacional focado em conscientização energética.

## 📝 Licença

Este é um projeto educacional desenvolvido para fins de aprendizado e conscientização sobre consumo de energia.

---

**Desenvolvido com ❤️ para um futuro mais sustentável 🌱**
