"use client";

import { useState, useEffect } from "react";
import {
  MailCheck,
  Plus,
  Trash2,
  Edit3,
  Eye,
  RefreshCw,
  Search,
  Check,
  Copy,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
  FileText,
  Tag,
  Send,
} from "lucide-react";
import {
  StoredEmailTemplate,
  TemplateCategory,
  renderTemplateText,
} from "@/lib/ats-email-templates";
import { useModal } from "@/components/admin/ui/modals";

const CATEGORY_COLORS: Record<TemplateCategory, { bg: string; text: string; border: string }> = {
  interview: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/25" },
  assessment: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/25" },
  offer: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/25" },
  rejection: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/25" },
  status: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/25" },
  custom: { bg: "bg-gray-500/10", text: "text-gray-300", border: "border-gray-500/25" },
};

const SAMPLE_VARS = {
  name: "Mahnoor Seemab",
  jobTitle: "Business Development Executive",
  department: "Growth & Partnerships",
  matchedSkills: ["B2B Sales", "Client Acquisition", "Lead Outreach"],
};

export function EmailTemplatesTab({ isSuperAdmin }: { isSuperAdmin: boolean }) {
  const { confirm, alert } = useModal();
  const [templates, setTemplates] = useState<StoredEmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Notification Toast
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Editor Modal State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<StoredEmailTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "interview" as TemplateCategory,
    subject: "",
    body: "",
  });
  const [saving, setSaving] = useState(false);
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");

  // Preview Modal State
  const [previewTemplate, setPreviewTemplate] = useState<StoredEmailTemplate | null>(null);

  // Delete Confirm State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Reset Confirm State
  const [resetting, setResetting] = useState(false);

  // Variable chip copied indicator
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-templates");
      const data = await res.json();
      if (data.templates) {
        setTemplates(data.templates);
      }
    } catch (err: any) {
      setMsg({ type: "error", text: "Failed to load email templates: " + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Clear toast after 5s
  useEffect(() => {
    if (msg) {
      const t = setTimeout(() => setMsg(null), 5000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  if (!isSuperAdmin) {
    return (
      <div className="p-8 rounded-2xl bg-card border border-border text-center space-y-3">
        <AlertCircle size={36} className="text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-foreground">Access Restricted</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Email template management is strictly restricted to Super Administrators.
        </p>
      </div>
    );
  }

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      category: "interview",
      subject: "Update regarding your application for {jobTitle} at Anthrix",
      body: `Hi {name},

Thank you for your interest in joining Anthrix and applying for the {jobTitle} position.

[Write your message here]

Best regards,
Anthrix Hiring Team
https://anthrix.com`,
    });
    setEditorTab("edit");
    setEditorOpen(true);
  };

  const handleOpenEdit = (template: StoredEmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      category: template.category,
      subject: template.subject,
      body: template.body,
    });
    setEditorTab("edit");
    setEditorOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.subject.trim() || !formData.body.trim()) {
      setMsg({ type: "error", text: "Template name, subject line, and email body are required." });
      return;
    }

    setSaving(true);
    try {
      const action = editingTemplate ? "update" : "create";
      const payload: any = {
        action,
        name: formData.name.trim(),
        category: formData.category,
        subject: formData.subject.trim(),
        body: formData.body.trim(),
      };
      if (editingTemplate) {
        payload.id = editingTemplate.id;
      }

      const res = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save template");
      }

      setTemplates(data.templates);
      setEditorOpen(false);
      setMsg({
        type: "success",
        text: editingTemplate
          ? `Template "${formData.name}" updated successfully!`
          : `New template "${formData.name}" created successfully!`,
      });
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to save template" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (templateId: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", templateId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setTemplates(data.templates);
      setDeletingId(null);
      setMsg({ type: "success", text: "Template deleted successfully." });
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to delete" });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: "Reset Email Templates",
      message: "Are you sure you want to reset all email templates to system defaults? Any custom templates will be replaced.",
      confirmText: "Reset Templates",
      variant: "warning",
    });
    if (!confirmed) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset");
      setTemplates(data.templates);
      setMsg({ type: "success", text: "Email templates reset to default presets." });
    } catch (err: any) {
      setMsg({ type: "error", text: err.message || "Failed to reset" });
    } finally {
      setResetting(false);
    }
  };

  const copyVariable = (varStr: string) => {
    navigator.clipboard.writeText(varStr);
    setCopiedVar(varStr);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const insertVariableIntoBody = (varStr: string) => {
    setFormData((prev) => ({
      ...prev,
      body: prev.body + ` ${varStr}`,
    }));
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories: { id: string; label: string }[] = [
    { id: "all", label: "All Templates" },
    { id: "interview", label: "Interview" },
    { id: "assessment", label: "Assessment" },
    { id: "offer", label: "Job Offer" },
    { id: "status", label: "Application Status" },
    { id: "rejection", label: "Rejection" },
    { id: "custom", label: "Custom" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Toast Notification */}
      {msg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-sm font-medium ${
            msg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/30 text-rose-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {msg.type === "success" ? <Check size={18} /> : <AlertCircle size={18} />}
            <span>{msg.text}</span>
          </div>
          <button onClick={() => setMsg(null)} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#080B12] to-[#0D1117] border border-[#F55036]/20 p-6 lg:p-8">
        <div className="absolute inset-0 bg-[#F55036]/5 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F55036]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#F55036]/10 border border-[#F55036]/30 flex items-center justify-center flex-shrink-0">
              <MailCheck size={24} className="text-[#F55036]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">Recruitment Email Templates</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F55036]/10 border border-[#F55036]/30 text-[#F55036] tracking-wider uppercase">
                  Super Admin Only
                </span>
              </div>
              <p className="text-xs text-white/50 max-w-xl leading-relaxed">
                Configure, customize, and author all automated status emails, interview invitations, assessment rounds, and job offers dispatched to applicants.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleReset}
              disabled={resetting}
              className="px-3.5 py-2 rounded-xl border border-border bg-card/60 hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 disabled:opacity-50"
              title="Reset all templates to default system presets"
            >
              <RefreshCw size={14} className={resetting ? "animate-spin" : ""} />
              Reset Defaults
            </button>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 rounded-xl bg-[#F55036] hover:bg-[#F55036]/90 text-white text-xs font-bold shadow-[0_0_20px_rgba(245,80,54,0.35)] transition-all flex items-center gap-1.5"
            >
              <Plus size={15} />
              Add Template
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === c.id
                  ? "bg-[#F55036] text-white shadow-sm"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl bg-card border border-border text-foreground focus:border-[#F55036] outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Templates List / Grid */}
      {loading ? (
        <div className="p-16 rounded-2xl bg-card border border-border flex flex-col items-center justify-center text-muted-foreground">
          <Loader2 size={32} className="animate-spin text-[#F55036] mb-3" />
          <p className="text-xs">Loading email templates...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="p-16 rounded-2xl bg-card border border-border text-center space-y-3">
          <FileText size={36} className="text-muted-foreground/40 mx-auto" />
          <p className="text-sm font-semibold text-foreground">No templates found</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery
              ? `No templates matched "${searchQuery}". Try a different search term.`
              : "No templates exist in this category yet. Click 'Add Template' to author one."}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="px-3 py-1.5 rounded-lg bg-muted text-xs font-semibold text-foreground hover:bg-muted/80"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map((tmpl) => {
            const catStyle = CATEGORY_COLORS[tmpl.category] || CATEGORY_COLORS.custom;
            return (
              <div
                key={tmpl.id}
                className="group relative rounded-2xl bg-card border border-border hover:border-[#F55036]/40 p-5 transition-all flex flex-col justify-between hover:shadow-lg"
              >
                <div className="space-y-3">
                  {/* Card Top */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-[#F55036] transition-colors line-clamp-1">
                        {tmpl.name}
                      </h3>
                      <p className="text-[11px] font-mono text-muted-foreground/70 mt-0.5">ID: {tmpl.id}</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider flex-shrink-0 ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                    >
                      {tmpl.category}
                    </span>
                  </div>

                  {/* Subject preview */}
                  <div className="p-2.5 rounded-xl bg-background/80 border border-border/60">
                    <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                      Subject Line:
                    </p>
                    <p className="text-xs font-semibold text-foreground line-clamp-1">
                      {tmpl.subject}
                    </p>
                  </div>

                  {/* Body Snippet */}
                  <div>
                    <p className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                      Body Preview:
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-line leading-relaxed font-sans">
                      {tmpl.body}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between gap-2">
                  <span className="text-[10px] text-muted-foreground/60">
                    {tmpl.isSystem ? "System Preset" : "Custom Template"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewTemplate(tmpl)}
                      className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-all flex items-center gap-1"
                      title="Preview email as applicant"
                    >
                      <Eye size={14} />
                      <span className="hidden sm:inline">Preview</span>
                    </button>
                    <button
                      onClick={() => handleOpenEdit(tmpl)}
                      className="p-2 rounded-xl bg-[#F55036]/10 hover:bg-[#F55036]/20 text-[#F55036] text-xs font-bold transition-all flex items-center gap-1"
                      title="Edit template"
                    >
                      <Edit3 size={14} />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingId(tmpl.id)}
                      className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all flex items-center gap-1"
                      title="Delete template"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── MODAL: TEMPLATE EDITOR (CREATE / EDIT) ─────────────────────────── */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F55036]/10 border border-[#F55036]/30 flex items-center justify-center">
                  <MailCheck size={20} className="text-[#F55036]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {editingTemplate ? `Edit Template: ${editingTemplate.name}` : "Create New Email Template"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Only super administrators have permission to save template modifications.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditorOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="px-6 pt-4 flex items-center gap-2 border-b border-border/40">
              <button
                onClick={() => setEditorTab("edit")}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-all ${
                  editorTab === "edit"
                    ? "border-[#F55036] text-[#F55036]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Template Editor
              </button>
              <button
                onClick={() => setEditorTab("preview")}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  editorTab === "preview"
                    ? "border-[#F55036] text-[#F55036]"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Eye size={13} />
                Live Preview
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[calc(85vh-200px)] overflow-y-auto">
              {editorTab === "edit" ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        Template Name <span className="text-[#F55036]">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Technical Screening Round 2"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border text-foreground focus:border-[#F55036] outline-none font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        Category <span className="text-[#F55036]">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as TemplateCategory })}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border text-foreground focus:border-[#F55036] outline-none font-semibold cursor-pointer"
                      >
                        <option value="interview">Interview Invitation</option>
                        <option value="assessment">Practical Assessment</option>
                        <option value="offer">Job Offer</option>
                        <option value="status">Application Status</option>
                        <option value="rejection">Polite Rejection</option>
                        <option value="custom">Custom / General</option>
                      </select>
                    </div>
                  </div>

                  {/* Variables Helper Bar */}
                  <div className="p-3 rounded-xl bg-muted/40 border border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Sparkles size={12} className="text-[#F55036]" />
                        Available Dynamic Variables (Click to insert):
                      </span>
                      {copiedVar && (
                        <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                          <Check size={12} /> Copied {copiedVar}!
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {[
                        { token: "{name}", desc: "Applicant Name" },
                        { token: "{jobTitle}", desc: "Job Title" },
                        { token: "{department}", desc: "Department" },
                        { token: "{matchedSkills}", desc: "Top Skills" },
                      ].map((v) => (
                        <button
                          key={v.token}
                          type="button"
                          onClick={() => {
                            insertVariableIntoBody(v.token);
                            copyVariable(v.token);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-background border border-border hover:border-[#F55036] text-[11px] font-mono text-foreground hover:text-[#F55036] transition-colors flex items-center gap-1"
                          title={`Insert ${v.token} (${v.desc})`}
                        >
                          <code>{v.token}</code>
                          <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">({v.desc})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject Line */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Subject Line <span className="text-[#F55036]">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Interview Invitation: {jobTitle} at Anthrix"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-background border border-border text-foreground focus:border-[#F55036] outline-none font-semibold"
                    />
                  </div>

                  {/* Email Body */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Email Body (Plain Text & Linebreaks) <span className="text-[#F55036]">*</span>
                    </label>
                    <textarea
                      rows={10}
                      value={formData.body}
                      onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                      placeholder="Write your email body..."
                      className="w-full px-4 py-3 text-xs font-sans rounded-xl bg-background border border-border text-foreground focus:border-[#F55036] outline-none leading-relaxed resize-y"
                    />
                  </div>
                </>
              ) : (
                /* Live Preview Pane */
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground flex items-center justify-between">
                    <span>
                      Previewing with sample candidate: <strong className="text-foreground">Mahnoor Seemab</strong>
                    </span>
                    <span className="text-[11px] font-mono">Role: Business Development Executive</span>
                  </div>

                  {/* Simulated Email Client */}
                  <div className="rounded-xl border border-border overflow-hidden bg-background">
                    <div className="p-3 bg-muted/30 border-b border-border space-y-1.5 text-xs">
                      <p>
                        <strong className="text-muted-foreground font-mono">From:</strong>{" "}
                        <span className="text-foreground">Anthrix Hiring Team &lt;careers@anthrix.com&gt;</span>
                      </p>
                      <p>
                        <strong className="text-muted-foreground font-mono">To:</strong>{" "}
                        <span className="text-foreground">Mahnoor Seemab &lt;mahnoor@example.com&gt;</span>
                      </p>
                      <p>
                        <strong className="text-muted-foreground font-mono">Subject:</strong>{" "}
                        <strong className="text-foreground">
                          {renderTemplateText(formData.subject, SAMPLE_VARS) || "(No Subject)"}
                        </strong>
                      </p>
                    </div>

                    <div className="p-6 whitespace-pre-line text-xs font-sans leading-relaxed text-foreground bg-card">
                      {renderTemplateText(formData.body, SAMPLE_VARS) || "(No Body)"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#F55036] hover:bg-[#F55036]/90 text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {editingTemplate ? "Save Changes" : "Create Template"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: FULL PREVIEW ───────────────────────────────────────────── */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-[#F55036]" />
                <h3 className="text-sm font-bold text-foreground">
                  Preview: {previewTemplate.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="p-3.5 bg-muted/40 border-b border-border space-y-1 text-xs">
                  <p>
                    <strong className="text-muted-foreground font-mono">From:</strong>{" "}
                    <span className="text-foreground">Anthrix Hiring Team &lt;careers@anthrix.com&gt;</span>
                  </p>
                  <p>
                    <strong className="text-muted-foreground font-mono">To:</strong>{" "}
                    <span className="text-foreground">Mahnoor Seemab &lt;mahnoorseemab81@gmail.com&gt;</span>
                  </p>
                  <p>
                    <strong className="text-muted-foreground font-mono">Subject:</strong>{" "}
                    <strong className="text-foreground font-bold">
                      {renderTemplateText(previewTemplate.subject, SAMPLE_VARS)}
                    </strong>
                  </p>
                </div>
                <div className="p-6 whitespace-pre-line text-xs font-sans leading-relaxed text-foreground bg-background">
                  {renderTemplateText(previewTemplate.body, SAMPLE_VARS)}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-border bg-muted/20 flex items-center justify-end">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL: DELETE CONFIRMATION ────────────────────────────────────── */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-card border border-rose-500/30 p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-400">
              <Trash2 size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-foreground">Delete Email Template?</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Are you sure you want to delete this template? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                disabled={deleteLoading}
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-border bg-muted/50 hover:bg-muted text-xs font-semibold text-foreground"
              >
                Cancel
              </button>
              <button
                disabled={deleteLoading}
                onClick={() => handleDelete(deletingId)}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
              >
                {deleteLoading && <Loader2 size={13} className="animate-spin" />}
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
