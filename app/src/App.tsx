// src/App.tsx
import { useMemo, useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine
} from "recharts";
import BatteryGauge from "./components/BatteryGauge";
import MonthCalendar from "./components/MonthCalendar";
import OnboardingForm from "./components/OnboardingForm";
import PdfUploader from "./components/PdfUploader";
import DailyUsageForm from "./components/DailyUsageForm";
import DailyUsageHistory from "./components/DailyUsageHistory";
import type { HabitosConsumo } from "./components/OnboardingForm";
import type { DadosContaEnergia } from "./components/PdfUploader";
import type { RegistroDiario } from "./components/DailyUsageForm";
import { Container, Section, Card, CardBody, Input, Badge } from "./ui";

export default function App() {
  /* ===== Estado principal ===== */
  const [meta, setMeta] = useState<number>(18.0);
  const [percentShift, setPercentShift] = useState<number>(20);
  const [metaHistory, setMetaHistory] = useState<Array<{ date: string; meta: number }>>([]);
  const [badges, setBadges] = useState({ bronze: false, silver: false, gold: false });
  const [activeTab, setActiveTab] = useState<"meta" | "charts" | "badges" | "calendar" | "pdf" | "daily">("meta");
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [dicasPdf, setDicasPdf] = useState<string[]>([]);
  const [registrosDiarios, setRegistrosDiarios] = useState<RegistroDiario[]>([]);
  const [registroEditando, setRegistroEditando] = useState<RegistroDiario | undefined>(undefined);

  // dicas rápidas
  const dicas = [
    "Use o ferro de passar uma vez por semana.",
    "Desligue o carregador da tomada quando não estiver em uso.",
    "Agrupe roupas para lavar em uma única carga completa.",
  ];

  /* ===== Dados de exemplo (até conectar CSV/IoT) ===== */
  const initialDaily = [
    { label: "2020", kWh: 15.6 },
    { label: "2021", kWh: 16.7 },
    { label: "2022", kWh: 17.3 },
    { label: "2023", kWh: 18.0 },
    { label: "2024", kWh: 18.9 },
    { label: "2025", kWh: 19.8 },
  ];
  const initialHourly = [
    { hour: "0h", kWh: 0.52 }, { hour: "1h", kWh: 0.49 }, { hour: "2h", kWh: 0.47 }, { hour: "3h", kWh: 0.46 },
    { hour: "4h", kWh: 0.45 }, { hour: "5h", kWh: 0.48 }, { hour: "6h", kWh: 0.62 }, { hour: "7h", kWh: 0.75 },
    { hour: "8h", kWh: 0.68 }, { hour: "9h", kWh: 0.66 }, { hour: "10h", kWh: 0.70 }, { hour: "11h", kWh: 0.78 },
    { hour: "12h", kWh: 0.85 }, { hour: "13h", kWh: 0.92 }, { hour: "14h", kWh: 1.00 }, { hour: "15h", kWh: 1.05 },
    { hour: "16h", kWh: 1.12 }, { hour: "17h", kWh: 1.22 }, { hour: "18h", kWh: 1.35 }, { hour: "19h", kWh: 1.40 },
    { hour: "20h", kWh: 1.32 }, { hour: "21h", kWh: 1.06 }, { hour: "22h", kWh: 0.86 }, { hour: "23h", kWh: 0.65 },
  ];
  const [dailyData, setDailyData] = useState(initialDaily);
  const [hourlyData, setHourlyData] = useState(initialHourly);

  /* ===== Métricas derivadas ===== */
  const mediaAtual = dailyData.at(-1)?.kWh ?? 0;
  const acimaMeta = mediaAtual > meta;

  const pico = useMemo(
    () => hourlyData.reduce((a, b) => (b.kWh > a.kWh ? b : a), hourlyData[0]),
    [hourlyData]
  );
  const vale = useMemo(
    () => hourlyData.reduce((a, b) => (b.kWh < a.kWh ? b : a), hourlyData[0]),
    [hourlyData]
  );

  const pricePerKwh = 0.8; // R$
  const dailyKwhSaved = (pico.kWh - vale.kWh) * (percentShift / 100);
  const monthlySavingsBRL = (dailyKwhSaved * 30 * pricePerKwh).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
  const annualSavingsBRL = (dailyKwhSaved * 365 * pricePerKwh).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  /* ===== Processar dados do PDF ===== */
  const handlePdfData = (dados: DadosContaEnergia) => {
    // Atualizar dados do app com informações da conta
    setMeta(Math.max(dados.consumoDiarioMedio * 0.9, dados.consumoDiarioMedio - 2));
    
    // Criar dados diários baseados no histórico ou consumo mensal
    if (dados.historicoConsumo && dados.historicoConsumo.length > 0) {
      const newDaily = dados.historicoConsumo.map(h => ({
        label: h.mes,
        kWh: h.kwh / 30 // Converter para média diária
      }));
      setDailyData(newDaily);
    } else {
      // Se não tiver histórico, criar dados simulados baseados no consumo
      const consumoDiario = dados.consumoDiarioMedio;
      const newDaily = Array.from({ length: 12 }, (_, i) => {
        const variacao = (Math.random() - 0.5) * 2; // Variação de ±2 kWh
        return {
          label: `Mês ${i + 1}`,
          kWh: Math.max(0, consumoDiario + variacao)
        };
      });
      newDaily[newDaily.length - 1].kWh = consumoDiario; // Último valor = atual
      setDailyData(newDaily);
    }

    // Salvar dicas do PDF
    setDicasPdf(dados.dicas);

    // Ir para a aba de PDF para mostrar os resultados
    setActiveTab("pdf");

    // Salvar no localStorage
    try {
      localStorage.setItem('dadosContaPdf', JSON.stringify(dados));
    } catch {}
  };

  /* ===== Upload de CSV ===== */
  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => parseCsvText(String(reader.result || ""));
    reader.readAsText(file);
  };

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (!lines.length) return;

    const header = lines[0].split(/,|;|\t/).map((h) => h.trim().toLowerCase());
    const idxDate = header.findIndex((h) => h.includes("data"));
    const idxHora = header.findIndex((h) => h.includes("hora"));
    const idxKwh = header.findIndex((h) => h.includes("kwh"));

    const dailyMap: Record<string, number> = {};
    const hourlyMap: Record<number, number> = {};

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(/,|;|\t/).map((p) => p.trim());
      if (parts.length <= Math.max(idxDate, idxHora, idxKwh)) continue;

      const rawDate = idxDate >= 0 ? parts[idxDate] : "";
      const rawHour = idxHora >= 0 ? parts[idxHora] : "";
      const rawKwh = idxKwh >= 0 ? parts[idxKwh] : parts[parts.length - 1];
      if (!rawKwh) continue;
      const kwh = parseFloat(rawKwh.replace(",", ".")) || 0;

      // normaliza data
      let isoDate = rawDate;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)) {
        const [d, m, y] = rawDate.split("/");
        isoDate = `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
      } else if (/^\d{2}-\d{2}-\d{4}$/.test(rawDate)) {
        const [d, m, y] = rawDate.split("-");
        isoDate = `${y}-${m}-${d}`;
      } else if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        // se não reconheceu a data, pula
        continue;
      }

      dailyMap[isoDate] = (dailyMap[isoDate] || 0) + kwh;

      const hourMatch = rawHour.match(/(\d{1,2})/);
      const hour = hourMatch ? Math.min(23, Math.max(0, parseInt(hourMatch[1], 10))) : 0;
      hourlyMap[hour] = (hourlyMap[hour] || 0) + kwh;
    }

    const newDaily = Object.keys(dailyMap)
      .sort()
      .map((d) => ({ label: d, kWh: Number(dailyMap[d].toFixed(3)) }));
    const newHourly = Array.from({ length: 24 }).map((_, h) => ({
      hour: `${h}h`,
      kWh: Number((hourlyMap[h] || 0).toFixed(3)),
    }));

    setDailyData(newDaily.length ? newDaily : initialDaily);
    setHourlyData(newHourly.length ? newHourly : initialHourly);
  };

  /* ===== Consumo x Meta (para o gráfico) ===== */
  const metasVsConsumption = useMemo(() => {
    const metaMap = Object.fromEntries(metaHistory.map((m) => [m.date, m.meta]));
    return dailyData.map((d) => ({
      date: String(d.label),
      consumo: d.kWh,
      meta: metaMap[String(d.label)] ?? meta,
    }));
  }, [dailyData, meta, metaHistory]);

  const saveMetaForToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    const next = [...metaHistory.filter((m) => m.date !== today), { date: today, meta }];
    setMetaHistory(next);
    localStorage.setItem("metaHistory", JSON.stringify(next));
  };

  /* ===== Handlers para registros diários ===== */
  const handleSaveRegistroDiario = (registro: RegistroDiario) => {
    try {
      // Remove registro existente para a mesma data e adiciona o novo
      const novosRegistros = [
        ...registrosDiarios.filter(r => r.data !== registro.data),
        registro
      ].sort((a, b) => a.data.localeCompare(b.data));

      setRegistrosDiarios(novosRegistros);
      localStorage.setItem('registrosDiarios', JSON.stringify(novosRegistros));

      // Atualizar gráfico com dados dos registros
      atualizarGraficosComRegistros(novosRegistros);

      // Limpar registro em edição
      setRegistroEditando(undefined);

      // Mostrar mensagem de sucesso (opcional)
      alert('✅ Registro salvo com sucesso!');
    } catch (err) {
      console.error('Erro ao salvar registro:', err);
      alert('❌ Erro ao salvar registro. Tente novamente.');
    }
  };

  const handleDeleteRegistro = (data: string) => {
    try {
      const novosRegistros = registrosDiarios.filter(r => r.data !== data);
      setRegistrosDiarios(novosRegistros);
      localStorage.setItem('registrosDiarios', JSON.stringify(novosRegistros));
      atualizarGraficosComRegistros(novosRegistros);
    } catch (err) {
      console.error('Erro ao excluir registro:', err);
    }
  };

  const handleEditRegistro = (registro: RegistroDiario) => {
    setRegistroEditando(registro);
    setActiveTab('daily');
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const atualizarGraficosComRegistros = (registros: RegistroDiario[]) => {
    if (registros.length === 0) return;

    // Criar dados diários a partir dos registros
    const dadosDiarios = registros.map(r => ({
      label: r.data,
      kWh: r.consumoTotal
    }));

    setDailyData(dadosDiarios);

    // Atualizar meta baseada na média
    const mediaConsumo = registros.reduce((acc, r) => acc + r.consumoTotal, 0) / registros.length;
    setMeta(Math.max(mediaConsumo * 0.9, mediaConsumo - 2));
  };

  /* ===== Carregar/salvar badges e onboarding ===== */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("metaHistory");
      if (raw) setMetaHistory(JSON.parse(raw));
      const braw = localStorage.getItem("badges");
      if (braw) setBadges(JSON.parse(braw));
      const pdfRaw = localStorage.getItem("dadosContaPdf");
      if (pdfRaw) {
        const dados: DadosContaEnergia = JSON.parse(pdfRaw);
        setDicasPdf(dados.dicas || []);
      }
      const registrosRaw = localStorage.getItem("registrosDiarios");
      if (registrosRaw) {
        const registros: RegistroDiario[] = JSON.parse(registrosRaw);
        setRegistrosDiarios(registros);
        atualizarGraficosComRegistros(registros);
      }
      if (!raw) setShowOnboarding(true);
    } catch {}
  }, []);

  useEffect(() => {
    const daysWithinMeta = dailyData.filter((d) => d.kWh <= meta).length;
    const newBadges = {
      bronze: daysWithinMeta >= 7,
      silver: daysWithinMeta >= 15,
      gold: daysWithinMeta >= 30,
    };
    setBadges(newBadges);
    try { localStorage.setItem("badges", JSON.stringify(newBadges)); } catch {}
  }, [dailyData, meta]);

  /* ===== Render ===== */
  return (
    <div className="min-h-screen app-bg">
      {/* HEADER */}
      <div className="pt-6 pb-4">
        <Container>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <h1 className="serif-heading">MVP – Consumo Consciente</h1>
              <div className="text-gray-600 mt-1">(Residência)</div>
            </div>
            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 grid place-items-center">
              <div className="text-3xl text-emerald-800">💡</div>
            </div>
          </div>
        </Container>
      </div>

      {/* BANNER DE ALERTA */}
      {acimaMeta && (
        <Container>
          <div className="alert-banner rounded-xl border p-4 mt-2 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="text-red-700 font-semibold">⚠️ Consumo atual: {mediaAtual} kWh/dia</div>
              <div className="text-sm text-red-700 opacity-90">Meta: {meta} kWh/dia</div>
              <div className="ml-auto w-2/5">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: Math.min(100, (mediaAtual / meta) * 100) + "%" }} />
                </div>
              </div>
            </div>
          </div>
        </Container>
      )}

      {/* CONTEÚDO */}
      <Container>
        <div className="py-6">
          {/* Upload de PDF */}
          <div className="mb-6">
            <PdfUploader onDataExtracted={handlePdfData} />
          </div>

          {/* topo com gauge e upload */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="text-center">
              {(() => {
                const pct = mediaAtual && meta ? Math.round((meta / Math.max(0.0001, mediaAtual)) * 100) : 0;
                let color = "#10B981";
                if (mediaAtual > meta * 1.05) color = "#ef4444";
                else if (Math.abs(mediaAtual - meta) / Math.max(meta, 1) <= 0.05) color = "#3b82f6";
                return (
                  <div className="inline-block p-2 rounded-xl bg-white shadow">
                    <BatteryGauge
                      percent={pct}
                      color={color}
                      label={mediaAtual <= meta ? "Dentro da meta" : "Acima da meta"}
                    />
                    <div className="mt-2 text-sm text-gray-600">
                      Meta diária: <b className="text-gray-800">{meta} kWh</b>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Carregar CSV:</label>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => handleFile(e.target.files?.[0])}
                className="text-sm"
              />
            </div>
          </div>

          {/* Abas simples */}
          <div className="bg-white rounded-lg p-2 flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab("meta")}
              className={`px-3 py-1.5 rounded-full border ${activeTab === "meta"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white hover:bg-gray-50"}`}
            >
              🎯 Meta & Simulação
            </button>
            <button
              onClick={() => setActiveTab("charts")}
              className={`px-3 py-1.5 rounded-full border ${activeTab === "charts"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white hover:bg-gray-50"}`}
            >
              📊 Gráficos
            </button>
            <button
              onClick={() => setActiveTab("badges")}
              className={`px-3 py-1.5 rounded-full border ${activeTab === "badges"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white hover:bg-gray-50"}`}
            >
              🏆 Selos
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-3 py-1.5 rounded-full border ${activeTab === "calendar"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white hover:bg-gray-50"}`}
            >
              📅 Calendário
            </button>
            <button
              onClick={() => setActiveTab("pdf")}
              className={`px-3 py-1.5 rounded-full border ${activeTab === "pdf"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white hover:bg-gray-50"}`}
            >
              📄 Análise da Conta
            </button>
            <button
              onClick={() => setActiveTab("daily")}
              className={`px-3 py-1.5 rounded-full border ${activeTab === "daily"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white hover:bg-gray-50"}`}
            >
              📝 Registro Diário
            </button>
          </div>

          {/* PAINÉIS */}
          {activeTab === "meta" && (
            <Section title="Meta diária e recomendações">
              <Card>
                <CardBody>
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Coluna 1: meta & simulação */}
                    <div className="space-y-3">
                      <div className="text-sm text-gray-600">Meta (kWh/dia)</div>
                      <Input
                        type="number"
                        step="0.1"
                        value={meta}
                        onChange={(e) => setMeta(parseFloat(e.target.value || "0"))}
                        className="w-40"
                      />

                      <div className="text-sm text-gray-700">
                        <div className="font-medium">Simulação: deslocar % do pico para o vale</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={5}
                            value={percentShift}
                            onChange={(e) =>
                              setPercentShift(Math.max(0, Math.min(100, Number(e.target.value || 0))))
                            }
                            className="w-24"
                          />
                          <Badge>
                            Economia/dia ≈ {((pico.kWh - vale.kWh) * (percentShift / 100)).toFixed(2)} kWh
                          </Badge>
                        </div>
                        <div className="text-emerald-700 mt-1">
                          Economia mensal estimada: <b>{monthlySavingsBRL}</b>
                        </div>
                        <div className="text-emerald-700">
                          Economia anual estimada: <b>{annualSavingsBRL}</b>
                        </div>
                      </div>

                      <button
                        onClick={saveMetaForToday}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-sm"
                      >
                        Salvar meta para hoje
                      </button>
                    </div>

                    {/* Coluna 2: dicas */}
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Dicas rápidas</div>
                      <ul className="text-sm text-gray-800 list-disc pl-5 space-y-1">
                        {dicas.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Coluna 3: pico x vale */}
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <div className="text-sm text-emerald-900">Pico vs. Vale</div>
                      <div className="text-lg font-semibold">
                        Pico: {pico.hour} ({pico.kWh} kWh)
                      </div>
                      <div className="text-lg font-semibold">
                        Vale: {vale.hour} ({vale.kWh} kWh)
                      </div>
                      <div className="mt-2 text-emerald-800 text-sm">
                        Desloque ~{percentShift}% do uso do pico para o vale.
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Section>
          )}

          {activeTab === "charts" && (
            <Section title="Gráficos">
              <Card>
                <CardBody>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={metasVsConsumption}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="consumo"
                          name="Consumo médio diário (kWh)"
                          stroke="#14532d"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="meta"
                          name="Meta (kWh)"
                          stroke="#16a34a"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardBody>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <ReferenceLine x={"19h"} stroke="#16a34a" strokeDasharray="4 4" label="Pico" />
                        <ReferenceLine x={"4h"} stroke="#0ea5e9" strokeDasharray="4 4" label="Vale" />
                        <Bar dataKey="kWh" name="Consumo" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardBody>
              </Card>
            </Section>
          )}

          {activeTab === "badges" && (
            <Section title="Selos">
              <Card>
                <CardBody>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className={`rounded-xl border p-4 ${badges.bronze ? "bg-yellow-50" : "bg-gray-50"}`}>
                      🥉 Economizador Bronze
                      <div className="text-sm text-gray-600">7 dias dentro da meta</div>
                    </div>
                    <div className={`rounded-xl border p-4 ${badges.silver ? "bg-slate-50" : "bg-gray-50"}`}>
                      🥈 Economizador Prata
                      <div className="text-sm text-gray-600">15 dias dentro da meta</div>
                    </div>
                    <div className={`rounded-xl border p-4 ${badges.gold ? "bg-amber-50" : "bg-gray-50"}`}>
                      🥇 Economizador Ouro
                      <div className="text-sm text-gray-600">30 dias dentro da meta</div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Section>
          )}

          {activeTab === "calendar" && (
            <Section title="Calendário do mês">
              <Card>
                <CardBody>
                  <div className="flex items-center gap-3 text-sm mb-3">
                    <span className="w-3 h-3 bg-emerald-400 rounded-sm" /> Dentro da meta
                    <span className="w-3 h-3 bg-amber-400 rounded-sm" /> Próximo
                    <span className="w-3 h-3 bg-rose-400 rounded-sm" /> Acima
                  </div>
                  <MonthCalendar
                    days={dailyData
                      .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(String(d.label)))
                      .map((d) => ({ date: String(d.label), consumo: d.kWh }))}
                    meta={meta}
                  />
                </CardBody>
              </Card>
            </Section>
          )}

          {activeTab === "pdf" && (
            <Section title="Análise da sua Conta de Energia">
              {dicasPdf.length > 0 ? (
                <Card>
                  <CardBody>
                    <div className="space-y-4">
                      <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                        <h3 className="font-semibold text-emerald-900 mb-2">
                          ✅ PDF processado com sucesso!
                        </h3>
                        <p className="text-sm text-emerald-800">
                          Os dados da sua conta foram extraídos e analisados. Veja suas dicas personalizadas abaixo.
                        </p>
                      </div>

                      <div className="bg-white rounded-xl border p-6">
                        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                          💡 Dicas Personalizadas de Economia
                        </h3>
                        <div className="space-y-3">
                          {dicasPdf.map((dica, idx) => (
                            <div 
                              key={idx}
                              className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors"
                            >
                              <div className="text-2xl">{idx === 0 ? '🎯' : idx === 1 ? '💰' : idx === 2 ? '📊' : '✨'}</div>
                              <div className="flex-1">
                                <p className="text-gray-800">{dica}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">📈 Próximos passos</h4>
                        <ul className="text-sm text-blue-800 space-y-1 list-disc pl-5">
                          <li>Ajuste sua meta diária na aba "Meta & Simulação"</li>
                          <li>Monitore seu progresso na aba "Gráficos"</li>
                          <li>Conquiste selos economizando energia na aba "Selos"</li>
                          <li>Faça upload de contas mensais para acompanhar a evolução</li>
                        </ul>
                      </div>

                      <div className="text-center">
                        <button
                          onClick={() => setActiveTab("meta")}
                          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
                        >
                          Ir para Meta & Simulação
                        </button>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <Card>
                  <CardBody>
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📄</div>
                      <h3 className="text-lg font-medium text-gray-700 mb-2">
                        Nenhum PDF analisado ainda
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Faça upload da sua conta de energia no campo acima para receber dicas personalizadas
                      </p>
                    </div>
                  </CardBody>
                </Card>
              )}
            </Section>
          )}

          {activeTab === "daily" && (
            <Section title="Registro Diário de Consumo">
              <DailyUsageForm 
                onSave={handleSaveRegistroDiario}
                registroExistente={registroEditando}
              />
              
              {registroEditando && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                  <div className="text-sm text-blue-800">
                    ✏️ Editando registro de {registroEditando.data.split('-').reverse().join('/')}
                  </div>
                  <button
                    onClick={() => setRegistroEditando(undefined)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Cancelar edição
                  </button>
                </div>
              )}

              <div className="mt-6">
                <DailyUsageHistory
                  historico={registrosDiarios}
                  onDelete={handleDeleteRegistro}
                  onEdit={handleEditRegistro}
                />
              </div>
            </Section>
          )}

          <footer className="text-xs text-gray-500 text-center pt-4">
            MVP educacional – troque os dados sintéticos por leituras reais (CSV/IoT).
          </footer>
        </div>
      </Container>

      {/* Onboarding modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center z-50">
          <div className="w-full max-w-3xl">
            <OnboardingForm
              onFinish={(habitos: HabitosConsumo) => {
                // Exemplo simples: ajusta ligeiramente a meta com base em hábitos
                if (habitos && habitos.banhoMin) {
                  const suggested = Math.max(12, Math.round(mediaAtual - 1));
                  setMeta(suggested);
                }
                setShowOnboarding(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
