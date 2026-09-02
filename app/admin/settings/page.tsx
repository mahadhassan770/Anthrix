"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import {
  Loader2, User, Lock, Palette, Camera, ShieldAlert, Monitor, Sun, Moon, Laptop, CheckCircle, Eye, EyeOff,
  Bot, Zap, Shield, RefreshCw, FlaskConical, Save, PhoneCall, Phone, MapPin, Mail, Clock,
} from "lucide-react";





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

export default function SettingsPage() {
  const { data: session, isPending, refetch } = useSession();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<"profile" | "contact" | "smtp" | "security" | "appearance" | "ai">("profile");
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });

  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // ─── SMTP Email State (Admin & Super Admin) ──────────────────────────────
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
      smtpFrom: prev.smtpUser ? `Anthrix Technologies <${prev.smtpUser}>` : prev.smtpFrom || "Anthrix Technologies <yourgmail@gmail.com>",
    }));
  };

  // ─── Contact Details State (Admin & Super Admin) ──────────────────────────
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

  // ─── AI Copilot State (Super Admin Only) ──────────────────────────────────
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

  // Live models fetched dynamically from Groq API
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
          if (current) {
            return { ...prev, groqModel: current };
          }
          return { ...prev, groqModel: data.models[0] };
        });
        setMainModelMsg({ type: "success", text: `Successfully loaded ${data.models.length} active models directly from Groq!` });
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
      const apiKey = keyOverride !== undefined ? keyOverride : (aiSettings.atsGroqApiKey || aiSettings.groqApiKey);
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
          if (current) {
            return { ...prev, atsGroqModel: current };
          }
          return { ...prev, atsGroqModel: data.models[0] };
        });
        setAtsModelMsg({ type: "success", text: `Successfully loaded ${data.models.length} active ATS models directly from Groq!` });
      } else {
        setAtsModelMsg({ type: "error", text: data.error || "Failed to fetch ATS models. Check API key." });
      }
    } catch (err: any) {
      setAtsModelMsg({ type: "error", text: err.message || "Network error fetching models from Groq." });
    } finally {
      setAtsModelsLoading(false);
    }
  };

  // Sync form with session once loaded
  useEffect(() => {
    if (session?.user) {
      setProfileForm({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  // ─── Load Contact Details (Admin & Super Admin) ───────────────────────────
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

  // ─── Load System & SMTP Settings ──────────────────────────────────────────
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
      if (data.success) {
        fetchLiveModels();
      }
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
      if (data.success) {
        fetchAtsLiveModels();
      }
    } catch {
      setAtsTestMsg({ type: "error", text: "Network error during ATS connection test." });
    } finally {
      setAtsTesting(false);
    }
  };

  // ─── Contact Details Update (Admin & Super Admin) ─────────────────────────
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
        if (data.settings) {
          setContactForm(data.settings);
        }
      } else {
        setContactMsg({ type: "error", text: data.error || "Failed to save contact details." });
      }
    } catch {
      setContactMsg({ type: "error", text: "Network error. Please try again." });
    } finally {
      setContactSaving(false);
    }
  };

  // ─── Profile Update ───────────────────────────────────────────────────────
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);

    const { error } = await authClient.updateUser({ name: profileForm.name });

    if (error) {
      setProfileMsg({ type: "error", text: error.message || "Failed to update profile." });
    } else {
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      refetch?.();
    }
    setProfileLoading(false);
  };

  // ─── Avatar Upload ────────────────────────────────────────────────────────
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setProfileMsg(null);

    try {
      const payload = new FormData();
      payload.append("file", file);
      payload.append("folder", "agency_portfolio");

      const res = await fetch("/api/upload", { method: "POST", body: payload });
      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      const { error } = await authClient.updateUser({ image: url });

      if (error) throw new Error(error.message);
      setProfileMsg({ type: "success", text: "Avatar updated successfully!" });
      refetch?.();
    } catch (err: any) {
      setProfileMsg({ type: "error", text: err.message || "Failed to upload avatar." });
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ─── Password Change ──────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (passwordForm.new.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }

    setPasswordLoading(true);

    const { error } = await authClient.changePassword({
      currentPassword: passwordForm.current,
      newPassword: passwordForm.new,
      revokeOtherSessions: true,
    });

    if (error) {
      setPasswordMsg({ type: "error", text: error.message || "Failed to change password. Check your current password." });
    } else {
      setPasswordMsg({ type: "success", text: "Password changed successfully! Other sessions have been signed out." });
      setPasswordForm({ current: "", new: "", confirm: "" });
    }
    setPasswordLoading(false);
  };

  // ─── Theme Options ────────────────────────────────────────────────────────
  const themeOptions = [
    {
      id: "light",
      label: "Light",
      desc: "Clean and bright interface",
      icon: Sun,
      preview: (
        <div className="w-full h-20 rounded-xl overflow-hidden border border-gray-200 bg-white flex">
          <div className="w-12 h-full bg-gray-100 border-r border-gray-200 flex flex-col gap-1.5 p-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-1.5 rounded-full bg-gray-300 w-full" />)}
          </div>
          <div className="flex-1 p-3 flex flex-col gap-2">
            <div className="h-2 rounded-full bg-gray-200 w-3/4" />
            <div className="flex-1 rounded-lg bg-gray-50 border border-gray-200" />
          </div>
        </div>
      ),
    },
    {
      id: "dark",
      label: "Dark",
      desc: "Industrial Carbon — easy on eyes",
      icon: Moon,
      preview: (
        <div className="w-full h-20 rounded-xl overflow-hidden border border-[#2D323B] bg-[#0F1115] flex">
          <div className="w-12 h-full bg-[#1C1F26] border-r border-[#2D323B] flex flex-col gap-1.5 p-2">
            {[...Array(4)].map((_, i) => <div key={i} className="h-1.5 rounded-full bg-[#2D323B] w-full" />)}
          </div>
          <div className="flex-1 p-3 flex flex-col gap-2">
            <div className="h-2 rounded-full bg-[#2D323B] w-3/4" />
            <div className="flex-1 rounded-lg bg-[#1C1F26] border border-[#2D323B]" />
          </div>
        </div>
      ),
    },
    {
      id: "system",
      label: "System",
      desc: "Follows your OS preference",
      icon: Laptop,
      preview: (
        <div className="w-full h-20 rounded-xl overflow-hidden border border-gray-200 flex">
          <div className="w-1/2 h-full bg-white flex flex-col">
            <div className="h-5 bg-gray-100 border-b border-gray-200" />
            <div className="flex-1 p-1.5 flex flex-col gap-1">
              <div className="h-1.5 rounded-full bg-gray-200 w-3/4" />
              <div className="flex-1 rounded bg-gray-50" />
            </div>
          </div>
          <div className="w-1/2 h-full bg-[#0F1115] flex flex-col">
            <div className="h-5 bg-[#1C1F26] border-b border-[#2D323B]" />
            <div className="flex-1 p-1.5 flex flex-col gap-1">
              <div className="h-1.5 rounded-full bg-[#2D323B] w-3/4" />
              <div className="flex-1 rounded bg-[#1C1F26]" />
            </div>
          </div>
        </div>
      ),
    },
  ];

  const isSuperAdmin = session?.user?.role === "super_admin";

  const tabs = [
    { id: "profile", label: "General", icon: User, desc: "Personal info and avatar" },
    { id: "contact", label: "Contact Info", icon: PhoneCall, desc: "Phones, email & location" },
    { id: "smtp", label: "Email & SMTP", icon: Mail, desc: "Gmail / SMTP email dispatch" },
    { id: "security", label: "Security", icon: Lock, desc: "Passwords and authentication" },
    { id: "appearance", label: "Appearance", icon: Palette, desc: "Theme and interface" },
    ...(isSuperAdmin ? [{ id: "ai", label: "AI Copilot", icon: Bot, desc: "LLM engine & configuration" }] : []),
  ];

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 size={32} className="animate-spin mb-4 text-primary" />
        <p>Loading preferences...</p>
      </div>
    );
  }

  const avatar = (session?.user as any)?.image;
  const initials = profileForm.name?.charAt(0).toUpperCase() || "A";

  return (
    <div className="w-full space-y-8 pb-16">

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-card to-background border border-border p-8 lg:p-10">
        <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="relative z-10 flex items-center gap-6">
          <div
            className="w-20 h-20 rounded-2xl bg-background border border-border flex items-center justify-center shadow-2xl flex-shrink-0 overflow-hidden cursor-pointer group relative"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatar ? (
              <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-foreground font-display">{initials}</span>
            )}
            <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {avatarUploading ? <Loader2 size={20} className="text-white animate-spin" /> : <Camera size={20} className="text-white" />}
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display tracking-tight mb-1">
              {profileForm.name || "Admin"}
            </h1>
            <p className="text-muted-foreground">{profileForm.email}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">

        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-col space-y-2 sticky top-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setProfileMsg(null); setPasswordMsg(null); }}
                  className={`flex flex-col items-start px-5 py-4 rounded-xl text-left transition-all duration-200 ${
                    isActive ? "bg-card border border-border shadow-lg" : "bg-transparent border border-transparent hover:bg-card/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <Icon size={16} className={isActive ? "text-primary" : "text-muted-foreground"} />
                    <span className={`font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{tab.label}</span>
                  </div>
                  <span className={`text-xs pl-7 ${isActive ? "text-muted-foreground" : "text-muted-foreground/60"}`}>{tab.desc}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">

          {/* ─── PROFILE TAB ─────────────────────────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

              {profileMsg && (
                <div className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${
                  profileMsg.type === "error"
                    ? "bg-destructive/10 border-destructive/20 text-destructive"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                }`}>
                  {profileMsg.type === "error" ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
                  {profileMsg.text}
                </div>
              )}

              {/* Avatar Card */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 sm:p-8 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-1">Profile Photo</h2>
                    <p className="text-sm text-muted-foreground">Click the photo in the header to upload a new avatar.</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                  <div
                    className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center overflow-hidden cursor-pointer group relative"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {avatar ? (
                      <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-foreground">{initials}</span>
                    )}
                    <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {avatarUploading ? <Loader2 size={14} className="text-white animate-spin" /> : <Camera size={14} className="text-white" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & Email Form */}
              <form onSubmit={handleProfileSubmit} className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-1">Personal Info</h2>
                    <p className="text-sm text-muted-foreground">Update your display name shown across the admin panel.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Display Name</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all"
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Email Address</label>
                      <input
                        type="email"
                        disabled
                        value={profileForm.email}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-muted-foreground opacity-70 cursor-not-allowed outline-none"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-background/50 p-4 sm:px-8 border-t border-border flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Max 32 characters.</p>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-5 py-2.5 bg-foreground hover:opacity-90 text-background text-sm font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {profileLoading && <Loader2 size={16} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ─── CONTACT DETAILS TAB (ADMIN & SUPER ADMIN) ─────────────────── */}
          {activeTab === "contact" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

              {/* Status Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-card to-background border border-border p-6 sm:p-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <PhoneCall size={22} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-1 font-display">Business & Contact Information</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage phone numbers, emails, and location displayed across the Contact page, Footer, and Invoices.
                    </p>
                  </div>
                </div>
              </div>

              {contactMsg && (
                <div className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${
                  contactMsg.type === "error"
                    ? "bg-destructive/10 border-destructive/20 text-destructive"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                }`}>
                  {contactMsg.type === "error" ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
                  {contactMsg.text}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 sm:p-8 space-y-6">

                  {/* Section 1: Phone Numbers */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Phone size={16} className="text-primary" />
                      <h3 className="text-base font-bold text-foreground">Phone Numbers</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">Direct calling lines for sales, clients, and technical support.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Primary Phone Number *</label>
                        <input
                          type="text"
                          required
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all font-mono text-sm"
                          placeholder="+1 (415) 123-4567 or +92 300 1234567"
                        />
                        <p className="text-[11px] text-muted-foreground">Displayed as main contact line in the header & footer.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Secondary Phone Number (Optional)</label>
                        <input
                          type="text"
                          value={contactForm.secondaryPhone}
                          onChange={(e) => setContactForm({ ...contactForm, secondaryPhone: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all font-mono text-sm"
                          placeholder="+92 321 7654321 (WhatsApp / Backup Line)"
                        />
                        <p className="text-[11px] text-muted-foreground">Alternative or WhatsApp direct support number.</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Email Addresses */}
                  <div className="pt-6 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail size={16} className="text-primary" />
                      <h3 className="text-base font-bold text-foreground">Email Addresses</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">Inboxes where project inquiries, RFPs, and billing queries are routed.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Primary Contact Email *</label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all text-sm"
                          placeholder="hello@anthrix.dev"
                        />
                        <p className="text-[11px] text-muted-foreground">Main inquiry email shown on the Contact page & Footer.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Support & Billing Email</label>
                        <input
                          type="email"
                          value={contactForm.supportEmail}
                          onChange={(e) => setContactForm({ ...contactForm, supportEmail: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all text-sm"
                          placeholder="contact@anthrix.com"
                        />
                        <p className="text-[11px] text-muted-foreground">Used on invoices and client portal receipts.</p>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Location & Hours */}
                  <div className="pt-6 border-t border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={16} className="text-primary" />
                      <h3 className="text-base font-bold text-foreground">Studio Location & Working Hours</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">Location information and operational availability hours.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Operating Location *</label>
                        <input
                          type="text"
                          required
                          value={contactForm.location}
                          onChange={(e) => setContactForm({ ...contactForm, location: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all text-sm"
                          placeholder="San Francisco, CA or Lahore, Pakistan"
                        />
                        <p className="text-[11px] text-muted-foreground">City and region displayed on the Contact page and Footer.</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Working / Support Hours</label>
                        <input
                          type="text"
                          value={contactForm.workingHours}
                          onChange={(e) => setContactForm({ ...contactForm, workingHours: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all text-sm"
                          placeholder="Mon - Fri: 9:00 AM - 6:00 PM"
                        />
                        <p className="text-[11px] text-muted-foreground">Operating schedule shown to prospective clients.</p>
                      </div>
                    </div>
                  </div>

                  {/* Live Preview of Chips */}
                  <div className="pt-6 border-t border-border/50">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Live Preview (How it appears to visitors)</p>
                    <div className="flex flex-wrap gap-3 p-4 rounded-xl bg-background/50 border border-border">
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-xs">
                        <Mail size={13} className="text-primary" />
                        <span className="text-muted-foreground">Email:</span>
                        <span className="font-semibold text-foreground">{contactForm.email || "hello@anthrix.dev"}</span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-xs">
                        <Phone size={13} className="text-primary" />
                        <span className="text-muted-foreground">Phone:</span>
                        <span className="font-semibold text-foreground">{contactForm.phone || "+1 (415) 123-4567"}</span>
                      </div>
                      {contactForm.secondaryPhone && (
                        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-xs">
                          <PhoneCall size={13} className="text-emerald-500" />
                          <span className="text-muted-foreground">Secondary:</span>
                          <span className="font-semibold text-foreground">{contactForm.secondaryPhone}</span>
                        </div>
                      )}
                      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-xs">
                        <MapPin size={13} className="text-primary" />
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-semibold text-foreground">{contactForm.location || "San Francisco, CA"}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Footer Save Button */}
                <div className="bg-background/50 p-4 sm:px-8 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle size={14} className="text-emerald-500" />
                    <span>Available to both Admins and Super Admins</span>
                  </div>
                  <button
                    type="submit"
                    disabled={contactSaving}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold rounded-lg transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20"
                  >
                    {contactSaving && <Loader2 size={16} className="animate-spin" />}
                    Save Contact Details
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ─── EMAIL & SMTP TAB ─────────────────────────────────────────── */}
          {activeTab === "smtp" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

              {/* Status Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-card to-background border border-border p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
                      <Mail size={22} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground mb-1 font-display">Email & SMTP Delivery Engine</h2>
                      <p className="text-sm text-muted-foreground">
                        Configure Gmail or custom SMTP to send automated candidate confirmations, interview invites, and offers.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={fillGmailPresets}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-all active:scale-95"
                  >
                    <Zap size={14} /> Fill with Gmail Presets
                  </button>
                </div>
              </div>

              {/* Feedback Message */}
              {smtpMsg && (
                <div className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${
                  smtpMsg.type === "error"
                    ? "bg-destructive/10 border-destructive/20 text-destructive"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                }`}>
                  {smtpMsg.type === "error" ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
                  {smtpMsg.text}
                </div>
              )}

              {/* Gmail App Password Setup Instructions Alert */}
              <div className="p-5 rounded-2xl bg-primary/[0.03] border border-primary/20 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-primary">
                  <Shield size={15} /> How to connect your Gmail (Free & Takes 1 Minute)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted-foreground leading-relaxed">
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <strong className="text-foreground block mb-1">1. Enable 2-Step Verification</strong>
                    Turn on 2-Step Verification in your Google Account security settings.
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <strong className="text-foreground block mb-1">2. Generate App Password</strong>
                    Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-primary underline">Google App Passwords</a>, name it <code className="text-primary font-mono font-bold">Anthrix ATS</code>, and generate a 16-character key.
                  </div>
                  <div className="p-3 rounded-xl bg-background border border-border">
                    <strong className="text-foreground block mb-1">3. Paste Below & Test</strong>
                    Enter your Gmail address, paste the 16-character key below, and click <strong className="text-foreground">Test Connection</strong>!
                  </div>
                </div>
              </div>

              {/* SMTP Form */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* SMTP Host */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-foreground">SMTP Host Server *</label>
                      <input
                        type="text"
                        required
                        value={smtpSettings.smtpHost}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpHost: e.target.value })}
                        placeholder="smtp.gmail.com or smtp.hostinger.com"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all font-mono text-sm"
                      />
                      <p className="text-[11px] text-muted-foreground">For Gmail, use <code className="font-mono text-foreground">smtp.gmail.com</code>.</p>
                    </div>

                    {/* SMTP Port & Security */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground">SMTP Port *</label>
                        <input
                          type="text"
                          required
                          value={smtpSettings.smtpPort}
                          onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPort: e.target.value })}
                          placeholder="465"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all font-mono text-sm"
                        />
                        <p className="text-[11px] text-muted-foreground">465 (SSL) or 587 (TLS).</p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-foreground">SSL / TLS</label>
                        <select
                          value={smtpSettings.smtpSecure ? "true" : "false"}
                          onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpSecure: e.target.value === "true" })}
                          className="w-full bg-background border border-border rounded-xl px-3 py-3 text-foreground focus:border-primary outline-none transition-all font-mono text-sm"
                        >
                          <option value="true">SSL (Port 465)</option>
                          <option value="false">TLS / STARTTLS (Port 587)</option>
                        </select>
                      </div>
                    </div>

                    {/* SMTP Username / Email */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-foreground">SMTP Username / Gmail Address *</label>
                      <input
                        type="email"
                        required
                        value={smtpSettings.smtpUser}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpUser: e.target.value })}
                        placeholder="yourname@gmail.com"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all text-sm font-mono"
                      />
                      <p className="text-[11px] text-muted-foreground">Your full email address used for login.</p>
                    </div>

                    {/* SMTP Password / Google App Password */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Password / Google App Password *</label>
                      <div className="relative">
                        <input
                          type={smtpShowPass ? "text" : "password"}
                          required
                          value={smtpSettings.smtpPass}
                          onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpPass: e.target.value })}
                          placeholder="16-character Google App Password"
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 text-foreground focus:border-primary outline-none transition-all font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setSmtpShowPass(!smtpShowPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {smtpShowPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">For Gmail, paste your 16-character App Password.</p>
                    </div>

                    {/* Sender 'From' Header */}
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Sender "From" Header</label>
                      <input
                        type="text"
                        value={smtpSettings.smtpFrom}
                        onChange={(e) => setSmtpSettings({ ...smtpSettings, smtpFrom: e.target.value })}
                        placeholder='Anthrix Technologies <yourname@gmail.com>'
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all text-sm"
                      />
                      <p className="text-[11px] text-muted-foreground">The display name and sender address candidates see in their inbox.</p>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="bg-background/50 p-4 sm:px-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleSmtpTest}
                    disabled={smtpTesting || !smtpSettings.smtpHost || !smtpSettings.smtpUser || !smtpSettings.smtpPass}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    {smtpTesting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {smtpTesting ? "Testing SMTP Authentication..." : "Test SMTP Connection"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSmtpSave}
                    disabled={smtpLoading}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                  >
                    {smtpLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save SMTP Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── SECURITY TAB ─────────────────────────────────────────────────── */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

              {passwordMsg && (
                <div className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${
                  passwordMsg.type === "error"
                    ? "bg-destructive/10 border-destructive/20 text-destructive"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                }`}>
                  {passwordMsg.type === "error" ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-lg font-bold text-foreground mb-1">Change Password</h2>
                    <p className="text-sm text-muted-foreground">
                      Ensure your account uses a strong, unique password. Changing it will sign out all other active sessions.
                    </p>
                  </div>

                  <div className="space-y-5 pt-4 border-t border-border/50 max-w-md">
                    {[
                      { label: "Current Password", key: "current" as const },
                      { label: "New Password", key: "new" as const },
                      { label: "Confirm New Password", key: "confirm" as const },
                    ].map((field) => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">{field.label}</label>
                        <div className="relative">
                          <input
                            type={showPasswords[field.key] ? "text" : "password"}
                            required
                            value={passwordForm[field.key]}
                            onChange={(e) => setPasswordForm({ ...passwordForm, [field.key]: e.target.value })}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 text-foreground focus:border-primary outline-none transition-all font-mono"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(p => ({ ...p, [field.key]: !p[field.key] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPasswords[field.key] ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                        {field.key === "new" && (
                          <p className="text-xs text-muted-foreground">Must be at least 8 characters.</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-background/50 p-4 sm:px-8 border-t border-border flex items-center justify-end">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2.5 bg-destructive hover:bg-red-600 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {passwordLoading && <Loader2 size={16} className="animate-spin" />}
                    Update Password
                  </button>
                </div>
              </form>

              {/* Active Sessions */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-foreground mb-1">Active Sessions</h2>
                  <p className="text-sm text-muted-foreground mb-4">Devices currently logged into your account.</p>
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Monitor size={18} className="text-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">Current Device</p>
                      <p className="text-xs text-muted-foreground">Active now</p>
                    </div>
                    <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-1 rounded-full font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── APPEARANCE TAB ───────────────────────────────────────────────── */}
          {activeTab === "appearance" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-foreground mb-1">Interface Theme</h2>
                  <p className="text-sm text-muted-foreground mb-8">
                    Choose how the admin panel looks. Your preference is applied instantly and saved automatically.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {themeOptions.map((opt) => {
                      const isSelected = theme === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setTheme(opt.id)}
                          className={`relative group flex flex-col gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                            isSelected ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/30"
                          }`}
                        >
                          {opt.preview}

                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isSelected ? "border-primary bg-primary" : "border-border"
                            }`}>
                              {isSelected && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 5L4 7L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                          </div>

                          {isSelected && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                              Active
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-background/50 p-4 sm:px-8 border-t border-border flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs text-muted-foreground">Theme is applied instantly and saved to your browser's local storage.</p>
                </div>
              </div>
            </div>
          )}

          {/* ─── AI COPILOT TAB (SUPER ADMIN ONLY) ─────────────────────────── */}
          {activeTab === "ai" && isSuperAdmin && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">

              {/* Status Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#080B12] to-[#0D1117] border border-[#F55036]/20 p-6">
                <div className="absolute inset-0 bg-[#F55036]/5" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#F55036]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                <div className="relative flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F55036]/10 border border-[#F55036]/30 flex items-center justify-center flex-shrink-0">
                    <Bot size={22} className="text-[#F55036]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-white">Anthrix A-OS Copilot Engine</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F55036]/10 border border-[#F55036]/30 text-[#F55036] tracking-wider uppercase">Super Admin</span>
                    </div>
                    <p className="text-sm text-white/50">Powered by High-Speed LLM Inference Engine · Ultra-Low Latency</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${aiSettings.copilotEnabled ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-white/30"}`}>
                      {aiSettings.copilotEnabled ? "● Active" : "○ Disabled"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback Message */}
              {aiMsg && (
                <div className={`p-4 rounded-xl text-sm font-medium border flex items-center gap-3 ${
                  aiMsg.type === "error"
                    ? "bg-red-500/10 border-red-500/20 text-red-400"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                }`}>
                  {aiMsg.type === "error" ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
                  {aiMsg.text}
                </div>
              )}

              {/* LLM API Key */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Zap size={15} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-foreground">LLM API Configuration</h3>
                      <p className="text-xs text-muted-foreground">Connect your AI inference provider API key</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    {/* API Key Field */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">LLM API Key</label>
                      <div className="relative">
                        <input
                          type={aiShowKey ? "text" : "password"}
                          value={aiSettings.groqApiKey}
                          onChange={(e) => setAiSettings({ ...aiSettings, groqApiKey: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 text-foreground focus:border-primary outline-none transition-all font-mono text-sm"
                          placeholder="Enter your LLM API Key (e.g. gsk_...)"
                        />
                        <button
                          type="button"
                          onClick={() => setAiShowKey(!aiShowKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {aiShowKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Model Selection with Dedicated Fetch Button */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-foreground">Copilot LLM Model</label>
                        <button
                          type="button"
                          onClick={() => fetchLiveModels()}
                          disabled={modelsLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                          title="Fetch all live active models from Groq API"
                        >
                          {modelsLoading ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                          {modelsLoading ? "Fetching Models..." : "⚡ Fetch Available Models"}
                        </button>
                      </div>

                      {mainModelMsg && (
                        <div className={`p-2.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                          mainModelMsg.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}>
                          {mainModelMsg.type === "success" ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
                          <span>{mainModelMsg.text}</span>
                        </div>
                      )}

                      <select
                        value={aiSettings.groqModel}
                        onChange={(e) => setAiSettings({ ...aiSettings, groqModel: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all text-sm font-mono"
                        disabled={modelsLoading}
                      >
                        {(() => {
                          const options = [...liveModels];
                          if (aiSettings.groqModel && !options.includes(aiSettings.groqModel)) {
                            options.unshift(aiSettings.groqModel);
                          }
                          if (options.length === 0) {
                            return (
                              <option value={aiSettings.groqModel || ""}>
                                {aiSettings.groqModel ? `${aiSettings.groqModel} (Saved)` : "Click '⚡ Fetch Available Models' above"}
                              </option>
                            );
                          }
                          return options.map((modelId) => (
                            <option key={modelId} value={modelId}>
                              {modelId}
                            </option>
                          ));
                        })()}
                      </select>
                      <p className="text-xs text-muted-foreground">
                        {liveModels.length > 0
                          ? `Showing ${liveModels.length} active models. Click "⚡ Fetch Available Models" to refresh live from Groq.`
                          : "Click the Fetch button above to load all live models from your Groq account."}
                      </p>
                    </div>

                    {/* Enable/Disable Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                      <div>
                        <p className="text-sm font-semibold text-foreground">Copilot Enabled</p>
                        <p className="text-xs text-muted-foreground">Show the Anthrix AI Copilot HUD on the public website</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAiSettings({ ...aiSettings, copilotEnabled: !aiSettings.copilotEnabled })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${aiSettings.copilotEnabled ? "bg-primary" : "bg-border"}`}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${aiSettings.copilotEnabled ? "translate-x-6" : "translate-x-0"}`} />
                      </button>
                    </div>

                    {/* Copilot Custom System Prompt */}
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-foreground">Custom Copilot System Prompt</label>
                        <button
                          type="button"
                          onClick={() => setAiSettings((prev) => ({ ...prev, systemPrompt: DEFAULT_COPILOT_PROMPT }))}
                          className="text-xs text-primary hover:underline font-medium cursor-pointer"
                        >
                          Use Recommended Prompt
                        </button>
                      </div>
                      <textarea
                        value={aiSettings.systemPrompt}
                        onChange={(e) => setAiSettings({ ...aiSettings, systemPrompt: e.target.value })}
                        rows={4}
                        placeholder={DEFAULT_COPILOT_PROMPT}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all text-xs font-mono resize-none leading-relaxed"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Custom instructions appended to the website sales advisor copilot.
                      </p>
                    </div>

                    {/* Test Copilot LLM Connection Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleAiTest}
                        disabled={aiTesting}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {aiTesting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        {aiTesting ? "Testing Copilot Connection..." : "Test LLM Connection"}
                      </button>
                    </div>

                    {mainTestMsg && (
                      <div className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                        mainTestMsg.type === "success"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-red-500/10 border-red-500/30 text-red-400"
                      }`}>
                        {mainTestMsg.type === "success" ? <CheckCircle size={15} /> : <ShieldAlert size={15} />}
                        <span>{mainTestMsg.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Dedicated ATS & Talent Intake AI Engine Card */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Bot size={16} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-foreground">ATS & Talent Intake AI Engine</h3>
                        <p className="text-xs text-muted-foreground">Dedicated LLM API key and model for resume scoring and candidate pipelines</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      Isolated ATS Model
                    </span>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    {/* Master AI Processing & Scoring Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-background border border-border">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">AI Processing & Resume Scoring</p>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            aiSettings.atsAiEnabled
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : "bg-zinc-500/10 border-zinc-500/30 text-zinc-400"
                          }`}>
                            {aiSettings.atsAiEnabled ? "ACTIVE" : "PAUSED"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Automatically parse resumes, calculate 0–100 match scores, and generate talent dossiers upon submission
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAiSettings({ ...aiSettings, atsAiEnabled: !aiSettings.atsAiEnabled })}
                        className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 ml-4 ${
                          aiSettings.atsAiEnabled ? "bg-emerald-500" : "bg-border"
                        }`}
                        title={aiSettings.atsAiEnabled ? "Click to pause AI scoring" : "Click to activate AI scoring"}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                            aiSettings.atsAiEnabled ? "left-7" : "left-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* ATS API Key */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-foreground">ATS Groq API Key</label>
                        <span className="text-[11px] text-muted-foreground">Optional · Falls back to Copilot key if empty</span>
                      </div>
                      <div className="relative">
                        <input
                          type={atsShowKey ? "text" : "password"}
                          value={aiSettings.atsGroqApiKey}
                          onChange={(e) => setAiSettings({ ...aiSettings, atsGroqApiKey: e.target.value })}
                          className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 text-foreground focus:border-primary outline-none transition-all font-mono text-sm"
                          placeholder="Separate Groq API Key for ATS (e.g. gsk_...)"
                        />
                        <button
                          type="button"
                          onClick={() => setAtsShowKey(!atsShowKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {atsShowKey ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* ATS Model Selection with Dedicated Fetch Button */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-foreground">ATS Evaluation Model</label>
                        <button
                          type="button"
                          onClick={() => fetchAtsLiveModels()}
                          disabled={atsModelsLoading}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                          title="Fetch all live active models for ATS from Groq API"
                        >
                          {atsModelsLoading ? <Loader2 size={13} className="animate-spin" /> : <Zap size={13} />}
                          {atsModelsLoading ? "Fetching Models..." : "⚡ Fetch Available Models"}
                        </button>
                      </div>

                      {atsModelMsg && (
                        <div className={`p-2.5 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                          atsModelMsg.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-red-500/10 border-red-500/30 text-red-400"
                        }`}>
                          {atsModelMsg.type === "success" ? <CheckCircle size={14} /> : <ShieldAlert size={14} />}
                          <span>{atsModelMsg.text}</span>
                        </div>
                      )}

                      <select
                        value={aiSettings.atsGroqModel}
                        onChange={(e) => setAiSettings({ ...aiSettings, atsGroqModel: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all text-sm font-mono"
                        disabled={atsModelsLoading}
                      >
                        {(() => {
                          const options = [...atsLiveModels];
                          if (aiSettings.atsGroqModel && !options.includes(aiSettings.atsGroqModel)) {
                            options.unshift(aiSettings.atsGroqModel);
                          }
                          if (options.length === 0) {
                            return (
                              <option value={aiSettings.atsGroqModel || ""}>
                                {aiSettings.atsGroqModel ? `${aiSettings.atsGroqModel} (Saved)` : "Click '⚡ Fetch Available Models' above"}
                              </option>
                            );
                          }
                          return options.map((modelId) => (
                            <option key={modelId} value={modelId}>
                              {modelId}
                            </option>
                          ));
                        })()}
                      </select>
                      <p className="text-xs text-muted-foreground">
                        Used to parse resumes against requirements, calculate 0–100 match scores, and auto-generate candidate emails.
                      </p>
                    </div>

                    {/* ATS Custom Evaluation Directives */}
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-foreground">Custom ATS Evaluation Directives</label>
                        <button
                          type="button"
                          onClick={() => setAiSettings((prev) => ({ ...prev, atsSystemPrompt: DEFAULT_ATS_PROMPT }))}
                          className="text-xs text-emerald-400 hover:underline font-medium cursor-pointer"
                        >
                          Use Recommended Directives
                        </button>
                      </div>
                      <textarea
                        value={aiSettings.atsSystemPrompt}
                        onChange={(e) => setAiSettings({ ...aiSettings, atsSystemPrompt: e.target.value })}
                        rows={4}
                        placeholder={DEFAULT_ATS_PROMPT}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground focus:border-primary outline-none transition-all text-xs font-mono resize-none leading-relaxed"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Custom hiring standards & evaluation directives injected into the ATS resume scoring engine.
                      </p>
                    </div>

                    {/* Test ATS Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleAtsTest}
                        disabled={atsTesting}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        {atsTesting ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        {atsTesting ? "Testing ATS Connection..." : "Test ATS LLM Connection"}
                      </button>
                    </div>

                    {atsTestMsg && (
                      <div className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                        atsTestMsg.type === "success"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-red-500/10 border-red-500/30 text-red-400"
                      }`}>
                        {atsTestMsg.type === "success" ? <CheckCircle size={15} /> : <ShieldAlert size={15} />}
                        <span>{atsTestMsg.text}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>



              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-card border border-border">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Save Configuration</h4>
                  <p className="text-xs text-muted-foreground">Persist API keys, selected models, and system prompts to your database.</p>
                </div>
                <button
                  onClick={handleAiSave}
                  disabled={aiLoading}
                  className="flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#F55036] hover:bg-[#E04025] text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,80,54,0.3)] cursor-pointer"
                >
                  {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {aiLoading ? "Saving Settings..." : "Save AI Settings"}
                </button>
              </div>

              {/* Info Banner */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[#F55036]/5 border border-[#F55036]/15">
                <Shield size={16} className="text-[#F55036] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-white/40 leading-relaxed">
                  The LLM API key is stored securely in your database and is only accessible to super administrators. It is never exposed to the public or regular admins.
                </p>
              </div>
            </div>
          )}

        </main>

      </div>
    </div>
  );
}
