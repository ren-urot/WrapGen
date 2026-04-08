// client/src/components/ExportButton.jsx
import { useExport } from '../hooks/useExport';

export default function ExportButton({ versionId }) {
  const exportMutation = useExport();

  async function handleExport() {
    if (!versionId) return;
    try {
      const result = await exportMutation.mutateAsync(versionId);
      if (result.files?.[0]) {
        const a = document.createElement('a');
        a.href = result.files[0];
        a.download = 'wrapgen-export.png';
        a.click();
      }
    } catch (err) {
      alert(`Export failed: ${err.message}`);
    }
  }

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={!versionId || exportMutation.isPending}
        className="w-full bg-lime text-bg font-bold py-2.5 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity text-sm"
      >
        {exportMutation.isPending ? 'Preparing export...' : 'Export Print File'}
      </button>
      {exportMutation.isError && (
        <p className="text-red-400 text-xs mt-1">{exportMutation.error.message}</p>
      )}
    </div>
  );
}
