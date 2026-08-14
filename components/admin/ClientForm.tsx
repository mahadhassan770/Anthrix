"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Client } from "@prisma/client";
import { Loader2, ImagePlus, X, Building, Mail, Phone, AlignLeft } from "lucide-react";

type ClientFormData = {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  notes: string;
  logo: string;
};

export default function ClientForm({ client }: { client?: Client }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState<ClientFormData>({
    name: client?.name || "",
    company: client?.company || "",
    email: client?.email || "",
    phone: client?.phone || "",
    status: client?.status || "active",
    notes: client?.notes || "",
    logo: client?.logo || "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setError("");
      
      const payload = new FormData();
      payload.append("file", file);
      payload.append("folder", "agency_portfolio");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: payload,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setFormData((prev) => ({ ...prev, logo: data.url }));
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = client ? `/api/admin/clients/${client.id}` : "/api/admin/clients";
      const method = client ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save client");
      }

      const savedClient = await res.json();
      router.push(`/admin/clients/${savedClient.id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-8 pb-16">
      
      {/* Top Actions */}
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border sticky top-6 z-10">
        <h1 className="text-xl font-bold text-foreground">
          {client ? "Edit Client" : "New Client"}
        </h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-[#d94429] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {client ? "Save Changes" : "Create Client"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card p-6 rounded-xl border border-border space-y-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Contact Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Contact Name</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors"
                  placeholder="e.g. Jane Doe"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Building size={14} /> Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors"
                  placeholder="e.g. Acme Corp"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail size={14} /> Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors"
                  placeholder="jane@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone size={14} /> Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            
            <div className="space-y-1.5 pt-4 border-t border-border">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <AlignLeft size={14} /> Internal Notes
              </label>
              <textarea
                rows={6}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:border-primary outline-none transition-colors"
                placeholder="Details about onboarding, special requests, meeting summaries..."
              />
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          
          {/* Logo Upload */}
          <div className="bg-card p-6 rounded-xl border border-border space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Company Logo
            </h2>
            
            <div 
              className="relative aspect-square w-full max-w-[200px] mx-auto rounded-full border-2 border-dashed border-border bg-background flex flex-col items-center justify-center overflow-hidden group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {formData.logo ? (
                <>
                  <img src={formData.logo} alt="Logo" className="object-cover w-full h-full" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">Change</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData({ ...formData, logo: "" });
                    }}
                    className="absolute top-4 right-4 p-1.5 bg-red-500 rounded-md text-white hover:bg-red-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : uploadingImage ? (
                <div className="flex flex-col items-center text-muted-foreground">
                  <Loader2 size={24} className="animate-spin mb-2" />
                </div>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                  <ImagePlus size={24} className="mb-2" />
                  <span className="text-xs font-medium">Upload</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          {/* Status Settings */}
          <div className="bg-card p-6 rounded-xl border border-border space-y-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Status
            </h2>

            <div className="space-y-3">
              {[
                { id: "active", label: "Active", desc: "Currently engaged", color: "bg-emerald-500" },
                { id: "lead", label: "Lead", desc: "Potential client", color: "bg-blue-500" },
                { id: "inactive", label: "Inactive", desc: "Past client", color: "bg-zinc-500" },
              ].map((statusOpt) => (
                <label 
                  key={statusOpt.id} 
                  className={`flex items-start p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.status === statusOpt.id 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-background border-border hover:border-white/20"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={statusOpt.id}
                    checked={formData.status === statusOpt.id}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="mt-1 sr-only"
                  />
                  <div className={`w-3 h-3 rounded-full mt-1 mr-3 flex-shrink-0 ${statusOpt.color}`} />
                  <div>
                    <p className={`text-sm font-medium ${formData.status === statusOpt.id ? "text-primary" : "text-foreground"}`}>
                      {statusOpt.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{statusOpt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </form>
  );
}
