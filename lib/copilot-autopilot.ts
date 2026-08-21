/**
 * Anthrix A-OS Copilot Autopilot Helpers
 * Provides smooth scrolling, element highlighting, and navigation utilities
 * for the Site Autopilot feature.
 */

export type AutopilotAction = {
  type: "navigate" | "scroll_to" | "highlight" | "open_contact";
  target?: string;
};

/**
 * Execute an autopilot action returned by the AI
 */
export function executeAutopilotAction(action: AutopilotAction, router?: any): void {
  if (!action?.type) return;

  switch (action.type) {
    case "navigate":
      if (action.target && typeof window !== "undefined") {
        window.location.href = action.target;
      }
      break;

    case "scroll_to":
      if (action.target) {
        scrollToSection(action.target);
      }
      break;

    case "highlight":
      if (action.target) {
        highlightElement(action.target);
      }
      break;

    case "open_contact":
      scrollToSection("contact");
      break;
  }
}

/**
 * Smooth-scroll to a section by ID or keyword mapping
 */
export function scrollToSection(target: string): void {
  if (typeof window === "undefined") return;

  // Keyword mapping for common section names
  const sectionMap: Record<string, string[]> = {
    work: ["work", "projects", "portfolio", "case-studies"],
    services: ["services", "what-we-do", "offerings"],
    contact: ["contact", "get-in-touch", "booking", "cta"],
    about: ["about", "team", "who-we-are"],
    hero: ["hero", "home", "top"],
  };

  // Try direct ID match first
  let el = document.getElementById(target);

  // Try mapped IDs
  if (!el) {
    for (const [, ids] of Object.entries(sectionMap)) {
      if (ids.includes(target.toLowerCase())) {
        for (const id of ids) {
          el = document.getElementById(id);
          if (el) break;
        }
      }
    }
  }

  // Try querySelector as fallback
  if (!el) {
    el = document.querySelector(`[data-section="${target}"]`) as HTMLElement;
  }

  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Add a subtle pulse highlight
    highlightElement(el.id || target, 2000);
  } else {
    // If section not found on this page, scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Highlight one or more DOM elements with a glowing cyber-ring overlay
 */
export function highlightElement(selectorOrId: string, duration = 3000): void {
  if (typeof window === "undefined") return;

  // Try to find elements
  const targets: Element[] = [];

  // Try by ID
  const byId = document.getElementById(selectorOrId);
  if (byId) {
    targets.push(byId);
  }

  // Try by data-attribute
  const byData = document.querySelectorAll(`[data-highlight="${selectorOrId}"]`);
  byData.forEach((el) => targets.push(el));

  // Try querySelector
  try {
    const byQuery = document.querySelectorAll(selectorOrId);
    byQuery.forEach((el) => {
      if (!targets.includes(el)) targets.push(el);
    });
  } catch {}

  // Add highlight class and remove after duration
  targets.forEach((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.transition = "box-shadow 0.3s ease, outline 0.3s ease";
    htmlEl.style.boxShadow = "0 0 0 3px rgba(245, 80, 54, 0.6), 0 0 30px rgba(245, 80, 54, 0.3)";
    htmlEl.style.outline = "2px solid rgba(245, 80, 54, 0.8)";
    htmlEl.style.borderRadius = "12px";
    htmlEl.style.zIndex = "10";

    setTimeout(() => {
      htmlEl.style.boxShadow = "";
      htmlEl.style.outline = "";
      htmlEl.style.zIndex = "";
    }, duration);
  });
}

/**
 * Get a friendly description of the current page for context
 */
export function getCurrentPageContext(): string {
  if (typeof window === "undefined") return "homepage";
  const path = window.location.pathname;
  if (path === "/" || path === "") return "Homepage";
  if (path.startsWith("/work")) return "Portfolio / Work page";
  if (path.startsWith("/services")) return "Services page";
  if (path.startsWith("/contact")) return "Contact page";
  return `${path} page`;
}
