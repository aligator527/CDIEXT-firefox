const READER_URL = browser.runtime.getURL("reader/reader.html");

function setVersion() {
  const versionEl = document.getElementById("version");
  if (versionEl) versionEl.textContent = browser.runtime.getManifest().version;
}

function openOptions() {
  browser.runtime.openOptionsPage();
}

function openReader() {
  browser.windows.create({ url: READER_URL, type: "popup", width: 800, height: 300 });
}

document.addEventListener("DOMContentLoaded", () => {
  setVersion();

  document.getElementById("open-options")?.addEventListener("click", openOptions);
  document.getElementById("open-options-2")?.addEventListener("click", openOptions);
  document.getElementById("open-reader")?.addEventListener("click", openReader);
});
