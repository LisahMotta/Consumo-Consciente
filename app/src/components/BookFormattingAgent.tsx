import { useState, useRef, useCallback } from 'react';
import { formatBook, type FormattingMode } from '../services/bookFormattingAgent';

export default function BookFormattingAgent() {
  const [apiKey, setApiKey] = useState(
    (import.meta as any).env?.VITE_GEMINI_API_KEY || ''
  );
  const [showApiKey, setShowApiKey] = useState(false);
  const [text, setText] = useState('');
  const [mode, setMode] = useState<FormattingMode>('KDP');
  const [htmlOutput, setHtmlOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'preview' | 'source'>('preview');
  const [copied, setCopied] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleFormat = useCallback(async () => {
    if (!text.trim()) { setError('Insira o texto a ser formatado.'); return; }
    if (!apiKey.trim()) { setError('Insira sua chave de API Gemini.'); return; }
    setIsLoading(true); setError(null); setHtmlOutput('');
    abortControllerRef.current = new AbortController();
    try {
      await formatBook(text, mode, apiKey,
        (chunk) => setHtmlOutput((prev) => prev + chunk),
        abortControllerRef.current.signal
      );
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string; status?: number };
      if (e.name !== 'AbortError') {
        if (e.status === 400 || e.message?.includes('API_KEY')) {
          setError('Chave de API inválida. Obtenha gratuitamente em aistudio.google.com');
        } else {
          setError(e.message || 'Erro ao formatar. Tente novamente.');
        }
      }
    } finally { setIsLoading(false); }
  }, [text, mode, apiKey]);

  const handleStop = () => { abortControllerRef.current?.abort(); setIsLoading(false); };

  const handleDownload = () => {
    const content = htmlOutput.trim().startsWith('<!DOCTYPE') || htmlOutput.trim().startsWith('<html')
      ? htmlOutput
      : `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Livro — ${mode}</title>
</head>
<body>
${htmlOutput}
</body>
</html>`;
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `livro-${mode.toLowerCase()}-${Date.now()}.html`,
    });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(htmlOutput);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 300));
  const outputWords = htmlOutput ? htmlOutput.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).length : 0;
  const outputPages = Math.max(1, Math.ceil(outputWords / 300));

  return (
    <div className="min-h-screen bg-slate-950 font-sans">

      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center text-lg shadow-lg shadow-violet-900">
              📚
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">Agente de Diagramação</h1>
              <p className="text-slate-400 text-xs mt-0.5">Transforme texto bruto em livro publicável</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/15 text-emerald-400 text-xs font-medium px-3 py-1 rounded-full border border-emerald-500/30">
              ● Gemini 2.0 Flash
            </span>
            <span className="bg-violet-500/15 text-violet-400 text-xs font-medium px-3 py-1 rounded-full border border-violet-500/30">
              Gratuito
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left Panel: Controls ── */}
          <aside className="lg:col-span-2 flex flex-col gap-4">

            {/* API Key Card */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Autenticação</span>
              </div>
              <label className="block text-slate-300 text-sm font-medium mb-1.5">
                Chave de API Gemini
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm font-mono pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
                <button type="button" onClick={() => setShowApiKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition">
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-slate-500 text-xs mt-2">
                Obtenha grátis em{' '}
                <span className="text-violet-400 font-medium">aistudio.google.com</span>
              </p>
            </div>

            {/* Mode Selector Card */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <span className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                Modo de Saída
              </span>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'KDP', icon: '📱', label: 'Amazon KDP', sub: 'Ebook / Kindle' },
                  { key: 'ABNT', icon: '📖', label: 'Livro Físico', sub: 'Normas ABNT' },
                ] as { key: FormattingMode; icon: string; label: string; sub: string }[]).map(({ key, icon, label, sub }) => (
                  <button key={key} type="button" onClick={() => setMode(key)}
                    className={`relative p-3 rounded-lg border-2 text-left transition-all ${
                      mode === key
                        ? 'border-violet-500 bg-violet-500/10'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}>
                    {mode === key && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                    )}
                    <div className="text-2xl mb-1.5">{icon}</div>
                    <div className={`text-sm font-semibold ${mode === key ? 'text-violet-300' : 'text-slate-300'}`}>{label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{sub}</div>
                  </button>
                ))}
              </div>
              <div className="mt-3 p-2.5 bg-slate-800 rounded-lg text-xs text-slate-400 leading-relaxed">
                {mode === 'KDP'
                  ? '📱 HTML limpo com h1/h2/p. Sem CSS fixo. Otimizado para Kindle e dispositivos móveis.'
                  : '📖 Estrutura ABNT completa: capa, sumário, desenvolvimento. Times New Roman 12pt.'}
              </div>
            </div>

            {/* Text Input Card */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Texto de Entrada</span>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>{wordCount.toLocaleString('pt-BR')} palavras</span>
                  <span>·</span>
                  <span>~{estimatedPages} pág.</span>
                </div>
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                placeholder="Cole aqui o texto bruto — rascunhos, anotações, artigos, transcrições…

O agente irá organizar, dividir em capítulos e formatar para publicação."
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition leading-relaxed"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-slate-600 text-xs">{text.length.toLocaleString('pt-BR')} caracteres</span>
              </div>
            </div>

            {/* Action Button */}
            {!isLoading ? (
              <button type="button" onClick={handleFormat}
                disabled={!text.trim() || !apiKey.trim()}
                className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-900/50 flex items-center justify-center gap-2">
                <span className="text-base">✨</span>
                Formatar Livro
              </button>
            ) : (
              <button type="button" onClick={handleStop}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
                <span className="inline-block animate-spin">⏳</span>
                Gerando… clique para parar
              </button>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                ⚠️ {error}
              </div>
            )}
          </aside>

          {/* ── Right Panel: Output ── */}
          <main className="lg:col-span-3 flex flex-col">
            <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col flex-1 overflow-hidden">

              {/* Output Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-1">
                  {(['preview', 'source'] as const).map(v => (
                    <button key={v} type="button" onClick={() => setActiveView(v)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeView === v
                          ? 'bg-violet-600 text-white'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }`}>
                      {v === 'preview' ? '👁️ Preview' : '🗒️ HTML Fonte'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={handleCopy}
                    disabled={!htmlOutput}
                    className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed">
                    {copied ? '✅ Copiado!' : '📋 Copiar'}
                  </button>
                  <button type="button" onClick={handleDownload}
                    disabled={!htmlOutput}
                    className="px-3 py-1.5 text-sm bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition font-medium disabled:opacity-30 disabled:cursor-not-allowed">
                    ⬇️ Download .html
                  </button>
                </div>
              </div>

              {/* Output Body */}
              <div className="flex-1 relative" style={{ minHeight: '500px' }}>
                {!htmlOutput && !isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <div className="text-6xl mb-4 opacity-20">📄</div>
                    <p className="text-slate-500 text-sm font-medium">O livro formatado aparecerá aqui</p>
                    <p className="text-slate-600 text-xs mt-1">Cole seu texto, escolha o modo e clique em Formatar</p>
                  </div>
                )}

                {isLoading && !htmlOutput && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                    <p className="text-slate-400 text-sm">Analisando e formatando o texto…</p>
                  </div>
                )}

                {htmlOutput && (
                  activeView === 'preview' ? (
                    <iframe
                      srcDoc={htmlOutput}
                      className="w-full h-full border-0 bg-white"
                      style={{ minHeight: '500px' }}
                      sandbox="allow-same-origin"
                      title="Prévia do livro"
                    />
                  ) : (
                    <pre className="p-4 text-xs font-mono text-emerald-400 bg-slate-950 overflow-auto h-full whitespace-pre-wrap break-all" style={{ minHeight: '500px' }}>
                      {htmlOutput}
                    </pre>
                  )
                )}
              </div>

              {/* Output Footer Stats */}
              <div className="px-4 py-2.5 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{htmlOutput.length.toLocaleString('pt-BR')} chars gerados</span>
                  {htmlOutput && (
                    <>
                      <span>·</span>
                      <span>~{outputPages} páginas estimadas</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    mode === 'KDP'
                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  }`}>
                    {mode === 'KDP' ? '📱 KDP' : '📖 ABNT'}
                  </span>
                  {isLoading && (
                    <span className="text-xs text-violet-400 animate-pulse">● gerando</span>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
