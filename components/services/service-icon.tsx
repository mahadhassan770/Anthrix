"use client";

import {
  Code2,
  Globe,
  Layers,
  Cpu,
  Workflow,
  Bot,
  Database,
  GitBranch,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Code2,
  Globe,
  Layers,
  Cpu,
  Workflow,
  Bot,
  Database,
  GitBranch,
  MessageSquare,
  BarChart3,
};

export function ServiceIcon({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  const Icon = iconMap[name] ?? Code2;
  return <Icon size={size} className={className} />;
}
