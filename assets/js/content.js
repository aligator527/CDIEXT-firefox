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
            console.log("Content script loaded!");

            // At the top of `content.js`
            let isSearchingEnabled = true;

            // Function to get the current state from the background script
            function fetchCurrentState() {
                browser.runtime.sendMessage({ action: "queryState" })
                    .then(response => {
                        isSearchingEnabled = response.isEnabled;
                    });
            }

            fetchCurrentState();

            // Listen for messages from the background script
            browser.runtime.onMessage.addListener((message) => {
                if (message.action === "toggleSearch") {
                    isSearchingEnabled = message.isEnabled;
                }
            });

            document.addEventListener('mousemove', handleMouseMove);
                
            let popup = null;

            // Function to handle mouse movement.
            function handleMouseMove(event) {

                if (!isSearchingEnabled) return;

                const words = getPotentialWordsFromPoint(event.clientX, event.clientY);
                if (words.length) {
                    browser.runtime.sendMessage({action: "lookupWords", words: words})
                        .then(response => {
                            // console.log("Received response:", response);
                            if (response.definitions && response.definitions.length) {
                                const combinedDefinitions = response.definitions.map(def => `<div>${def}</div>`).join(''); // Wrapping each definition in a div for better structuring.
                                showPopup(event.clientX, event.clientY, combinedDefinitions);
                            } else if (popup) { 
                                popup.style.display = 'none'; // Hide popup if no definitions found.
                            }
                        });
                }
            }

            function getPotentialWordsFromPoint(x, y) {
                let startContainer;
                let offset;

                const element = document.elementFromPoint(x, y);
                if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
                    // Handle input fields
                    const value = element.value;
                    const selectionStart = element.selectionStart;

                    startContainer = { textContent: value };
                    offset = selectionStart;
                } else {
                    // Handle static content
                    const position = document.caretPositionFromPoint(x, y);
                    if (!position || !position.offsetNode || position.offsetNode.nodeType !== Node.TEXT_NODE) {
                        return [];
                    }

                    startContainer = position.offsetNode;
                    offset = position.offset;
                }

                let words = [];
                let currentWord = '';
                let failures = 0;

                for (let i = offset; i < startContainer.textContent.length && failures < 2; i++) {
                    let char = startContainer.textContent[i];

                    // Skip if the character is not Chinese.
                    if (!char.match(/[\u4e00-\u9fa5]/)) {
                        failures++;
                        continue;
                    }

                    currentWord += char;
                    words.unshift(currentWord);
                }

                return words;
            }

            function createPopup() {
                if (!popup) {
                    popup = document.createElement('div');
                    popup.style.position = 'fixed'; // Fixed position so it's always relative to viewport.
                    popup.style.zIndex = '9999';
                    popup.style.padding = '8px';
                    popup.style.border = '1px solid black';
                    popup.style.borderRadius = '4px';
                    popup.style.maxWidth = '300px'; // A reasonable width for readability.
                    popup.style.overflowY = 'auto'; // Scrollable if content is too long.
                    popup.style.maxHeight = '300px'; // Maximum height before scrolling.
                    popup.style.display = 'none';
                    popup.style.boxShadow = '0px 0px 8px rgba(0,0,0,0.2)'; // Soft shadow for depth.
                    window.config.popupStyles.forEach((style, index) => {
                        const styleNametmp = style.split(":")[0].trim();
                        const styleName = styleNametmp == "color" ? "color" :  styleNametmp.split("-").join(" ").replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
                            return index === 0 ? word.toLowerCase() : word.toUpperCase();
                        }).replace(/\s+/g, ''); // background-color -> backgroundColor
                        const styleValue = style.split(":")[1].split(";")[0].trim();

                        popup.style[styleName] = styleValue;
                    })
                    document.body.appendChild(popup);
                    // console.log("Popup created!");
                }
            }

            function showPopup(x, y, definition) {
                createPopup();
                // console.log("Displaying popup at:", x, y);
                
                // Add the content to the popup to calculate its height.
                popup.innerHTML = definition; 
                
                // Check if popup is out of screen when displayed below the cursor.
                let overflowBelow = (y + popup.offsetHeight + 10) > window.innerHeight;

                if (overflowBelow) {
                    // If it overflows, display it above the cursor.
                    popup.style.top = `${y - popup.offsetHeight - 10}px`; 
                } else {
                    // Else, display it below the cursor as usual.
                    popup.style.top = `${y + 10}px`;
                }

                popup.style.left = `${x + 10}px`;
                popup.style.display = 'block';
            }

            document.addEventListener('mouseout', () => {
                if (popup) {
                    popup.style.display = 'none';
                }
            });
        })
    });
}