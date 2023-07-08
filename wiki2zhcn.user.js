// ==UserScript==
// @name         wiki2zhcn
// @namespace    owlsome2501
// @version      0.1
// @description  redirect to zh-cn wikipedia
// @author       owlsome2501
// @match        https://zh.wikipedia.org/wiki/*
// @match        https://zh.wikipedia.org/zh-hans/*
// @match        https://zh.m.wikipedia.org/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    var zhcn_path = location.pathname.replace(/\/.*\/(.*)/,"/zh-cn/$1");
    var url = "https://zh.wikipedia.org" + zhcn_path;
    location.replace(url);
})();