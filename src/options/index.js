import { loadSettings, saveSettings } from "../shared/config.js";

const FONT_LIST = [
  "Arial",
  "Arial Black",
  "Comic Sans MS",
  "Courier New",
  "Georgia",
  "Impact",
  "Lucida Console",
  "Lucida Sans Unicode",
  "Palatino Linotype",
  "Tahoma",
  "Times New Roman",
  "Trebuchet MS",
  "Verdana",
  "Courier",
  "Helvetica",
  "Times",
  "Monaco",
  "Consolas",
  "SimSun",
  "NSimSun",
  "FangSong",
  "KaiTi",
  "MingLiU_HKSCS-ExtB",
  "MingLiU-ExtB",
  "PMingLiU-ExtB",
  "Microsoft YaHei",
  "SimHei",
];

const STYLE_GROUPS = [
  "wordDisplayStyles",
  "readingWithTonesStyles",
  "simplifiedChineseStyles",
  "traditionalChineseStyles",
  "definitionStyles",
  "popupStyles",
  "readerStyles",
];

function detectFontAvailability() {
  const availableFonts = [];
  const testString = "mmmmmmmmmmlli";
  const baseFonts = ["monospace", "sans-serif", "serif"];

  const context = document.createElement("canvas").getContext("2d");
  const getTextWidth = (font, text) => {
    context.font = font;
    return context.measureText(text).width;
  };

  for (const font of FONT_LIST) {
    const detected = baseFonts.some(
      (baseFont) =>
        getTextWidth(`72px ${baseFont}`, testString) !==
        getTextWidth(`72px ${font}, ${baseFont}`, testString),
    );
    if (detected) availableFonts.push(font);
  }

  return availableFonts;
}

function createStyleInput(styleName, styleValue, fonts) {
  let input;

  if (styleName === "font-weight") {
    input = document.createElement("select");
    ["100", "200", "300", "400", "500", "600", "700", "800", "900"].forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      option.selected = value === styleValue;
      input.appendChild(option);
    });
  } else if (styleName === "font-size") {
    input = document.createElement("input");
    input.type = "number";
    input.value = styleValue.replace("px", "");
  } else if (styleName === "color" || styleName === "background-color") {
    input = document.createElement("input");
    input.type = "color";
    input.value = styleValue;
  } else if (styleName === "font-family") {
    input = document.createElement("select");
    for (const font of fonts) {
      const option = document.createElement("option");
      option.value = font;
      option.textContent = font;
      input.appendChild(option);
    }
    input.value = styleValue;
  } else {
    input = document.createElement("input");
    input.type = "text";
    input.value = styleValue;
  }

  input.dataset.styleName = styleName;
  return input;
}

function createStyleInputs(groupId, stylesArray, fonts) {
  const groupDiv = document.getElementById(groupId);
  stylesArray.forEach((style) => {
    const styleName = style.split(":")[0].trim();
    const styleValue = style.split(":")[1].split(";")[0].trim();

    const label = document.createElement("label");
    label.textContent = `${styleName}:`;

    const input = createStyleInput(styleName, styleValue, fonts);
    groupDiv.appendChild(label);
    groupDiv.appendChild(input);
  });
}

function getStyleValues(groupId) {
  const groupDiv = document.getElementById(groupId);
  const inputs = groupDiv.querySelectorAll("input, select");
  return Array.from(inputs).map(
    (input) => `${input.dataset.styleName}: ${input.value}${input.type === "number" ? "px" : ""};`,
  );
}

document.addEventListener("DOMContentLoaded", async () => {
  const config = await loadSettings();
  const availableFonts = detectFontAvailability();

  for (const group of STYLE_GROUPS) {
    createStyleInputs(`${group}-group`, config[group], availableFonts);
  }

  const stickyCheckbox = document.getElementById("sticky-mode");
  stickyCheckbox.checked = Boolean(config.stickyMode);

  const audioHotkeyInput = document.getElementById("hotkey-audio");
  const ankiHotkeyInput = document.getElementById("hotkey-anki");
  audioHotkeyInput.value = config.hotkeys.audio;
  ankiHotkeyInput.value = config.hotkeys.anki;

  const ankiInputs = {
    deckName: document.getElementById("anki-deck"),
    modelName: document.getElementById("anki-model"),
    frontField: document.getElementById("anki-front"),
    backField: document.getElementById("anki-back"),
  };
  for (const [key, input] of Object.entries(ankiInputs)) {
    input.value = config.anki[key];
  }

  document.getElementById("options-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const newSettings = {};
    for (const group of STYLE_GROUPS) {
      newSettings[group] = getStyleValues(`${group}-group`);
    }
    newSettings.stickyMode = stickyCheckbox.checked;
    newSettings.hotkeys = {
      audio: (audioHotkeyInput.value || "a").toLowerCase(),
      anki: (ankiHotkeyInput.value || "d").toLowerCase(),
    };
    newSettings.anki = {
      deckName: ankiInputs.deckName.value,
      modelName: ankiInputs.modelName.value,
      frontField: ankiInputs.frontField.value,
      backField: ankiInputs.backField.value,
    };

    await saveSettings(newSettings);
    alert("Settings saved!");
  });
});
