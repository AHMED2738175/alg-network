import { useState, useEffect } from 'react';
import { Play, Loader2, Terminal, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { executeAPI } from '../services/api';
import type { ExecutionResult } from '../types';

interface Props {
  initialCode?: string;
  initialLanguage?: string;
  isExpanded: boolean;
  onToggle: () => void;
  pendingCode?: { code: string; language: string } | null;
  onCodeConsumed?: () => void;
}

export default function TerminalPanel({ initialCode, initialLanguage, isExpanded, onToggle, pendingCode, onCodeConsumed }: Props) {
  const [code, setCode] = useState(initialCode || '');
  const [language, setLanguage] = useState(initialLanguage || 'python');

  useEffect(() => {
    if (pendingCode && isExpanded) {
      setCode(pendingCode.code);
      setLanguage(pendingCode.language);
      onCodeConsumed?.();
    }
  }, [pendingCode, isExpanded, onCodeConsumed]);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<{ code: string; language: string; result: ExecutionResult }[]>([]);

  const languages = [
    'python', 'javascript', 'typescript', 'go', 'rust', 'c', 'cpp',
    'java', 'ruby', 'php', 'shell', 'bash', 'r'
  ];

  const handleRun = async () => {
    if (!code.trim() || isRunning) return;
    setIsRunning(true);
    try {
      const res = await executeAPI.run(code, language);
      setResult(res);
      setHistory(prev => [...prev, { code, language, result: res }]);
    } catch (err) {
      setResult({
        stdout: '',
        stderr: err instanceof Error ? err.message : 'Execution failed',
        exit_code: 1,
        execution_time: 0,
      });
    }
    setIsRunning(false);
  };

  const clearHistory = () => {
    setHistory([]);
    setResult(null);
  };

  return (
    <div className={`border-t border-gray-700 bg-gray-900 flex flex-col transition-all ${isExpanded ? 'h-80' : 'h-10'}`}>
      <div
        className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-emerald-400" />
          <span className="text-xs font-medium text-gray-300">Terminal / Code Runner</span>
          {result && (
            <span className={`text-xs px-1.5 py-0.5 rounded ${result.exit_code === 0 ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'}`}>
              {result.exit_code === 0 ? 'Success' : `Exit: ${result.exit_code}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && (
            <button
              onClick={(e) => { e.stopPropagation(); clearHistory(); }}
              className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
            >
              <Trash2 size={12} />
            </button>
          )}
          {isExpanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronUp size={14} className="text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col border-r border-gray-700">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-850 border-b border-gray-700">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded px-2 py-0.5 text-xs text-gray-300 focus:outline-none"
              >
                {languages.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <button
                onClick={handleRun}
                disabled={isRunning || !code.trim()}
                className="flex items-center gap-1 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-700 rounded text-xs text-white transition-colors"
              >
                {isRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                Run
              </button>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code to execute..."
              className="flex-1 bg-gray-950 text-gray-200 p-3 text-sm font-mono resize-none focus:outline-none placeholder-gray-600"
              spellCheck={false}
            />
          </div>

          <div className="flex-1 flex flex-col">
            <div className="px-3 py-1.5 bg-gray-850 border-b border-gray-700">
              <span className="text-xs text-gray-400">Output</span>
              {result && (
                <span className="text-xs text-gray-500 ml-2">({result.execution_time}s)</span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-950 p-3 font-mono text-sm">
              {history.map((item, i) => (
                <div key={i} className="mb-3">
                  <div className="text-xs text-gray-500 mb-1">$ {item.language} run ({item.result.execution_time}s)</div>
                  {item.result.stdout && (
                    <pre className="text-emerald-300 whitespace-pre-wrap">{item.result.stdout}</pre>
                  )}
                  {item.result.stderr && (
                    <pre className="text-red-400 whitespace-pre-wrap">{item.result.stderr}</pre>
                  )}
                </div>
              ))}
              {isRunning && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Running...</span>
                </div>
              )}
              {!result && history.length === 0 && !isRunning && (
                <div className="text-gray-600 text-xs">Output will appear here...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
