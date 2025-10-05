import React, { useMemo, useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine } from "recharts";
import { Home, PlugZap, Leaf, AlertTriangle, Lightbulb } from "lucide-react";
import BatteryGauge from './components/BatteryGauge'
import MonthCalendar from './components/MonthCalendar'

// se não estiver usando shadcn, troque por elementos HTML padrões
function Card({ children }: { children: React.ReactNode }) { return <div className="bg-white rounded-2xl shadow p-4">{children}</div>; }
function CardTitle({ children }: { children: React.ReactNode }) { return <h3 className="text-lg font-semibold mb-2">{children}</h3>; }

// (sample series removed — charts use `dailyData` and `hourlyData` now)

export default function App() {
  const [meta, setMeta] = useState(18.0);
  const [percentShift, setPercentShift] = useState<number>(20);
  const [metaHistory, setMetaHistory] = useState<Array<{date:string, meta:number}>>([]);
  const tips = [
    'Use o ferro de passar uma vez por semana.',
    'Desligue o carregador da tomada quando não estiver em uso.',
    'Agrupe roupas para lavar em uma única carga completa.',
    'Prefira banho mais curto e feche o registro durante o shampoo.',
    'Aproveite programas eco/eco wash na máquina de lavar.',
    'Use LED e apague as luzes em cômodos vazios.',
  ];
  const [tipIndex, setTipIndex] = useState<number>(()=> Math.floor(Math.random()*tips.length));

  // initial sample data (kept for demo)
  const initialDaily = [
    { label: '2020', kWh: 15.6 },
    { label: '2021', kWh: 16.7 },
    { label: '2022', kWh: 17.3 },
    { label: '2023', kWh: 18.0 },
    { label: '2024', kWh: 18.9 },
    { label: '2025', kWh: 19.8 },
  ];
  const initialHourly = [
    { hour: '0h', kWh: 0.52 }, { hour: '1h', kWh: 0.49 }, { hour: '2h', kWh: 0.47 }, { hour: '3h', kWh: 0.46 },
    { hour: '4h', kWh: 0.45 }, { hour: '5h', kWh: 0.48 }, { hour: '6h', kWh: 0.62 }, { hour: '7h', kWh: 0.75 },
    { hour: '8h', kWh: 0.68 }, { hour: '9h', kWh: 0.66 }, { hour: '10h', kWh: 0.70 }, { hour: '11h', kWh: 0.78 },
    { hour: '12h', kWh: 0.85 }, { hour: '13h', kWh: 0.92 }, { hour: '14h', kWh: 1.00 }, { hour: '15h', kWh: 1.05 },
    { hour: '16h', kWh: 1.12 }, { hour: '17h', kWh: 1.22 }, { hour: '18h', kWh: 1.35 }, { hour: '19h', kWh: 1.40 },
    { hour: '20h', kWh: 1.32 }, { hour: '21h', kWh: 1.06 }, { hour: '22h', kWh: 0.86 }, { hour: '23h', kWh: 0.65 },
  ];

  const [dailyData, setDailyData] = useState(initialDaily);
  const [hourlyData, setHourlyData] = useState(initialHourly);

  // derived metrics from hourlyData
  const mediaAtual = dailyData.at(-1) ? dailyData.at(-1)!.kWh : 0;
  const acimaMeta = mediaAtual > meta;

  const pico = hourlyData.reduce((a,b)=> b.kWh>a.kWh?b:a, hourlyData[0]);
  const vale = hourlyData.reduce((a,b)=> b.kWh<a.kWh?b:a, hourlyData[0]);

  // Simulation calculations
  const pricePerKwh = 0.8; // R$
  const dailyKwhSaved = (pico.kWh - vale.kWh) * (percentShift/100) ;
  const annualSavings = dailyKwhSaved * 365 * pricePerKwh;
  const annualSavingsBRL = annualSavings.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
  const monthlySavings = dailyKwhSaved * 30 * pricePerKwh;
  const monthlySavingsBRL = monthlySavings.toLocaleString('pt-BR',{style:'currency',currency:'BRL'});

  // CSV upload handling
  const handleFile = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      parseCsvText(text);
    };
    reader.readAsText(file);
  };

  const parseCsvText = (text: string) => {
    const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(l=>l.length>0);
    if (lines.length === 0) return;
    const header = lines[0].split(/,|;|\t/).map(h=>h.trim().toLowerCase());
    const idxDate = header.findIndex(h=>h.includes('data'));
    const idxHora = header.findIndex(h=>h.includes('hora'));
    const idxKwh = header.findIndex(h=>h.includes('kwh'));

    // accumulate
    const dailyMap: Record<string, number> = {};
    const hourlyMap: Record<number, number> = {};
    for (let i=1;i<lines.length;i++){
      const parts = lines[i].split(/,|;|\t/).map(p=>p.trim());
      if (parts.length <= Math.max(idxDate, idxHora, idxKwh)) continue;
      let rawDate = idxDate>=0 ? parts[idxDate] : '';
      const rawHour = idxHora>=0 ? parts[idxHora] : '';
      const rawKwh = idxKwh>=0 ? parts[idxKwh] : parts[parts.length-1];
      if (!rawKwh) continue;
      const kwh = parseFloat(rawKwh.replace(',', '.')) || 0;

      // normalize date to YYYY-MM-DD when possible (accept dd/mm/yyyy or yyyy-mm-dd)
      let isoDate = rawDate;
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(rawDate)){
        const [d,m,y]=rawDate.split('/'); isoDate = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)){
        isoDate = rawDate;
      } else if (/^\d{2}-\d{2}-\d{4}$/.test(rawDate)){
        const [d,m,y]=rawDate.split('-'); isoDate = `${y}-${m}-${d}`;
      } else if (!rawDate){
        // if no date column, skip
        continue;
      }

      dailyMap[isoDate] = (dailyMap[isoDate] || 0) + kwh;

      // parse hour (take first number found)
      const hourMatch = rawHour.match(/(\d{1,2})/);
      const hour = hourMatch ? Math.min(23, Math.max(0, parseInt(hourMatch[1],10))) : 0;
      hourlyMap[hour] = (hourlyMap[hour] || 0) + kwh;
    }

    const newDaily = Object.keys(dailyMap).sort().map(d=>({ label: d, kWh: Number(dailyMap[d].toFixed(3)) }));
    const newHourly = Array.from({length:24}).map((_,h)=>({ hour: `${h}h`, kWh: Number((hourlyMap[h]||0).toFixed(3)) }));
    setDailyData(newDaily.length ? newDaily : initialDaily);
    setHourlyData(newHourly.length ? newHourly : initialHourly);
  };

  // derived data for charts: combine daily data with meta history when available
  const metasVsConsumption = useMemo(()=>{
    const metaMap = Object.fromEntries(metaHistory.map(m=>[m.date,m.meta]));
    return dailyData.map(d=>({ date: String(d.label), consumo: d.kWh, meta: metaMap[String(d.label)] ?? meta }));
  },[dailyData, meta, metaHistory]);

  const saveMetaForToday = () => {
    const today = new Date().toISOString().slice(0,10);
    const next = [...metaHistory.filter(m=>m.date!==today), { date: today, meta }];
    setMetaHistory(next);
    try{ localStorage.setItem('metaHistory', JSON.stringify(next)); }catch(e){}
  };

  const [badges, setBadges] = useState({ bronze: false, silver: false, gold: false });

  // load persisted metaHistory and badges on mount
  useEffect(()=>{
    try{
      const raw = localStorage.getItem('metaHistory');
      if (raw) setMetaHistory(JSON.parse(raw));
      const braw = localStorage.getItem('badges');
      if (braw) setBadges(JSON.parse(braw));
    }catch(e){}
  },[]);

  // compute badges based on days within meta
  useEffect(()=>{
    const daysWithinMeta = dailyData.filter(d=> typeof d.kWh === 'number' && d.kWh <= meta).length;
    const newBadges = {
      bronze: daysWithinMeta >= 7,
      silver: daysWithinMeta >= 15,
      gold: daysWithinMeta >= 30,
    };
    setBadges(newBadges);
  },[dailyData, meta]);

  useEffect(()=>{
    try{ localStorage.setItem('badges', JSON.stringify(badges)); }catch(e){}
  },[badges]);

  // simple tabs state
  const tabs = [
    { id: 'meta', label: '🎯 Meta & Simulação' },
    { id: 'charts', label: '📊 Gráficos' },
    { id: 'badges', label: '🏆 Selos' },
    { id: 'calendar', label: '📅 Calendário' },
  ];
  const [activeTab, setActiveTab] = useState<string>('meta');

  return (
    <div className="min-h-screen bg-gray-50 p-6 app-bg relative">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <Home className="w-6 h-6 text-blue-600"/>
            <h1 className="text-2xl font-semibold">MVP – Consumo Consciente (Residência)</h1>
          </div>

          {/* prominent meta gauge centered */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              {(() => {
                const pct = mediaAtual && meta ? Math.round((meta / Math.max(0.0001, mediaAtual)) * 100) : 0;
                // choose color token per status
                let color = '#10B981'; // green
                if (mediaAtual > meta * 1.05) color = '#ef4444'; // red
                else if (Math.abs(mediaAtual - meta) / Math.max(meta,1) <= 0.05) color = '#3b82f6'; // blue
                return <div className="inline-block p-2 rounded-xl bg-white shadow">
                  <BatteryGauge percent={pct} color={color} label={ mediaAtual <= meta ? 'Dentro da meta' : 'Acima da meta' } />
                  <div className="mt-2 text-sm text-gray-600">Meta diária: <b className="text-gray-800">{meta} kWh</b></div>
                </div>
              })()}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Carregar CSV:</label>
              <input type="file" accept=".csv,text/csv" onChange={e=> handleFile(e.target.files?.[0])} className="text-sm"/>
            </div>
          </div>
        </header>

        {/* Tab bar */}
        <div className="bg-white rounded-lg p-2 flex gap-2">
          {tabs.map(t=> (
            <button key={t.id} onClick={()=>setActiveTab(t.id)} className={`px-3 py-2 rounded-lg text-sm ${activeTab===t.id? 'bg-teal-600 text-white' : 'bg-gray-50 text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div>
          {activeTab === 'meta' && (
            <div className="space-y-4">
              {acimaMeta && (
                <Card>
                  <CardTitle><span className="text-red-600">🔔 Alertas e Dicas rápidas</span></CardTitle>
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5"/>
                    <div>
                      <div className="font-medium text-red-700">Alerta: acima da meta diária</div>
                      <div className="text-sm text-red-700">Consumo médio atual ≈ <b>{mediaAtual} kWh/dia</b>. Meta: <b>{meta} kWh/dia</b>.</div>
                      <div className="mt-3 text-sm bg-red-50 p-2 rounded">
                        <div className="font-semibold">Dica rápida</div>
                        <div className="text-sm text-gray-700">{tips[tipIndex]}</div>
                        <div className="mt-2">
                          <button className="text-xs inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded" onClick={()=> setTipIndex((tipIndex+1)%tips.length)}>
                            <Lightbulb className="w-4 h-4 text-yellow-500"/> <span>Próxima dica</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              <Card>
                <CardTitle><div className="flex items-center gap-2 text-blue-600"><PlugZap className="w-5 h-5"/>Meta diária e recomendações</div></CardTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-1 md:col-span-2 space-y-4">
                    <label className="text-sm text-gray-600">Meta (kWh/dia)</label>
                    <input type="number" step="0.1" className="border rounded-lg p-2 w-32" value={meta} onChange={e=>setMeta(parseFloat(e.target.value||"0"))}/>
                    <div className="mt-4">
                      <label className="text-sm text-gray-600">Simulação: deslocar % do pico para o vale</label>
                      <div className="flex items-center gap-3 mt-2">
                        <input type="range" min={0} max={100} defaultValue={20} id="shift" onChange={(e)=>{ const v = parseInt((e.target as HTMLInputElement).value,10); setPercentShift(v); }} />
                        <input type="number" min={0} max={100} value={percentShift} onChange={e=> setPercentShift(Math.max(0, Math.min(100, parseInt(e.target.value||'0',10))))} className="w-20 border rounded p-1 text-sm" />
                        <div className="text-sm text-gray-700">%</div>
                      </div>
                      <div className="mt-3 text-sm text-gray-700">
                        <div>Economia estimada por dia: <b>{dailyKwhSaved.toFixed(3)} kWh</b></div>
                        <div>Economia estimada anual: <b>{annualSavingsBRL}</b></div>
                      </div>

                      {dailyKwhSaved > 0 && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800 inline-block">
                          Você economizaria <b>{monthlySavingsBRL}</b> por mês
                        </div>
                      )}
                    </div>
                    <ul className="text-sm text-gray-700 space-y-1 mt-2">
                      <li>• Adie máquina de lavar/ferro/forno para 21h–6h.</li>
                      <li>• AC em 23–24°C, modo sleep, vedações ok.</li>
                      <li>• Banhos curtos; evite 18–20h.</li>
                      <li>• Stand-by: desligue TV/PCs ociosos.</li>
                      <li>• Iluminação LED e hábitos de apagar luzes.</li>
                    </ul>
                  </div>
                  <div className={`rounded-xl p-4 ${mediaAtual <= meta ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <div className="text-sm text-gray-600">Pico vs. Vale</div>
                    <div className="text-xl font-semibold">Pico: {pico.hour} ({pico.kWh} kWh)</div>
                    <div className="text-xl font-semibold">Vale: {vale.hour} ({vale.kWh} kWh)</div>
                    <div className="mt-1 flex items-center gap-2 text-green-700"><Leaf className="w-4 h-4"/>Desloque ~20% do pico para o vale.</div>
                    <div className="mt-4"><button className="bg-teal-600 text-white px-3 py-1 rounded" onClick={saveMetaForToday}>Salvar meta para hoje</button></div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="space-y-4">
              <Card>
                <CardTitle>📊 Gráficos e Histórico de Consumo</CardTitle>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metasVsConsumption}>
                      <CartesianGrid strokeDasharray="3 3"/>
                      <XAxis dataKey="date"/>
                      <YAxis/>
                      <Tooltip/>
                      <Legend/>
                      <Line type="monotone" dataKey="consumo" name="Consumo médio diário (kWh)" stroke="#1e40af" strokeWidth={2} dot={false}/>
                      <Line type="monotone" dataKey="meta" name="Meta (kWh)" stroke="#dc2626" strokeWidth={2} dot={false}/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card>
                <CardTitle>Perfil médio horário</CardTitle>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3"/>
                      <XAxis dataKey="hour"/>
                      <YAxis/>
                      <Tooltip/>
                      <Legend/>
                      <ReferenceLine x={"19h"} stroke="#16a34a" strokeDasharray="4 4" label="Pico"/>
                      <ReferenceLine x={"4h"} stroke="#0ea5e9" strokeDasharray="4 4" label="Vale"/>
                      <Bar dataKey="kWh" name="Consumo"/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'badges' && (
            <Card>
              <CardTitle>🏆 Gamificação (Selos)</CardTitle>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg border ${badges.bronze ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                  <div className="text-xl">🥉</div>
                  <div className="text-sm">Economizador Bronze</div>
                  <div className="text-xs text-gray-500">7 dias dentro da meta</div>
                </div>
                <div className={`p-3 rounded-lg border ${badges.silver ? 'bg-slate-50' : 'bg-gray-50'}`}>
                  <div className="text-xl">🥈</div>
                  <div className="text-sm">Economizador Prata</div>
                  <div className="text-xs text-gray-500">15 dias dentro da meta</div>
                </div>
                <div className={`p-3 rounded-lg border ${badges.gold ? 'bg-amber-50' : 'bg-gray-50'}`}>
                  <div className="text-xl">🥇</div>
                  <div className="text-sm">Economizador Ouro</div>
                  <div className="text-xs text-gray-500">30 dias dentro da meta</div>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'calendar' && (
            <Card>
              <CardTitle>📅 Calendário do Mês</CardTitle>
              <MonthCalendar days={dailyData.filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(String(d.label))).map(d=>({date:String(d.label), consumo:d.kWh}))} meta={meta} />
            </Card>
          )}
        </div>

        {/* Removed duplicated sections (charts, selos, calendar, series, hourly profile) — they live inside tabs now */}

        <footer className="text-xs text-gray-500 text-center pt-2">
          MVP educacional – troque os dados sintéticos por leituras reais (CSV/IoT).
        </footer>
      </div>
    </div>
  );
}
