import { getTextWindow } from "./wordScanner.js";
import { Messages } from "./messages.js";

/**
 * Look up the word under (x, y) and render the results through the popup controller.
 * @param {{ showEntries: Function, hidePopup: Function }} popupController
 * @param {number} x
 * @param {number} y
 * @returns {Promise<void>}
 */
export async function lookupAndShow(popupController, x, y) {
  const hit = getTextWindow(x, y);
  if (!hit) return;

  const response = await browser.runtime.sendMessage({
    action: Messages.LOOKUP_WORDS,
    text: hit.text,
    cursor: hit.cursor,
  });

  if (response && response.definitions && response.definitions.length) {
    // Key on the top word so the sticky popup stays put while on the same word.
    popupController.showEntries(x, y, response.definitions, response.definitions[0].headword);
  } else {
    popupController.hidePopup();
  }
}

/**
 * Wire mousemove/mouseout hover lookups onto the current document.
 * @param {object} options
 * @param {{ showEntries: Function, hidePopup: Function }} options.popupController
 * @param {() => boolean} [options.isEnabled]
 */
export function attachHoverLookup({ popupController, isEnabled = () => true }) {
  document.addEventListener("mousemove", (event) => {
    if (!isEnabled()) return;
    lookupAndShow(popupController, event.clientX, event.clientY);
  });

  document.addEventListener("mouseout", () => {
    popupController.hidePopup();
  });
}
