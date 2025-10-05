import React, { useMemo, useState } from "react";

export type HabitosConsumo = {
  moradores: number;
  banhoMin: number;                 // duração média (min)
  banhosDia: number;                // banhos por pessoa/dia
  usaAC: "nunca" | "eventual" | "diario";
  tempAC: number;                   // temperatura média do AC
  usaFerro: "semanal" | "quinzenal" | "mensal" | "raro";
  maquinaLavarSemana: number;       // ciclos/semana
  secadoraSemana: number;           // ciclos/semana
  standby: "desliga" | "mantem";
  iluminação: "led" | "mista" | "fluor_incand";
  pico: "18-20" | "19-21" | "20-22" | "variavel";
  ventilador: "nao" | "sim";
  chuveiroEletrico: "sim" | "nao";
  microondas: "sim" | "nao";
  lavaLoucas: "sim" | "nao";
  geladeiras: number;
};

type Props = {
  onFinish: (habitos: HabitosConsumo, sugestoes: string[]) => void;
};

export default function OnboardingForm({ onFinish }: Props) {
  const [h, setH] = useState<HabitosConsumo>({
    moradores: 3,
    banhoMin: 9,
    banhosDia: 2,
    usaAC: "eventual",
    tempAC: 23,
    usaFerro: "semanal",
    maquinaLavarSemana: 3,
    secadoraSemana: 1,
    standby: "mantem",
    iluminação: "mista",
    pico: "19-21",
    ventilador: "sim",
    chuveiroEletrico: "sim",
    microondas: "sim",
    lavaLoucas: "nao",
    geladeiras: 1,
  });

  const sugestoes: string[] = useMemo(() => gerarSugestoes(h), [h]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onFinish(h, sugestoes);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 space-y-6"
      >
        <h1 className="text-2xl font-semibold">Bem-vinda! Vamos entender seus hábitos 👋</h1>
        <p className="text-sm text-gray-600">
          Leva 1 minuto. Suas respostas geram recomendações personalizadas de economia e
          configuram o app para você.
        </p>

        {/* Linha 1 */}
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Quantos moradores?">
            <input type="number" min={1} className="input" value={h.moradores}
              onChange={e => setH({ ...h, moradores: Number(e.target.value || 1) })}/>
          </Field>

          <Field label="Banho (min) por pessoa">
            <input type="number" min={1} className="input" value={h.banhoMin}
              onChange={e => setH({ ...h, banhoMin: Number(e.target.value || 0) })}/>
          </Field>

          <Field label="Banhos por pessoa/dia">
            <input type="number" min={0} step={0.5} className="input" value={h.banhosDia}
              onChange={e => setH({ ...h, banhosDia: Number(e.target.value || 0) })}/>
          </Field>
        </div>

        {/* Linha 2 */}
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Ar-condicionado">
            <select className="input" value={h.usaAC}
              onChange={e => setH({ ...h, usaAC: e.target.value as HabitosConsumo["usaAC"] })}>
              <option value="nunca">Não uso</option>
              <option value="eventual">Eventual</option>
              <option value="diario">Diário</option>
            </select>
          </Field>

          <Field label="Temperatura do AC (°C)">
            <input type="number" min={16} max={30} className="input" value={h.tempAC}
              onChange={e => setH({ ...h, tempAC: Number(e.target.value || 23) })}/>
          </Field>

          <Field label="Ferro de passar">
            <select className="input" value={h.usaFerro}
              onChange={e => setH({ ...h, usaFerro: e.target.value as HabitosConsumo["usaFerro"] })}>
              <option value="semanal">Semanal</option>
              <option value="quinzenal">Quinzenal</option>
              <option value="mensal">Mensal</option>
              <option value="raro">Raro</option>
            </select>
          </Field>
        </div>

        {/* Linha 3 */}
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Máquina de lavar (ciclos/semana)">
            <input type="number" min={0} className="input" value={h.maquinaLavarSemana}
              onChange={e => setH({ ...h, maquinaLavarSemana: Number(e.target.value || 0) })}/>
          </Field>

          <Field label="Secadora (ciclos/semana)">
            <input type="number" min={0} className="input" value={h.secadoraSemana}
              onChange={e => setH({ ...h, secadoraSemana: Number(e.target.value || 0) })}/>
          </Field>

          <Field label="Aparelhos em stand-by?">
            <select className="input" value={h.standby}
              onChange={e => setH({ ...h, standby: e.target.value as HabitosConsumo["standby"] })}>
              <option value="desliga">Costumo desligar da tomada</option>
              <option value="mantem">Normalmente ficam ligados</option>
            </select>
          </Field>
        </div>

        {/* Linha 3.5: novos eletrodomésticos */}
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Ventilador">
            <select className="input" value={h.ventilador}
              onChange={e => setH({ ...h, ventilador: e.target.value as HabitosConsumo["ventilador"] })}>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </Field>

          <Field label="Chuveiro elétrico (resistência)">
            <select className="input" value={h.chuveiroEletrico}
              onChange={e => setH({ ...h, chuveiroEletrico: e.target.value as HabitosConsumo["chuveiroEletrico"] })}>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </Field>

          <Field label="Micro-ondas">
            <select className="input" value={h.microondas}
              onChange={e => setH({ ...h, microondas: e.target.value as HabitosConsumo["microondas"] })}>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </Field>
        </div>

        {/* Linha 4.5: mais eletros */}
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Lava-louças">
            <select className="input" value={h.lavaLoucas}
              onChange={e => setH({ ...h, lavaLoucas: e.target.value as HabitosConsumo["lavaLoucas"] })}>
              <option value="sim">Sim</option>
              <option value="nao">Não</option>
            </select>
          </Field>

          <Field label="Quantidade de geladeiras">
            <input type="number" min={0} className="input" value={h.geladeiras}
              onChange={e => setH({ ...h, geladeiras: Number(e.target.value || 1) })}/>
          </Field>

          <div />
        </div>

        {/* Linha 4 */}
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Iluminação predominante">
            <select className="input" value={h.iluminação}
              onChange={e => setH({ ...h, iluminação: e.target.value as HabitosConsumo["iluminação"] })}>
              <option value="led">LED</option>
              <option value="mista">Mista (LED + outras)</option>
              <option value="fluor_incand">Fluorescente/Incandescente</option>
            </select>
          </Field>

          <Field label="Seu horário mais ativo (pico)">
            <select className="input" value={h.pico}
              onChange={e => setH({ ...h, pico: e.target.value as HabitosConsumo["pico"] })}>
              <option value="18-20">18–20h</option>
              <option value="19-21">19–21h</option>
              <option value="20-22">20–22h</option>
              <option value="variavel">Variável</option>
            </select>
          </Field>

          <div className="flex items-end">
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-3">
              Continuar e ver recomendações
            </button>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-xl p-4">
          <div className="font-medium mb-2">Sugestões preliminares</div>
          <ul className="text-sm text-emerald-900 list-disc pl-5 space-y-1">
            {sugestoes.map((s: string, i: number) => (<li key={i}>{s}</li>))}
          </ul>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      {children}
    </label>
  );
}

// utilitário: classe comum dos inputs
declare global {
  interface HTMLElementTagNameMap { }
}

// Simple suggestions generator based on habits — kept small and deterministic
function gerarSugestoes(h: HabitosConsumo): string[] {
  const out: string[] = [];
  if (h.banhoMin > 10) out.push('Reduza o tempo do banho para 8–10 minutos para economizar energia e água.');
  if (h.usaAC === 'diario' && h.tempAC < 24) out.push('Defina o AC para 23–24°C e use modo econômico.');
  if (h.usaFerro === 'semanal') out.push('Agrupe roupas para passar de uma só vez e evite passar peças pouco usadas.');
  if (h.maquinaLavarSemana >= 3) out.push('Use programas econômicos e lave com carga completa.');
  if (h.standby === 'mantem') out.push('Desconecte aparelhos em stand-by quando possível ou use régua com interruptor.');
  if (h.ventilador === 'sim') out.push('Use ventiladores no lugar do AC quando possível — muito mais eficiente.');
  if (h.chuveiroEletrico === 'sim') out.push('Chuveiros elétricos consomem muito — reduza duração e prefira temperaturas mais baixas.');
  if (h.microondas === 'sim') out.push('Micro-ondas é eficiente para aquecer; prefira-o a forno elétrico quando possível.');
  if (h.lavaLoucas === 'sim') out.push('Use o ciclo econômico da lava-louças e só rode com carga completa.');
  if (h.geladeiras > 1) out.push('Avalie a necessidade de múltiplas geladeiras e mantenha as borrachas vedadas.');
  if (out.length === 0) out.push('Ótimo! Seus hábitos parecem razoáveis — verifique recomendações detalhadas no painel.');
  return out;
}
