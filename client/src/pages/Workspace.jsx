// client/src/pages/Workspace.jsx
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '../hooks/useProject';
import { useGenerate } from '../hooks/useGenerate';
import WorkspaceLayout from '../components/WorkspaceLayout';
import LogoUpload from '../components/LogoUpload';
import RefUpload from '../components/RefUpload';
import VersionHistory from '../components/VersionHistory';
import ExportButton from '../components/ExportButton';

export default function Workspace() {
  const { id } = useParams();
  const { data: project, isLoading } = useProject(id);
  const generateMutation = useGenerate(id);

  const [logo, setLogo] = useState(null);
  const [ref, setRef] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);

  // The active version: most recently generated or user-selected
  const activeVersion = selectedVersion ||
    (project?.versions?.length ? project.versions[0] : null);

  const mockupUrls = activeVersion
    ? JSON.parse(activeVersion.mockup_urls)
    : null;

  async function handleGenerate(prompt) {
    if (!logo) { alert('Please upload a logo first.'); return; }
    try {
      await generateMutation.mutateAsync({ prompt, logo, ref });
      setSelectedVersion(null); // auto-select the latest
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    }
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-bg flex items-center justify-center text-gray-400">
        Loading project...
      </div>
    );
  }
  if (!project) {
    return (
      <div className="h-screen bg-bg flex items-center justify-center text-gray-400">
        Project not found.
      </div>
    );
  }

  const leftPanelContent = (
    <>
      <div>
        <p className="text-white font-semibold truncate">{project.name}</p>
        <p className="text-xs text-gray-500">{project.vehicle_id}</p>
      </div>
      <LogoUpload file={logo} onChange={setLogo} />
      <RefUpload file={ref} onChange={setRef} />
      <VersionHistory
        versions={project.versions || []}
        selectedVersionId={activeVersion?.id}
        onSelect={(v) => setSelectedVersion(v)}
      />
      <ExportButton versionId={activeVersion?.id} />
    </>
  );

  return (
    <WorkspaceLayout
      leftPanelContent={leftPanelContent}
      mockupUrls={mockupUrls}
      isGenerating={generateMutation.isPending}
      onGenerate={handleGenerate}
      canGenerate={!!logo}
    />
  );
}
