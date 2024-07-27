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

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Build

First of all, download the Cedict file from https://www.mdbg.net/chinese/dictionary?page=cc-cedict (look for `cedict_1_0_ts_utf-8_mdbg.zip`).

Put `cedict_ts.u8` to the folder with `CedictToAdvancedJson.py` and run the code:

    python CedictToAdvancedJson.py

Then you get files `cedict_1.json`, `cedict_2.json`, ..., `cedict_10.json`. 

Put them inside `data` folder.

Then run `about:debugging` in Firefox, add extension by uploading `manifest.json` file 

<!-- ROADMAP -->
## Roadmap

- [X] Add options for styles of pop-up dictionary
- [ ] Add options for styles of reader
- [ ] Add sticky mode
  - [ ] Add hotkey for sticky mode
- [ ] Add function of playing audio
- [ ] Add function of adding word to Anki

See the [open issues](https://github.com/othneildrew/Best-README-Template/issues) for a full list of proposed features (and known issues).

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

* [Nazeka](https://github.com/wareya/nazeka)

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