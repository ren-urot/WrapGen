// client/src/hooks/useTemplates.js
import { useQuery } from '@tanstack/react-query';
import { listTemplates } from '../api/templates';

export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: listTemplates,
    staleTime: Infinity, // templates don't change at runtime
  });
}
