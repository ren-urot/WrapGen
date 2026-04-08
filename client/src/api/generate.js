// client/src/api/generate.js
const BASE = import.meta.env.VITE_API_URL || '';

// Uses FormData — cannot use apiFetch (Content-Type must be multipart)
export async function generateMockup(projectId, { prompt, logo, ref }) {
  const form = new FormData();
  form.append('prompt', prompt);
  form.append('logo', logo);
  if (ref) form.append('ref', ref);

  const res = await fetch(`${BASE}/api/projects/${projectId}/generate`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Generation failed: ${res.status}`);
  }
  return res.json(); // { versionId, mockupUrls }
}
