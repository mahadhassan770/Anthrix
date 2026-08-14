"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Building, Loader2, ArrowRight } from "lucide-react";
import { Client } from "@prisma/client";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/admin/clients");
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm("Are you sure you want to delete this client? This action cannot be undone.")) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete client");
      
      setClients((prev) => prev.filter((c) => c.id !== id));
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
        <p>Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-display tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your client relationships and CRM data.</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-[#d94429] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Client
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Clients Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {clients.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-background border border-border rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <Building size={24} />
            </div>
            <h3 className="text-foreground font-medium mb-1">No clients yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Add your first client to start managing your CRM.</p>
            <Link
              href="/admin/clients/new"
              className="px-4 py-2 bg-border hover:bg-[#3D4450] text-foreground text-sm font-medium rounded-lg transition-colors"
            >
              Add Client
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Client</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-border/30 transition-colors group relative">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden flex-shrink-0 text-xs font-bold text-muted-foreground">
                          {client.logo ? (
                            <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                          ) : (
                            client.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <Link href={`/admin/clients/${client.id}`} className="font-medium text-foreground hover:text-primary transition-colors before:absolute before:inset-0">
                            {client.name}
                          </Link>
                          {client.company && <p className="text-xs text-muted-foreground mt-0.5">{client.company}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-foreground truncate max-w-[200px]">{client.email || "—"}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{client.phone || "—"}</p>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        client.status === "active" 
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                          : client.status === "lead"
                          ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                      }`}>
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 relative z-10">
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-border rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <ArrowRight size={16} />
                        </Link>
                        <Link
                          href={`/admin/clients/${client.id}/edit`}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-border rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={(e) => handleDelete(client.id, e)}
                          disabled={deleting === client.id}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === client.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
