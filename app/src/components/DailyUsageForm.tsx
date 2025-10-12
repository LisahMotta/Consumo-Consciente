import React, { useState, useEffect } from 'react';
import { EQUIPAMENTOS_PADRAO, calcularConsumo, calcularCusto, type Equipamento } from '../data/equipamentos';

export type RegistroUso = {
  equipamentoId: string;
  horasUso: number;
  minutos?: number;
};

export type RegistroDiario = {
  data: string; // ISO date yyyy-mm-dd
  registros: RegistroUso[];
  consumoTotal: number; // kWh
  custoTotal: number; // R$
};

type Props = {
  onSave: (registro: RegistroDiario) => void;
  registroExistente?: RegistroDiario;
};

export default function DailyUsageForm({ onSave, registroExistente }: Props) {
  const [dataSelecionada, setDataSelecionada] = useState<string>(
    registroExistente?.data || new Date().toISOString().slice(0, 10)
  );
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('todos');
  const [registros, setRegistros] = useState<RegistroUso[]>(registroExistente?.registros || []);
  const [equipamentoCustom, setEquipamentoCustom] = useState({ nome: '', potencia: 0 });
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [tarifaKwh, setTarifaKwh] = useState(0.8);

  const categorias = [
    { id: 'todos', nome: 'Todos', icone: '📋' },
    { id: 'climatizacao', nome: 'Climatização', icone: '❄️' },
    { id: 'cozinha', nome: 'Cozinha', icone: '🍳' },
    { id: 'lazer', nome: 'Lazer', icone: '📺' },
    { id: 'higiene', nome: 'Higiene', icone: '🚿' },
    { id: 'trabalho', nome: 'Trabalho', icone: '💻' },
    { id: 'iluminacao', nome: 'Iluminação', icone: '💡' },
    { id: 'outros', nome: 'Outros', icone: '🔌' },
  ];

  // Carregar tarifa do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tarifaKwh');
    if (saved) setTarifaKwh(parseFloat(saved));
  }, []);

  const equipamentosFiltrados = categoriaFiltro === 'todos'
    ? EQUIPAMENTOS_PADRAO
    : EQUIPAMENTOS_PADRAO.filter(e => e.categoria === categoriaFiltro);

  const getRegistro = (equipamentoId: string): RegistroUso | undefined => {
    return registros.find(r => r.equipamentoId === equipamentoId);
  };

  const updateRegistro = (equipamentoId: string, horasUso: number, minutos: number = 0) => {
    const horasTotal = horasUso + (minutos / 60);
    
    if (horasTotal === 0) {
      // Remove o registro se horas = 0
      setRegistros(prev => prev.filter(r => r.equipamentoId !== equipamentoId));
    } else {
      const existe = registros.find(r => r.equipamentoId === equipamentoId);
      if (existe) {
        setRegistros(prev => prev.map(r =>
          r.equipamentoId === equipamentoId
            ? { ...r, horasUso: horasTotal, minutos }
            : r
        ));
      } else {
        setRegistros(prev => [...prev, { equipamentoId, horasUso: horasTotal, minutos }]);
      }
    }
  };

  const calcularTotais = () => {
    let consumoTotal = 0;
    
    registros.forEach(reg => {
      const equip = EQUIPAMENTOS_PADRAO.find(e => e.id === reg.equipamentoId);
      if (equip) {
        consumoTotal += calcularConsumo(equip.potenciaMedia, reg.horasUso);
      }
    });

    const custoTotal = calcularCusto(consumoTotal, tarifaKwh);
    
    return { consumoTotal, custoTotal };
  };

  const handleSave = () => {
    const { consumoTotal, custoTotal } = calcularTotais();
    
    const registroDiario: RegistroDiario = {
      data: dataSelecionada,
      registros,
      consumoTotal,
      custoTotal,
    };

    onSave(registroDiario);

    // Limpar formulário
    setRegistros([]);
    setDataSelecionada(new Date().toISOString().slice(0, 10));
  };

  const { consumoTotal, custoTotal } = calcularTotais();

  return (
    <div className="space-y-6">
      {/* Cabeçalho com data e tarifa */}
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h3 className="font-semibold text-lg mb-4">📝 Registro Diário de Consumo</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Data do registro</label>
            <input
              type="date"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className="input w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-2">Tarifa (R$/kWh)</label>
            <input
              type="number"
              step="0.01"
              value={tarifaKwh}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setTarifaKwh(val);
                localStorage.setItem('tarifaKwh', val.toString());
              }}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Filtro de categorias */}
      <div className="bg-white rounded-xl border p-4 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoriaFiltro(cat.id)}
              className={`px-4 py-2 rounded-lg border whitespace-nowrap transition-colors ${
                categoriaFiltro === cat.id
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-gray-50 border-gray-200'
              }`}
            >
              {cat.icone} {cat.nome}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de equipamentos */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="p-4 border-b bg-gray-50">
          <h4 className="font-medium text-gray-700">
            Selecione os equipamentos usados hoje
          </h4>
        </div>
        
        <div className="divide-y max-h-96 overflow-y-auto">
          {equipamentosFiltrados.map(equip => {
            const registro = getRegistro(equip.id);
            const horas = Math.floor(registro?.horasUso || 0);
            const minutos = Math.round(((registro?.horasUso || 0) % 1) * 60);
            const consumo = registro ? calcularConsumo(equip.potenciaMedia, registro.horasUso) : 0;
            const custo = calcularCusto(consumo, tarifaKwh);

            return (
              <div key={equip.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{equip.icone}</div>
                  
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{equip.nome}</div>
                    <div className="text-sm text-gray-600">
                      {equip.potenciaMedia}W
                      {equip.dica && (
                        <span className="ml-2 text-emerald-600">💡 {equip.dica}</span>
                      )}
                    </div>
                    
                    <div className="flex gap-3 mt-2 items-center">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Horas:</label>
                        <input
                          type="number"
                          min="0"
                          max="24"
                          value={horas}
                          onChange={(e) => updateRegistro(equip.id, parseInt(e.target.value) || 0, minutos)}
                          className="w-20 px-2 py-1 border rounded text-center"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Minutos:</label>
                        <input
                          type="number"
                          min="0"
                          max="59"
                          step="15"
                          value={minutos}
                          onChange={(e) => updateRegistro(equip.id, horas, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border rounded text-center"
                        />
                      </div>
                      
                      {registro && (
                        <div className="ml-auto text-right">
                          <div className="text-sm font-semibold text-emerald-700">
                            {consumo.toFixed(3)} kWh
                          </div>
                          <div className="text-xs text-gray-600">
                            R$ {custo.toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumo e salvar */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 p-6 shadow-lg">
        <h4 className="font-semibold text-lg mb-4 text-emerald-900">📊 Resumo do Dia</h4>
        
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 border border-emerald-100">
            <div className="text-sm text-gray-600">Equipamentos registrados</div>
            <div className="text-2xl font-bold text-emerald-700">{registros.length}</div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-emerald-100">
            <div className="text-sm text-gray-600">Consumo total</div>
            <div className="text-2xl font-bold text-emerald-700">
              {consumoTotal.toFixed(2)} kWh
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-emerald-100">
            <div className="text-sm text-gray-600">Custo estimado</div>
            <div className="text-2xl font-bold text-emerald-700">
              R$ {custoTotal.toFixed(2)}
            </div>
          </div>
        </div>

        {registros.length > 0 && (
          <div className="space-y-2">
            <h5 className="font-medium text-sm text-emerald-900">Detalhamento:</h5>
            <div className="bg-white rounded-lg p-3 max-h-40 overflow-y-auto">
              {registros.map(reg => {
                const equip = EQUIPAMENTOS_PADRAO.find(e => e.id === reg.equipamentoId);
                if (!equip) return null;
                const consumo = calcularConsumo(equip.potenciaMedia, reg.horasUso);
                return (
                  <div key={reg.equipamentoId} className="flex justify-between text-sm py-1">
                    <span>{equip.icone} {equip.nome}</span>
                    <span className="font-medium">{consumo.toFixed(2)} kWh</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={registros.length === 0}
          className={`w-full mt-4 py-3 rounded-xl font-semibold transition-colors ${
            registros.length > 0
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          💾 Salvar Registro do Dia
        </button>
      </div>
    </div>
  );
}

