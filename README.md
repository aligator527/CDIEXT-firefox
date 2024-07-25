File Structure
```
    .
    ├──📕 assets // This directory stores static assets such as CSS, JavaScript, and image files.
    │   ├──📕 js // Scripts for the popup and the content scripts.
    │   │   └──📄 content.js
    │   └──📕 img // Images used by the extension, such as icons
    │       ├──📄 icon.png
    |       └──📄 icon_disabled.png
    ├──📕 data // This directory contain CC-CEDICT file
    ├──📕 options // This directory contain options Page and configure file
    |   ├──📄 options.html
    |   ├──📄 options.js
    |   └──📄 configure.json
    ├──📕 reader // This directory contain the HTML&JS file that represents the reader window of the extension
    │   ├──📄 reader.html
    |   └──📄 reader.js
    ├──📄 manifest.json // This is the manifest file for the extension. It specifies basic metadata for the extension, like its name and version, permissions it requires, and scripts it needs to run.
    └──📄 background.js // This is the background script of the extension. It listens for events and controls the behavior of the extension.
    ├──📄CedictToAdvancedJson.py // Generate cedict_advanced.json (you can see format of file lower in README, also file is located at CDIEXT-firefox/data)
    ├──📄CedictToJson.py // Generate cedict.json (simplified version of dictionary, not used in this extension)
    ├──📄LICENCE
    ├──📄README.MD
```