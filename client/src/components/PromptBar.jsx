// client/src/components/PromptBar.jsx
import { useState } from 'react';

export default function PromptBar({ onGenerate, isGenerating, disabled }) {
  const [prompt, setPrompt] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!prompt.trim() || isGenerating || disabled) return;
    onGenerate(prompt.trim());
    setPrompt('');
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 p-4 border-t border-border bg-panel"
    >
      <textarea
        rows={2}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e); }
        }}
        placeholder="Describe your wrap design... (e.g. bold red and black racing stripes, logo centred)"
        disabled={isGenerating || disabled}
        className="flex-1 bg-bg border border-border rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-electric resize-none disabled:opacity-50 text-sm"
      />
      <button
        type="submit"
        disabled={isGenerating || !prompt.trim() || disabled}
        className="bg-electric hover:bg-blue-600 disabled:opacity-40 text-white font-bold px-6 py-2 rounded-lg transition-colors self-end"
      >
        {isGenerating ? '...' : 'Generate'}
      </button>
    </form>
  );
}
