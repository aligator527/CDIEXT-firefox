    const config = {
        wordDisplayStyles: [
            "font-weight: 700;",
            "font-size: 12px;",
            "font-family: Arial",
            "color: #000000;",
        ],
        readingWithTonesStyles: [
            "font-weight: 400;",
            "font-size: 12px;",
            "font-family: Arial",
            "color: #000000;"
        ],
        simplifiedChineseStyles: [
            "font-weight: 700;",
            "font-size: 12px;",
            "font-family: Arial",
            "color: #000000;"
        ],
        traditionalChineseStyles: [
            "font-weight: 700;",
            "font-size: 12px;",
            "font-family: Arial",
            "color: #000000;"
        ],
        definitionStyles: [
            "font-weight: 400;",
            "font-size: 12px;",
            "font-family: Arial",
            "color: #000000;"
        ]
    };

    function loadSettings() {
        return new Promise((resolve, reject) => {
            browser.storage.local.get('settings', (result) => {
                if (result.settings) {
                    Object.assign(config, result.settings);
                }
                resolve();
            });
        });
    }

    function saveSettings(settings) {
        return new Promise((resolve, reject) => {
            browser.storage.local.set({ settings: settings }, () => {
                resolve();
            });
        });
    }

    window.config = config;
    window.loadSettings = loadSettings;
    window.saveSettings = saveSettings;
