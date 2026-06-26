const SHARED_STYLE = [
  "font-weight: 400;",
  "font-size: 12px;",
  "font-family: Arial",
  "color: #000000;",
];

const BOLD_STYLE = [
  "font-weight: 700;",
  "font-size: 12px;",
  "font-family: Arial",
  "color: #000000;",
];

export const defaultConfig = {
  wordDisplayStyles: [...BOLD_STYLE],
  readingWithTonesStyles: [...SHARED_STYLE],
  simplifiedChineseStyles: [...BOLD_STYLE],
  traditionalChineseStyles: [...BOLD_STYLE],
  definitionStyles: [...SHARED_STYLE],
  popupStyles: [
    "background-color: #ffffff;",
    "font-weight: 400;",
    "font-size: 12px;",
    "font-family: Arial",
    "color: #000000;",
  ],
  readerStyles: ["background-color: #111111;", "color: #e0e0e0;", "font-size: 22px;"],
  // When true, the popup stays pinned until dismissed instead of following the cursor.
  stickyMode: false,
  // Keyboard shortcuts that act on the top entry of the visible popup.
  hotkeys: {
    audio: "a",
    anki: "d",
  },
  // AnkiConnect note mapping (https://foosoft.net/projects/anki-connect/).
  anki: {
    deckName: "Default",
    modelName: "Basic",
    frontField: "Front",
    backField: "Back",
  },
};

/**
 * Load persisted settings merged on top of the defaults.
 * @returns {Promise<typeof defaultConfig>}
 */
export async function loadSettings() {
  const config = structuredClone(defaultConfig);
  const result = await browser.storage.local.get("settings");
  if (result.settings) {
    Object.assign(config, result.settings);
  }
  return config;
}

/**
 * Persist the provided settings object.
 * @param {object} settings
 * @returns {Promise<void>}
 */
export async function saveSettings(settings) {
  await browser.storage.local.set({ settings });
}
