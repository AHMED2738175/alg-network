import { useState, useEffect } from 'react';
import {
  MessageSquare,
  FolderTree,
  Rocket,
  Code2,
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  Plus,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { filesAPI } from '../services/api';
import type { FileItem } from '../types';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onFileSelect: (path: string) => void;
  onNewProject: () => void;
}

function FileTreeNode({ item, onSelect, onDelete, depth = 0 }: {
  item: FileItem;
  onSelect: (path: string) => void;
  onDelete: (path: string) => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [children, setChildren] = useState<FileItem[]>([]);

  const loadChildren = async () => {
    if (item.type === 'directory') {
      try {
        const items = await filesAPI.list(item.path);
        setChildren(items);
      } catch {
        setChildren([]);
      }
    }
  };

  const handleClick = () => {
    if (item.type === 'directory') {
      setExpanded(!expanded);
      if (!expanded) loadChildren();
    } else {
      onSelect(item.path);
    }
  };

  return (
    <div>
      <div
        className="flex items-center gap-1 px-2 py-1 hover:bg-gray-700/50 cursor-pointer group text-sm"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
      >
        {item.type === 'directory' ? (
          expanded ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />
        ) : (
          <span className="w-3.5" />
        )}
        {item.type === 'directory' ? (
          <Folder size={14} className="text-blue-400" />
        ) : (
          <File size={14} className="text-gray-400" />
        )}
        <span className="text-gray-300 truncate flex-1">{item.name}</span>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(item.path); }}
          className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 text-gray-500 transition-opacity"
        >
          <Trash2 size={12} />
        </button>
      </div>
      {expanded && children.map((child) => (
        <FileTreeNode
          key={child.path}
          item={child}
          onSelect={onSelect}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function Sidebar({ activeTab, onTabChange, onFileSelect, onNewProject }: Props) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const items = await filesAPI.list();
      setFiles(items);
    } catch {
      setFiles([]);
    }
    setLoading(false);
  };

  const handleDelete = async (path: string) => {
    try {
      await filesAPI.delete(path);
      loadFiles();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'files') {
      loadFiles();
    }
  }, [activeTab]);

  const tabs = [
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'files', icon: FolderTree, label: 'Files' },
    { id: 'projects', icon: Rocket, label: 'Projects' },
  ];

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b border-gray-700">
        <Code2 size={24} className="text-blue-400" />
        <h1 className="text-lg font-bold text-white">DevAssist AI</h1>
      </div>

      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors ${
              activeTab === tab.id
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'files' && (
          <div>
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Workspace</span>
              <div className="flex gap-1">
                <button
                  onClick={loadFiles}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                  title="Refresh"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={onNewProject}
                  className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
                  title="New Project"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
            {files.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                <FolderTree size={32} className="mx-auto mb-2 opacity-50" />
                <p>No files yet</p>
                <p className="text-xs mt-1">Create a project to get started</p>
              </div>
            ) : (
              files.map((item) => (
                <FileTreeNode
                  key={item.path}
                  item={item}
                  onSelect={onFileSelect}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="p-4">
            <button
              onClick={onNewProject}
              className="w-full flex items-center gap-2 p-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm transition-colors"
            >
              <Plus size={16} />
              New Project
            </button>
            <div className="mt-4 space-y-2">
              <h3 className="text-xs text-gray-400 uppercase tracking-wider">Quick Templates</h3>
              {[
                { lang: 'Python', template: 'FastAPI', icon: '🐍' },
                { lang: 'JavaScript', template: 'Express', icon: '📜' },
                { lang: 'TypeScript', template: 'React', icon: '📘' },
                { lang: 'Go', template: 'API', icon: '🐹' },
                { lang: 'Rust', template: 'CLI', icon: '🦀' },
              ].map((t) => (
                <button
                  key={t.template}
                  onClick={onNewProject}
                  className="w-full flex items-center gap-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 text-sm transition-colors"
                >
                  <span>{t.icon}</span>
                  <span>{t.lang} / {t.template}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="p-4 text-gray-400 text-sm">
            <h3 className="text-xs uppercase tracking-wider mb-3">Suggestions</h3>
            <div className="space-y-2">
              {[
                'Build a REST API',
                'Create a React app',
                'Write a Python script',
                'Build a CLI tool',
                'Create a web scraper',
                'Design a database schema',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => onTabChange('chat')}
                  className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-700 text-center">
        <span className="text-xs text-gray-500">DevAssist AI v1.0</span>
      </div>
    </div>
  );
}
