// client/src/hooks/useGenerate.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateMockup } from '../api/generate';

export function useGenerate(projectId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => generateMockup(projectId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
    },
  });
}
