import { loadSettings } from "../shared/config.js";
import { createPopupController } from "../shared/popup.js";
import { attachHoverLookup, lookupAndShow } from "../shared/hover.js";
import { applyDeclarations } from "../shared/styles.js";

const CHINESE_CHAR = /[\u4e00-\u9fa5]/;
const CLIPBOARD_POLL_MS = 1000;

document.addEventListener("DOMContentLoaded", async () => {
  const config = await loadSettings();
  applyDeclarations(document.body, config.readerStyles);

  const popupController = createPopupController(config);
  popupController.setSticky(config.stickyMode);

  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.settings) {
      const updated = changes.settings.newValue || {};
      popupController.setSticky(Boolean(updated.stickyMode));
      if (updated.readerStyles) applyDeclarations(document.body, updated.readerStyles);
    }
  });

  const lineCountElement = document.getElementById("linecount");
  const pasteTarget = document.getElementById("cdiext-paste-target");
  const buttonPause = document.getElementById("button_pause");
  const buttonDelete = document.getElementById("button_delete");

  let isPaused = false;
  let lastCopiedText = "";
  const lines = [];

  function updateLineCount() {
    lineCountElement.textContent = lines.length;
  }

  function addLine(text) {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    pasteTarget.value += text + "\n";
    pasteTarget.scrollTop = pasteTarget.scrollHeight;

    paragraph.addEventListener("click", (event) => {
      lookupAndShow(popupController, event.clientX, event.clientY);
    });

    document.body.appendChild(paragraph);
    lines.push(paragraph);
    updateLineCount();
  }

  function deleteNewestLine() {
    if (lines.length === 0) return;
    const paragraph = lines.pop();
    const text = paragraph.textContent + "\n";
    paragraph.remove();
    pasteTarget.value = pasteTarget.value.replace(text, "");
    updateLineCount();
  }

  function checkClipboard() {
    if (isPaused) return;

    navigator.clipboard
      .readText()
      .then((text) => {
        if (CHINESE_CHAR.test(text) && text !== lastCopiedText) {
          lastCopiedText = text;
          addLine(text);
        }
      })
      .catch((error) => {
        console.error("Failed to read clipboard contents:", error);
      });
  }

  buttonPause.addEventListener("click", () => {
    isPaused = !isPaused;
    buttonPause.textContent = isPaused ? "Resume" : "Pause";
  });

  buttonDelete.addEventListener("click", deleteNewestLine);

  setInterval(checkClipboard, CLIPBOARD_POLL_MS);

  attachHoverLookup({ popupController });
});
