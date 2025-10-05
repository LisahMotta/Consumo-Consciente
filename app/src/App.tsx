import React, { useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, ReferenceLine } from "recharts";
import { Home, PlugZap, Leaf, AlertTriangle } from "lucide-react";

// se não estiver usando shadcn, troque por elementos HTML padrões
function Card({ children }: { children: React.ReactNode }) { return <div className="bg-white rounded-2xl shadow p-4">{children}</div>; }
function CardTitle({ children }: { children: React.ReactNode }) { return <h3 className="text-lg font-semibold mb-2">{children}</h3>; }

const dailyAvg2020_2025 = [
  { ano: 2020, kWh: 15.6 },
  { ano: 2021, kWh: 16.7 },
  { ano: 2022, kWh: 17.3 },
  { ano: 2023, kWh: 18.0 },
  { ano: 2024, kWh: 18.9 },
  { ano: 2025, kWh: 19.8 },
];

const hourlyProfile = [
  { hora: "0h", kWh: 0.52 }, { hora: "1h", kWh: 0.49 }, { hora: "2h", kWh: 0.47 }, { hora: "3h", kWh: 0.46 },
  { hora: "4h", kWh: 0.45 }, { hora: "5h", kWh: 0.48 }, { hora: "6h", kWh: 0.62 }, { hora: "7h", kWh: 0.75 },
  { hora: "8h", kWh: 0.68 }, { hora: "9h", kWh: 0.66 }, { hora: "10h", kWh: 0.70 }, { hora: "11h", kWh: 0.78 },
  { hora: "12h", kWh: 0.85 }, { hora: "13h", kWh: 0.92 }, { hora: "14h", kWh: 1.00 }, { hora: "15h", kWh: 1.05 },
  { hora: "16h", kWh: 1.12 }, { hora: "17h", kWh: 1.22 }, { hora: "18h", kWh: 1.35 }, { hora: "19h", kWh: 1.40 },
  { hora: "20h", kWh: 1.32 }, { hora: "21h", kWh: 1.06 }, { hora: "22h", kWh: 0.86 }, { hora: "23h", kWh: 0.65 },
];

export default function App() {
  const [meta, setMeta] = useState(18.0);
  const mediaAtual = dailyAvg2020_2025.at(-1)!.kWh;
  const acimaMeta = mediaAtual > meta;

  const pico = hourlyProfile.reduce((a,b)=> b.kWh>a.kWh?b:a);
  const vale = hourlyProfile.reduce((a,b)=> b.kWh<a.kWh?b:a);
  const economiaEstim = (pico.kWh*0.2 - 0.5*0.2).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex items-center gap-3">
          <Home className="w-6 h-6"/>
          <h1 className="text-2xl font-semibold">MVP – Consumo Consciente (Residência)</h1>
        </header>

        {acimaMeta && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5"/>
            <div>
              <div className="font-medium">Alerta: acima da meta diária</div>
              <div className="text-sm text-red-700">
                Consumo médio atual ≈ <b>{mediaAtual} kWh/dia</b>. Meta: <b>{meta} kWh/dia</b>. 
                Sugestão: deslocar parte do uso de climatização e lavanderia para horários de vale. Economia estimada: ~ <b>{economiaEstim} kWh/dia</b>.
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardTitle><div className="flex items-center gap-2"><PlugZap className="w-5 h-5"/>Meta diária e recomendações</div></CardTitle>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="col-span-2 space-y-3">
              <label className="text-sm text-gray-600">Meta (kWh/dia)</label>
              <input type="number" step="0.1" className="border rounded-lg p-2 w-32"
                     value={meta} onChange={e=>setMeta(parseFloat(e.target.value||"0"))}/>
              <ul className="text-sm text-gray-700 space-y-1 mt-2">
                <li>• Adie máquina de lavar/ferro/forno para 21h–6h.</li>
                <li>• AC em 23–24°C, modo sleep, vedações ok.</li>
                <li>• Banhos curtos; evite 18–20h.</li>
                <li>• Stand-by: desligue TV/PCs ociosos.</li>
                <li>• Iluminação LED e hábitos de apagar luzes.</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-600">Pico vs. Vale</div>
              <div className="text-xl font-semibold">Pico: {pico.hora} ({pico.kWh} kWh)</div>
              <div className="text-xl font-semibold">Vale: {vale.hora} ({vale.kWh} kWh)</div>
              <div className="mt-1 flex items-center gap-2 text-green-700"><Leaf className="w-4 h-4"/>Desloque ~20% do pico para o vale.</div>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Consumo médio diário – 2020 a 2025</CardTitle>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyAvg2020_2025}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="ano"/>
                <YAxis/>
                <Tooltip/>
                <Legend/>
                <ReferenceLine y={meta} stroke="#ef4444" strokeDasharray="4 4" label="Meta"/>
                <Line type="monotone" dataKey="kWh" name="Média diária" stroke="#2563eb" strokeWidth={2} dot/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardTitle>Perfil médio horário</CardTitle>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyProfile}>
                <CartesianGrid strokeDasharray="3 3"/>
                <XAxis dataKey="hora"/>
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

        <footer className="text-xs text-gray-500 text-center pt-2">
          MVP educacional – troque os dados sintéticos por leituras reais (CSV/IoT).
        </footer>
      </div>
    </div>
  );
}
