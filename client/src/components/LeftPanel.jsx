// client/src/components/LeftPanel.jsx
export default function LeftPanel({ isOpen, onToggle, children }) {
  return (
    <div className={`flex flex-col border-r border-border bg-panel transition-all duration-200 ${isOpen ? 'w-64' : 'w-12'} flex-shrink-0`}>
      <button
        onClick={onToggle}
        className="p-3 text-gray-400 hover:text-white self-end transition-colors"
        title={isOpen ? 'Collapse panel' : 'Expand panel'}
      >
        {isOpen ? '◀' : '▶'}
      </button>
      {isOpen && (
        <div className="flex flex-col gap-4 px-4 pb-4 overflow-y-auto flex-1">
          {children}
        </div>
      )}
    </div>
  );
}
