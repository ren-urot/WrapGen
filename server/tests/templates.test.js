// server/tests/templates.test.js
const path = require('path');

process.env.TEMPLATES_DIR = path.join(__dirname, 'fixtures/templates');

const { loadTemplates, getTemplate } = require('../src/templates');

describe('loadTemplates', () => {
  it('returns array of templates from fixtures dir', () => {
    const templates = loadTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0]).toMatchObject({
      id: expect.any(String),
      label: expect.any(String),
      wrapZone: expect.objectContaining({ x: expect.any(Number), w: expect.any(Number) }),
    });
  });
});

describe('getTemplate', () => {
  it('returns template with file paths', () => {
    const t = getTemplate('transit-van');
    expect(t).not.toBeNull();
    expect(t.id).toBe('transit-van');
    expect(t.photoPath).toContain('photo.png');
    expect(t.overlayPath).toContain('overlay.png');
  });

  it('returns null for unknown id', () => {
    expect(getTemplate('flying-saucer')).toBeNull();
  });
});
