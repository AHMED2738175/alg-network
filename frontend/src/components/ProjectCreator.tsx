import { useState } from 'react';
import { X, Rocket, Loader2 } from 'lucide-react';
import { projectsAPI } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (result: { name: string; path: string; files: string[]; message: string }) => void;
}

const TEMPLATES: Record<string, { templates: string[]; icon: string }> = {
  python: { templates: ['fastapi', 'flask', 'script'], icon: '🐍' },
  javascript: { templates: ['express', 'vanilla'], icon: '📜' },
  typescript: { templates: ['react', 'node'], icon: '📘' },
  go: { templates: ['api', 'cli'], icon: '🐹' },
  rust: { templates: ['cli'], icon: '🦀' },
  java: { templates: ['app'], icon: '☕' },
};

export default function ProjectCreator({ isOpen, onClose, onCreated }: Props) {
  const [name, setName] = useState('');
  const [language, setLanguage] = useState('python');
  const [template, setTemplate] = useState('fastapi');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    const first = TEMPLATES[lang]?.templates[0];
    if (first) setTemplate(first);
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Project name is required');
      return;
    }
    setIsCreating(true);
    setError('');
    try {
      const result = await projectsAPI.create(name, template, language, description);
      onCreated(result);
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
    setIsCreating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl w-full max-w-lg mx-4 border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Rocket size={20} className="text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Create New Project</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-gray-300 block mb-1">Project Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-awesome-project"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Language</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TEMPLATES).map(([lang, info]) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                    language === lang
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span>{info.icon}</span>
                  <span className="capitalize">{lang}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Template</label>
            <div className="flex gap-2 flex-wrap">
              {TEMPLATES[language]?.templates.map((t) => (
                <button
                  key={t}
                  onClick={() => setTemplate(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                    template === t
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-900 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300 block mb-1">Description (optional)</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of your project"
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-900/30 p-2 rounded-lg">{error}</div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-lg text-white text-sm transition-colors"
          >
            {isCreating ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
            Create Project
          </button>
        </div>
      </div>
    </div>
  );
}
