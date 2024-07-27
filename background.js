function ensureConfigLoaded(callback) {
  if (typeof window.loadSettings === 'function') {
      callback();
  } else {
      setTimeout(() => ensureConfigLoaded(callback), 100);
  }
}

const script = document.createElement('script');
script.src = browser.runtime.getURL('options/configure.js');
document.head.appendChild(script);

script.onload = () => {
  ensureConfigLoaded(() => {
    loadSettings().then(() => {

      let dictionary = {
        data: [],
        index: {},
      };

      let isSearchingEnabled = true;

      // Function to notify all tabs about the current state
      function notifyAllTabs() {
        browser.tabs.query({}, (tabs) => {
          for (let tab of tabs) {
            browser.tabs.sendMessage(tab.id, {
              action: "toggleSearch",
              isEnabled: isSearchingEnabled,
            });
          }
        });
      }

      // Toggle search state and update icon and badge
      function toggleSearchState() {
        isSearchingEnabled = !isSearchingEnabled;
        const newIcon = isSearchingEnabled
          ? "assets/img/icon.png"
          : "assets/img/icon_disabled.png";
        browser.browserAction.setIcon({ path: newIcon });
        browser.browserAction.setBadgeText({ text: isSearchingEnabled ? "" : "OFF" });
        notifyAllTabs();
      }

      // Load dictionary from multiple JSON files and build an index
      function loadDictionary() {
        const files = [
          "data/cedict_1.json",
          "data/cedict_2.json",
          "data/cedict_3.json",
          "data/cedict_4.json",
          "data/cedict_5.json",
          "data/cedict_6.json",
          "data/cedict_7.json",
          "data/cedict_8.json",
          "data/cedict_9.json",
          "data/cedict_10.json"
        ];

        const fetchPromises = files.map(file =>
          fetch(browser.runtime.getURL(file)).then(response => response.json())
        );

        Promise.all(fetchPromises)
          .then(results => {
            results.forEach(data => dictionary.data.push(...data));
            dictionary.index = buildIndex(dictionary.data);
            console.log("Dictionary and index loaded!");
          })
          .catch(error => {
            console.error("Failed to load the dictionary:", error);
          });
      }

      // Build an index for quick lookups
      function buildIndex(dictionaryData) {
        const index = {};
        dictionaryData.forEach((entry, i) => {
          if (!index[entry.traditional]) {
            index[entry.traditional] = [];
          }
          if (!index[entry.simplified]) {
            index[entry.simplified] = [];
          }
          index[entry.traditional].push(i);
          index[entry.simplified].push(i);
        });
        return index;
      }

      // Convert pinyin with tone numbers to pinyin with tone marks
      function addToneMarks(pinyin) {
        const toneMarks = [
          ["a", "ā", "á", "ǎ", "à", "a"],
          ["e", "ē", "é", "ě", "è", "e"],
          ["i", "ī", "í", "ǐ", "ì", "i"],
          ["o", "ō", "ó", "ǒ", "ò", "o"],
          ["u", "ū", "ú", "ǔ", "ù", "u"],
          ["ü", "ǖ", "ǘ", "ǚ", "ǜ", "ü"],
          ["A", "Ā", "Á", "Ǎ", "À", "A"],
          ["E", "Ē", "É", "Ě", "È", "E"],
          ["I", "Ī", "Í", "Ǐ", "Ì", "I"],
          ["O", "Ō", "Ó", "Ǒ", "Ò", "O"],
          ["U", "Ū", "Ú", "Ǔ", "Ù", "U"],
          ["Ü", "Ǖ", "Ǘ", "Ǚ", "Ǜ", "Ü"],
        ];

        return pinyin
          .split(" ")
          .map((segment) => {
            const toneNumberMatch = segment.match(/\d/);
            if (!toneNumberMatch) return segment;

            const toneNumber = parseInt(toneNumberMatch[0]);
            for (let [vowel, ...marks] of toneMarks) {
              if (segment.includes(vowel)) {
                return segment
                  .replace(vowel, marks[toneNumber - 1])
                  .replace(/\d/, "");
              }
            }
            return segment;
          })
          .join(" ");
      }

      // Find definitions for a list of words
      function findDefinitions(words) {
        console.log("Looking up definitions for:", words);
        const foundDefinitions = {};

        words.forEach((word) => {
          const indices = dictionary.index[word];
          if (indices) {
            indices.forEach((i) => {
              const entry = dictionary.data[i];
              if (!foundDefinitions[word]) {
                foundDefinitions[word] = [];
              }

              let wordDisplay =
                entry.traditional !== entry.simplified
                  ? `<span style="${config.simplifiedChineseStyles.join(' ')}">${entry.simplified}</span> / <span style="${config.traditionalChineseStyles.join(' ')}">${entry.traditional}</span>`
                  : `<span style="${config.simplifiedChineseStyles.join(' ')}">${word}</span>`;

                  let readingWithTones = `<span style="${config.readingWithTonesStyles.join(' ')}">${addToneMarks(entry.reading)}</span>`;
                  let definition = `
                    <span style="${config.wordDisplayStyles.join(' ')}">
                      ${wordDisplay}
                    </span> 
                    <span style="${config.definitionStyles.join(' ')}">
                      ${readingWithTones}</span><br/>
                    <span style="${config.definitionStyles.join(' ')}">
                      ${entry.meanings.map(m => m.meaning).join(', ')}
                    </span>`;

              if (!foundDefinitions[word].includes(definition)) {
                foundDefinitions[word].push(definition);
              }
            });
          }
        });

        return Object.values(foundDefinitions).flat();
      }

      // Initialize the extension by loading the dictionary and setting up event listeners
      function initialize() {
        loadDictionary();

        browser.browserAction.onClicked.addListener(toggleSearchState);

        browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
          if (message.action === "queryState") {
            sendResponse({ isEnabled: isSearchingEnabled });
          } else if (message.action === "lookupWords") {
            const words = message.words;
            const definitions = findDefinitions(words);
            sendResponse({ definitions: definitions });
          }
        });

        // Context menu for options and reader
        if (browser.contextMenus) {
          browser.contextMenus.create({
            id: "toggle-search",
            title: "Toggle CDIEXT",
            contexts: ["all"],
          });
          browser.contextMenus.create({
            id: "cdiext-options",
            title: "Options",
            contexts: ["browser_action"],
          });
          browser.contextMenus.create({
            id: "cdiext-reader",
            title: "Open Reader",
            contexts: ["browser_action"],
          });

          browser.contextMenus.onClicked.addListener((info, tab) => {
            if (info.menuItemId === "toggle-search") {
              toggleSearchState();
            } else if (info.menuItemId === "cdiext-options") {
              openOptions(info, tab);
            } else if (info.menuItemId === "cdiext-reader") {
              openReader(info, tab);
            }
          });
        }
      }

      // Open the reader window
      function openReader(info, tab) {
        try {
          browser.windows.create({
            url: browser.extension.getURL("reader/reader.html"),
            type: "popup",
            width: 800,
            height: 300,
          });
        } catch (err) {
          console.error("Failed to open reader window:", err);
        }
      }

      // Open the options page
      function openOptions(info, tab) {
        try {
          browser.tabs.create({
            url: browser.extension.getURL("options/options.html"),
          });
        } catch (err) {
          console.error("Failed to open options page:", err);
        }
      }

      // Initialize the extension
      initialize();

    });
  });
};