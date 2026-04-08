// client/src/api/templates.js
import { apiFetch } from './client';

export const listTemplates = () => apiFetch('/api/templates');

export const getTemplateImageUrl = (id) => {
  const base = import.meta.env.VITE_API_URL || '';
  return `${base}/api/templates/${id}/image`;
};
