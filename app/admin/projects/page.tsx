"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ExternalLink, Image as ImageIcon, Loader2 } from "lucide-react";
import { Project } from "@prisma/client";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/admin/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      setProjects(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin mb-4" />
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your portfolio items and case studies.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[#d94429] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Project
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Projects Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {projects.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-background border border-border rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <ImageIcon size={24} />
            </div>
            <h3 className="text-foreground font-medium mb-1">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Create your first project to showcase your work.</p>
            <Link
              href="/admin/projects/new"
              className="px-4 py-2 bg-border hover:bg-[#3D4450] text-foreground text-sm font-medium rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Project</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Visibility</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-border/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-background border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                          {project.coverImage ? (
                            <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={18} className="text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{project.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">/{project.slug}</span>
                            {project.liveUrl && (
                              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-xs">
                                <ExternalLink size={10} /> Visit
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        project.published 
                          ? "bg-green-500/10 text-green-500 border border-green-500/20" 
                          : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                      }`}>
                        {project.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {project.featured ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          Featured
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/projects/${project.id}/edit`}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-border rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(project.id)}
                          disabled={deleting === project.id}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === project.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
