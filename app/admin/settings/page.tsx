"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import {
  Loader2,
  User,
  Lock,
  Palette,
  Camera,
  ShieldAlert,
  Monitor,
  Sun,
  Moon,
  Laptop,
  CheckCircle,
  Eye,
  EyeOff,
  Bot,
  Zap,
  Shield,
  RefreshCw,
  Save,
  PhoneCall,
  Phone,
  MapPin,
  Mail,
  MailCheck,
  Building,
  KeyRound,
  Sliders,
  Check,
  Sparkles,
  ChevronRight,
  Clock,
  Info,
} from "lucide-react";
import { EmailTemplatesTab } from "./email-templates-tab";

// ─── Default AI System Prompts ────────────────────────────────────────────────

const DEFAULT_COPILOT_PROMPT = `You are the Anthrix AI Solutions Architect & Client Advisor.
- Represent Anthrix Technologies: an elite engineering agency specializing in Autonomous AI Agents, RAG Pipelines, Multi-Tenant SaaS, and Full-Stack Web Architecture.
- Tone: Highly technical, confident, articulate, transparent, and solution-focused.
- Objective: Understand the visitor's product vision, discuss technical feasibility, suggest optimal architectures (Next.js, FastAPI, vector search, n8n), and guide them to schedule a discovery call or request a project quotation.
- Avoid generic buzzwords; provide concrete architectural insights.`;

const DEFAULT_ATS_PROMPT = `You are the Principal Talent Intelligence & Evaluation Engine for Anthrix.
- Domain Agility: Accurately evaluate candidates across ALL departments (Engineering, AI, Sales, Marketing, Video Editing, HR, Finance, Operations, Design, Executive).
- Scoring Standards: Apply a strict, uninflated 5-dimension rubric (Skills Alignment, Experience Depth, Career Trajectory, Quantified Accomplishments, Role Fit).
- Evidence-Based: Reward explicit metrics ($ revenue, % growth, scale, leadership), verify continuous tenure, and penalize keyword stuffing or generic claims.
- Output: Deliver sharp, unbiased summaries, highlighting verified strengths, specific gaps, and clear hiring recommendations.`;

// ─── Settings Page Component ──────────────────────────────────────────────────

export default function SettingsPage() {
  const { data: session, isPending, refetch } = useSession();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<
    "profile" | "contact" | "smtp" | "security" | "appearance" | "templates" | "ai"
  >("profile");

  // Profile & Password State
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // ─── SMTP Email State ───────────────────────────────────────────────────────
  const [smtpSettings, setSmtpSettings] = useState({
    smtpHost: "smtp.gmail.com",
    smtpPort: "465",
    smtpUser: "",
    smtpPass: "",
    smtpFrom: "",
    smtpSecure: true,
  });
  const [smtpShowPass, setSmtpShowPass] = useState(false);
  const [smtpLoading, setSmtpLoading] = useState(false);
  const [smtpTesting, setSmtpTesting] = useState(false);
  const [smtpMsg, setSmtpMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [smtpLoaded, setSmtpLoaded] = useState(false);

  const fillGmailPresets = () => {
    setSmtpSettings((prev) => ({
      ...prev,
      smtpHost: "smtp.gmail.com",
      smtpPort: "465",
      smtpSecure: true,
      smtpFrom: prev.smtpUser
        ? `Anthrix Technologies <${prev.smtpUser}>`
        : prev.smtpFrom || "Anthrix Technologies <yourgmail@gmail.com>",
    }));
  };

  // ─── Contact Details State ──────────────────────────────────────────────────
  const [contactForm, setContactForm] = useState({
    email: "",
    phone: "",
    secondaryPhone: "",
    location: "",
    supportEmail: "",
    workingHours: "",
  });
  const [contactSaving, setContactSaving] = useState(false);
  const [contactMsg, setContactMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [contactLoaded, setContactLoaded] = useState(false);

  // ─── AI Copilot State (Super Admin Only) ────────────────────────────────────
  const [aiSettings, setAiSettings] = useState({
    groqApiKey: "",
    groqModel: "",
    copilotEnabled: true,
    systemPrompt: "",
    atsGroqApiKey: "",
    atsGroqModel: "",
    atsSystemPrompt: "",
    atsAiEnabled: true,
  });
  const [atsShowKey, setAtsShowKey] = useState(false);
  const [atsTesting, setAtsTesting] = useState(false);
  const [aiShowKey, setAiShowKey] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTesting, setAiTesting] = useState(false);
  const [aiMsg, setAiMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [aiLoaded, setAiLoaded] = useState(false);

  const [liveModels, setLiveModels] = useState<string[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [mainModelMsg, setMainModelMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [mainTestMsg, setMainTestMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [atsLiveModels, setAtsLiveModels] = useState<string[]>([]);
  const [atsModelsLoading, setAtsModelsLoading] = useState(false);
  const [atsModelMsg, setAtsModelMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [atsTestMsg, setAtsTestMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchLiveModels = async (keyOverride?: string, modelOverride?: string) => {
    setModelsLoading(true);
    setMainModelMsg(null);
    try {
      const apiKey = keyOverride !== undefined ? keyOverride : aiSettings.groqApiKey;
      const res = await fetch("/api/admin/groq-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, type: "main" }),
      });
      const data = await res.json();
      if (res.ok && data.models && data.models.length > 0) {
        setLiveModels(data.models);
        setAiSettings((prev) => {
          const current = modelOverride !== undefined ? modelOverride : prev.groqModel;
          if (current) return { ...prev, groqModel: current };
          return { ...prev, groqModel: data.models[0] };
        });
        setMainModelMsg({ type: "success", text: `Loaded ${data.models.length} active models from Groq!` });
      } else {
        setMainModelMsg({ type: "error", text: data.error || "Failed to fetch live models. Check API key." });
      }
    } catch (err: any) {
      setMainModelMsg({ type: "error", text: err.message || "Network error fetching models from Groq." });
    } finally {
      setModelsLoading(false);
    }
  };

  const fetchAtsLiveModels = async (keyOverride?: string, modelOverride?: string) => {
    setAtsModelsLoading(true);
    setAtsModelMsg(null);
    try {
      const apiKey = keyOverride !== undefined ? keyOverride : aiSettings.atsGroqApiKey || aiSettings.groqApiKey;
      const res = await fetch("/api/admin/groq-models", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, type: "ats" }),
      });
      const data = await res.json();
      if (res.ok && data.models && data.models.length > 0) {
        setAtsLiveModels(data.models);
        setAiSettings((prev) => {
          const current = modelOverride !== undefined ? modelOverride : prev.atsGroqModel;
          if (current) return { ...prev, atsGroqModel: current };
          return { ...prev, atsGroqModel: data.models[0] };
        });
        setAtsModelMsg({ type: "success", text: `Loaded ${data.models.length} active ATS models from Groq!` });
      } else {
        setAtsModelMsg({ type: "error", text: data.error || "Failed to fetch ATS models. Check API key." });
      }
    } catch (err: any) {
      setAtsModelMsg({ type: "error", text: err.message || "Network error fetching models from Groq." });
    } finally {
      setAtsModelsLoading(false);
    }
  };

  // Sync profile form with session
  useEffect(() => {
    if (session?.user) {
      setProfileForm({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  // Load Contact details
  useEffect(() => {
    if (contactLoaded) return;
    fetch("/api/admin/contact-settings")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setContactForm({
            email: data.email || "",
            phone: data.phone || "",
            secondaryPhone: data.secondaryPhone || "",
            location: data.location || "",
            supportEmail: data.supportEmail || "",
            workingHours: data.workingHours || "",
          });
          setContactLoaded(true);
        }
      })
      .catch(() => {});
  }, [contactLoaded]);

  // Load System & SMTP Settings
  useEffect(() => {
    if (smtpLoaded) return;
    fetch("/api/admin/system-settings")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setSmtpSettings({
            smtpHost: data.smtpHost || "smtp.gmail.com",
            smtpPort: data.smtpPort || "465",
            smtpUser: data.smtpUser || "",
            smtpPass: data.smtpPass || "",
            smtpFrom: data.smtpFrom || "",
            smtpSecure: data.smtpSecure !== false,
          });
          setSmtpLoaded(true);

          if (session?.user?.role === "super_admin") {
            const savedGroqModel = data.groqModel || "";
            const savedAtsGroqModel = data.atsGroqModel || "";
            const loadedAi = {
              groqApiKey: data.groqApiKey || "",
              groqModel: savedGroqModel,
              copilotEnabled: data.copilotEnabled !== false,
              systemPrompt: data.systemPrompt || "",
              atsGroqApiKey: data.atsGroqApiKey || "",
              atsGroqModel: savedAtsGroqModel,
              atsSystemPrompt: data.atsSystemPrompt || "",
              atsAiEnabled: data.atsAiEnabled !== false,
            };
            setAiSettings(loadedAi);
            setAiLoaded(true);
            fetchLiveModels(loadedAi.groqApiKey, savedGroqModel);
            fetchAtsLiveModels(loadedAi.atsGroqApiKey || loadedAi.groqApiKey, savedAtsGroqModel);
          }
        }
      })
      .catch(() => {});
  }, [session, smtpLoaded]);

  // Handlers
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      await authClient.updateUser({ name: profileForm.name });
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      refetch?.();
    } catch {
      setProfileMsg({ type: "error", text: "Failed to update profile." });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (passwordForm.new.length < 8) {
      setPasswordMsg({ type: "error", text: "Password must be at least 8 characters long." });
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: passwordForm.current,
        newPassword: passwordForm.new,
        revokeOtherSessions: true,
      });
      if (error) {
        setPasswordMsg({ type: "error", text: error.message || "Failed to update password." });
      } else {
        setPasswordMsg({ type: "success", text: "Password changed successfully! Other sessions logged out." });
        setPasswordForm({ current: "", new: "", confirm: "" });
      }
    } catch {
      setPasswordMsg({ type: "error", text: "An error occurred while changing password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    setProfileMsg(null);
    try {
      const payload = new FormData();
      payload.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: payload });
      const data = await res.json();
      if (!res.ok || !data.secure_url) throw new Error(data.error || "Upload failed");
      await authClient.updateUser({ image: data.secure_url });
      setProfileMsg({ type: "success", text: "Profile avatar updated successfully!" });
      refetch?.();
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "Failed to upload avatar" });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSaving(true);
    setContactMsg(null);
    try {
      const res = await fetch("/api/admin/contact-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setContactMsg({ type: "success", text: data.message || "Contact details updated successfully!" });
      } else {
        setContactMsg({ type: "error", text: data.error || "Failed to save contact details." });
      }
    } catch {
      setContactMsg({ type: "error", text: "Network error saving contact details." });
    } finally {
      setContactSaving(false);
    }
  };

  const handleSmtpSave = async () => {
    setSmtpLoading(true);
    setSmtpMsg(null);
    try {
      const res = await fetch("/api/admin/system-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtpSettings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSmtpMsg({ type: "success", text: "SMTP configuration saved successfully!" });
      } else {
        setSmtpMsg({ type: "error", text: data.error || "Failed to save SMTP settings." });
      }
    } catch {
      setSmtpMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSmtpLoading(false);
    }
  };

  const handleSmtpTest = async () => {
    setSmtpTesting(true);
    setSmtpMsg(null);
    try {
      const res = await fetch("/api/admin/system-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_smtp_connection", ...smtpSettings }),
      });
      const data = await res.json();
      setSmtpMsg({
        type: data.success ? "success" : "error",
        text: data.message || (data.success ? "SMTP connection verified!" : "SMTP connection failed."),
      });
    } catch {
      setSmtpMsg({ type: "error", text: "Network error during SMTP connection test." });
    } finally {
      setSmtpTesting(false);
    }
  };

  const handleAiSave = async () => {
    setAiLoading(true);
    setAiMsg(null);
    try {
      const res = await fetch("/api/admin/system-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiSettings),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiMsg({ type: "success", text: data.message });
      } else {
        setAiMsg({ type: "error", text: data.error || "Failed to save settings." });
      }
    } catch {
      setAiMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiTest = async () => {
    setAiTesting(true);
    setMainTestMsg(null);
    try {
      const res = await fetch("/api/admin/system-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_connection", ...aiSettings }),
      });
      const data = await res.json();
      setMainTestMsg({
        type: data.success ? "success" : "error",
        text: data.message || (data.success ? "Copilot LLM connection successful!" : "Connection failed."),
      });
      if (data.success) fetchLiveModels();
    } catch {
      setMainTestMsg({ type: "error", text: "Network error during connection test." });
    } finally {
      setAiTesting(false);
    }
  };

  const handleAtsTest = async () => {
    setAtsTesting(true);
    setAtsTestMsg(null);
    try {
      const res = await fetch("/api/admin/system-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test_ats_connection", ...aiSettings }),
      });
      const data = await res.json();
      setAtsTestMsg({
        type: data.success ? "success" : "error",
        text: data.message || (data.success ? "ATS LLM connection successful!" : "ATS Connection failed."),
      });
      if (data.success) fetchAtsLiveModels();
    } catch {
      setAtsTestMsg({ type: "error", text: "Network error during ATS connection test." });
    } finally {
      setAtsTesting(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin mb-4 text-[#F55036]" />
        <p className="text-sm font-medium">Loading preferences &amp; configurations...</p>
      </div>
    );
  }

  const isSuperAdmin = session?.user?.role === "super_admin";
  const avatar = (session?.user as any)?.image;
  const initials = profileForm.name?.charAt(0).toUpperCase() || "A";

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "contact", label: "Company Info", icon: Building },
    { id: "smtp", label: "Email & SMTP", icon: Mail },
    { id: "security", label: "Security", icon: Lock },
    { id: "appearance", label: "Appearance", icon: Palette },
    ...(isSuperAdmin
      ? [
          { id: "templates", label: "Email Templates", icon: MailCheck },
          { id: "ai", label: "AI Engines", icon: Bot },
        ]
      : []),
  ];

  return (
    <div className="w-full space-y-6">
      {/* ─── Compact User Identity Card ────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#F55036]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            {/* Avatar with Camera Overlay */}
            <div
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0C1019] to-card border border-border flex items-center justify-center shadow-inner overflow-hidden cursor-pointer group relative flex-shrink-0"
              onClick={() => fileInputRef.current?.click()}
              title="Click to change avatar"
            >
              {avatar ? (
                <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-bold text-foreground font-mono">{initials}</span>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {avatarUploading ? <Loader2 size={16} className="text-white animate-spin" /> : <Camera size={16} className="text-white" />}
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
                  {profileForm.name || "Administrator"}
                </h1>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${
                    isSuperAdmin
                      ? "bg-[#F55036]/10 border-[#F55036]/25 text-[#F55036]"
                      : "bg-purple-500/10 border-purple-500/25 text-purple-400"
                  }`}
                >
                  {isSuperAdmin ? "Super Admin" : "Admin"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">{profileForm.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refetch?.()}
            className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted/40 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            <RefreshCw size={12} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* ─── Material Segmented Pill Navigation ──────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-1.5 flex items-center gap-1 overflow-x-auto shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                setProfileMsg(null);
                setPasswordMsg(null);
                setSmtpMsg(null);
                setContactMsg(null);
                setAiMsg(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex-1 justify-center ${
                isActive
                  ? "bg-[#F55036] text-white shadow-[0_0_15px_rgba(245,80,54,0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── TAB CONTENTS ────────────────────────────────────────────────────── */}
      <div className="min-w-0">
        {/* ── TAB 1: PROFILE ── */}
        {activeTab === "profile" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {profileMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center gap-2.5 ${
                  profileMsg.type === "error"
                    ? "bg-rose-500/10 border-rose-500/25 text-rose-400"
                    : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                }`}
              >
                {profileMsg.type === "error" ? <ShieldAlert size={15} /> : <CheckCircle size={15} />}
                <span>{profileMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-foreground">General Profile Information</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Update your display name and photo representation across the admin dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-semibold focus:border-[#F55036] outline-none transition-colors"
                    placeholder="Your Name"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Email Address (Fixed)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={profileForm.email}
                    className="w-full bg-background/50 border border-border rounded-xl px-3.5 py-2.5 text-xs text-muted-foreground opacity-60 cursor-not-allowed outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-border">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {profileLoading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {profileLoading ? "Updating..." : "Save Profile"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 2: COMPANY INFO (CONTACT) ── */}
        {activeTab === "contact" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {contactMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center gap-2.5 ${
                  contactMsg.type === "error"
                    ? "bg-rose-500/10 border-rose-500/25 text-rose-400"
                    : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                }`}
              >
                {contactMsg.type === "error" ? <ShieldAlert size={15} /> : <CheckCircle size={15} />}
                <span>{contactMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleContactSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-foreground">Agency Business &amp; Contact Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Public telephone numbers, inboxes, and studio location shown on the Contact page, Footer, and Invoices.
                </p>
              </div>

              {/* Phones */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Phone size={13} className="text-[#F55036]" /> Phone Numbers
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Primary Contact Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      placeholder="+1 (415) 123-4567 or +92 300 1234567"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono focus:border-[#F55036] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Secondary / WhatsApp Line
                    </label>
                    <input
                      type="text"
                      value={contactForm.secondaryPhone}
                      onChange={(e) => setContactForm({ ...contactForm, secondaryPhone: e.target.value })}
                      placeholder="+92 321 7654321"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono focus:border-[#F55036] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Emails */}
              <div className="space-y-3 pt-3 border-t border-border/60">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Mail size={13} className="text-[#F55036]" /> Inboxes &amp; Routing
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Primary Inquiries Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="hello@anthrix.dev"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Support &amp; Billing Email
                    </label>
                    <input
                      type="email"
                      value={contactForm.supportEmail}
                      onChange={(e) => setContactForm({ ...contactForm, supportEmail: e.target.value })}
                      placeholder="billing@anthrix.com"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Hours */}
              <div className="space-y-3 pt-3 border-t border-border/60">
                <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#F55036]" /> Location &amp; Operating Hours
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Operating Location *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.location}
                      onChange={(e) => setContactForm({ ...contactForm, location: e.target.value })}
                      placeholder="San Francisco, CA or Lahore, Pakistan"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Working Hours
                    </label>
                    <input
                      type="text"
                      value={contactForm.workingHours}
                      onChange={(e) => setContactForm({ ...contactForm, workingHours: e.target.value })}
                      placeholder="Mon - Fri: 9:00 AM - 6:00 PM"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Visitor Chips Preview */}
              <div className="p-3.5 rounded-xl bg-background/60 border border-border space-y-2">
                <p className="text-[10px] font-mono uppercase font-bold text-muted-foreground tracking-wider">
                  Live Footer &amp; Contact Preview
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border font-medium">
                    <Mail size={12} className="text-[#F55036]" /> {contactForm.email || "hello@anthrix.dev"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border font-medium">
                    <Phone size={12} className="text-[#F55036]" /> {contactForm.phone || "+1 (415) 123-4567"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border font-medium">
                    <MapPin size={12} className="text-[#F55036]" /> {contactForm.location || "San Francisco, CA"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-border">
                <button
                  type="submit"
                  disabled={contactSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {contactSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {contactSaving ? "Saving..." : "Save Company Details"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TAB 3: EMAIL & SMTP ── */}
        {activeTab === "smtp" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {smtpMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center gap-2.5 ${
                  smtpMsg.type === "error"
                    ? "bg-rose-500/10 border-rose-500/25 text-rose-400"
                    : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                }`}
              >
                {smtpMsg.type === "error" ? <ShieldAlert size={15} /> : <CheckCircle size={15} />}
                <span>{smtpMsg.text}</span>
              </div>
            )}

            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">SMTP Email Server &amp; Dispatcher</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Configure your delivery credentials for candidate confirmations, interview invitations, and status notices.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={fillGmailPresets}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F55036]/10 border border-[#F55036]/25 text-[#F55036] hover:bg-[#F55036]/20 text-xs font-bold transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Zap size={12} />
                  <span>Fill Gmail Presets</span>
                </button>
              </div>

              {/* Quick Setup Callout */}
              <div className="p-4 rounded-xl bg-background/60 border border-border space-y-2 text-xs text-muted-foreground leading-relaxed">
                <p className="font-bold text-foreground flex items-center gap-1.5">
                  <Shield size={13} className="text-[#F55036]" /> Quick Gmail Instructions:
                </p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Ensure 2-Step Verification is active on your Google Account.</li>
                  <li>
                    Generate an App Password at{" "}
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#F55036] underline"
                    >
                      myaccount.google.com/apppasswords
                    </a>{" "}
                    (Name it "Anthrix ATS").
                  </li>
                  <li>Enter your full Gmail address and paste the 16-character generated password below.</li>
                </ol>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    SMTP Host Server *
                  </label>
                  <input
                    type="text"
                    required
                    value={smtpSettings.smtpHost}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpHost: e.target.value })}
                    placeholder="smtp.gmail.com"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono focus:border-[#F55036] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Port *
                    </label>
                    <input
                      type="text"
                      required
                      value={smtpSettings.smtpPort}
                      onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPort: e.target.value })}
                      placeholder="465"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono focus:border-[#F55036] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      Protocol
                    </label>
                    <select
                      value={smtpSettings.smtpSecure ? "true" : "false"}
                      onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpSecure: e.target.value === "true" })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none cursor-pointer"
                    >
                      <option value="true">SSL (465)</option>
                      <option value="false">TLS (587)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    SMTP Username / Gmail Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={smtpSettings.smtpUser}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpUser: e.target.value })}
                    placeholder="hiring@anthrix.com"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    SMTP App Password *
                  </label>
                  <div className="relative">
                    <input
                      type={smtpShowPass ? "text" : "password"}
                      required
                      value={smtpSettings.smtpPass}
                      onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPass: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 pr-10 text-xs text-foreground focus:border-[#F55036] outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setSmtpShowPass(!smtpShowPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {smtpShowPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Sender Identity (From Header) *
                  </label>
                  <input
                    type="text"
                    required
                    value={smtpSettings.smtpFrom}
                    onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpFrom: e.target.value })}
                    placeholder="Anthrix Technologies <hiring@anthrix.com>"
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:border-[#F55036] outline-none"
                  />
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleSmtpTest}
                  disabled={smtpTesting || !smtpSettings.smtpUser || !smtpSettings.smtpPass}
                  className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted/40 text-xs font-semibold text-foreground transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {smtpTesting ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                  {smtpTesting ? "Testing Connection..." : "Test Connection"}
                </button>

                <button
                  type="button"
                  onClick={handleSmtpSave}
                  disabled={smtpLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {smtpLoading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {smtpLoading ? "Saving..." : "Save SMTP Settings"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: SECURITY & PASSWORD ── */}
        {activeTab === "security" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {passwordMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center gap-2.5 ${
                  passwordMsg.type === "error"
                    ? "bg-rose-500/10 border-rose-500/25 text-rose-400"
                    : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                }`}
              >
                {passwordMsg.type === "error" ? <ShieldAlert size={15} /> : <CheckCircle size={15} />}
                <span>{passwordMsg.text}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-foreground">Update Password &amp; Session Tokens</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Change your administrator password. Other active sessions will be automatically revoked.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                {[
                  { label: "Current Password", key: "current" as const },
                  { label: "New Password", key: "new" as const },
                  { label: "Confirm New Password", key: "confirm" as const },
                ].map((field) => (
                  <div key={field.key} className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      {field.label} *
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords[field.key] ? "text" : "password"}
                        required
                        value={passwordForm[field.key]}
                        onChange={(e) => setPasswordForm({ ...passwordForm, [field.key]: e.target.value })}
                        placeholder="••••••••••••"
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 pr-10 text-xs text-foreground font-mono focus:border-[#F55036] outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords((p) => ({ ...p, [field.key]: !p[field.key] }))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPasswords[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-border">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {passwordLoading ? <Loader2 size={13} className="animate-spin" /> : <Lock size={13} />}
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>

            {/* Active Session Info Card */}
            <div className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Monitor size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Current Active Session</p>
                  <p className="text-[11px] text-muted-foreground">Connected via browser session token</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                ACTIVE
              </span>
            </div>
          </div>
        )}

        {/* ── TAB 5: APPEARANCE ── */}
        {activeTab === "appearance" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
              <div>
                <h3 className="text-sm font-bold text-foreground">Interface Theme &amp; Presentation</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose your dashboard appearance. Themes are applied instantly.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {[
                  { id: "dark", label: "Dark Theme", desc: "Anthrix obsidian aesthetic", icon: Moon },
                  { id: "light", label: "Light Theme", desc: "High contrast clean surface", icon: Sun },
                  { id: "system", label: "System Default", desc: "Syncs with OS preferences", icon: Laptop },
                ].map((opt) => {
                  const isSelected = theme === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTheme(opt.id)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                        isSelected
                          ? "bg-[#F55036]/8 border-[#F55036] shadow-sm"
                          : "bg-background border-border hover:border-[#F55036]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected
                              ? "bg-[#F55036] text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F55036] text-white">
                            Active
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-foreground">{opt.label}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{opt.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: EMAIL TEMPLATES (SUPER ADMIN) ── */}
        {activeTab === "templates" && isSuperAdmin && (
          <div className="animate-in fade-in duration-200">
            <EmailTemplatesTab isSuperAdmin={isSuperAdmin} />
          </div>
        )}

        {/* ── TAB 7: AI INTELLIGENCE ENGINES (SUPER ADMIN) ── */}
        {activeTab === "ai" && isSuperAdmin && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {aiMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold border flex items-center gap-2.5 ${
                  aiMsg.type === "error"
                    ? "bg-rose-500/10 border-rose-500/25 text-rose-400"
                    : "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                }`}
              >
                {aiMsg.type === "error" ? <ShieldAlert size={15} /> : <CheckCircle size={15} />}
                <span>{aiMsg.text}</span>
              </div>
            )}

            {/* 1. Website Client Copilot */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F55036]/10 border border-[#F55036]/25 flex items-center justify-center text-[#F55036]">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Website Solutions Copilot</h3>
                    <p className="text-xs text-muted-foreground">
                      Client-facing AI advisor that answers questions and guides prospects.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAiSettings((p) => ({ ...p, copilotEnabled: !p.copilotEnabled }))}
                    className={`text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                      aiSettings.copilotEnabled
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-zinc-500/10 border-zinc-500/30 text-zinc-500"
                    }`}
                  >
                    {aiSettings.copilotEnabled ? "● Copilot Active" : "○ Copilot Disabled"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    Groq API Key
                  </label>
                  <div className="relative">
                    <input
                      type={aiShowKey ? "text" : "password"}
                      value={aiSettings.groqApiKey}
                      onChange={(e) => setAiSettings({ ...aiSettings, groqApiKey: e.target.value })}
                      placeholder="gsk_..."
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 pr-10 text-xs text-foreground font-mono focus:border-[#F55036] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setAiShowKey(!aiShowKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {aiShowKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Model
                    </label>
                    <button
                      type="button"
                      onClick={() => fetchLiveModels()}
                      disabled={modelsLoading}
                      className="text-[11px] font-bold text-[#F55036] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {modelsLoading ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                      <span>Fetch Models</span>
                    </button>
                  </div>

                  <select
                    value={aiSettings.groqModel}
                    onChange={(e) => setAiSettings({ ...aiSettings, groqModel: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono focus:border-[#F55036] outline-none cursor-pointer"
                  >
                    {liveModels.length > 0 ? (
                      liveModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))
                    ) : (
                      <option value={aiSettings.groqModel || ""}>
                        {aiSettings.groqModel || "Click 'Fetch Models'"}
                      </option>
                    )}
                  </select>
                </div>
              </div>

              {mainTestMsg && (
                <p className={`text-xs font-semibold ${mainTestMsg.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                  {mainTestMsg.text}
                </p>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Copilot System Persona Prompt
                  </label>
                  <button
                    type="button"
                    onClick={() => setAiSettings((p) => ({ ...p, systemPrompt: DEFAULT_COPILOT_PROMPT }))}
                    className="text-[11px] text-muted-foreground hover:text-foreground font-mono"
                  >
                    Reset to Default
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={aiSettings.systemPrompt}
                  onChange={(e) => setAiSettings({ ...aiSettings, systemPrompt: e.target.value })}
                  placeholder={DEFAULT_COPILOT_PROMPT}
                  className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground font-mono focus:border-[#F55036] outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleAiTest}
                  disabled={aiTesting}
                  className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted/40 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {aiTesting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  <span>Test Copilot Connection</span>
                </button>
              </div>
            </div>

            {/* 2. ATS Resume Evaluation Intelligence */}
            <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">ATS Resume Scoring Engine</h3>
                    <p className="text-xs text-muted-foreground">
                      Automated 5-dimension candidate evaluation and match scoring engine.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAiSettings((p) => ({ ...p, atsAiEnabled: !p.atsAiEnabled }))}
                    className={`text-xs font-bold px-3 py-1 rounded-full border transition-all cursor-pointer ${
                      aiSettings.atsAiEnabled
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : "bg-zinc-500/10 border-zinc-500/30 text-zinc-500"
                    }`}
                  >
                    {aiSettings.atsAiEnabled ? "● ATS Active" : "○ ATS Paused"}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                    ATS Dedicated API Key (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type={atsShowKey ? "text" : "password"}
                      value={aiSettings.atsGroqApiKey}
                      onChange={(e) => setAiSettings({ ...aiSettings, atsGroqApiKey: e.target.value })}
                      placeholder="Leave blank to reuse main Groq key"
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 pr-10 text-xs text-foreground font-mono focus:border-[#F55036] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setAtsShowKey(!atsShowKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {atsShowKey ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      ATS Scoring Model
                    </label>
                    <button
                      type="button"
                      onClick={() => fetchAtsLiveModels()}
                      disabled={atsModelsLoading}
                      className="text-[11px] font-bold text-[#F55036] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {atsModelsLoading ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                      <span>Fetch Models</span>
                    </button>
                  </div>

                  <select
                    value={aiSettings.atsGroqModel}
                    onChange={(e) => setAiSettings({ ...aiSettings, atsGroqModel: e.target.value })}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono focus:border-[#F55036] outline-none cursor-pointer"
                  >
                    {atsLiveModels.length > 0 ? (
                      atsLiveModels.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))
                    ) : (
                      <option value={aiSettings.atsGroqModel || ""}>
                        {aiSettings.atsGroqModel || "Click 'Fetch Models'"}
                      </option>
                    )}
                  </select>
                </div>
              </div>

              {atsTestMsg && (
                <p className={`text-xs font-semibold ${atsTestMsg.type === "success" ? "text-emerald-400" : "text-rose-400"}`}>
                  {atsTestMsg.text}
                </p>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    ATS Evaluation Rubric Prompt
                  </label>
                  <button
                    type="button"
                    onClick={() => setAiSettings((p) => ({ ...p, atsSystemPrompt: DEFAULT_ATS_PROMPT }))}
                    className="text-[11px] text-muted-foreground hover:text-foreground font-mono"
                  >
                    Reset to Default
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={aiSettings.atsSystemPrompt}
                  onChange={(e) => setAiSettings({ ...aiSettings, atsSystemPrompt: e.target.value })}
                  placeholder={DEFAULT_ATS_PROMPT}
                  className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground font-mono focus:border-[#F55036] outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={handleAtsTest}
                  disabled={atsTesting}
                  className="px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-muted/40 text-xs font-semibold text-foreground transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {atsTesting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                  <span>Test ATS Connection</span>
                </button>

                <button
                  type="button"
                  onClick={handleAiSave}
                  disabled={aiLoading}
                  className="px-6 py-2.5 rounded-xl bg-[#F55036] text-white text-xs font-bold shadow-[0_0_15px_rgba(245,80,54,0.3)] hover:bg-[#F55036]/90 transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                  {aiLoading ? "Saving..." : "Save AI Configurations"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
