import { loadSettings, saveSettings } from "../shared/config.js";
import { loadDictionary, findDefinitions } from "../shared/dictionary.js";
import { Messages } from "../shared/messages.js";

const ANKI_CONNECT_URL = "http://127.0.0.1:8765";

const ICON_ENABLED = "assets/img/icon.png";
const ICON_DISABLED = "assets/img/icon_disabled.png";

let isSearchingEnabled = true;

// Cache config and reload it whenever the user saves new settings.
let configPromise = loadSettings();
browser.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.settings) {
    configPromise = loadSettings();
  }
});

// Lazily load the dictionary; event pages may unload, so rebuild on demand.
let dictionaryPromise = null;
function ensureDictionary() {
  if (!dictionaryPromise) {
    dictionaryPromise = loadDictionary().catch((error) => {
      dictionaryPromise = null;
      throw error;
    });
  }
  return dictionaryPromise;
}

function notifyAllTabs() {
  browser.tabs.query({}).then((tabs) => {
    for (const tab of tabs) {
      browser.tabs
        .sendMessage(tab.id, {
          action: Messages.TOGGLE_SEARCH,
          isEnabled: isSearchingEnabled,
        })
        .catch(() => {
          // Tabs without the content script (e.g. about: pages) are expected to reject.
        });
    }
  });
}

function toggleSearchState() {
  isSearchingEnabled = !isSearchingEnabled;
  browser.action.setIcon({ path: isSearchingEnabled ? ICON_ENABLED : ICON_DISABLED });
  browser.action.setBadgeText({ text: isSearchingEnabled ? "" : "OFF" });
  notifyAllTabs();
}

async function addNoteToAnki(entry, ankiConfig) {
  const front =
    entry.simplified === entry.traditional
      ? entry.simplified
      : `${entry.simplified} / ${entry.traditional}`;
  const back = `${entry.readingWithTones}<br>${entry.meanings.join(", ")}`;

  const payload = {
    action: "addNote",
    version: 6,
    params: {
      note: {
        deckName: ankiConfig.deckName,
        modelName: ankiConfig.modelName,
        fields: {
          [ankiConfig.frontField]: front,
          [ankiConfig.backField]: back,
        },
        options: { allowDuplicate: false },
        tags: ["cdiext"],
      },
    },
  };

  let response;
  try {
    response = await fetch(ANKI_CONNECT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch {
    return {
      ok: false,
      error:
        "Can't reach AnkiConnect. Open Anki, install the AnkiConnect add-on, and add this extension to its webCorsOriginList (or set it to [\"*\"]).",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: `AnkiConnect blocked the request (HTTP ${response.status}). Add this extension's origin to AnkiConnect's webCorsOriginList.`,
    };
  }

  let data;
  try {
    data = await response.json();
  } catch {
    return { ok: false, error: "Unexpected response from AnkiConnect." };
  }

  if (data.error) return { ok: false, error: data.error };
  return { ok: true, id: data.result };
}

async function handleMessage(message) {
  if (message.action === Messages.QUERY_STATE) {
    return { isEnabled: isSearchingEnabled };
  }

  if (message.action === Messages.LOOKUP_WORDS) {
    const [config, dictionary] = await Promise.all([configPromise, ensureDictionary()]);
    return { definitions: findDefinitions(dictionary, message.text, message.cursor, config) };
  }

  if (message.action === Messages.ADD_TO_ANKI) {
    const config = await configPromise;
    return addNoteToAnki(message.entry, config.anki);
  }

  return undefined;
}

async function toggleStickyMode() {
  const config = await loadSettings();
  await saveSettings({ ...config, stickyMode: !config.stickyMode });
}

function openReader() {
  browser.windows
    .create({
      url: browser.runtime.getURL("reader/reader.html"),
      type: "popup",
      width: 800,
      height: 300,
    })
    .catch((error) => console.error("Failed to open reader window:", error));
}

function openOptions() {
  browser.runtime.openOptionsPage().catch((error) => {
    console.error("Failed to open options page:", error);
  });
}

function openGuide() {
  browser.tabs
    .create({ url: browser.runtime.getURL("home/home.html") })
    .catch((error) => console.error("Failed to open guide:", error));
}

function createContextMenus() {
  if (!browser.contextMenus) return;

  browser.contextMenus.removeAll();
  browser.contextMenus.create({
    id: "toggle-search",
    title: "Toggle CDIEXT",
    contexts: ["all"],
  });
  browser.contextMenus.create({
    id: "cdiext-options",
    title: "Options",
    contexts: ["action"],
  });
  browser.contextMenus.create({
    id: "cdiext-reader",
    title: "Open Reader",
    contexts: ["action"],
  });
  browser.contextMenus.create({
    id: "cdiext-guide",
    title: "Help / Guide",
    contexts: ["action"],
  });
}

function handleContextMenuClick(info) {
  if (info.menuItemId === "toggle-search") {
    toggleSearchState();
  } else if (info.menuItemId === "cdiext-options") {
    openOptions();
  } else if (info.menuItemId === "cdiext-reader") {
    openReader();
  } else if (info.menuItemId === "cdiext-guide") {
    openGuide();
  }
}

function handleInstalled(details) {
  createContextMenus();
  if (details.reason === "install") openGuide();
}

browser.action.onClicked.addListener(toggleSearchState);
browser.runtime.onMessage.addListener(handleMessage);
browser.runtime.onInstalled.addListener(handleInstalled);
browser.runtime.onStartup.addListener(createContextMenus);

if (browser.contextMenus) {
  browser.contextMenus.onClicked.addListener(handleContextMenuClick);
}

if (browser.commands) {
  browser.commands.onCommand.addListener((command) => {
    if (command === "toggle-sticky") toggleStickyMode();
  });
}

// Warm the dictionary so the first lookup is fast.
ensureDictionary().catch((error) => console.error("Failed to load the dictionary:", error));
