"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  Trash2,
  AlertCircle,
} from "lucide-react";

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
}

export interface AlertOptions {
  title?: string;
  message: string;
  buttonText?: string;
  variant?: "danger" | "warning" | "info" | "success";
}

interface ModalContextType {
  confirm: (options: string | ConfirmOptions) => Promise<boolean>;
  alert: (options: string | AlertOptions) => Promise<void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function useModal() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}

export function ModalProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // State for confirm modal
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  // State for alert modal
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    options: AlertOptions;
    resolve: () => void;
  } | null>(null);

  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const alertButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const confirm = useCallback((input: string | ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      let opts: ConfirmOptions;
      if (typeof input === "string") {
        const isDelete =
          /delete|remove|destroy|trash|reject|cancel/i.test(input);
        opts = {
          title: isDelete ? "Confirm Action" : "Confirmation Required",
          message: input,
          confirmText: isDelete ? "Delete" : "Confirm",
          cancelText: "Cancel",
          variant: isDelete ? "danger" : "warning",
        };
      } else {
        const isDelete =
          optsVariantOrDefault(input.variant, input.message) === "danger";
        opts = {
          title: input.title || (isDelete ? "Confirm Action" : "Confirmation Required"),
          message: input.message,
          confirmText: input.confirmText || (isDelete ? "Delete" : "Confirm"),
          cancelText: input.cancelText || "Cancel",
          variant: input.variant || (isDelete ? "danger" : "warning"),
        };
      }

      setConfirmState({
        isOpen: true,
        options: opts,
        resolve: (result: boolean) => {
          setConfirmState(null);
          resolve(result);
        },
      });
    });
  }, []);

  const alert = useCallback((input: string | AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      let opts: AlertOptions;
      if (typeof input === "string") {
        const isError = /fail|error|invalid|required|cannot|not found|denied/i.test(input);
        const isSuccess = /success|saved|updated|created|sent|completed/i.test(input);
        opts = {
          title: isError ? "Notice" : isSuccess ? "Success" : "Attention",
          message: input,
          buttonText: "Acknowledge",
          variant: isError ? "danger" : isSuccess ? "success" : "info",
        };
      } else {
        opts = {
          title: input.title || "Notification",
          message: input.message,
          buttonText: input.buttonText || "Acknowledge",
          variant: input.variant || "info",
        };
      }

      setAlertState({
        isOpen: true,
        options: opts,
        resolve: () => {
          setAlertState(null);
          resolve();
        },
      });
    });
  }, []);

  function optsVariantOrDefault(
    variant: ConfirmOptions["variant"],
    msg: string
  ): "danger" | "warning" | "info" | "success" {
    if (variant) return variant;
    if (/delete|remove|destroy|trash|reject/i.test(msg)) return "danger";
    return "warning";
  }

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (confirmState?.isOpen) {
        if (e.key === "Escape") {
          e.preventDefault();
          confirmState.resolve(false);
        }
      } else if (alertState?.isOpen) {
        if (e.key === "Escape" || e.key === "Enter") {
          e.preventDefault();
          alertState.resolve();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confirmState, alertState]);

  // Focus trap focus button on open
  useEffect(() => {
    if (confirmState?.isOpen) {
      setTimeout(() => confirmButtonRef.current?.focus(), 50);
    }
  }, [confirmState?.isOpen]);

  useEffect(() => {
    if (alertState?.isOpen) {
      setTimeout(() => alertButtonRef.current?.focus(), 50);
    }
  }, [alertState?.isOpen]);

  return (
    <ModalContext.Provider value={{ confirm, alert }}>
      {children}

      {mounted &&
        createPortal(
          <>
            {/* Confirmation Modal */}
            {confirmState?.isOpen && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
                onClick={() => confirmState.resolve(false)}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 animate-in zoom-in-95 duration-150 relative"
                >
                  <button
                    type="button"
                    onClick={() => confirmState.resolve(false)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <X size={16} />
                  </button>

                  <div className="flex items-start gap-4">
                    {confirmState.options.variant === "danger" ? (
                      <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0">
                        <Trash2 size={20} />
                      </div>
                    ) : confirmState.options.variant === "warning" ? (
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={20} />
                      </div>
                    ) : confirmState.options.variant === "success" ? (
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={20} />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-[#F55036]/10 border border-[#F55036]/20 text-[#F55036] flex items-center justify-center flex-shrink-0">
                        <Info size={20} />
                      </div>
                    )}

                    <div className="flex-1 pr-6">
                      <h3 className="text-base font-bold text-foreground">
                        {confirmState.options.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-line">
                        {confirmState.options.message}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => confirmState.resolve(false)}
                      className="px-4 py-2 rounded-xl border border-border bg-background hover:bg-muted/50 text-xs font-semibold text-foreground transition-all cursor-pointer"
                    >
                      {confirmState.options.cancelText}
                    </button>
                    <button
                      ref={confirmButtonRef}
                      type="button"
                      onClick={() => confirmState.resolve(true)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                        confirmState.options.variant === "danger"
                          ? "bg-rose-600 hover:bg-rose-500"
                          : confirmState.options.variant === "warning"
                          ? "bg-amber-600 hover:bg-amber-500"
                          : confirmState.options.variant === "success"
                          ? "bg-emerald-600 hover:bg-emerald-500"
                          : "bg-[#F55036] hover:bg-[#F55036]/90"
                      }`}
                    >
                      {confirmState.options.confirmText}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Alert Modal */}
            {alertState?.isOpen && (
              <div
                role="dialog"
                aria-modal="true"
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150"
                onClick={() => alertState.resolve()}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden p-6 animate-in zoom-in-95 duration-150 relative"
                >
                  <button
                    type="button"
                    onClick={() => alertState.resolve()}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <X size={16} />
                  </button>

                  <div className="flex items-start gap-4">
                    {alertState.options.variant === "danger" ? (
                      <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center flex-shrink-0">
                        <AlertCircle size={20} />
                      </div>
                    ) : alertState.options.variant === "warning" ? (
                      <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={20} />
                      </div>
                    ) : alertState.options.variant === "success" ? (
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={20} />
                      </div>
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-[#F55036]/10 border border-[#F55036]/20 text-[#F55036] flex items-center justify-center flex-shrink-0">
                        <Info size={20} />
                      </div>
                    )}

                    <div className="flex-1 pr-6">
                      <h3 className="text-base font-bold text-foreground">
                        {alertState.options.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed whitespace-pre-line">
                        {alertState.options.message}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-center justify-end">
                    <button
                      ref={alertButtonRef}
                      type="button"
                      onClick={() => alertState.resolve()}
                      className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                        alertState.options.variant === "danger"
                          ? "bg-rose-600 hover:bg-rose-500"
                          : alertState.options.variant === "warning"
                          ? "bg-amber-600 hover:bg-amber-500"
                          : alertState.options.variant === "success"
                          ? "bg-emerald-600 hover:bg-emerald-500"
                          : "bg-[#F55036] hover:bg-[#F55036]/90"
                      }`}
                    >
                      {alertState.options.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>,
          document.body
        )}
    </ModalContext.Provider>
  );
}
