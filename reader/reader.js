document.addEventListener("DOMContentLoaded", () => {
  const lineCountElement = document.getElementById("linecount");
  const pasteTarget = document.getElementById("cdiext-paste-target");
  const buttonPause = document.getElementById("button_pause");
  const buttonDelete = document.getElementById("button_delete");

  let isPaused = false;
  let lines = [];
  let lastCopiedText = "";
  let popup = null;

  function updateLineCount() {
    lineCountElement.textContent = lines.length;
  }

  function addLine(text) {
    const p = document.createElement("p");
    p.textContent = text;
    pasteTarget.value += text + "\n";
    pasteTarget.scrollTop = pasteTarget.scrollHeight;

    p.addEventListener("click", () => {
      browser.runtime
        .sendMessage({ action: "lookupWords", words: [text] })
        .then((response) => {
          console.log(response.definitions);
          if (response.definitions && response.definitions.length) {
            const combinedDefinitions = response.definitions
              .map((def) => `<div>${def}</div>`)
              .join("");
            showPopup(event.clientX, event.clientY, combinedDefinitions);
          } else if (popup) {
            popup.style.display = "none";
          }
        });
    });
    document.body.appendChild(p);
    lines.push(p);
    updateLineCount();
  }

  function deleteNewestLine() {
    if (lines.length > 0) {
      const p = lines.pop();
      const text = p.textContent + "\n";
      p.remove();
      pasteTarget.value = pasteTarget.value.replace(text, "");
      updateLineCount();
    }
  }

  function checkClipboard() {
    if (isPaused) return;

    navigator.clipboard
      .readText()
      .then((text) => {
        if (text.match(/[\u4e00-\u9fa5]/) && text !== lastCopiedText) {
          lastCopiedText = text;
          addLine(text);
        }
      })
      .catch((err) => {
        console.error("Failed to read clipboard contents: ", err);
      });
  }

  buttonPause.addEventListener("click", () => {
    isPaused = !isPaused;
    buttonPause.textContent = isPaused ? "Resume" : "Pause";
  });

  buttonDelete.addEventListener("click", () => {
    deleteNewestLine();
  });

  setInterval(checkClipboard, 1000);

  // Popup dictionary functionality
  document.addEventListener("mousemove", handleMouseMove);

  function handleMouseMove(event) {
    const words = getPotentialWordsFromPoint(event.clientX, event.clientY);
    if (words.length) {
      browser.runtime
        .sendMessage({ action: "lookupWords", words: words })
        .then((response) => {
          if (response.definitions && response.definitions.length) {
            const combinedDefinitions = response.definitions
              .map((def) => `<div>${def}</div>`)
              .join("");
            showPopup(event.clientX, event.clientY, combinedDefinitions);
          } else if (popup) {
            popup.style.display = "none";
          }
        });
    }
  }

  function getPotentialWordsFromPoint(x, y) {
    let startContainer;
    let offset;

    const element = document.elementFromPoint(x, y);
    if (
      element &&
      (element.tagName === "INPUT" || element.tagName === "TEXTAREA")
    ) {
      const value = element.value;
      const selectionStart = element.selectionStart;

      startContainer = { textContent: value };
      offset = selectionStart;
    } else {
      const position = document.caretPositionFromPoint(x, y);
      if (
        !position ||
        !position.offsetNode ||
        position.offsetNode.nodeType !== Node.TEXT_NODE
      ) {
        return [];
      }

      startContainer = position.offsetNode;
      offset = position.offset;
    }

    let words = [];
    let currentWord = "";
    let failures = 0;

    for (
      let i = offset;
      i < startContainer.textContent.length && failures < 2;
      i++
    ) {
      let char = startContainer.textContent[i];
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
      popup = document.createElement("div");
      popup.style.position = "fixed";
      popup.style.zIndex = "9999";
      popup.style.padding = "8px";
      popup.style.color = "black";
      popup.style.backgroundColor = "white";
      popup.style.border = "1px solid black";
      popup.style.borderRadius = "4px";
      popup.style.maxWidth = "300px";
      popup.style.fontFamily = "Arial, sans-serif";
      popup.style.fontSize = "12px";
      popup.style.overflowY = "auto";
      popup.style.maxHeight = "300px";
      popup.style.display = "none";
      popup.style.boxShadow = "0px 0px 8px rgba(0,0,0,0.2)";
      document.body.appendChild(popup);
    }
  }

  function showPopup(x, y, definition) {
    createPopup();

    popup.innerHTML = definition;

    let overflowBelow = y + popup.offsetHeight + 10 > window.innerHeight;
    if (overflowBelow) {
      popup.style.top = `${y - popup.offsetHeight - 10}px`;
    } else {
      popup.style.top = `${y + 10}px`;
    }

    popup.style.left = `${x + 10}px`;
    popup.style.display = "block";
  }

  document.addEventListener("mouseout", () => {
    if (popup) {
      popup.style.display = "none";
    }
  });
});
