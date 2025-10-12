# 📝 Guia: Registro Diário de Consumo

## Como funciona o questionário diário

Este recurso permite que você registre o uso detalhado de cada equipamento elétrico da sua casa, calculando automaticamente o consumo e custo de energia.

---

## 🎯 Como usar

### 1️⃣ Acesse a aba "📝 Registro Diário"
No menu de navegação do aplicativo, clique em "📝 Registro Diário"

### 2️⃣ Configure a data e tarifa
- **Data**: Selecione o dia que deseja registrar (pode ser hoje ou dias anteriores)
- **Tarifa**: Ajuste o valor em R$ por kWh (geralmente entre R$ 0,60 e R$ 1,20)
  - Este valor você encontra na sua conta de energia
  - A tarifa é salva automaticamente para próximos registros

### 3️⃣ Filtre por categoria
Use os botões de categoria para navegar mais fácil:
- ❄️ **Climatização**: Ar-condicionado, ventiladores
- 🍳 **Cozinha**: Geladeira, micro-ondas, forno
- 📺 **Lazer**: TV, videogame, som
- 🚿 **Higiene**: Chuveiro, secador de cabelo
- 💻 **Trabalho**: Computador, notebook, monitor
- 💡 **Iluminação**: Lâmpadas de todos os tipos
- 🔌 **Outros**: Máquina de lavar, ferro, aspirador

### 4️⃣ Registre o tempo de uso
Para cada equipamento usado:
1. **Horas**: Digite quantas horas completas ficou ligado
2. **Minutos**: Ajuste os minutos adicionais (0-59)
3. O app calcula automaticamente o consumo em kWh e o custo

**Exemplos:**
- TV ligada das 06h às 22h = 16 horas
- Chuveiro: 2 banhos de 10 minutos = 20 minutos
- Ar-condicionado: 6 horas completas
- Micro-ondas: 15 minutos total

### 5️⃣ Veja o resumo
O card de resumo mostra em tempo real:
- 📊 Quantidade de equipamentos registrados
- ⚡ Consumo total do dia em kWh
- 💰 Custo estimado em R$
- 📝 Lista detalhada por equipamento

### 6️⃣ Salve o registro
Clique em "💾 Salvar Registro do Dia" para:
- Salvar permanentemente seus dados
- Atualizar os gráficos do app
- Ajustar sua meta automaticamente
- Adicionar ao histórico

---

## 📊 Banco de dados de equipamentos

O app já vem com **40+ equipamentos pré-cadastrados** com consumo real:

### Mais econômicos (< 100W)
- 💡 Lâmpada LED: 10-15W
- 💻 Notebook: 70W
- 📺 TV LED 32": 60W
- 🌀 Ventilador: 50-70W
- 🖥️ Monitor: 40W

### Consumo moderado (100-500W)
- 🧊 Geladeira: 120W
- 🖥️ Desktop: 300W
- 📺 TV 4K 65": 150W
- 🧺 Máquina de lavar: 500W

### Alto consumo (500-1500W)
- ❄️ Ar-condicionado: 1000-1400W
- 🔥 Forno elétrico: 1500W
- 💨 Secador de cabelo: 1500W
- 🔥 Ferro de passar: 1200W
- 📟 Micro-ondas: 1200W

### VILÕES (> 3000W) ⚠️
- 🚿 **Chuveiro elétrico: 5500W** (o maior!)
- 👕 **Secadora de roupas: 3500W**

---

## 💡 Entendendo o cálculo

### Fórmula básica:
```
Consumo (kWh) = (Potência em Watts × Horas de uso) ÷ 1000
Custo (R$) = Consumo (kWh) × Tarifa (R$/kWh)
```

### Exemplos práticos:

**Exemplo 1: Chuveiro elétrico**
- Potência: 5500W
- Uso: 30 minutos (0,5h)
- Cálculo: (5500 × 0,5) ÷ 1000 = **2,75 kWh**
- Custo: 2,75 × R$ 0,80 = **R$ 2,20**

**Exemplo 2: TV LED 50"**
- Potência: 100W
- Uso: 8 horas
- Cálculo: (100 × 8) ÷ 1000 = **0,8 kWh**
- Custo: 0,8 × R$ 0,80 = **R$ 0,64**

**Exemplo 3: Ar-condicionado 12.000 BTUs**
- Potência: 1400W
- Uso: 6 horas
- Cálculo: (1400 × 6) ÷ 1000 = **8,4 kWh**
- Custo: 8,4 × R$ 0,80 = **R$ 6,72**

---

## 📈 Histórico e Estatísticas

Depois de salvar registros, você terá acesso a:

### Estatísticas gerais:
- 📊 Dias registrados
- ⚡ Consumo médio por dia
- 💰 Custo total acumulado
- 📈 Maior e menor consumo
- 🔝 Equipamento mais usado

### Ações disponíveis:
- ✏️ **Editar** registros anteriores
- 🗑️ **Excluir** registros
- 👁️ **Ver detalhes** de cada dia
- 📊 Dados automaticamente nos **gráficos**

---

## 🎯 Dicas para usar melhor

### ✅ Boas práticas:
1. **Registre todo dia** antes de dormir
2. **Seja honesto** nos tempos de uso
3. **Arredonde tempos curtos** (ex: 5 min para 0 ou 15 min)
4. **Equipamentos 24h** (geladeira, roteador): use horas reais
5. **Compare** dias para identificar padrões

### 💡 Insights que você pode descobrir:
- Qual equipamento consome mais na sua casa
- Quanto você gasta por dia em energia
- Se suas mudanças de hábito estão funcionando
- Quais dias você consome mais
- Impacto do chuveiro no custo total

### ⚠️ Atenção especial:
- **Chuveiro elétrico**: Responsável por até 40% do consumo residencial
- **Ar-condicionado**: Configure para 24°C e use timer
- **Stand-by**: Desligue da tomada quando não usar
- **Geladeira**: Não precisa registrar horas de uso variável

---

## 🔄 Integração com outras funcionalidades

Os dados do registro diário:
- ✅ Atualizam os gráficos automaticamente
- ✅ Ajustam sua meta de consumo
- ✅ Contribuem para o sistema de selos
- ✅ Permitem comparação com conta de energia (PDF)
- ✅ São salvos no seu dispositivo (localStorage)

---

## 📱 Exemplo de rotina diária

**Manhã (Antes de sair para trabalho):**
- ☕ Cafeteira: 10 minutos
- 🚿 Chuveiro: 10 minutos
- 📺 TV: 1 hora (durante café)
- 💻 Notebook: 1 hora

**Tarde (Após chegar):**
- ❄️ Ar-condicionado: 6 horas
- 📺 TV: 4 horas
- 💻 Computador: 3 horas
- 💡 Luzes LED (3 lâmpadas): 5 horas cada

**Noite:**
- 🍳 Forno elétrico: 30 minutos
- 🚿 Chuveiro: 10 minutos
- 📺 TV: 2 horas

**Resultado típico:** 15-25 kWh/dia | R$ 12-20 por dia

---

## 🎓 Aprenda a economizar

Após alguns dias de registro, você vai:
1. **Identificar vilões**: Equipamentos que consomem mais
2. **Encontrar padrões**: Dias/horários de maior consumo
3. **Testar mudanças**: Veja o impacto de novos hábitos
4. **Estabelecer metas**: Baseadas em dados reais
5. **Economizar dinheiro**: Reduza até 30% da conta

---

**💚 Comece hoje e tome controle do seu consumo de energia!**

