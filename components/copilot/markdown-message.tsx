"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

function CodeBlock({ children, className }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const codeText = String(children).replace(/\n$/, "");
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2.5 rounded-xl overflow-hidden border border-white/10 bg-[#05080D]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.04] border-b border-white/5 text-[10px] text-white/40 font-mono">
        <span>{language || "code"}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          {copied ? <Check size={11} className="text-[#F55036]" /> : <Copy size={11} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-xs font-mono text-white/90 leading-relaxed scrollbar-thin scrollbar-thumb-white/10">
        <code>{codeText}</code>
      </pre>
    </div>
  );
}

export default function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="markdown-content text-sm leading-relaxed text-white/85 space-y-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-white mt-3 mb-1 font-[family-name:var(--font-orbitron)] tracking-wide">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-white mt-2.5 mb-1 flex items-center gap-1.5">
              <span className="w-1 h-3 rounded-full bg-[#F55036]" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-white/95 mt-2 mb-1 uppercase tracking-wider">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
          em: ({ children }) => <em className="italic text-white/70">{children}</em>,
          ul: ({ children }) => <ul className="my-1.5 space-y-1 pl-4 list-disc marker:text-[#F55036]">{children}</ul>,
          ol: ({ children }) => <ol className="my-1.5 space-y-1 pl-4 list-decimal marker:text-white/40">{children}</ol>,
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="my-2 border-l-2 border-[#F55036]/60 pl-3 py-0.5 italic text-white/70 bg-[#F55036]/5 rounded-r-lg">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F55036] hover:underline font-medium inline-flex items-center gap-0.5"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto rounded-xl border border-white/10 bg-[#080B12]">
              <table className="w-full text-xs text-left">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-white/5 border-b border-white/10 text-white/80">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-white/5">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-white/[0.02] transition-colors">{children}</tr>,
          th: ({ children }) => <th className="px-3 py-2 font-semibold">{children}</th>,
          td: ({ children }) => <td className="px-3 py-2 text-white/70">{children}</td>,
          hr: () => <hr className="my-3 border-white/10" />,
          code: ({ node, inline, className, children, ...props }: any) => {
            if (inline) {
              return (
                <code className="bg-white/10 text-[#F55036] px-1.5 py-0.5 rounded text-[12px] font-mono font-medium">
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
