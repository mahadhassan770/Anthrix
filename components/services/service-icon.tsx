"use client";

import {
  Cloud,
  AppWindow,
  Zap,
  Cpu,
  Code2,
  Globe,
  Layers,
  Workflow,
  Bot,
  Database,
  GitBranch,
  MessageSquare,
  BarChart3,
  Sparkles,
  Terminal,
  Layout,
  Server,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Cloud,
  cloud: Cloud,
  AppWindow,
  appwindow: AppWindow,
  Layout,
  layout: Layout,
  Zap,
  zap: Zap,
  Cpu,
  cpu: Cpu,
  Code2,
  code2: Code2,
  Globe,
  globe: Globe,
  Layers,
  layers: Layers,
  Workflow,
  workflow: Workflow,
  Bot,
  bot: Bot,
  Database,
  database: Database,
  GitBranch,
  gitbranch: GitBranch,
  MessageSquare,
  messagesquare: MessageSquare,
  BarChart3,
  barchart3: BarChart3,
  Sparkles,
  sparkles: Sparkles,
  Terminal,
  terminal: Terminal,
  Server,
  server: Server,
};

export function ServiceIcon({
  name,
  size = 24,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const normalizedKey = name?.toLowerCase()?.replace(/[-_\s]/g, "") || "";
  const Icon = iconMap[name] || iconMap[normalizedKey] || Code2;
  return <Icon size={size} className={className} />;
}
