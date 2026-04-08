// client/src/api/export.js
import { apiFetch } from './client';

export const triggerExport = (versionId) =>
  apiFetch(`/api/export/${versionId}`, { method: 'POST' });

export const pollExport = (versionId) =>
  apiFetch(`/api/export/${versionId}`);
