/**
 * Banco de dados de equipamentos com consumo médio em Watts
 * Fonte: Procel/Inmetro e fabricantes
 */

export type Equipamento = {
  id: string;
  nome: string;
  potenciaMedia: number; // em Watts
  categoria: 'climatizacao' | 'cozinha' | 'lazer' | 'higiene' | 'iluminacao' | 'trabalho' | 'outros';
  icone: string;
  dica?: string;
};

export const EQUIPAMENTOS_PADRAO: Equipamento[] = [
  // CLIMATIZAÇÃO
  {
    id: 'ar-condicionado-7000',
    nome: 'Ar-condicionado 7.000 BTUs',
    potenciaMedia: 1000,
    categoria: 'climatizacao',
    icone: '❄️',
    dica: 'Configure para 24°C e use modo econômico'
  },
  {
    id: 'ar-condicionado-12000',
    nome: 'Ar-condicionado 12.000 BTUs',
    potenciaMedia: 1400,
    categoria: 'climatizacao',
    icone: '❄️',
    dica: 'Limpe os filtros mensalmente'
  },
  {
    id: 'ventilador-teto',
    nome: 'Ventilador de teto',
    potenciaMedia: 70,
    categoria: 'climatizacao',
    icone: '🌀',
    dica: 'Muito mais eficiente que ar-condicionado'
  },
  {
    id: 'ventilador-mesa',
    nome: 'Ventilador de mesa',
    potenciaMedia: 50,
    categoria: 'climatizacao',
    icone: '🌀'
  },

  // COZINHA
  {
    id: 'geladeira',
    nome: 'Geladeira (duplex)',
    potenciaMedia: 120,
    categoria: 'cozinha',
    icone: '🧊',
    dica: 'Funciona 24h mas em ciclos. Não precisa registrar horas.'
  },
  {
    id: 'freezer',
    nome: 'Freezer',
    potenciaMedia: 100,
    categoria: 'cozinha',
    icone: '🧊',
    dica: 'Mantenha sempre cheio para maior eficiência'
  },
  {
    id: 'micro-ondas',
    nome: 'Micro-ondas',
    potenciaMedia: 1200,
    categoria: 'cozinha',
    icone: '📟',
    dica: 'Mais eficiente que forno elétrico'
  },
  {
    id: 'forno-eletrico',
    nome: 'Forno elétrico',
    potenciaMedia: 1500,
    categoria: 'cozinha',
    icone: '🔥',
    dica: 'Alto consumo - use com moderação'
  },
  {
    id: 'fogao-eletrico',
    nome: 'Fogão elétrico (1 boca)',
    potenciaMedia: 1200,
    categoria: 'cozinha',
    icone: '🍳'
  },
  {
    id: 'liquidificador',
    nome: 'Liquidificador',
    potenciaMedia: 300,
    categoria: 'cozinha',
    icone: '🔄'
  },
  {
    id: 'cafeteira',
    nome: 'Cafeteira elétrica',
    potenciaMedia: 800,
    categoria: 'cozinha',
    icone: '☕'
  },
  {
    id: 'air-fryer',
    nome: 'Air Fryer',
    potenciaMedia: 1400,
    categoria: 'cozinha',
    icone: '🍟',
    dica: 'Mais eficiente que forno tradicional'
  },

  // LAZER
  {
    id: 'tv-32-led',
    nome: 'TV LED 32"',
    potenciaMedia: 60,
    categoria: 'lazer',
    icone: '📺'
  },
  {
    id: 'tv-50-led',
    nome: 'TV LED 50"',
    potenciaMedia: 100,
    categoria: 'lazer',
    icone: '📺'
  },
  {
    id: 'tv-65-4k',
    nome: 'TV 4K 65"',
    potenciaMedia: 150,
    categoria: 'lazer',
    icone: '📺'
  },
  {
    id: 'videogame',
    nome: 'Videogame (PS5/Xbox)',
    potenciaMedia: 180,
    categoria: 'lazer',
    icone: '🎮'
  },
  {
    id: 'som-potente',
    nome: 'Som/Aparelhagem',
    potenciaMedia: 150,
    categoria: 'lazer',
    icone: '🔊'
  },

  // HIGIENE
  {
    id: 'chuveiro-eletrico',
    nome: 'Chuveiro elétrico',
    potenciaMedia: 5500,
    categoria: 'higiene',
    icone: '🚿',
    dica: 'MAIOR VILÃO! Use no morno e reduza tempo de banho'
  },
  {
    id: 'secador-cabelo',
    nome: 'Secador de cabelo',
    potenciaMedia: 1500,
    categoria: 'higiene',
    icone: '💨',
    dica: 'Use apenas quando necessário'
  },
  {
    id: 'chapinha',
    nome: 'Chapinha/Prancha',
    potenciaMedia: 50,
    categoria: 'higiene',
    icone: '✨'
  },

  // LAVANDERIA
  {
    id: 'maquina-lavar',
    nome: 'Máquina de lavar',
    potenciaMedia: 500,
    categoria: 'outros',
    icone: '🧺',
    dica: 'Use sempre com carga completa'
  },
  {
    id: 'secadora',
    nome: 'Secadora de roupas',
    potenciaMedia: 3500,
    categoria: 'outros',
    icone: '👕',
    dica: 'Alto consumo - prefira varal quando possível'
  },
  {
    id: 'ferro-passar',
    nome: 'Ferro de passar',
    potenciaMedia: 1200,
    categoria: 'outros',
    icone: '🔥',
    dica: 'Agrupe roupas e passe tudo de uma vez'
  },
  {
    id: 'aspirador',
    nome: 'Aspirador de pó',
    potenciaMedia: 1000,
    categoria: 'outros',
    icone: '🌪️'
  },

  // TRABALHO/ESTUDO
  {
    id: 'computador-desktop',
    nome: 'Computador desktop',
    potenciaMedia: 300,
    categoria: 'trabalho',
    icone: '🖥️'
  },
  {
    id: 'notebook',
    nome: 'Notebook',
    potenciaMedia: 70,
    categoria: 'trabalho',
    icone: '💻',
    dica: 'Muito mais eficiente que desktop'
  },
  {
    id: 'monitor',
    nome: 'Monitor externo',
    potenciaMedia: 40,
    categoria: 'trabalho',
    icone: '🖥️'
  },
  {
    id: 'impressora',
    nome: 'Impressora',
    potenciaMedia: 50,
    categoria: 'trabalho',
    icone: '🖨️'
  },
  {
    id: 'roteador',
    nome: 'Roteador Wi-Fi',
    potenciaMedia: 10,
    categoria: 'trabalho',
    icone: '📡',
    dica: 'Fica ligado 24h'
  },

  // ILUMINAÇÃO
  {
    id: 'lampada-led-10w',
    nome: 'Lâmpada LED 10W',
    potenciaMedia: 10,
    categoria: 'iluminacao',
    icone: '💡',
    dica: 'A mais eficiente!'
  },
  {
    id: 'lampada-led-15w',
    nome: 'Lâmpada LED 15W',
    potenciaMedia: 15,
    categoria: 'iluminacao',
    icone: '💡'
  },
  {
    id: 'lampada-fluorescente',
    nome: 'Lâmpada fluorescente 20W',
    potenciaMedia: 20,
    categoria: 'iluminacao',
    icone: '💡',
    dica: 'Substitua por LED'
  },
  {
    id: 'lampada-incandescente',
    nome: 'Lâmpada incandescente 60W',
    potenciaMedia: 60,
    categoria: 'iluminacao',
    icone: '💡',
    dica: 'URGENTE! Substitua por LED (10W)'
  },
];

/**
 * Calcula o consumo de energia em kWh
 * @param potenciaWatts Potência do equipamento em Watts
 * @param horasUso Horas de uso
 * @returns Consumo em kWh
 */
export function calcularConsumo(potenciaWatts: number, horasUso: number): number {
  return (potenciaWatts * horasUso) / 1000;
}

/**
 * Calcula o custo em reais
 * @param kWh Consumo em kWh
 * @param tarifaPorKwh Tarifa em R$ por kWh
 * @returns Custo em R$
 */
export function calcularCusto(kWh: number, tarifaPorKwh: number = 0.8): number {
  return kWh * tarifaPorKwh;
}

