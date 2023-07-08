// ==UserScript==
// @name         prevent enter opus from t.bilibili
// @namespace    tbili_no_enter
// @version      0.1
// @description  make a better bulibuli!
// @author       owlsome2501
// @match        *://t.bilibili.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    function delete_all_event() {
        let ta = document.querySelectorAll(".text div[class='content']")
        ta.forEach(el => {
            let elc = el.cloneNode(true);
            el.parentNode.replaceChild(elc, el);
        })
    }
    setInterval(delete_all_event, 2000);
})();
