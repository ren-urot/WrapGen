// client/src/hooks/useExport.js
import { useMutation } from '@tanstack/react-query';
import { triggerExport, pollExport } from '../api/export';

export function useExport() {
  return useMutation({
    mutationFn: async (versionId) => {
      await triggerExport(versionId);

      // Poll until ready (max 60 seconds, 2s interval)
      const deadline = Date.now() + 60_000;
      while (Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 2000));
        const result = await pollExport(versionId);
        if (result.status === 'ready') return result;
        if (result.status === 'error') throw new Error('Export processing failed');
      }
      throw new Error('Export timed out');
    },
  });
}
