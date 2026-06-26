const CHINESE_CHAR = /[\u4e00-\u9fa5]/;
// How far to look forward/backward (in characters) from the hovered character.
const MAX_FORWARD = 16;
const MAX_BACKWARD = 10;

/**
 * Find the deepest element under the point, piercing open shadow roots, and
 * collect those roots so the caret lookup can pierce them too.
 * @param {number} x
 * @param {number} y
 * @returns {{ element: Element | null, shadowRoots: ShadowRoot[] }}
 */
function deepHit(x, y) {
  const shadowRoots = [];
  let element = document.elementFromPoint(x, y);
  let host = element;

  while (host && host.shadowRoot) {
    shadowRoots.push(host.shadowRoot);
    const inner = host.shadowRoot.elementFromPoint(x, y);
    if (!inner || inner === host) break;
    host = inner;
  }

  return { element: host || element, shadowRoots };
}

function caretAt(x, y, shadowRoots) {
  try {
    // The shadowRoots option lets Firefox pierce open shadow trees (ignored if unsupported).
    return document.caretPositionFromPoint(x, y, shadowRoots.length ? { shadowRoots } : undefined);
  } catch {
    return document.caretPositionFromPoint(x, y);
  }
}

/**
 * Resolve the text source and character offset under the point (x, y),
 * handling form fields, deeply nested nodes, and open shadow DOM.
 * @returns {{ text: string, offset: number } | null}
 */
function resolveTextAtPoint(x, y) {
  const { element, shadowRoots } = deepHit(x, y);
  const isFormField =
    element && (element.tagName === "INPUT" || element.tagName === "TEXTAREA");
  const position = caretAt(x, y, shadowRoots);

  if (isFormField) {
    const value = element.value ?? "";
    let offset = element.selectionStart ?? 0;
    if (position && Number.isInteger(position.offset) && position.offset <= value.length) {
      offset = position.offset;
    }
    return { text: value, offset };
  }

  if (!position || !position.offsetNode || position.offsetNode.nodeType !== Node.TEXT_NODE) {
    return null;
  }
  return { text: position.offsetNode.textContent, offset: position.offset };
}

/**
 * Return a contiguous window of Chinese characters around the cursor, plus the
 * cursor's index within that window. The background script then matches the
 * longest dictionary word that covers the cursor, so hovering anywhere inside a
 * word (not just its first character) resolves the whole word.
 * @param {number} x
 * @param {number} y
 * @returns {{ text: string, cursor: number } | null}
 */
export function getTextWindow(x, y) {
  const resolved = resolveTextAtPoint(x, y);
  if (!resolved) return null;

  const { text } = resolved;
  let anchor = resolved.offset;

  // The caret offset can land just past the character; step back onto it.
  if (anchor >= text.length || !CHINESE_CHAR.test(text[anchor])) {
    if (anchor > 0 && CHINESE_CHAR.test(text[anchor - 1])) anchor -= 1;
    else return null;
  }

  let start = anchor;
  while (start > 0 && CHINESE_CHAR.test(text[start - 1]) && anchor - start < MAX_BACKWARD) {
    start--;
  }

  let end = anchor + 1;
  while (end < text.length && CHINESE_CHAR.test(text[end]) && end - anchor < MAX_FORWARD) {
    end++;
  }

  return { text: text.slice(start, end), cursor: anchor - start };
}
