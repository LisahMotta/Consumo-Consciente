import { useState } from 'react';
import { EQUIPAMENTOS_PADRAO, calcularConsumo, calcularCusto } from '../data/equipamentos';

export default function QuickCalculator() {
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState('');
  const [horas, setHoras] = useState(1);
  const [diasPorSemana, setDiasPorSemana] = useState(7);
  const [tarifaKwh, setTarifaKwh] = useState(0.8);

  const equipamento = EQUIPAMENTOS_PADRAO.find(e => e.id === equipamentoSelecionado);

  // Cálculos
  const consumoDia = equipamento ? calcularConsumo(equipamento.potenciaMedia, horas) : 0;
  const consumoSemana = consumoDia * diasPorSemana;
  const consumoMes = consumoDia * 30;
  const consumoAno = consumoDia * 365;

  const custoDia = calcularCusto(consumoDia, tarifaKwh);
  const custoSemana = calcularCusto(consumoSemana, tarifaKwh);
  const custoMes = calcularCusto(consumoMes, tarifaKwh);
  const custoAno = calcularCusto(consumoAno, tarifaKwh);

  // Equipamentos populares primeiro
  const equipamentosOrdenados = [
    ...EQUIPAMENTOS_PADRAO.filter(e => 
      ['tv-50-led', 'chuveiro-eletrico', 'ar-condicionado-12000', 'geladeira', 'notebook'].includes(e.id)
    ),
    ...EQUIPAMENTOS_PADRAO.filter(e => 
      !['tv-50-led', 'chuveiro-eletrico', 'ar-condicionado-12000', 'geladeira', 'notebook'].includes(e.id)
    )
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-3xl">⚡</div>
        <h3 className="font-semibold text-lg text-blue-900">Calculadora Rápida de Custo</h3>
      </div>

      <p className="text-sm text-blue-800 mb-4">
        Descubra quanto custa usar um equipamento por dia, semana, mês ou ano!
      </p>

      {/* Seletor de equipamento */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Escolha o equipamento:
          </label>
          <select
            value={equipamentoSelecionado}
            onChange={(e) => setEquipamentoSelecionado(e.target.value)}
            className="input w-full"
          >
            <option value="">Selecione um equipamento...</option>
            {equipamentosOrdenados.map(eq => (
              <option key={eq.id} value={eq.id}>
                {eq.icone} {eq.nome} ({eq.potenciaMedia}W)
              </option>
            ))}
          </select>
        </div>

        {equipamento && (
          <>
            {/* Tempo de uso */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas por dia:
                </label>
                <input
                  type="number"
                  min="0.25"
                  max="24"
                  step="0.25"
                  value={horas}
                  onChange={(e) => setHoras(parseFloat(e.target.value) || 0)}
                  className="input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dias por semana:
                </label>
                <input
                  type="number"
                  min="1"
                  max="7"
                  value={diasPorSemana}
                  onChange={(e) => setDiasPorSemana(parseInt(e.target.value) || 7)}
                  className="input w-full"
                />
              </div>
            </div>

            {/* Tarifa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tarifa (R$/kWh):
              </label>
              <input
                type="number"
                step="0.01"
                value={tarifaKwh}
                onChange={(e) => setTarifaKwh(parseFloat(e.target.value) || 0.8)}
                className="input w-32"
              />
              <span className="text-xs text-gray-500 ml-2">(veja na sua conta de luz)</span>
            </div>

            {/* Resultados */}
            <div className="bg-white rounded-xl p-4 border-2 border-blue-200 mt-4">
              <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <span className="text-2xl">{equipamento.icone}</span>
                <span>Custo de usar {equipamento.nome}</span>
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 mb-1">Por dia</div>
                  <div className="font-bold text-blue-700">{consumoDia.toFixed(3)} kWh</div>
                  <div className="text-sm text-emerald-700 font-semibold">R$ {custoDia.toFixed(2)}</div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 mb-1">Por semana</div>
                  <div className="font-bold text-blue-700">{consumoSemana.toFixed(3)} kWh</div>
                  <div className="text-sm text-emerald-700 font-semibold">R$ {custoSemana.toFixed(2)}</div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 mb-1">Por mês</div>
                  <div className="font-bold text-blue-700">{consumoMes.toFixed(2)} kWh</div>
                  <div className="text-sm text-emerald-700 font-semibold">R$ {custoMes.toFixed(2)}</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 text-center border-2 border-orange-200">
                  <div className="text-xs text-gray-600 mb-1">Por ano</div>
                  <div className="font-bold text-orange-700">{consumoAno.toFixed(2)} kWh</div>
                  <div className="text-sm text-red-700 font-bold">R$ {custoAno.toFixed(2)}</div>
                </div>
              </div>

              {/* Comparação e dica */}
              {equipamento.potenciaMedia > 1000 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="text-sm text-orange-900">
                    <strong>⚠️ Alto consumo!</strong> Este equipamento consome muito.
                    {equipamento.dica && <div className="mt-1 text-xs">💡 {equipamento.dica}</div>}
                  </div>
                </div>
              )}

              {/* Exemplo de economia */}
              {horas > 2 && equipamento.potenciaMedia > 500 && (
                <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="text-sm text-emerald-900">
                    <strong>💡 Dica de economia:</strong> Reduzindo o uso para{' '}
                    <strong>{Math.max(1, horas - 1)}h/dia</strong>, você economiza{' '}
                    <strong>R$ {(calcularCusto(calcularConsumo(equipamento.potenciaMedia, 1), tarifaKwh) * 30).toFixed(2)}/mês</strong>!
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

