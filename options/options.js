document.addEventListener('DOMContentLoaded', () => {
    function ensureConfigLoaded(callback) {
        if (typeof window.loadSettings === 'function') {
            callback();
        } else {
            setTimeout(() => ensureConfigLoaded(callback), 100);
        }
    }

    const fontList = [
      "Arial", "Arial Black", "Comic Sans MS", "Courier New", "Georgia", "Impact", 
      "Lucida Console", "Lucida Sans Unicode", "Palatino Linotype", "Tahoma", 
      "Times New Roman", "Trebuchet MS", "Verdana", "Courier", "Helvetica", "Times", 
      "Monaco", "Consolas"
    ];

    function detectFontAvailability() {
      const availableFonts = [];
      const testString = "mmmmmmmmmmlli";
      const baseFonts = ["monospace", "sans-serif", "serif"];
      
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      
      function getTextWidth(font, text) {
        context.font = font;
        return context.measureText(text).width;
      }
      
      for (const font of fontList) {
        let detected = false;
        for (const baseFont of baseFonts) {
          const baseWidth = getTextWidth(`72px ${baseFont}`, testString);
          const fontWidth = getTextWidth(`72px ${font}, ${baseFont}`, testString);
          if (baseWidth !== fontWidth) {
            detected = true;
            break;
          }
        }
        if (detected) {
          availableFonts.push(font);
        }
      }
      return availableFonts;
    }

    const script = document.createElement('script');
    script.src = browser.runtime.getURL('options/configure.js');
    document.head.appendChild(script);
    
    script.onload = () => {
        ensureConfigLoaded(() => {
            window.loadSettings().then(() => {
              const availableFonts = detectFontAvailability();
              const fontOptionsHTML = availableFonts.map(font => `<option value="${font}">${font}</option>`).join('');

                function createStyleInputs(groupId, stylesArray) {
                  const groupDiv = document.getElementById(groupId);
                  stylesArray.forEach((style, index) => {
                    const styleName = style.split(":")[0].trim();
                    const styleValue = style.split(":")[1].split(";")[0].trim();
                    
                    const label = document.createElement('label');
                    label.textContent = styleName + ":";
          
                    let input;
          
                    if (styleName === "font-weight") {
                      input = document.createElement('select');
                      ["100", "200", "300", "400", "500", "600", "700", "800", "900"].forEach(value => {
                        const option = document.createElement('option');
                        option.value = value;
                        option.textContent = value;
                        if (value === styleValue) {
                          option.selected = true;
                        }
                        input.appendChild(option);
                      });
                    } else if (styleName === "font-size") {
                      input = document.createElement('input');
                      input.type = 'number';
                      input.value = styleValue.replace('px', '');
                    } else if (styleName === "color") {
                      input = document.createElement('input');
                      input.type = 'color';
                      input.value = styleValue;
                    } else if (styleName === "font-family") {
                      input = document.createElement('select');
                      input.innerHTML = fontOptionsHTML;
                      input.value = styleValue;
                    } else {
                      input = document.createElement('input');
                      input.type = 'text';
                      input.value = styleValue;
                    }
          
                    input.dataset.index = index;
                    input.dataset.styleName = styleName;
          
                    groupDiv.appendChild(label);
                    groupDiv.appendChild(input);
                  });
                }
          
                createStyleInputs('wordDisplayStyles-group', window.config.wordDisplayStyles);
                createStyleInputs('readingWithTonesStyles-group', window.config.readingWithTonesStyles);
                createStyleInputs('simplifiedChineseStyles-group', window.config.simplifiedChineseStyles);
                createStyleInputs('traditionalChineseStyles-group', window.config.traditionalChineseStyles);
                createStyleInputs('definitionStyles-group', window.config.definitionStyles);
          
                document.getElementById('options-form').addEventListener('submit', (event) => {
                  event.preventDefault();
          
                  // Function to get values from input fields
                  function getStyleValues(groupId) {
                    const groupDiv = document.getElementById(groupId);
                    const inputs = groupDiv.querySelectorAll('input, select');
                    return Array.from(inputs).map(input => `${input.dataset.styleName}: ${input.value}${input.type === 'number' ? 'px' : ''};`);
                  }
          
                  // Save the new settings
                  const newSettings = {
                    wordDisplayStyles: getStyleValues('wordDisplayStyles-group'),
                    readingWithTonesStyles: getStyleValues('readingWithTonesStyles-group'),
                    simplifiedChineseStyles: getStyleValues('simplifiedChineseStyles-group'),
                    traditionalChineseStyles: getStyleValues('traditionalChineseStyles-group'),
                    definitionStyles: getStyleValues('definitionStyles-group')
                  };

                  console.log(newSettings);
          
                  window.saveSettings(newSettings).then(() => {
                    alert('Settings saved! Reload extension to apply new settings');
                  });
                });
            });
        });
    };
  });
  