import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RegistroDiario } from './DailyUsageForm';
import { EQUIPAMENTOS_PADRAO } from '../data/equipamentos';

type Props = {
  registrosDiarios: RegistroDiario[];
  meta: number;
  badges: { bronze: boolean; silver: boolean; gold: boolean };
};

export default function ExportReport({ registrosDiarios, meta, badges }: Props) {
  const [exporting, setExporting] = useState(false);

  const exportToPDF = () => {
    setExporting(true);
    
    try {
      const doc = new jsPDF();
      const hoje = new Date().toLocaleDateString('pt-BR');

      // Cabeçalho
      doc.setFillColor(20, 83, 45); // Verde escuro
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text('Consumo Consciente', 105, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text('Relatório Mensal de Consumo de Energia', 105, 30, { align: 'center' });

      // Resetar cor do texto
      doc.setTextColor(0, 0, 0);

      // Data do relatório
      doc.setFontSize(10);
      doc.text(`Gerado em: ${hoje}`, 20, 50);

      // Estatísticas gerais
      const consumoTotal = registrosDiarios.reduce((acc, r) => acc + r.consumoTotal, 0);
      const custoTotal = registrosDiarios.reduce((acc, r) => acc + r.custoTotal, 0);
      const consumoMedio = registrosDiarios.length > 0 ? consumoTotal / registrosDiarios.length : 0;
      const diasRegistrados = registrosDiarios.length;

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo Geral', 20, 60);
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Dias registrados: ${diasRegistrados}`, 20, 70);
      doc.text(`Consumo médio/dia: ${consumoMedio.toFixed(2)} kWh`, 20, 77);
      doc.text(`Consumo total: ${consumoTotal.toFixed(2)} kWh`, 20, 84);
      doc.text(`Custo total: R$ ${custoTotal.toFixed(2)}`, 20, 91);
      doc.text(`Meta diária: ${meta.toFixed(1)} kWh`, 20, 98);

      // Badges conquistados
      const badgesConquistados = Object.entries(badges).filter(([_, v]) => v).length;
      doc.text(`Selos conquistados: ${badgesConquistados}/3`, 20, 105);

      // Tabela de registros diários
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Histórico Diário', 20, 120);

      const dadosTabela = registrosDiarios
        .sort((a, b) => b.data.localeCompare(a.data))
        .slice(0, 15) // Últimos 15 dias
        .map(r => {
          const [ano, mes, dia] = r.data.split('-');
          return [
            `${dia}/${mes}/${ano}`,
            r.registros.length,
            `${r.consumoTotal.toFixed(2)} kWh`,
            `R$ ${r.custoTotal.toFixed(2)}`,
            r.consumoTotal <= meta ? 'L' : ''
          ];
        });

      autoTable(doc, {
        startY: 125,
        head: [['Data', 'Equipamentos', 'Consumo', 'Custo', 'Meta']],
        body: dadosTabela,
        theme: 'grid',
        headStyles: { fillColor: [20, 83, 45] },
        styles: { fontSize: 9 },
        columnStyles: {
          4: { halign: 'center' }
        }
      });

      // Equipamentos mais usados
      const equipamentosContagem: Record<string, number> = {};
      const equipamentosConsumo: Record<string, number> = {};

      registrosDiarios.forEach(reg => {
        reg.registros.forEach(r => {
          equipamentosContagem[r.equipamentoId] = (equipamentosContagem[r.equipamentoId] || 0) + 1;
          const equip = EQUIPAMENTOS_PADRAO.find(e => e.id === r.equipamentoId);
          if (equip) {
            const consumo = (equip.potenciaMedia * r.horasUso) / 1000;
            equipamentosConsumo[r.equipamentoId] = (equipamentosConsumo[r.equipamentoId] || 0) + consumo;
          }
        });
      });

      const top5 = Object.keys(equipamentosConsumo)
        .sort((a, b) => equipamentosConsumo[b] - equipamentosConsumo[a])
        .slice(0, 5);

      const finalY = (doc as any).lastAutoTable.finalY || 125;
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Top 5 Equipamentos que mais consomem', 20, finalY + 15);

      const dadosTop5 = top5.map(id => {
        const equip = EQUIPAMENTOS_PADRAO.find(e => e.id === id);
        return [
          equip?.nome || id,
          `${equipamentosConsumo[id].toFixed(2)} kWh`,
          `${equipamentosContagem[id]} dias`
        ];
      });

      autoTable(doc, {
        startY: finalY + 20,
        head: [['Equipamento', 'Consumo Total', 'Dias Usados']],
        body: dadosTop5,
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74] }
      });

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Consumo Consciente - Página ${i} de ${pageCount}`,
          105,
          290,
          { align: 'center' }
        );
      }

      // Salvar PDF
      doc.save(`relatorio-consumo-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('❌ Erro ao gerar relatório. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const exportToCSV = () => {
    try {
      // Cabeçalho CSV
      let csv = 'Data,Equipamentos,Consumo (kWh),Custo (R$),Dentro da Meta\n';

      // Dados
      registrosDiarios
        .sort((a, b) => a.data.localeCompare(b.data))
        .forEach(r => {
          const [ano, mes, dia] = r.data.split('-');
          const dentroMeta = r.consumoTotal <= meta ? 'Sim' : 'Não';
          csv += `${dia}/${mes}/${ano},${r.registros.length},${r.consumoTotal.toFixed(2)},${r.custoTotal.toFixed(2)},${dentroMeta}\n`;
        });

      // Criar blob e download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `consumo-diario-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
    } catch (error) {
      console.error('Erro ao gerar CSV:', error);
      alert('❌ Erro ao gerar CSV. Tente novamente.');
    }
  };

  if (registrosDiarios.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl border p-6 text-center">
        <div className="text-4xl mb-2">📄</div>
        <p className="text-sm text-gray-600">
          Registre alguns dias primeiro para exportar relatórios
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="text-3xl">📊</div>
        <h3 className="font-semibold text-lg">Exportar Relatório</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Baixe seus dados de consumo em PDF ou CSV para compartilhar, imprimir ou analisar.
      </p>

      {/* Resumo rápido */}
      <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
        <div className="text-sm text-blue-900 space-y-1">
          <div className="flex justify-between">
            <span>Dias registrados:</span>
            <strong>{registrosDiarios.length}</strong>
          </div>
          <div className="flex justify-between">
            <span>Período:</span>
            <strong>
              {registrosDiarios[0]?.data.split('-').reverse().join('/')} até{' '}
              {registrosDiarios[registrosDiarios.length - 1]?.data.split('-').reverse().join('/')}
            </strong>
          </div>
        </div>
      </div>

      {/* Botões de export */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={exportToPDF}
          disabled={exporting}
          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
            exporting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          <span className="text-xl">📄</span>
          <span>{exporting ? 'Gerando...' : 'Baixar PDF'}</span>
        </button>

        <button
          onClick={exportToCSV}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          <span className="text-xl">📊</span>
          <span>Baixar CSV</span>
        </button>
      </div>

      <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
        <p className="text-xs text-emerald-900">
          <strong>💡 Dica:</strong> O PDF contém gráficos e análises detalhadas. 
          O CSV é melhor para abrir no Excel ou Google Sheets.
        </p>
      </div>
    </div>
  );
}

