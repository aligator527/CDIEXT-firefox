<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="assets/img/icon.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">CDIEXT</h3>

  <p align="center">
    A pop-up dictionary extension for Chinese with Reader Function
    <br />    
    <br />
    <a href="https://github.com/aligator527/CDIEXT-firefox/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    ·
    <a href="https://github.com/aligator527/CDIEXT-firefox/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![Game Screen Shot][game-screenshot]](https://example.com)

I used Nazeka in Firefox with Textractor to learn Japanese through visual novels. However, when I tried to apply the same method to learn Chinese, I couldn't find an extension that allows copying text from the clipboard into a separate window for translation. Therefore, I decided to create my own extension to facilitate learning Chinese through visual novels. This extension also works with web pages and even INPUT elements, which other extensions don't support. It seems like I'm the only one who cares about this functionality!

So, basically, there are:

- **Pop-up Dictionary for Web Pages**: Instantly translate words on web pages using a pop-up dictionary.
- **Separate Window for Clipboard Text**: Copy Chinese text from the clipboard (using Textractor for visual novels) and view translations in a separate window.
- **Word Translation Check**: Easily check translations of words in the separate window.
- **Customizable Styles**: Adjust the extension's appearance through the Options window.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

![Game Screen Shot][game-screenshot]
![WikiPedia Screen Shot][wikipedia-screenshot]
![Youtube Screen Shot][youtube-screenshot]

### Keyboard shortcuts


| Action                    | Shortcut               |
| ------------------------- | ---------------------- |
| Play audio                | `A`                    |
| Add top entry to Anki     | `D`                    |
| Close / dismiss pop-up    | `Esc`                  |
| Toggle sticky mode        | `Alt+Shift+S`          |
| Enable / disable look-ups | Click the toolbar icon |

The `A` and `D` keys can be changed in the Options page. A welcome/guide page opens on install and is also available from the toolbar context menu (**Help / Guide**).

### Anki export

Adding cards requires the [AnkiConnect](https://ankiweb.net/shared/info/2055492159) add-on. After installing it, open `Tools -> Add-ons -> AnkiConnect -> Config` in Anki and add this extension to `webCorsOriginList` (the simplest option is `["*"]`), then restart Anki — otherwise AnkiConnect silently blocks the request. Set your deck name, note type, and field names in the Options page so they match your Anki setup.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Build

### 1. Generate the dictionary data

Download the CC-CEDICT file from https://www.mdbg.net/chinese/dictionary?page=cc-cedict (look for `cedict_1_0_ts_utf-8_mdbg.zip`).

Put `cedict_ts.u8` next to `tools/CedictToAdvancedJson.py` and run:

    python tools/CedictToAdvancedJson.py

This produces `cedict_1.json` ... `cedict_10.json`. Move them into the `data/` folder.

### 2. Build the extension

The extension is bundled with [esbuild](https://esbuild.github.io/) and tooled with [web-ext](https://github.com/mozilla/web-ext). You need [Node.js](https://nodejs.org/) 18+.

    npm install      # install dev dependencies
    npm run build    # bundle the extension into dist/

Available scripts:

| Script            | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `npm run build`   | Bundle `src/` into `dist/`.                          |
| `npm run watch`   | Rebuild on file changes.                             |
| `npm run dev`     | Launch Firefox with the extension via `web-ext run`. |
| `npm run lint`    | Run ESLint and `web-ext lint`.                       |
| `npm run format`  | Format the codebase with Prettier.                   |
| `npm run package` | Build and produce a distributable zip.               |

### 3. Load it in Firefox

Open `about:debugging` -> **This Firefox** -> **Load Temporary Add-on...** and select `dist/manifest.json`.

<!-- ROADMAP -->

## Roadmap

- [x] Add options for styles of pop-up dictionary
- [x] Add options for styles of reader
- [x] Add sticky mode
  - [x] Add hotkey for sticky mode (`Alt+Shift+S`)
- [x] Add function of playing audio (Web Speech API)
- [x] Add function of adding word to Anki (AnkiConnect)
- [ ] Vocabulary history: store looked-up words, show a list, bulk export to CSV/Anki.
- [x] Smarter segmentation: the scanner is greedy forward-only; add dictionary-based longest-match for better multi-character words.
- [ ] HSK level / frequency tags with color coding in the popup.
- [ ] Pinyin vs. Zhuyin (bopomofo) display toggle.
- [ ] Per-site enable/disable + domain blacklist, and popup theming/dark mode.
- [ ] Cross-browser (Chrome) support
- [ ] i18n via \_locales, and unit tests (Vitest) for pinyin.js/dictionary.js.
- [x] Performance: precomputed/trie index or IndexedDB caching for faster cold starts.

See the [open issues](https://github.com/aligator527/CDIEXT-firefox/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- File Structure -->

## File Structure

Source lives in `src/` and is bundled into `dist/` (git-ignored) by `build.mjs`.

```
    .
    ├──📕 src // Extension source code (bundled by esbuild).
    │   ├──📕 background    // Event-page script: dictionary lookup, toggle, context menus, Anki, commands.
    │   │   └──📄 index.js
    │   ├──📕 content       // Content script: hover pop-up dictionary on web pages and inputs.
    │   │   └──📄 index.js
    │   ├──📕 reader        // Reader window that grabs Chinese text from the clipboard.
    │   │   ├──📄 reader.html
    │   │   └──📄 index.js
    │   ├──📕 options       // Options page for customizing styles and behavior.
    │   │   ├──📄 options.html
    │   │   └──📄 index.js
    │   └──📕 shared        // Reusable modules imported by the entry points.
    │       ├──📄 config.js      // Default settings + load/save helpers.
    │       ├──📄 dictionary.js  // Load CC-CEDICT chunks, build index, find definitions.
    │       ├──📄 pinyin.js      // Numbered pinyin -> tone marks.
    │       ├──📄 wordScanner.js // Detect candidate words under the cursor.
    │       ├──📄 popup.js       // Shared definition pop-up (audio + Anki buttons, sticky mode).
    │       ├──📄 hover.js       // Wire hover lookups to the pop-up.
    │       ├──📄 styles.js      // Apply "prop: value;" style arrays to elements.
    │       └──📄 messages.js    // Message action constants.
    ├──📕 assets/img // Icons used by the extension.
    ├──📕 data       // CC-CEDICT JSON chunks (cedict_1.json ... cedict_10.json).
    ├──📕 tools      // Python scripts that generate the dictionary JSON from CC-CEDICT.
    │   ├──📄 CedictToAdvancedJson.py // Generate cedict_1..10.json (format used by this extension).
    │   └──📄 CedictToJson.py         // Generate a simplified cedict.json (not used by the extension).
    ├──📄 manifest.json   // Manifest V3 metadata, permissions, and entry points.
    ├──📄 build.mjs       // esbuild bundler + static-file copier.
    ├──📄 package.json    // npm scripts and dev dependencies.
    ├──📄 LICENSE
    └──📄 README.md
```

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Ivan Dolgov - [LinkedIn](https://www.linkedin.com/in/aligator527/) - aligator527official@gmail.com

Project Link: [https://github.com/aligator527/CDIEXT-firefox](https://github.com/aligator527/CDIEXT-firefox)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

Thank you for N1, Nazeka-sama.

- [Nazeka](https://github.com/wareya/nazeka)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/aligator527/CDIEXT-firefox.svg?style=for-the-badge
[contributors-url]: https://github.com/aligator527/CDIEXT-firefox/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/aligator527/CDIEXT-firefox.svg?style=for-the-badge
[forks-url]: https://github.com/aligator527/CDIEXT-firefox/network/members
[stars-shield]: https://img.shields.io/github/stars/aligator527/CDIEXT-firefox.svg?style=for-the-badge
[stars-url]: https://github.com/aligator527/CDIEXT-firefox/stargazers
[issues-shield]: https://img.shields.io/github/issues/aligator527/CDIEXT-firefox.svg?style=for-the-badge
[issues-url]: https://github.com/aligator527/CDIEXT-firefox/issues
[license-shield]: https://img.shields.io/github/license/aligator527/CDIEXT-firefox.svg?style=for-the-badge
[license-url]: https://github.com/aligator527/CDIEXT-firefox/blob/main/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/aligator527
[game-screenshot]: readme_assets/game.png
[wikipedia-screenshot]: readme_assets/wikipedia.png
[youtube-screenshot]: readme_assets/youtube.png
