// client/src/hooks/useProject.js
import { useQuery } from '@tanstack/react-query';
import { getProject } from '../api/projects';

export function useProject(id) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
    enabled: !!id,
  });
}
