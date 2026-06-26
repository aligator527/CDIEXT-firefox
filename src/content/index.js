import { loadSettings } from "../shared/config.js";
import { createPopupController } from "../shared/popup.js";
import { attachHoverLookup } from "../shared/hover.js";
import { Messages } from "../shared/messages.js";

(async () => {
  const config = await loadSettings();

  let isSearchingEnabled = true;

  const stateResponse = await browser.runtime.sendMessage({ action: Messages.QUERY_STATE });
  if (stateResponse) {
    isSearchingEnabled = stateResponse.isEnabled;
  }

  browser.runtime.onMessage.addListener((message) => {
    if (message.action === Messages.TOGGLE_SEARCH) {
      isSearchingEnabled = message.isEnabled;
    }
  });

  const popupController = createPopupController(config);
  popupController.setSticky(config.stickyMode);

  browser.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.settings) {
      const updated = changes.settings.newValue || {};
      popupController.setSticky(Boolean(updated.stickyMode));
    }
  });

  attachHoverLookup({ popupController, isEnabled: () => isSearchingEnabled });
})();
