export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeBlocks?: CodeBlock[];
}

export interface CodeBlock {
  language: string;
  code: string;
}

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  language?: string;
  size?: number;
  children?: FileItem[];
}

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  exit_code: number;
  execution_time: number;
}

export interface ProjectTemplate {
  language: string;
  template: string;
  name: string;
}

export interface LanguageInfo {
  name: string;
  extensions: string[];
  icon: string;
  templates: string[];
}
