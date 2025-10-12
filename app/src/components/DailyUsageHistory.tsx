import React from 'react';
import type { RegistroDiario } from './DailyUsageForm';
import { EQUIPAMENTOS_PADRAO } from '../data/equipamentos';

type Props = {
  historico: RegistroDiario[];
  onDelete: (data: string) => void;
  onEdit: (registro: RegistroDiario) => void;
};

export default function DailyUsageHistory({ historico, onDelete, onEdit }: Props) {
  if (historico.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Nenhum registro ainda
        </h3>
        <p className="text-sm text-gray-600">
          Comece registrando o uso de equipamentos no formulário acima
        </p>
      </div>
    );
  }

  // Ordenar por data (mais recente primeiro)
  const historiocoOrdenado = [...historico].sort((a, b) => b.data.localeCompare(a.data));

  // Calcular estatísticas
  const consumoMedio = historico.reduce((acc, r) => acc + r.consumoTotal, 0) / historico.length;
  const consumoTotal = historico.reduce((acc, r) => acc + r.consumoTotal, 0);
  const custoTotal = historico.reduce((acc, r) => acc + r.custoTotal, 0);
  const maiorConsumo = Math.max(...historico.map(r => r.consumoTotal));
  const menorConsumo = Math.min(...historico.map(r => r.consumoTotal));

  // Equipamento mais usado
  const equipamentosContagem: Record<string, number> = {};
  historico.forEach(reg => {
    reg.registros.forEach(r => {
      equipamentosContagem[r.equipamentoId] = (equipamentosContagem[r.equipamentoId] || 0) + 1;
    });
  });
  const equipamentoMaisUsadoId = Object.keys(equipamentosContagem).reduce((a, b) => 
    equipamentosContagem[a] > equipamentosContagem[b] ? a : b, ''
  );
  const equipamentoMaisUsado = EQUIPAMENTOS_PADRAO.find(e => e.id === equipamentoMaisUsadoId);

  const formatarData = (isoDate: string) => {
    const [ano, mes, dia] = isoDate.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas gerais */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6">
        <h3 className="font-semibold text-lg mb-4 text-blue-900">📈 Estatísticas Gerais</h3>
        
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-sm text-gray-600">Dias registrados</div>
            <div className="text-2xl font-bold text-blue-700">{historico.length}</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-sm text-gray-600">Consumo médio/dia</div>
            <div className="text-2xl font-bold text-blue-700">{consumoMedio.toFixed(2)} kWh</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-sm text-gray-600">Consumo total</div>
            <div className="text-2xl font-bold text-blue-700">{consumoTotal.toFixed(2)} kWh</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="text-sm text-gray-600">Custo total</div>
            <div className="text-2xl font-bold text-blue-700">R$ {custoTotal.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="text-xs text-gray-600">Maior consumo</div>
            <div className="text-lg font-bold text-red-600">{maiorConsumo.toFixed(2)} kWh</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="text-xs text-gray-600">Menor consumo</div>
            <div className="text-lg font-bold text-green-600">{menorConsumo.toFixed(2)} kWh</div>
          </div>
          
          <div className="bg-white rounded-lg p-3 border border-blue-100">
            <div className="text-xs text-gray-600">Equipamento mais usado</div>
            <div className="text-sm font-bold text-gray-700">
              {equipamentoMaisUsado?.icone} {equipamentoMaisUsado?.nome || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Lista de registros */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b bg-gray-50">
          <h4 className="font-medium text-gray-700">📋 Histórico de Registros</h4>
        </div>
        
        <div className="divide-y max-h-96 overflow-y-auto">
          {historiocoOrdenado.map((registro) => {
            const isHoje = registro.data === new Date().toISOString().slice(0, 10);
            
            return (
              <div key={registro.data} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-semibold text-gray-800">
                        📅 {formatarData(registro.data)}
                      </div>
                      {isHoje && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full">
                          Hoje
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-gray-600">Equipamentos</div>
                        <div className="font-semibold text-gray-800">{registro.registros.length}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Consumo</div>
                        <div className="font-semibold text-blue-700">{registro.consumoTotal.toFixed(2)} kWh</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Custo</div>
                        <div className="font-semibold text-emerald-700">R$ {registro.custoTotal.toFixed(2)}</div>
                      </div>
                    </div>

                    {/* Detalhes dos equipamentos */}
                    <details className="text-sm">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                        Ver detalhes dos equipamentos
                      </summary>
                      <div className="mt-2 space-y-1 pl-4">
                        {registro.registros.map(reg => {
                          const equip = EQUIPAMENTOS_PADRAO.find(e => e.id === reg.equipamentoId);
                          if (!equip) return null;
                          const horas = Math.floor(reg.horasUso);
                          const minutos = Math.round((reg.horasUso % 1) * 60);
                          return (
                            <div key={reg.equipamentoId} className="flex justify-between text-gray-700">
                              <span>{equip.icone} {equip.nome}</span>
                              <span className="text-gray-600">
                                {horas}h{minutos > 0 ? ` ${minutos}min` : ''}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </details>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onEdit(registro)}
                      className="px-3 py-1 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir o registro de ${formatarData(registro.data)}?`)) {
                          onDelete(registro.data);
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200"
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

