import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Play, User, Bot } from 'lucide-react';
import { useState } from 'react';
import type { ChatMessage as ChatMessageType } from '../types';

interface Props {
  message: ChatMessageType;
  onRunCode?: (code: string, language: string) => void;
  onInsertCode?: (code: string, language: string) => void;
}

export default function ChatMessage({ message, onRunCode, onInsertCode }: Props) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const isUser = message.role === 'user';

  const handleCopy = (code: string, index: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  let codeBlockIndex = 0;

  return (
    <div className={`flex gap-3 p-4 ${isUser ? 'bg-gray-800/50' : 'bg-gray-900/50'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isUser ? 'bg-blue-600' : 'bg-emerald-600'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className="flex-1 min-w-0 overflow-hidden">
        <div className="text-xs text-gray-400 mb-1">
          {isUser ? 'You' : 'DevAssist AI'}
        </div>
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                const codeString = String(children).replace(/\n$/, '');
                if (match) {
                  const currentIndex = codeBlockIndex++;
                  const lang = match[1];
                  return (
                    <div className="relative group my-3 rounded-lg overflow-hidden border border-gray-700">
                      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                        <span className="text-xs text-gray-400 font-mono">{lang}</span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleCopy(codeString, currentIndex)}
                            className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                            title="Copy code"
                          >
                            {copiedIndex === currentIndex ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                          {onRunCode && ['python', 'javascript', 'typescript', 'go', 'rust', 'c', 'cpp', 'java', 'ruby', 'php', 'shell', 'bash'].includes(lang) && (
                            <button
                              onClick={() => onRunCode(codeString, lang)}
                              className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-green-400 transition-colors"
                              title="Run code"
                            >
                              <Play size={14} />
                            </button>
                          )}
                          {onInsertCode && (
                            <button
                              onClick={() => onInsertCode(codeString, lang)}
                              className="px-2 py-0.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors text-xs"
                              title="Insert into editor"
                            >
                              Insert
                            </button>
                          )}
                        </div>
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={lang}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: 0,
                          background: '#1a1b26',
                          fontSize: '13px',
                        }}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                return (
                  <code className="bg-gray-800 px-1.5 py-0.5 rounded text-sm text-emerald-400 font-mono" {...props}>
                    {children}
                  </code>
                );
              },
              p({ children }) {
                return <p className="mb-2 leading-relaxed text-gray-200">{children}</p>;
              },
              h1({ children }) {
                return <h1 className="text-xl font-bold text-white mb-3 mt-4">{children}</h1>;
              },
              h2({ children }) {
                return <h2 className="text-lg font-bold text-white mb-2 mt-3">{children}</h2>;
              },
              h3({ children }) {
                return <h3 className="text-base font-bold text-white mb-2 mt-3">{children}</h3>;
              },
              ul({ children }) {
                return <ul className="list-disc list-inside mb-2 space-y-1 text-gray-300">{children}</ul>;
              },
              ol({ children }) {
                return <ol className="list-decimal list-inside mb-2 space-y-1 text-gray-300">{children}</ol>;
              },
              li({ children }) {
                return <li className="text-gray-300">{children}</li>;
              },
              strong({ children }) {
                return <strong className="text-white font-semibold">{children}</strong>;
              },
              a({ href, children }) {
                return <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">{children}</a>;
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
