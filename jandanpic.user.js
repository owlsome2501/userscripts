// ==UserScript==
// @name         煎蛋无聊图屏蔽已读
// @namespace    jandan
// @version      0.1.1
// @description  屏蔽已读的无聊图，每次以打开jandan.net/pic作为更新已读时间戳标准
// @author       owlsome2501
// @match        https://*.jandan.net/pic/*
// @match        https://*.jandan.net/pic
// @grant        GM_getValue
// @grant        GM.getValue
// @grant        GM_setValue
// @grant        GM.setValue
// @require      https://cdn.jsdelivr.net/npm/jquery@3.4.1/dist/jquery.min.js
// ==/UserScript==

(function() {
    'use strict';
    var last = GM_getValue("last_t_id", "0");
    var path = window.location.pathname;
    if(path == "/pic"){
        var newLast = GM_getValue("new_t_id", "0");
        if (newLast != "0" && last == "0"){
            last = newLast;
            GM_setValue("last_t_id", last);
        }
        newLast = $('.righttext a').sort(function(a, b){
            return a.innerHTML < b.innerHTML
        })[0].innerHTML
        GM_setValue("new_t_id", newLast);
    }
    if(last != "0"){
        $('.righttext a').each(function(index){
            if($(this).text() < last) {
                $(this).parents('li').hide()
            }else if($(this).text() == last){
                GM_setValue("last_t_id", GM_getValue("new_t_id"))
            }
        })
    }
})();
