import { useState, useRef, useEffect } from 'react';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import Sidebar from './components/Sidebar';
import TerminalPanel from './components/TerminalPanel';
import CodeViewer from './components/CodeViewer';
import ProjectCreator from './components/ProjectCreator';
import { chatAPI } from './services/api';
import type { ChatMessage as ChatMessageType } from './types';
import './App.css';

function App() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '0',
      role: 'assistant',
      content: `# Welcome to DevAssist AI! \n\nI'm your AI-powered coding assistant. I can help you with:\n\n- **Code Generation** - Write code in any language (Python, JS, Go, Rust, Java, C++, and more)\n- **Project Creation** - Scaffold complete projects from templates\n- **Code Execution** - Run your code directly in the terminal below\n- **File Management** - Create, edit, and manage project files\n- **Debugging** - Find and fix bugs in your code\n- **Code Review** - Get suggestions to improve your code\n\n**Try asking me:**\n- "Build a REST API with FastAPI"\n- "Create a React todo app"\n- "Write a Python web scraper"\n- "Explain how async/await works"\n\nJust type your request below and I'll help you build it!`,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [terminalExpanded, setTerminalExpanded] = useState(false);
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const [showProjectCreator, setShowProjectCreator] = useState(false);
  const [insertedCode, setInsertedCode] = useState<{ code: string; language: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await chatAPI.send(allMessages);

      const assistantMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        codeBlocks: response.code_blocks,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please make sure the backend server is running and try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleRunCode = (code: string, _language: string) => {
    setTerminalExpanded(true);
    const terminalPanel = document.querySelector('textarea[placeholder="Enter code to execute..."]') as HTMLTextAreaElement;
    if (terminalPanel) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
      nativeInputValueSetter?.call(terminalPanel, code);
      terminalPanel.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };

  const handleInsertCode = (code: string, language: string) => {
    setInsertedCode({ code, language });
    setShowCodeViewer(true);
  };

  const handleFileSelect = (path: string) => {
    setOpenFile(path);
    setShowCodeViewer(true);
    setInsertedCode(null);
  };

  const handleProjectCreated = () => {
    setActiveTab('files');
  };

  return (
    <div className="h-screen flex bg-gray-950 text-white overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onFileSelect={handleFileSelect}
        onNewProject={() => setShowProjectCreator(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-12 flex items-center justify-between px-4 bg-gray-900 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-sm text-gray-300">DevAssist AI - Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
              {messages.length - 1} messages
            </span>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          <div className={`flex flex-col ${showCodeViewer ? 'w-1/2' : 'w-full'} min-w-0`}>
            <div className="flex-1 overflow-y-auto">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  onRunCode={handleRunCode}
                  onInsertCode={handleInsertCode}
                />
              ))}
              {isLoading && (
                <div className="flex gap-3 p-4 bg-gray-900/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">AI</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-gray-400">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <ChatInput onSend={handleSend} isLoading={isLoading} />
          </div>

          {showCodeViewer && (
            <div className="w-1/2 border-l border-gray-700">
              <CodeViewer
                filePath={insertedCode ? null : openFile}
                onClose={() => {
                  setShowCodeViewer(false);
                  setOpenFile(null);
                  setInsertedCode(null);
                }}
                externalCode={insertedCode?.code}
                externalLanguage={insertedCode?.language}
              />
            </div>
          )}
        </div>

        <TerminalPanel
          isExpanded={terminalExpanded}
          onToggle={() => setTerminalExpanded(!terminalExpanded)}
        />
      </div>

      <ProjectCreator
        isOpen={showProjectCreator}
        onClose={() => setShowProjectCreator(false)}
        onCreated={handleProjectCreated}
      />
    </div>
  );
}

export default App;
