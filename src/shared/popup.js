import { applyDeclarations } from "./styles.js";
import { Messages } from "./messages.js";

// System CJK font stack so the popup renders Chinese well without remote fonts.
const CJK_FONT_STACK =
  '"Noto Sans SC", "Noto Sans TC", "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "Source Han Sans SC", sans-serif';

const BASE_STYLES = {
  position: "fixed",
  zIndex: "2147483647",
  padding: "8px",
  border: "1px solid black",
  borderRadius: "4px",
  maxWidth: "320px",
  maxHeight: "320px",
  overflowY: "auto",
  display: "none",
  boxShadow: "0px 0px 8px rgba(0,0,0,0.2)",
  // Reset inherited properties so the page can't bleed styles into the popup.
  lineHeight: "1.4",
  textAlign: "left",
};

function isEditableTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
}

function speak(text) {
  if (!text || !("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

async function addEntryToAnki(entry) {
  try {
    const response = await browser.runtime.sendMessage({
      action: Messages.ADD_TO_ANKI,
      entry,
    });
    if (response && response.ok) return { ok: true };
    return { ok: false, error: response?.error || "Unknown error" };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

function makeToolbarButton(label, title) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.title = title;
  Object.assign(button.style, {
    cursor: "pointer",
    border: "1px solid rgba(0,0,0,0.2)",
    borderRadius: "4px",
    background: "transparent",
    color: "inherit",
    font: "inherit",
    lineHeight: "1.2",
    padding: "1px 6px",
    marginRight: "4px",
  });
  return button;
}

/**
 * Create a controller that lazily builds and positions a shared definition popup.
 * The popup lives inside a Shadow DOM so host-page CSS cannot override it.
 * @param {typeof import("./config.js").defaultConfig} config
 */
export function createPopupController(config) {
  let host = null;
  let popup = null;
  let hintEl = null;
  let sticky = Boolean(config.stickyMode);
  let currentEntries = [];
  let currentKey = null;

  const audioKey = (config.hotkeys?.audio || "a").toLowerCase();
  const ankiKey = (config.hotkeys?.anki || "d").toLowerCase();

  function defaultHintText() {
    return `${audioKey.toUpperCase()} play audio \u00B7 ${ankiKey.toUpperCase()} add to Anki \u00B7 Esc close`;
  }

  function ensurePopup() {
    if (popup) return popup;

    host = document.createElement("div");
    host.style.setProperty("all", "initial");
    const shadow = host.attachShadow({ mode: "open" });

    popup = document.createElement("div");
    Object.assign(popup.style, BASE_STYLES);
    popup.style.setProperty("font-family", CJK_FONT_STACK, "important");
    applyDeclarations(popup, config.popupStyles);

    shadow.appendChild(popup);
    document.body.appendChild(host);
    return popup;
  }

  function buildEntryNode(entry) {
    const item = document.createElement("div");
    item.style.marginBottom = "6px";

    const content = document.createElement("div");
    content.innerHTML = entry.html;
    item.appendChild(content);

    const toolbar = document.createElement("div");
    toolbar.style.marginTop = "4px";

    const audioButton = makeToolbarButton(`\u{1F50A} ${audioKey.toUpperCase()}`, "Play audio");
    audioButton.addEventListener("click", () => speak(entry.simplified || entry.headword));
    toolbar.appendChild(audioButton);

    const ankiButton = makeToolbarButton(`+ Anki ${ankiKey.toUpperCase()}`, "Add to Anki");
    ankiButton.addEventListener("click", async () => {
      ankiButton.disabled = true;
      ankiButton.textContent = "...";
      const result = await addEntryToAnki(entry);
      ankiButton.textContent = result.ok ? "\u2713 Added" : "\u2717 Failed";
      if (!result.ok) {
        ankiButton.title = String(result.error);
        flashHint(`Anki: ${result.error}`, 6000);
        console.warn("CDIEXT Anki error:", result.error);
      }
      setTimeout(() => {
        ankiButton.disabled = false;
        ankiButton.textContent = `+ Anki ${ankiKey.toUpperCase()}`;
      }, 2000);
    });
    toolbar.appendChild(ankiButton);

    item.appendChild(toolbar);
    return item;
  }

  function flashHint(text, duration = 1500) {
    if (!hintEl) return;
    hintEl.textContent = text;
    setTimeout(() => {
      if (hintEl) hintEl.textContent = defaultHintText();
    }, duration);
  }

  function render(entries) {
    const element = ensurePopup();
    element.textContent = "";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.marginBottom = "6px";

    hintEl = document.createElement("div");
    hintEl.textContent = defaultHintText();
    Object.assign(hintEl.style, { fontSize: "10px", opacity: "0.7" });
    header.appendChild(hintEl);

    if (sticky) {
      const closeButton = makeToolbarButton("\u2715", "Close");
      closeButton.style.marginRight = "0";
      closeButton.addEventListener("click", forceHide);
      header.appendChild(closeButton);
    }

    element.appendChild(header);

    for (const entry of entries) {
      element.appendChild(buildEntryNode(entry));
    }
  }

  function position(x, y) {
    const margin = 8;
    const gap = 10;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Cap the height to the viewport so the popup scrolls instead of overflowing.
    popup.style.maxHeight = `${Math.min(320, Math.max(80, viewportHeight - margin * 2))}px`;
    popup.style.display = "block";

    const width = popup.offsetWidth;
    const height = popup.offsetHeight;

    // Prefer below the cursor; flip above if it doesn't fit; otherwise clamp.
    let top;
    if (y + gap + height <= viewportHeight - margin) {
      top = y + gap;
    } else if (y - gap - height >= margin) {
      top = y - gap - height;
    } else {
      top = viewportHeight - height - margin;
    }
    top = Math.min(Math.max(top, margin), Math.max(margin, viewportHeight - height - margin));

    // Prefer right of the cursor; flip left if it doesn't fit; then clamp.
    let left = x + gap;
    if (left + width > viewportWidth - margin) {
      left = x - gap - width;
    }
    left = Math.min(Math.max(left, margin), Math.max(margin, viewportWidth - width - margin));

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
  }

  function isVisible() {
    return popup && popup.style.display === "block";
  }

  /**
   * Render structured definition entries at (x, y).
   *
   * In sticky mode the popup keeps its position and content while the same word
   * (`key`) stays under the cursor; it only re-renders and repositions when the
   * word changes. In follow mode it always tracks the cursor.
   *
   * @param {number} x
   * @param {number} y
   * @param {import("./dictionary.js").DefinitionEntry[]} entries
   * @param {string} [key] Identifier for the looked-up text (used for sticky stability).
   */
  function showEntries(x, y, entries, key) {
    if (sticky && key != null && key === currentKey && isVisible()) return;
    currentKey = key;
    currentEntries = entries;
    render(entries);
    position(x, y);
  }

  function hidePopup() {
    // In sticky mode the popup is only dismissed explicitly (close button / Esc).
    if (sticky || !popup) return;
    popup.style.display = "none";
    currentKey = null;
  }

  function forceHide() {
    if (popup) popup.style.display = "none";
    currentKey = null;
  }

  function setSticky(value) {
    sticky = Boolean(value);
  }

  window.addEventListener("keydown", async (event) => {
    if (event.key === "Escape") {
      forceHide();
      return;
    }

    if (!isVisible() || !currentEntries.length) return;
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (isEditableTarget(event.target)) return;

    const key = event.key.toLowerCase();
    const topEntry = currentEntries[0];

    if (key === audioKey) {
      event.preventDefault();
      speak(topEntry.simplified || topEntry.headword);
    } else if (key === ankiKey) {
      event.preventDefault();
      flashHint("Adding to Anki...");
      const result = await addEntryToAnki(topEntry);
      if (result.ok) {
        flashHint("\u2713 Added to Anki");
      } else {
        flashHint(`Anki: ${result.error}`, 6000);
        console.warn("CDIEXT Anki error:", result.error);
      }
    }
  });

  return { showEntries, hidePopup, forceHide, setSticky };
}
