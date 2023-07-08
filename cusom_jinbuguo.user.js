// ==UserScript==
// @name         custom style for jinbuguo.com
// @namespace    jinbuguo
// @version      0.1.1
// @description  custom style for jinbuguo.com
// @author       owlsome2501
// @match        *://www.jinbuguo.com/*
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    GM_addStyle(`
        body {
            margin-left: 20%;
            margin-right: 20%;
        }

        p {
            text-indent: 2em;
        }
    `)

})();
