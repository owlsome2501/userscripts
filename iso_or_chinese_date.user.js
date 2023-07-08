// ==UserScript==
// @name ISO or Chinese Formatted Time/Date for Github & StackOverflow
// @name:zh-CN 修改Github和StackOverflow等网站时间为ISO或者中文格式
// @namespace owlsome2501
// @version 1.0
// @description Change time/date to ISO or Chinese format for Github and stackoverflow websites.
// @description:zh-CN 把Github,stackoverflow等网站的时间转换为ISO或者中文格式
// @author owlsome2501
// @match https://github.com/*
// @match https://gist.github.com/*
// @match https://askubuntu.com/*
// @match https://stackapps.com/*
// @match https://superuser.com/*
// @match https://serverfault.com/*
// @match https://mathoverflow.net/*
// @match https://*.stackoverflow.com/*
// @match https://*.stackexchange.com/*
// @icon https://github.com/favicon.ico
// @grant none
// @run-at document-end
// ==/UserScript==

(function () {
    'use strict';
    document.documentElement.setAttribute("lang", "zh-CN");
    // function replaceTime(){
    //     var time_list = document.querySelectorAll("span.relativetime, span.relativetime-clean")
    //     time_list.forEach(function(ele) {
    //         ele.innerText = ele.title.substring(0,16);
    //     })
    //     var items = document.getElementsByTagName("relative-time")
    //     for (var i = 0; i < items.length; i++) {
    //         var item = items[i];
    //         item.innerHTML = item.getAttribute("datetime").substring(0,16).replace(/T/," ");
    //     }
    // }
    // replaceTime();
    // var observer = new MutationObserver(function (mutations, observer) {
    //     replaceTime();
    // });
    // var body = document.querySelector('body');
    // var options = { 'childList': true };
    // observer.observe(body, options);

})();