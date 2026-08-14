"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2, ListTree } from "lucide-react";
import { Service } from "@prisma/client";

type ServiceWithCounts = Service & {
  _count?: {
    offerings: number;
  };
};

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const res = await fetch("/api/admin/services");
      if (!res.ok) throw new Error("Failed to fetch services");
      const data = await res.json();
      setServices(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service? All related offerings will be deleted too.")) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete service");
      
      setServices((prev) => prev.filter((p) => p.id !== id));
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
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Services & Practice Areas</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your main service pillars and sub-offerings.</p>
        </div>
        <Link
          href="/admin/services/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[#d94429] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Service
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Services Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {services.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-background border border-border rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <ListTree size={24} />
            </div>
            <h3 className="text-foreground font-medium mb-1">No services yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Create your first main practice area.</p>
            <Link
              href="/admin/services/new"
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
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service Pillar</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Offerings</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-border/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-background border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                          {service.icon ? (
                            <span className="text-muted-foreground text-xs">{service.icon}</span>
                          ) : (
                            <ListTree size={18} className="text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{service.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">/{service.slug}</span>
                            {service.tagline && (
                              <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                                {service.tagline}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-muted-foreground font-mono text-sm">{service.order}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border">
                        {service._count?.offerings || 0} Modules
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/services/${service.id}/edit`}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-border rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(service.id)}
                          disabled={deleting === service.id}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === service.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
