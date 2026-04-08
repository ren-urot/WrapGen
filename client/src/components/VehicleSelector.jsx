// client/src/components/VehicleSelector.jsx
import { useTemplates } from '../hooks/useTemplates';

export default function VehicleSelector({ value, onChange }) {
  const { data: templates = [] } = useTemplates();
  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
        Vehicle
      </label>
      <div className="flex flex-col gap-1.5">
        {templates.map((t) => (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`text-left px-3 py-2 rounded text-sm transition-colors ${
              value === t.id
                ? 'bg-electric text-white'
                : 'bg-bg border border-border text-gray-300 hover:border-electric'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
