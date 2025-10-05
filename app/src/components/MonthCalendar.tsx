import { useState, useRef } from 'react'

type Day = { date: string; consumo: number }

export default function MonthCalendar({ days, meta }: { days: Day[]; meta: number }) {
  // days: array with date (ISO yyyy-mm-dd) and consumo
  // build month from latest day
  if (!days || days.length === 0) return <div className="text-sm text-gray-500">Sem dados para o calendário</div>;
  const parseDate = (s:string) => new Date(s + 'T00:00:00');
  const sorted = [...days].sort((a,b)=> a.date.localeCompare(b.date));
  const last = parseDate(sorted[sorted.length-1].date);
  const year = last.getFullYear();
  const month = last.getMonth();
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month+1, 0).getDate();
  const startWeekday = first.getDay(); // 0=Sun

  const dayMap = new Map(sorted.map(d=>[d.date,d.consumo]));

  const cells: Array<{d:number|null, date?:string, consumo?:number}> = [];
  for (let i=0;i<startWeekday;i++) cells.push({d:null});
  for (let d=1; d<=lastDay; d++) {
    const iso = new Date(year, month, d).toISOString().slice(0,10);
    cells.push({ d, date: iso, consumo: dayMap.get(iso) });
  }

  const getColor = (c?:number) => {
    if (c === undefined || c === null) return 'bg-gray-100';
    if (c <= meta) return 'bg-green-200';
    if (c <= meta * 1.15) return 'bg-orange-200';
    return 'bg-red-200';
  }

  const [hover, setHover] = useState<{date:string, consumo?:number, x:number, y:number} | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  return (
    <div className="relative" ref={rootRef}>
      {/* legend */}
      <div className="flex items-center gap-3 text-sm mb-2 text-blue-600">
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-200 border"/> <div className="text-black">Dentro da meta</div></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-200 border"/> <div className="text-black">Até 15% acima</div></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-200 border"/> <div className="text-black">Mais de 15% acima</div></div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs text-center">
        <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
      </div>
      <div className="grid grid-cols-7 gap-1 mt-2">
        {cells.map((c,idx)=> (
          <div key={idx}
            onMouseEnter={(e) => { if (c.d) setHover({ date: String(c.date), consumo: c.consumo, x: e.clientX, y: e.clientY }); }}
            onMouseMove={(e) => { if (c.d) setHover(h => h ? { ...h, x: e.clientX, y: e.clientY } : { date: String(c.date), consumo: c.consumo, x: e.clientX, y: e.clientY }); }}
            onMouseLeave={() => setHover(null)}
            className={`h-12 border rounded p-1 flex flex-col justify-between ${c.d? getColor(c.consumo) : 'bg-transparent'}`}>
            {c.d ? <><div className="text-xs font-semibold">{c.d}</div><div className="text-xs text-gray-700">{c.consumo ?? '-'} kWh</div></> : null}
          </div>
        ))}
      </div>

      {hover && (
        <div style={{ position: 'fixed', left: hover.x + 10, top: hover.y - 40, zIndex: 40 }} className="bg-white border rounded shadow p-2 text-sm max-w-xs">
          <div className="font-semibold">{hover.date}</div>
          <div className="text-xs text-gray-700">{(hover.consumo !== undefined && hover.consumo !== null) ? `${hover.consumo} kWh` : 'Sem dados'}</div>
          <div className="text-xs text-gray-500">Meta: {meta} kWh</div>
        </div>
      )}
    </div>
  )
}
