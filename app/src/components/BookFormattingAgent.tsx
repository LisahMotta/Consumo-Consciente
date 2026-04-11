import { useState, useRef, useCallback, useMemo } from 'react';
import { formatBook, type FormattingMode } from '../services/bookFormattingAgent';

const LOADING_MESSAGES = [
  'Analisando o texto…',
  'Identificando temas e estrutura…',
  'Dividindo em capítulos…',
  'Criando títulos profissionais…',
  'Melhorando a fluidez do texto…',
  'Aplicando formatação editorial…',
  'Gerando sumário…',
  'Finalizando o documento…',
];

function useLoadingMessage(isLoading: boolean) {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (isLoading && !intervalRef.current) {
    intervalRef.current = setInterval(() => {
      setIndex(i => (i + 1) % LOADING_MESSAGES.length);
    }, 2800);
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
    <div className="grid grid-cols-5 divide-x divide-slate-800 border-t border-slate-800">
      {[
        { label: 'Capítulos', value: stats.chapters },
        { label: 'Seções', value: stats.sections },
        { label: 'Palavras', value: stats.words.toLocaleString('pt-BR') },
        { label: 'Páginas', value: `~${stats.pages}` },
        { label: 'Leitura', value: `~${stats.readMin} min` },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center py-2.5 px-2">
          <span className="text-slate-200 font-semibold text-sm">{value}</span>
          <span className="text-slate-500 text-xs mt-0.5">{label}</span>
        </div>
      ))}
    </div>
  );
}

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
  const loadingMessage = useLoadingMessage(isLoading);

  const handleFormat = useCallback(async () => {
    if (!text.trim()) { setError('Insira o texto a ser formatado.'); return; }
    if (!apiKey.trim()) { setError('Insira sua chave de API Gemini.'); return; }
    setIsLoading(true); setError(null); setHtmlOutput('');
    abortControllerRef.current = new AbortController();
    try {
      await formatBook(text, mode, apiKey,
        (chunk) => setHtmlOutput(prev => prev + chunk),
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

  const handleNew = () => { setHtmlOutput(''); setError(null); };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (win) { win.document.write(htmlOutput); win.document.close(); win.print(); }
  };

  const handleDownload = () => {
    const content = htmlOutput.trim().startsWith('<!DOCTYPE') || htmlOutput.trim().startsWith('<html')
      ? htmlOutput
      : `<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <meta charset="UTF-8" />\n  <title>Livro — ${mode}</title>\n</head>\n<body>\n${htmlOutput}\n</body>\n</html>`;
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
  const charCount = text.length;
  const charColor = charCount > 20000 ? 'text-amber-400' : charCount > 5000 ? 'text-emerald-400' : 'text-slate-500';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">

      {/* ── Header ── */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shadow-lg shadow-violet-950 text-base">
              📚
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">
                Agente de Diagramação de Livros
              </h1>
              <p className="text-slate-500 text-xs">Powered by Gemini 2.0 Flash</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-xs font-medium px-2.5 py-1 rounded-full">
              ● API gratuita
            </span>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/25 text-xs font-medium px-2.5 py-1 rounded-full">
              KDP &amp; ABNT
            </span>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <div className="flex-1 flex overflow-hidden">
        <div className="max-w-screen-2xl w-full mx-auto flex flex-col lg:flex-row gap-0 lg:gap-6 px-4 lg:px-6 py-4 lg:py-6 overflow-auto lg:overflow-hidden">

          {/* ── Left Panel ── */}
          <aside className="w-full lg:w-96 flex-shrink-0 flex flex-col gap-4 overflow-visible lg:overflow-y-auto lg:max-h-full pr-0 lg:pr-1">

            {/* API Key */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
                Autenticação
              </p>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Cole sua chave Gemini (AIza…)"
                  className="w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-lg px-3 py-2.5 text-sm font-mono pr-10 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
                />
                <button type="button" onClick={() => setShowApiKey(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition text-base">
                  {showApiKey ? '🙈' : '👁️'}
                </button>
              </div>
              <p className="text-slate-600 text-xs mt-2">
                Chave gratuita em{' '}
                <span className="text-violet-400">aistudio.google.com/apikey</span>
              </p>
            </div>

            {/* Mode */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4">
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
                Formato de Saída
              </p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {([
                  {
                    key: 'KDP' as FormattingMode,
                    icon: '📱',
                    title: 'Amazon KDP',
                    desc: 'Ebook Kindle',
                    color: 'violet',
                  },
                  {
                    key: 'ABNT' as FormattingMode,
                    icon: '📖',
                    title: 'Livro Físico',
                    desc: 'Normas ABNT',
                    color: 'amber',
                  },
                ]).map(({ key, icon, title, desc, color }) => {
                  const active = mode === key;
                  const ring = color === 'violet' ? 'border-violet-500 bg-violet-500/10' : 'border-amber-500 bg-amber-500/10';
                  const check = color === 'violet' ? 'bg-violet-500' : 'bg-amber-500';
                  const label = color === 'violet' ? 'text-violet-300' : 'text-amber-300';
                  return (
                    <button key={key} type="button" onClick={() => setMode(key)}
                      className={`relative p-3.5 rounded-xl border-2 text-left transition-all ${active ? ring : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}`}>
                      {active && (
                        <span className={`absolute top-2 right-2 w-4 h-4 ${check} rounded-full flex items-center justify-center text-white text-xs font-bold`}>✓</span>
                      )}
                      <div className="text-2xl mb-2">{icon}</div>
                      <div className={`text-sm font-bold ${active ? label : 'text-slate-300'}`}>{title}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                    </button>
                  );
                })}
              </div>
              <div className="bg-slate-800 rounded-lg p-2.5 text-xs text-slate-400 leading-relaxed">
                {mode === 'KDP'
                  ? '📱 HTML semântico com CSS editorial. Capa, sumário, capítulos com quebra de página. Otimizado para Kindle.'
                  : '📖 Documento ABNT NBR 14724. Capa, folha de rosto, resumo, sumário, seções numeradas e referências.'}
              </div>
            </div>

            {/* Text Input */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">
                  Texto de Entrada
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500">{wordCount.toLocaleString('pt-BR')} palavras</span>
                  <span className={`font-medium ${charColor}`}>{charCount.toLocaleString('pt-BR')} chars</span>
                </div>
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                rows={14}
                placeholder={"Cole aqui o texto bruto:\n\n• Rascunhos e anotações\n• Artigos e posts\n• Transcrições de áudio\n• Qualquer conteúdo textual\n\nO agente irá estruturar, dividir em capítulos e formatar profissionalmente."}
                className="flex-1 w-full bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-600 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition leading-relaxed"
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              {!isLoading ? (
                <button type="button" onClick={handleFormat}
                  disabled={!text.trim() || !apiKey.trim()}
                  className="w-full py-3.5 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-25 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-violet-950 flex items-center justify-center gap-2">
                  ✨ Gerar Livro Formatado
                </button>
              ) : (
                <button type="button" onClick={handleStop}
                  className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 border border-red-500/50 text-red-400 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  Parar Geração
                </button>
              )}
              {htmlOutput && !isLoading && (
                <button type="button" onClick={handleNew}
                  className="w-full py-2.5 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 rounded-xl text-sm transition-all">
                  + Novo Documento
                </button>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400 leading-relaxed">
                ⚠️ {error}
              </div>
            )}
          </aside>

          {/* ── Right Panel: Output ── */}
          <main className="flex-1 flex flex-col min-h-0 mt-4 lg:mt-0">
            <div className="bg-slate-900 rounded-xl border border-slate-800 flex flex-col flex-1 overflow-hidden">

              {/* Output Toolbar */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 flex-shrink-0">
                <div className="flex items-center bg-slate-800 rounded-lg p-0.5 gap-0.5">
                  {(['preview', 'source'] as const).map(v => (
                    <button key={v} type="button" onClick={() => setActiveView(v)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                        activeView === v
                          ? 'bg-slate-700 text-slate-100 shadow-sm'
                          : 'text-slate-500 hover:text-slate-300'
                      }`}>
                      {v === 'preview' ? '👁 Preview' : '{ } Fonte'}
                    </button>
                  ))}
                </div>

                <div className="flex-1" />

                {htmlOutput && (
                  <>
                    <button type="button" onClick={handlePrint}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition">
                      🖨 Imprimir
                    </button>
                    <button type="button" onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition">
                      {copied ? '✅ Copiado!' : '📋 Copiar'}
                    </button>
                    <button type="button" onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition font-medium">
                      ⬇ Baixar .html
                    </button>
                  </>
                )}
              </div>

              {/* Output Content */}
              <div className="flex-1 relative overflow-hidden">

                {/* Empty state */}
                {!htmlOutput && !isLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 select-none">
                    <div className="text-7xl mb-5 opacity-10">📄</div>
                    <p className="text-slate-400 font-semibold text-base mb-2">
                      Seu livro aparecerá aqui
                    </p>
                    <p className="text-slate-600 text-sm max-w-sm leading-relaxed">
                      Cole o texto no painel esquerdo, escolha o formato e clique em{' '}
                      <span className="text-violet-400 font-medium">Gerar Livro Formatado</span>
                    </p>
                    <div className="mt-8 grid grid-cols-2 gap-3 text-left max-w-md w-full">
                      {[
                        { icon: '📱', title: 'KDP / Kindle', desc: 'Capa + Sumário + Capítulos com CSS editorial' },
                        { icon: '📖', title: 'ABNT', desc: 'Capa + Folha de rosto + Seções numeradas' },
                        { icon: '✨', title: 'IA Profissional', desc: 'Melhora fluidez e cria títulos envolventes' },
                        { icon: '⬇', title: 'Exportação', desc: 'Download .html pronto para publicar ou imprimir' },
                      ].map(({ icon, title, desc }) => (
                        <div key={title} className="bg-slate-800/50 rounded-lg p-3 border border-slate-800">
                          <div className="text-lg mb-1">{icon}</div>
                          <div className="text-slate-300 text-xs font-semibold">{title}</div>
                          <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {isLoading && !htmlOutput && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <div className="flex gap-1.5">
                      {[0, 1, 2, 3].map(i => (
                        <div key={i}
                          className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                          style={{ animationDelay: `${i * 0.12}s` }}
                        />
                      ))}
                    </div>
                    <div className="text-center">
                      <p className="text-slate-300 text-sm font-medium">{loadingMessage}</p>
                      <p className="text-slate-600 text-xs mt-1">Gemini 2.0 Flash está trabalhando…</p>
                    </div>
                  </div>
                )}

                {/* Preview / Source */}
                {htmlOutput && (
                  activeView === 'preview' ? (
                    <iframe
                      srcDoc={htmlOutput}
                      className="w-full h-full border-0"
                      style={{ minHeight: '600px', background: '#fff' }}
                      sandbox="allow-same-origin"
                      title="Livro formatado"
                    />
                  ) : (
                    <pre className="w-full h-full p-4 text-xs font-mono text-emerald-400 bg-slate-950 overflow-auto whitespace-pre-wrap break-all leading-relaxed" style={{ minHeight: '600px' }}>
                      {htmlOutput}
                    </pre>
                  )
                )}

                {/* Streaming indicator */}
                {isLoading && htmlOutput && (
                  <div className="absolute bottom-3 right-3 bg-slate-800/90 backdrop-blur border border-slate-700 rounded-full px-3 py-1.5 flex items-center gap-2 text-xs text-violet-400">
                    <span className="inline-block w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
                    Gerando…
                  </div>
                )}
              </div>

              {/* Stats Bar */}
              {htmlOutput && !isLoading && <OutputStats html={htmlOutput} />}

              {/* Bottom bar */}
              <div className="px-4 py-2 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
                <span className="text-slate-600 text-xs">
                  {htmlOutput.length.toLocaleString('pt-BR')} caracteres gerados
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  mode === 'KDP'
                    ? 'bg-violet-500/10 text-violet-400 border-violet-500/25'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                }`}>
                  {mode === 'KDP' ? '📱 Amazon KDP' : '📖 ABNT NBR 14724'}
                </span>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
