// client/src/components/VersionHistory.jsx
export default function VersionHistory({ versions = [], selectedVersionId, onSelect }) {
  if (versions.length === 0) return null;

  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
        Version History
      </label>
      <div className="flex flex-col gap-1.5">
        {versions.map((v, i) => (
          <button
            key={v.id}
            onClick={() => onSelect(v)}
            className={`text-left px-3 py-2 rounded text-xs transition-colors ${
              selectedVersionId === v.id
                ? 'bg-dark-grey border border-electric text-white'
                : 'bg-bg border border-border text-gray-400 hover:border-gray-500'
            }`}
          >
            <span className="font-medium text-gray-300">v{versions.length - i}</span>
            <span className="block text-gray-500 truncate mt-0.5">{v.prompt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
