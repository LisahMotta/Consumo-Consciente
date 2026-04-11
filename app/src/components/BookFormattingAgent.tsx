import { useState, useRef, useCallback, useMemo } from 'react';
import { formatBook, type FormattingMode } from '../services/bookFormattingAgent';

const LOADING_MESSAGES = [
  'Analisando estrutura do texto…',
  'Identificando temas principais…',
  'Criando divisão de capítulos…',
  'Desenvolvendo títulos envolventes…',
  'Refinando a fluidez narrativa…',
  'Aplicando formatação editorial…',
  'Construindo sumário…',
  'Finalizando documento…',
];

function useLoadingMessage(isLoading: boolean) {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  if (isLoading && !intervalRef.current) {
    intervalRef.current = setInterval(() => setIndex(i => (i + 1) % LOADING_MESSAGES.length), 2800);
  }
  if (!isLoading && intervalRef.current) {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIndex(0);
  }
  return LOADING_MESSAGES[index];
}

function OutputStats({ html }: { html: string }) {
  const stats = useMemo(() => {
    const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const words = plain ? plain.split(' ').filter(Boolean).length : 0;
    const chapters = (html.match(/<h1/gi) || []).length;
    const sections = (html.match(/<h2/gi) || []).length;
    const pages = Math.max(1, Math.ceil(words / 300));
    const readMin = Math.max(1, Math.ceil(words / 200));
    return { words, chapters, sections, pages, readMin };
  }, [html]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      {[
        { label: 'Capítulos', value: stats.chapters, color: '#a78bfa' },
        { label: 'Seções', value: stats.sections, color: '#60a5fa' },
        { label: 'Palavras', value: stats.words.toLocaleString('pt-BR'), color: '#34d399' },
        { label: 'Páginas', value: `~${stats.pages}`, color: '#fbbf24' },
        { label: 'Leitura', value: `~${stats.readMin} min`, color: '#f472b6' },
      ].map(({ label, value, color }) => (
        <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 8px', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ color, fontWeight: 600, fontSize: '13px' }}>{value}</span>
          <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: '11px', marginTop: '2px' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function BookFormattingAgent() {
  const [apiKey, setApiKey] = useState((import.meta as any).env?.VITE_GEMINI_API_KEY || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [text, setText] = useState('');
  const [mode, setMode] = useState<FormattingMode>('KDP');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'preview' | 'source'>('preview');
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const loadingMessage = useLoadingMessage(isLoading);

  const handleFormat = useCallback(async () => {
    if (!text.trim()) { setError('Insira o texto a ser formatado.'); return; }
    if (!apiKey.trim()) { setError('Insira sua chave de API Gemini.'); return; }
    setIsLoading(true); setError(null); setHtmlOutput('');
    abortRef.current = new AbortController();
    try {
      await formatBook(text, mode, apiKey, chunk => setHtmlOutput(p => p + chunk), abortRef.current.signal);
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string; status?: number };
      if (e.name !== 'AbortError') {
        setError(e.status === 400 || e.message?.includes('API_KEY')
          ? 'Chave de API inválida. Obtenha em aistudio.google.com'
          : e.message || 'Erro ao formatar. Tente novamente.');
      }
    } finally { setIsLoading(false); }
  }, [text, mode, apiKey]);

  const handleStop = () => { abortRef.current?.abort(); setIsLoading(false); };
  const handleNew = () => { setHtmlOutput(''); setError(null); };

  const handlePrint = () => {
    const w = window.open('', '_blank');
    if (w) { w.document.write(htmlOutput); w.document.close(); w.print(); }
  };

  const handleDownload = () => {
    const content = htmlOutput.trim().startsWith('<!') ? htmlOutput
      : `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Livro ${mode}</title></head><body>${htmlOutput}</body></html>`;
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([content], { type: 'text/html;charset=utf-8' })),
      download: `livro-${mode.toLowerCase()}-${Date.now()}.html`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(htmlOutput);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const canGenerate = text.trim() && apiKey.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#07070e', color: '#ede9fe', fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif", overflow: 'hidden', position: 'relative' }}>

      {/* Keyframes injected inline */}
      <style>{`
        @keyframes bdot { 0%,80%,100%{transform:translateY(0);opacity:.25} 40%{transform:translateY(-7px);opacity:1} }
        @keyframes gpulse { 0%,100%{opacity:.7} 50%{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .bk-btn-gen:hover:not(:disabled) { box-shadow: 0 0 35px rgba(139,92,246,.55), 0 4px 20px rgba(0,0,0,.5) !important; transform: translateY(-1px); }
        .bk-btn-gen:active:not(:disabled) { transform: translateY(0); }
        .bk-card:hover { border-color: rgba(255,255,255,0.11) !important; }
        .bk-mode-btn:hover { border-color: rgba(255,255,255,0.15) !important; }
        .bk-tbtn:hover { background: rgba(255,255,255,0.06) !important; color: rgba(255,255,255,.75) !important; }
        .bk-input:focus { border-color: rgba(139,92,246,.5) !important; box-shadow: 0 0 0 3px rgba(139,92,246,.12) !important; outline: none; }
        .bk-textarea:focus { border-color: rgba(139,92,246,.4) !important; outline: none; }
      `}</style>

      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: -300, left: -200, width: 700, height: 700, background: 'radial-gradient(circle,rgba(109,40,217,.14) 0%,transparent 68%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: -200, right: -100, width: 500, height: 500, background: 'radial-gradient(circle,rgba(59,130,246,.07) 0%,transparent 68%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── HEADER ── */}
      <header style={{ height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(7,7,14,0.85)', backdropFilter: 'blur(24px)', flexShrink: 0, position: 'relative', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg,#6d28d9,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, boxShadow: '0 0 22px rgba(124,58,237,.45)', flexShrink: 0 }}>
            📚
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', color: '#ede9fe' }}>Agente de Diagramação</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', marginTop: 1 }}>Powered by Gemini 2.0 Flash</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {[
            { text: '● API gratuita', c: '#34d399', b: 'rgba(52,211,153,.1)', brd: 'rgba(52,211,153,.22)' },
            { text: 'KDP & ABNT', c: '#a78bfa', b: 'rgba(167,139,250,.1)', brd: 'rgba(167,139,250,.22)' },
          ].map(({ text, c, b, brd }) => (
            <span key={text} style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100, border: `1px solid ${brd}`, background: b, color: c }}>{text}</span>
          ))}
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: 336, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10, padding: 14, overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.07)' }}>

          {/* API Key */}
          <div className="bk-card" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 16, transition: 'border-color .2s' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', marginBottom: 10, margin: '0 0 10px' }}>Autenticação</p>
            <div style={{ position: 'relative' }}>
              <input
                className="bk-input"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="AIzaSy… (gratuita no Google AI Studio)"
                style={{ width: '100%', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.09)', borderRadius: 8, padding: '9px 36px 9px 12px', fontSize: 13, color: '#ede9fe', fontFamily: 'monospace', boxSizing: 'border-box', transition: 'border-color .2s, box-shadow .2s' }}
              />
              <button type="button" onClick={() => setShowApiKey(v => !v)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,.3)', fontSize: 14 }}>
                {showApiKey ? '🙈' : '👁️'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.22)', margin: '8px 0 0' }}>
              Gratuita em <span style={{ color: '#a78bfa' }}>aistudio.google.com/apikey</span>
            </p>
          </div>

          {/* Mode */}
          <div className="bk-card" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 16, transition: 'border-color .2s' }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', margin: '0 0 12px' }}>Formato de Saída</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {([
                { key: 'KDP' as FormattingMode, icon: '📱', title: 'Amazon KDP', desc: 'Ebook Kindle', color: '#7c3aed', glow: 'rgba(124,58,237,.18)' },
                { key: 'ABNT' as FormattingMode, icon: '📖', title: 'Livro Físico', desc: 'Normas ABNT', color: '#d97706', glow: 'rgba(217,119,6,.18)' },
              ]).map(({ key, icon, title, desc, color, glow }) => {
                const active = mode === key;
                return (
                  <button key={key} type="button" onClick={() => setMode(key)} className="bk-mode-btn"
                    style={{ flex: 1, padding: '14px 12px', borderRadius: 10, border: active ? `1.5px solid ${color}50` : '1.5px solid rgba(255,255,255,.07)', background: active ? glow : 'rgba(255,255,255,.02)', cursor: 'pointer', textAlign: 'left', transition: 'all .15s', boxShadow: active ? `0 0 20px ${glow}` : 'none' }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: active ? color : 'rgba(255,255,255,.65)' }}>{title}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', marginTop: 2 }}>{desc}</div>
                    {active && <div style={{ marginTop: 8, fontSize: 10, fontWeight: 600, color, letterSpacing: '.04em' }}>✓ Selecionado</div>}
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: 10, padding: '9px 11px', background: 'rgba(255,255,255,.03)', borderRadius: 8, fontSize: 11, color: 'rgba(255,255,255,.32)', lineHeight: 1.65 }}>
              {mode === 'KDP'
                ? '📱 HTML editorial — capa, sumário, capítulos com quebra de página, otimizado para Kindle'
                : '📖 ABNT NBR 14724 — capa, folha de rosto, resumo, sumário numerado e referências'}
            </div>
          </div>

          {/* Textarea */}
          <div className="bk-card" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 16, flex: 1, display: 'flex', flexDirection: 'column', transition: 'border-color .2s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.28)', margin: 0 }}>Texto de Entrada</p>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.22)', display: 'flex', gap: 8 }}>
                <span>{wordCount.toLocaleString('pt-BR')} palavras</span>
                <span style={{ color: charCount > 20000 ? '#fbbf24' : charCount > 5000 ? '#34d399' : 'rgba(255,255,255,.2)', fontWeight: 500 }}>{charCount.toLocaleString('pt-BR')} chars</span>
              </div>
            </div>
            <textarea
              className="bk-textarea"
              value={text}
              onChange={e => setText(e.target.value)}
              rows={12}
              placeholder={"Cole aqui o texto bruto:\n\n• Rascunhos e anotações\n• Artigos e posts\n• Transcrições de áudio\n• Qualquer conteúdo textual\n\nO agente irá estruturar, dividir em\ncapítulos e formatar profissionalmente."}
              style={{ flex: 1, width: '100%', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 8, padding: '11px 12px', fontSize: 13, color: '#ede9fe', resize: 'none', fontFamily: 'inherit', lineHeight: 1.65, boxSizing: 'border-box', transition: 'border-color .2s' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {!isLoading ? (
              <button type="button" onClick={handleFormat} disabled={!canGenerate} className="bk-btn-gen"
                style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#6d28d9,#9333ea)', border: 'none', borderRadius: 10, color: 'white', fontSize: 14, fontWeight: 700, cursor: canGenerate ? 'pointer' : 'not-allowed', opacity: canGenerate ? 1 : 0.35, boxShadow: '0 0 24px rgba(109,40,217,.38),0 4px 16px rgba(0,0,0,.45)', transition: 'all .2s', letterSpacing: '-.01em' }}>
                ✨ Gerar Livro Formatado
              </button>
            ) : (
              <button type="button" onClick={handleStop}
                style={{ width: '100%', padding: '13px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, color: '#fca5a5', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, background: '#f87171', borderRadius: '50%', display: 'inline-block', animation: 'gpulse 1s infinite' }} />
                Parar Geração
              </button>
            )}
            {htmlOutput && !isLoading && (
              <button type="button" onClick={handleNew}
                style={{ width: '100%', padding: '11px', background: 'transparent', border: '1px solid rgba(255,255,255,.09)', borderRadius: 10, color: 'rgba(255,255,255,.38)', fontSize: 13, cursor: 'pointer', transition: 'all .2s' }}>
                + Novo Documento
              </button>
            )}
          </div>

          {error && (
            <div style={{ padding: '12px 14px', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.22)', borderRadius: 10, fontSize: 13, color: '#fca5a5', lineHeight: 1.55 }}>
              ⚠️ {error}
            </div>
          )}
        </aside>

        {/* ── MAIN PANEL ── */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Toolbar */}
          <div style={{ height: 48, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, background: 'rgba(7,7,14,.6)', backdropFilter: 'blur(12px)' }}>
            <div style={{ display: 'flex', background: 'rgba(255,255,255,.05)', borderRadius: 8, padding: 3, gap: 2 }}>
              {(['preview', 'source'] as const).map(v => (
                <button key={v} type="button" onClick={() => setActiveView(v)}
                  style={{ padding: '5px 13px', borderRadius: 6, border: 'none', background: activeView === v ? 'rgba(255,255,255,.1)' : 'transparent', color: activeView === v ? '#ede9fe' : 'rgba(255,255,255,.32)', fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all .15s' }}>
                  {v === 'preview' ? '👁 Preview' : '{ } Fonte'}
                </button>
              ))}
            </div>
            <div style={{ flex: 1 }} />
            {htmlOutput && (
              <>
                <button type="button" onClick={handlePrint} className="bk-tbtn" style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,.09)', background: 'transparent', color: 'rgba(255,255,255,.4)', fontSize: 12, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 5 }}>
                  🖨 Imprimir
                </button>
                <button type="button" onClick={handleCopy} className="bk-tbtn" style={{ padding: '6px 12px', borderRadius: 7, border: '1px solid rgba(255,255,255,.09)', background: 'transparent', color: 'rgba(255,255,255,.4)', fontSize: 12, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {copied ? '✅ Copiado!' : '📋 Copiar'}
                </button>
                <button type="button" onClick={handleDownload}
                  style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: 'linear-gradient(135deg,#6d28d9,#9333ea)', color: 'white', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 0 14px rgba(109,40,217,.35)' }}>
                  ⬇ Baixar .html
                </button>
              </>
            )}
          </div>

          {/* Output area */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

            {/* Empty state */}
            {!htmlOutput && !isLoading && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
                <div style={{ fontSize: 72, opacity: .05, marginBottom: 24, userSelect: 'none' }}>📄</div>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#ede9fe', marginBottom: 8, textAlign: 'center', letterSpacing: '-.02em' }}>
                  Seu livro aparecerá aqui
                </p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,.3)', maxWidth: 360, textAlign: 'center', lineHeight: 1.65, marginBottom: 40 }}>
                  Cole o texto, escolha o formato e clique em{' '}
                  <span style={{ color: '#a78bfa', fontWeight: 500 }}>Gerar Livro Formatado</span>
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 440 }}>
                  {[
                    { icon: '📱', title: 'KDP / Kindle', desc: 'Capa + Sumário + Capítulos com CSS editorial', color: '#a78bfa' },
                    { icon: '📖', title: 'ABNT NBR 14724', desc: 'Capa + Folha de rosto + Seções numeradas', color: '#fbbf24' },
                    { icon: '✨', title: 'IA Profissional', desc: 'Melhora fluidez e cria títulos envolventes', color: '#34d399' },
                    { icon: '⬇', title: 'Exportação HTML', desc: 'Pronto para publicar no Kindle ou imprimir', color: '#60a5fa' },
                  ].map(({ icon, title, desc, color }) => (
                    <div key={title} style={{ background: 'rgba(255,255,255,.025)', border: '1px solid rgba(255,255,255,.07)', borderRadius: 10, padding: 16 }}>
                      <div style={{ fontSize: 20, marginBottom: 7 }}>{icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color, marginBottom: 4 }}>{title}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,.28)', lineHeight: 1.55 }}>{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Loading - no output yet */}
            {isLoading && !htmlOutput && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px solid rgba(139,92,246,.15)', borderTopColor: '#7c3aed', animation: 'spin 1s linear infinite' }} />
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📚</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#ede9fe', margin: 0, letterSpacing: '-.01em' }}>{loadingMessage}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,.28)', margin: '6px 0 0' }}>Gemini 2.0 Flash está trabalhando…</p>
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#7c3aed', animation: `bdot 1.3s ease-in-out ${i * 0.18}s infinite` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Preview / Source */}
            {htmlOutput && (
              activeView === 'preview'
                ? <iframe srcDoc={htmlOutput} style={{ width: '100%', height: '100%', border: 'none', background: '#fff', display: 'block' }} sandbox="allow-same-origin" title="Livro formatado" />
                : <pre style={{ width: '100%', height: '100%', padding: 20, margin: 0, fontSize: 12, fontFamily: "'Fira Code','Cascadia Code',monospace", color: '#86efac', background: '#05050a', overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.65, boxSizing: 'border-box' }}>{htmlOutput}</pre>
            )}

            {/* Streaming badge */}
            {isLoading && htmlOutput && (
              <div style={{ position: 'absolute', bottom: 14, right: 14, background: 'rgba(7,7,14,.92)', backdropFilter: 'blur(20px)', border: '1px solid rgba(124,58,237,.35)', borderRadius: 100, padding: '7px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#a78bfa', boxShadow: '0 4px 20px rgba(0,0,0,.5)' }}>
                <span style={{ width: 7, height: 7, background: '#7c3aed', borderRadius: '50%', display: 'inline-block', animation: 'gpulse 1s infinite' }} />
                Gerando ao vivo…
              </div>
            )}
          </div>

          {/* Stats bar */}
          {htmlOutput && !isLoading && <OutputStats html={htmlOutput} />}

          {/* Bottom bar */}
          <div style={{ height: 36, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.2)' }}>
              {htmlOutput.length.toLocaleString('pt-BR')} caracteres gerados
            </span>
            <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 100, border: mode === 'KDP' ? '1px solid rgba(124,58,237,.25)' : '1px solid rgba(217,119,6,.25)', background: mode === 'KDP' ? 'rgba(124,58,237,.1)' : 'rgba(217,119,6,.1)', color: mode === 'KDP' ? '#a78bfa' : '#fbbf24' }}>
              {mode === 'KDP' ? '📱 Amazon KDP' : '📖 ABNT NBR 14724'}
            </span>
          </div>
        </main>
      </div>
    </div>
  );
}
