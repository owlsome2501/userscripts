// ==UserScript==
// @name         tcms log viewer
// @namespace    owlsome2501
// @version      2024-12-05
// @description  try to take over the world!
// @author       owlsome2501
// @match        https://tcms.pingcap.net/api/v1/artifact-files/*/main.log
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pingcap.net
// @require      https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js
// @resource     hljsCss https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/default.min.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

(function() {
    'use strict';

    const hljsCss = GM_getResourceText('hljsCss');
    GM_addStyle(hljsCss);

    const preElements = document.querySelectorAll('pre');

    preElements.forEach(pre => {
        let lines = pre.textContent.split('\n');

        lines = lines.filter(line => !line.includes('long-running'));

        pre.textContent = lines.join('\n');

        hljs.highlightElement(pre);
    });

})();