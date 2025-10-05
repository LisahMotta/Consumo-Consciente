import React, { useMemo, useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine
} from "recharts";
import BatteryGauge from "./components/BatteryGauge";
import MonthCalendar from "./components/MonthCalendar";
import OnboardingForm from "./components/OnboardingForm";
import type { HabitosConsumo } from "./components/OnboardingForm";

/* ===== Helpers de UI (sem shadcn) ===== */
function Container({ children }: { children: React.ReactNode }) {
  return <div className="max-w-6xl mx-auto px-4 md:px-6">{children}</div>;
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800">{title}</h2>
      {children}
    </section>
  );
}
function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-2xl shadow-sm border border-gray-100">{children}</div>;
}
function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-4 md:p-6">{children}</div>;
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300 " +
        (props.className || "")
      }
    />
  );
}
function Badge({ children, color = "emerald" }:
  { children: React.ReactNode; color?: "emerald" | "red" | "gray" }) {
  const map: any = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${map[color]}`}>
      {children}
    </span>
  );
}
/* ===================================== */

export default function App() {
  /* ===== Estado principal ===== */
  const [meta, setMeta] = useState(18.0);
  const [percentShift, setPercentShift] = useState<number>(20);
  const [metaHistory, setMetaHistory] = useState<Array<{ date: string; meta: number }>>([]);
  const [badges, setBadges] = useState({ bronze: false, silver: false, gold: false });
  const [activeTab, setActiveTab] = useState<"meta" | "charts" | "badges" | "calendar">("meta");
  const [showOnboarding, setShowOnboarding] = useState(false);

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

  const pico = hourlyData.reduce((a, b) => (b.kWh > a.kWh ? b : a), hourlyData[0]);
  const vale = hourlyData.reduce((a, b) => (b.kWh < a.kWh ? b : a), hourlyData[0]);

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
      }

      if (!isoDate) continue;

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

  /* ===== Carregar/salvar badges ===== */
  useEffect(() => {
    const raw = localStorage.getItem("metaHistory");
    if (raw) setMetaHistory(JSON.parse(raw));
    const braw = localStorage.getItem("badges");
    if (braw) setBadges(JSON.parse(braw));
    // if no metaHistory found, show onboarding once
    if (!raw) setShowOnboarding(true);
  }, []);

  useEffect(() => {
    const daysWithinMeta = dailyData.filter((d) => d.kWh <= meta).length;
    const newBadges = {
      bronze: daysWithinMeta >= 7,
      silver: daysWithinMeta >= 15,
      gold: daysWithinMeta >= 30,
    };
    setBadges(newBadges);
    localStorage.setItem("badges", JSON.stringify(newBadges));
  }, [dailyData, meta]);

  /* ===== Render ===== */
  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(to bottom right,#f0fdfa,#ffffff)" }}>
      {/* HEADER */}
      <div className="border-b border-emerald-100/60 bg-white/70 backdrop-blur">
        <Container>
          <div className="py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white grid place-items-center text-lg">💡</div>
            <h1 className="text-2xl md:text-3xl font-semibold text-emerald-900">
              MVP – Consumo Consciente <span className="text-gray-500 text-xl">(Residência)</span>
            </h1>
            <div className="ml-auto">
              <Badge color="gray">Protótipo</Badge>
            </div>
          </div>
        </Container>
      </div>

      {/* BARRA DE ALERTA */}
      {acimaMeta && (
        <div className="bg-red-50/80 border-y border-red-100">
          <Container>
            <div className="py-2 text-sm text-red-700 flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500" />
              <b>Acima da meta</b>
              <span className="opacity-80">• Consumo atual: {mediaAtual} kWh/dia • Meta: {meta} kWh/dia</span>
              <div className="ml-auto w-64 h-2 rounded-full bg-red-100 overflow-hidden">
                <div
                  className="h-full bg-red-400"
                  style={{ width: Math.min(100, (mediaAtual / meta) * 100) + "%" }}
                />
              </div>
            </div>
          </Container>
        </div>
      )}

      {/* CONTEÚDO */}
      <Container>
        <div className="py-6 space-y-8">
          {/* topo com gauge e upload */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="text-center">
              {(() => {
                const pct = mediaAtual && meta ? Math.round((meta / Math.max(0.0001, mediaAtual)) * 100) : 0;
                let color = "#10B981"; // dentro da meta
                if (mediaAtual > meta * 1.05) color = "#ef4444"; // acima
                else if (Math.abs(mediaAtual - meta) / Math.max(meta, 1) <= 0.05) color = "#3b82f6"; // próximo
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
          <div className="bg-white rounded-lg p-2 flex gap-2">
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
                            onChange={(e) => setPercentShift(Math.max(0, Math.min(100, Number(e.target.value || 0))))}
                            className="w-24"
                          />
                          <Badge>Economia/dia ≈ {( (pico.kWh - vale.kWh) * (percentShift / 100) ).toFixed(2)} kWh</Badge>
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
                      <div className="text-lg font-semibold">Pico: {pico.hour} ({pico.kWh} kWh)</div>
                      <div className="text-lg font-semibold">Vale: {vale.hour} ({vale.kWh} kWh)</div>
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
                        <Line type="monotone" dataKey="consumo" name="Consumo médio diário (kWh)" stroke="#14532d" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="meta" name="Meta (kWh)" stroke="#16a34a" strokeWidth={2} dot={false} />
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
                // apply a simple heuristic: lower the meta slightly if suggested
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
