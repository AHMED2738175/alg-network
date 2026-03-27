const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }
  return response.json();
}

export const chatAPI = {
  send: (messages: { role: string; content: string }[], language?: string, context?: string) =>
    fetchAPI('/api/chat/', {
      method: 'POST',
      body: JSON.stringify({ messages, language, context }),
    }),
};

export const filesAPI = {
  list: (directory = '') => fetchAPI(`/api/files/?directory=${encodeURIComponent(directory)}`),
  read: (path: string) => fetchAPI(`/api/files/read?path=${encodeURIComponent(path)}`),
  write: (path: string, content: string) =>
    fetchAPI('/api/files/write', {
      method: 'POST',
      body: JSON.stringify({ path, content }),
    }),
  delete: (path: string) => fetchAPI(`/api/files/?path=${encodeURIComponent(path)}`, { method: 'DELETE' }),
  createDir: (path: string) =>
    fetchAPI('/api/files/directory', {
      method: 'POST',
      body: JSON.stringify({ path }),
    }),
};

export const executeAPI = {
  run: (code: string, language: string, timeout = 30) =>
    fetchAPI('/api/execute/', {
      method: 'POST',
      body: JSON.stringify({ code, language, timeout }),
    }),
  languages: () => fetchAPI('/api/execute/languages'),
};

export const projectsAPI = {
  create: (name: string, template: string, language: string, description?: string) =>
    fetchAPI('/api/projects/', {
      method: 'POST',
      body: JSON.stringify({ name, template, language, description }),
    }),
  templates: () => fetchAPI('/api/projects/templates'),
  languages: () => fetchAPI('/api/projects/languages'),
};
