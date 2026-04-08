// client/src/components/MockupCanvas.jsx
import MockupImage from './MockupImage';
import VariationTabs from './VariationTabs';
import GeneratingOverlay from './GeneratingOverlay';

export default function MockupCanvas({
  mockupUrls,
  isGenerating,
  selectedVariation,
  onVariationChange,
}) {
  return (
    <div className="flex-1 flex flex-col gap-3 p-4 min-h-0 relative">
      {isGenerating && <GeneratingOverlay />}

      <div className="flex-1 flex items-center justify-center bg-panel rounded-lg border border-border overflow-hidden relative">
        <MockupImage src={mockupUrls?.[selectedVariation]} />
      </div>

      {mockupUrls && mockupUrls.length > 1 && (
        <VariationTabs
          count={mockupUrls.length}
          selected={selectedVariation}
          onChange={onVariationChange}
        />
      )}
    </div>
  );
}
