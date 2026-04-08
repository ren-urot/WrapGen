// client/src/api/projects.js
import { apiFetch } from './client';

export const listProjects = () => apiFetch('/api/projects');

export const getProject = (id) => apiFetch(`/api/projects/${id}`);

export const createProject = ({ name, vehicle_id }) =>
  apiFetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify({ name, vehicle_id }),
  });

export const deleteProject = (id) =>
  apiFetch(`/api/projects/${id}`, { method: 'DELETE' });
