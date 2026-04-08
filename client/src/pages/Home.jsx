// client/src/pages/Home.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listProjects, createProject, deleteProject } from '../api/projects';
import { useTemplates } from '../hooks/useTemplates';

export default function Home() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: listProjects,
  });
  const { data: templates = [] } = useTemplates();

  const [name, setName] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [showForm, setShowForm] = useState(false);

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(`/project/${project.id}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  });

  function handleCreate(e) {
    e.preventDefault();
    if (!name.trim() || !vehicleId) return;
    createMutation.mutate({ name: name.trim(), vehicle_id: vehicleId });
  }

  return (
    <div className="min-h-screen bg-bg p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">WrapGen</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-electric hover:bg-blue-600 text-white font-semibold px-5 py-2.5 rounded transition-colors"
          >
            + New Project
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-panel border border-border rounded-lg p-6 mb-6"
          >
            <h2 className="text-lg font-semibold mb-4">New Project</h2>
            <div className="flex flex-col gap-3">
              <input
                className="bg-bg border border-border rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-electric"
                placeholder="Project name (e.g. Acme Plumbing Van)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <select
                className="bg-bg border border-border rounded px-3 py-2 text-white focus:outline-none focus:border-electric"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                required
              >
                <option value="">Select vehicle type...</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-lime text-bg font-bold py-2 rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {createMutation.isPending ? 'Creating...' : 'Create Project'}
              </button>
            </div>
            {createMutation.isError && (
              <p className="text-red-400 text-sm mt-2">{createMutation.error.message}</p>
            )}
          </form>
        )}

        {isLoading ? (
          <p className="text-gray-500">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500 text-center py-16">No projects yet. Create your first one above.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-panel border border-border rounded-lg px-5 py-4 flex items-center justify-between hover:border-electric transition-colors cursor-pointer"
                onClick={() => navigate(`/project/${p.id}`)}
              >
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-500">
                    {p.vehicle_id} · {p.version_count} version{p.version_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(p.id); }}
                  className="text-gray-600 hover:text-red-400 text-sm px-2 py-1 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
