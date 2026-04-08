// client/src/components/VariationTabs.jsx
export default function VariationTabs({ count, selected, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-dark-grey rounded">
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={`flex-1 py-1 px-3 rounded text-sm font-medium transition-colors ${
            selected === i
              ? 'bg-electric text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Variation {i + 1}
        </button>
      ))}
    </div>
  );
}
