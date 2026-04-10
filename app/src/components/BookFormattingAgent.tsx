import { useState, useRef, useCallback } from 'react';
import { formatBook, type FormattingMode } from '../services/bookFormattingAgent';

export default function BookFormattingAgent() {
  const [apiKey, setApiKey] = useState(
    (import.meta as any).env?.VITE_ANTHROPIC_API_KEY || ''
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
    if (!text.trim()) {
      setError('Por favor, insira o texto a ser formatado.');
      return;
    }
    if (!apiKey.trim()) {
      setError('Por favor, insira sua chave de API da Anthropic.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setHtmlOutput('');

    abortControllerRef.current = new AbortController();

    try {
      await formatBook(
        text,
        mode,
        apiKey,
        (chunk) => setHtmlOutput((prev) => prev + chunk),
        abortControllerRef.current.signal
      );
    } catch (err: unknown) {
      const apiErr = err as { name?: string; message?: string; status?: number };
      if (apiErr.name !== 'AbortError') {
        if (apiErr.status === 401) {
          setError('Chave de API inválida. Verifique sua chave da Anthropic.');
        } else {
          setError(apiErr.message || 'Erro ao formatar o livro. Tente novamente.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [text, mode, apiKey]);

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  const handleDownload = () => {
    const content =
      htmlOutput.trim().startsWith('<!DOCTYPE') || htmlOutput.trim().startsWith('<html')
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `livro-${mode.toLowerCase()}-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(htmlOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">📚 Agente de Diagramação de Livros</h2>
        <p className="text-violet-200 text-sm">
          Transforme texto bruto em livro estruturado para Amazon KDP ou ABNT
        </p>
      </div>

      <div className="p-6 space-y-5">
        {/* API Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            🔑 Chave de API Anthropic
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-4 py-2 border rounded-lg text-sm font-mono pr-10 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <button
              type="button"
              onClick={() => setShowApiKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
              aria-label={showApiKey ? 'Ocultar chave' : 'Mostrar chave'}
            >
              {showApiKey ? '🙈' : '👁️'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            A chave não é armazenada localmente. Em produção, use a variável{' '}
            <code className="bg-gray-100 px-1 rounded">VITE_ANTHROPIC_API_KEY</code>.
          </p>
        </div>

        {/* Mode Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📋 Modo de Diagramação
          </label>
          <div className="flex gap-3">
            {(['KDP', 'ABNT'] as FormattingMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 py-3 px-4 rounded-lg border-2 text-sm font-medium transition-all text-center ${
                  mode === m
                    ? 'border-violet-600 bg-violet-50 text-violet-700'
                    : 'border-gray-200 text-gray-600 hover:border-violet-300'
                }`}
              >
                <div className="text-xl mb-1">{m === 'KDP' ? '📱' : '📖'}</div>
                <div className="font-semibold">{m}</div>
                <div className="text-xs opacity-70 mt-0.5">
                  {m === 'KDP' ? 'Amazon Kindle / Ebook' : 'Livro Físico Acadêmico'}
                </div>
              </button>
            ))}
          </div>

          {/* Mode info badge */}
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
            {mode === 'KDP' ? (
              <>
                <strong>KDP:</strong> HTML limpo com &lt;h1&gt;, &lt;h2&gt;, &lt;p&gt; — sem CSS fixo, otimizado
                para leitura em Kindle e dispositivos móveis.
              </>
            ) : (
              <>
                <strong>ABNT:</strong> Capa, folha de rosto, sumário, desenvolvimento e referências —
                Times New Roman 12pt, espaçamento 1,5, margens 3/2 cm.
              </>
            )}
          </div>
        </div>

        {/* Text Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            📝 Texto Bruto
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Cole aqui o texto bruto que deseja transformar em livro estruturado...&#10;&#10;Pode incluir rascunhos, anotações, artigos, transcrições — o agente irá organizar e formatar tudo."
            className="w-full px-4 py-3 border rounded-lg text-sm resize-y focus:outline-none focus:ring-2 focus:ring-violet-400 font-mono leading-relaxed"
          />
          <p className="text-xs text-gray-500 mt-1">
            {charCount.toLocaleString('pt-BR')} caracteres · {wordCount.toLocaleString('pt-BR')} palavras
          </p>
        </div>

        {/* Action Button */}
        <div className="flex gap-3">
          {!isLoading ? (
            <button
              type="button"
              onClick={handleFormat}
              disabled={!text.trim() || !apiKey.trim()}
              className="flex-1 py-3 px-6 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              ✨ Formatar Livro
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStop}
              className="flex-1 py-3 px-6 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span className="inline-block animate-spin">⏳</span>
              Gerando… (clique para parar)
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* Output */}
        {htmlOutput && (
          <div className="border rounded-xl overflow-hidden">
            {/* Tabs + Actions */}
            <div className="flex items-center border-b bg-gray-50">
              <button
                type="button"
                onClick={() => setActiveView('preview')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeView === 'preview'
                    ? 'bg-white border-b-2 border-violet-600 text-violet-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                👁️ Preview
              </button>
              <button
                type="button"
                onClick={() => setActiveView('source')}
                className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeView === 'source'
                    ? 'bg-white border-b-2 border-violet-600 text-violet-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                🗒️ HTML Fonte
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {copied ? '✅ Copiado!' : '📋 Copiar'}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="px-3 py-2.5 text-sm text-violet-600 hover:text-violet-800 font-medium transition-colors border-l"
              >
                ⬇️ Download .html
              </button>
            </div>

            {/* Content */}
            {activeView === 'preview' ? (
              <iframe
                srcDoc={htmlOutput}
                className="w-full border-0 bg-white"
                style={{ minHeight: '500px' }}
                sandbox="allow-same-origin"
                title="Prévia do livro formatado"
              />
            ) : (
              <pre className="p-4 text-xs font-mono bg-gray-900 text-green-400 overflow-auto max-h-[500px] whitespace-pre-wrap break-all">
                {htmlOutput}
              </pre>
            )}

            {/* Footer stats */}
            <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-500 flex justify-between">
              <span>
                {htmlOutput.length.toLocaleString('pt-BR')} caracteres gerados
              </span>
              <span className="text-violet-600 font-medium">Modo: {mode}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
