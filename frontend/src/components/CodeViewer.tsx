import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Save, X, FileCode } from 'lucide-react';
import { filesAPI } from '../services/api';

interface Props {
  filePath: string | null;
  onClose: () => void;
  externalCode?: string;
  externalLanguage?: string;
}

export default function CodeViewer({ filePath, onClose, externalCode, externalLanguage }: Props) {
  const [content, setContent] = useState('');
  const [language, setLanguage] = useState('text');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (externalCode) {
      setContent(externalCode);
      setLanguage(externalLanguage || 'text');
      setEditContent(externalCode);
      return;
    }
    if (filePath) {
      loadFile(filePath);
    }
  }, [filePath, externalCode, externalLanguage]);

  const loadFile = async (path: string) => {
    try {
      const file = await filesAPI.read(path);
      setContent(file.content);
      setLanguage(file.language);
      setEditContent(file.content);
    } catch (err) {
      setContent(`Error loading file: ${err}`);
      setLanguage('text');
    }
  };

  const handleSave = async () => {
    if (!filePath) return;
    setSaving(true);
    try {
      await filesAPI.write(filePath, editContent);
      setContent(editContent);
      setIsEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
    }
    setSaving(false);
  };

  if (!filePath && !externalCode) return null;

  return (
    <div className="flex flex-col h-full bg-gray-950">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FileCode size={14} className="text-blue-400" />
          <span className="text-sm text-gray-300 font-mono">{filePath || 'Code Preview'}</span>
          <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">{language}</span>
        </div>
        <div className="flex items-center gap-1">
          {filePath && (
            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
            >
              <Save size={12} />
              {isEditing ? (saving ? 'Saving...' : 'Save') : 'Edit'}
            </button>
          )}
          <button
            onClick={() => { setIsEditing(false); onClose(); }}
            className="p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full h-full bg-gray-950 text-gray-200 p-4 font-mono text-sm resize-none focus:outline-none"
            spellCheck={false}
          />
        ) : (
          <SyntaxHighlighter
            language={language}
            style={oneDark}
            showLineNumbers
            customStyle={{
              margin: 0,
              borderRadius: 0,
              background: '#0a0a0f',
              fontSize: '13px',
              minHeight: '100%',
            }}
            lineNumberStyle={{
              minWidth: '3em',
              paddingRight: '1em',
              color: '#4a4a5a',
            }}
          >
            {content}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
}
