// ==UserScript==
// @name         Make ugly and arrogant Github acceptable
// @namespace    owlsome2501
// @version      0.1
// @description  Make ugly and arrogant Github acceptable
// @author       owlsome2501
// @match        https://github.com/*
// @match        https://gist.github.com/*
// @icon         https://github.githubassets.com/pinned-octocat.svg
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    document.body.dataset.turbo = 'false'
    document.documentElement.setAttribute("lang", "zh-CN");
    // Your code here...
})();