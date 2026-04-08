// client/src/components/WorkspaceLayout.jsx
import { useState } from 'react';
import LeftPanel from './LeftPanel';
import MockupCanvas from './MockupCanvas';
import PromptBar from './PromptBar';

export default function WorkspaceLayout({
  leftPanelContent,
  mockupUrls,
  isGenerating,
  onGenerate,
  canGenerate,
}) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState(0);

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center px-4 py-2 border-b border-border bg-panel flex-shrink-0">
        <a href="/" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← WrapGen
        </a>
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        <LeftPanel isOpen={isPanelOpen} onToggle={() => setIsPanelOpen(!isPanelOpen)}>
          {leftPanelContent}
        </LeftPanel>

        <MockupCanvas
          mockupUrls={mockupUrls}
          isGenerating={isGenerating}
          selectedVariation={selectedVariation}
          onVariationChange={setSelectedVariation}
        />
      </div>

      {/* Bottom prompt bar */}
      <PromptBar
        onGenerate={onGenerate}
        isGenerating={isGenerating}
        disabled={!canGenerate}
      />
    </div>
  );
}
