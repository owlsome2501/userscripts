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

    // ====================
    // 样式设置
    // ====================
    const hljsCss = GM_getResourceText('hljsCss');
    GM_addStyle(hljsCss);

    const CUSTOM_STYLES = `
        .log-container {
            font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.4;
            background: #ffffff;
            color: #24292e;
            border-radius: 6px;
            padding: 16px;
            margin: 10px 0;
            overflow-x: auto;
            max-width: 100%;
            box-sizing: border-box;
        }

        .log-line {
            margin: 2px 0;
            white-space: pre;
            display: block;
        }

        .log-timestamp {
            color: #005cc5;
        }

        .log-level-info {
            color: #22863a;
        }

        .log-level-warn {
            color: #e36209;
        }

        .log-level-error {
            color: #cb2431;
        }

        .log-level-debug {
            color: #6f42c1;
        }

        .log-source {
            color: #6a737d;
        }

        .log-message {
            color: #24292e;
        }

        .log-field {
            color: #e36209;
        }

        .log-value-string {
            color: #032f62;
        }

        #format-toggle-global {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #0366d6;
            color: white;
            border: 1px solid #0366d6;
            border-radius: 4px;
            padding: 8px 16px;
            font-size: 13px;
            cursor: pointer;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
            z-index: 1000;
            opacity: 0.9;
            transition: all 0.2s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        #format-toggle-global:hover {
            opacity: 1;
            background: #0256c6;
        }

        .formatted-content {
            display: block;
            background: #f6f8fa;
            border: 1px solid #e1e4e8;
            border-radius: 4px;
            padding: 8px;
            margin: 4px 0;
            white-space: pre-wrap;
            word-wrap: break-word;
            font-family: inherit;
            font-size: inherit;
        }

        .json-formatted pre {
            margin: 0;
            font-family: inherit;
            font-size: inherit;
            background: transparent !important;
        }

        .hljs {
            display: block;
            overflow-x: auto;
            padding: 0.5em;
            background: #f6f8fa !important;
        }

        .hljs-keyword {
            color: #d73a49;
            font-weight: bold;
        }

        .hljs-string {
            color: #032f62;
        }

        .hljs-number {
            color: #005cc5;
        }

        .hljs-literal {
            color: #005cc5;
        }

        .hljs-boolean {
            color: #005cc5;
        }

        .hljs-null {
            color: #005cc5;
        }

        .hljs-attr {
            color: #22863a;
        }

        .hljs-punctuation {
            color: #6a737d;
        }
    `;

    GM_addStyle(CUSTOM_STYLES);

    // ====================
    // 配置常量
    // ====================
    const LOG_LEVEL_COLORS = {
        'INFO': 'log-level-info',
        'WARN': 'log-level-warn',
        'ERROR': 'log-level-error',
        'DEBUG': 'log-level-debug',
        'FATAL': 'log-level-error',
        'PANIC': 'log-level-error'
    };

    const HIGHLIGHT_RULES = [
        {
            regex: /\[\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}\.\d{3} \+\d{2}:\d{2}\]/,
            className: 'log-timestamp'
        },
        {
            regex: /\[(INFO|WARN|WARNING|ERROR|DEBUG|FATAL|PANIC)\]/i,
            className: (match) => {
                const level = match.replace(/[\[\]]/g, '').toUpperCase();
                return LOG_LEVEL_COLORS[level] || 'log-level-info';
            }
        },
        {
            regex: /\[[^\]]+\.go:\d+\]/,
            className: 'log-source'
        },
        {
            regex: /\[[^\]]+\.(java|cpp|c|py|js|ts|rs):\d+\]/,
            className: 'log-source'
        }
    ];

    const LONG_STRING_THRESHOLD = 50;

    // ====================
    // 字符串工具函数
    // ====================
    function containsEscapeChars(str) {
        return /\\[nrt"'\\]/.test(str);
    }

    function unescapeString(str) {
        let result = '';
        let i = 0;

        while (i < str.length) {
            const char = str[i];

            if (char === '\\' && i + 1 < str.length) {
                const nextChar = str[i + 1];
                const escapeMap = {
                    'n': '\n',
                    't': '\t',
                    'r': '\r',
                    '\\': '\\',
                    '"': '"',
                    "'": "'"
                };

                result += escapeMap[nextChar] || `\\${nextChar}`;
                i += 2;
            } else {
                result += char;
                i++;
            }
        }

        return result;
    }

    function isLikelyJSON(str) {
        const trimmed = str.trim();
        return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
               (trimmed.startsWith('[') && trimmed.endsWith(']'));
    }

    function formatJSON(str) {
        try {
            const parsed = JSON.parse(str);
            return JSON.stringify(parsed, null, 2);
        } catch (e) {
            return null;
        }
    }

    // ====================
    // 显示格式化函数
    // ====================
    function createJSONFormattedDisplay(content) {
        const container = document.createElement('div');
        container.className = 'formatted-content json-formatted';

        const pre = document.createElement('pre');
        pre.textContent = content;

        // 关键修改：设置语言类，让highlight.js知道这是JSON
        pre.className = 'language-json';

        // 使用highlight.js高亮JSON
        hljs.highlightElement(pre);

        container.appendChild(pre);
        return container;
    }

    function createTextFormattedDisplay(content) {
        const container = document.createElement('div');
        container.className = 'formatted-content';
        container.textContent = content;
        return container;
    }

    function createFormattedDisplay(quotedContent) {
        const contentWithoutQuotes = quotedContent.slice(1, -1);
        let processed = contentWithoutQuotes;

        // 处理转义字符
        if (containsEscapeChars(contentWithoutQuotes)) {
            processed = unescapeString(contentWithoutQuotes);
        }

        // 检查是否为JSON
        if (isLikelyJSON(processed)) {
            const jsonFormatted = formatJSON(processed);
            if (jsonFormatted) {
                return createJSONFormattedDisplay(jsonFormatted);
            }
        }

        // 检查是否为长字符串或包含转义字符
        if (containsEscapeChars(contentWithoutQuotes) ||
            contentWithoutQuotes.length > LONG_STRING_THRESHOLD) {
            return createTextFormattedDisplay(processed);
        }

        return null;
    }

    // ====================
    // 日志解析函数
    // ====================
    function tokenizeLine(line) {
        const tokens = [];
        let i = 0;
        const length = line.length;
        let inQuotes = false;
        let currentToken = '';
        let quoteChar = '';

        while (i < length) {
            const char = line[i];

            if (!inQuotes) {
                if (char === '"' || char === "'") {
                    inQuotes = true;
                    quoteChar = char;
                    if (currentToken) {
                        tokens.push({ type: 'text', content: currentToken });
                        currentToken = '';
                    }
                    currentToken += char;
                } else if (char === '[') {
                    if (currentToken) {
                        tokens.push({ type: 'text', content: currentToken });
                        currentToken = '';
                    }
                    currentToken += char;
                } else if (char === ']' && currentToken.startsWith('[')) {
                    currentToken += char;
                    tokens.push({ type: 'bracket', content: currentToken });
                    currentToken = '';
                } else {
                    currentToken += char;
                }
            } else {
                currentToken += char;

                // 处理转义字符
                if (char === '\\' && i + 1 < length) {
                    i++;
                    currentToken += line[i];
                } else if (char === quoteChar) {
                    inQuotes = false;
                    tokens.push({ type: 'quoted', content: currentToken });
                    currentToken = '';
                }
            }
            i++;
        }

        if (currentToken) {
            tokens.push({ type: inQuotes ? 'quoted' : 'text', content: currentToken });
        }

        return tokens;
    }

    function highlightTextFragment(text) {
        const fragment = document.createDocumentFragment();
        let lastIndex = 0;
        let matches = [];

        // 收集所有匹配
        HIGHLIGHT_RULES.forEach(rule => {
            const regex = new RegExp(rule.regex.source, 'g');
            let match;
            while ((match = regex.exec(text)) !== null) {
                matches.push({
                    start: match.index,
                    end: match.index + match[0].length,
                    text: match[0],
                    className: typeof rule.className === 'function' ? rule.className(match[0]) : rule.className
                });
            }
        });

        // 排序并去重
        matches.sort((a, b) => a.start - b.start);
        const filteredMatches = [];
        let lastEnd = 0;

        for (let match of matches) {
            if (match.start >= lastEnd) {
                filteredMatches.push(match);
                lastEnd = match.end;
            }
        }

        // 构建DOM
        for (let match of filteredMatches) {
            if (lastIndex < match.start) {
                fragment.appendChild(document.createTextNode(text.substring(lastIndex, match.start)));
            }

            const span = document.createElement('span');
            span.className = match.className;
            span.textContent = match.text;
            fragment.appendChild(span);

            lastIndex = match.end;
        }

        // 添加剩余文本
        if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
        }

        return fragment;
    }

    function createBracketElement(content) {
        const span = document.createElement('span');

        if (/^\[(INFO|WARN|WARNING|ERROR|DEBUG|FATAL|PANIC)\]$/i.test(content)) {
            const level = content.replace(/[\[\]]/g, '').toUpperCase();
            span.className = LOG_LEVEL_COLORS[level] || 'log-level-info';
        } else if (/^\[[^\]]+\]$/.test(content)) {
            span.className = content.includes('=') ? 'log-field' : 'log-source';
        }

        span.textContent = content;
        return span;
    }

    function createQuotedElement(content) {
        const wrapper = document.createElement('span');
        wrapper.className = 'log-value-string';
        wrapper.textContent = content;
        return wrapper;
    }

    function parseLogLine(line) {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'log-line';
        const tokens = tokenizeLine(line);

        tokens.forEach(token => {
            switch (token.type) {
                case 'text':
                    lineDiv.appendChild(highlightTextFragment(token.content));
                    break;
                case 'bracket':
                    lineDiv.appendChild(createBracketElement(token.content));
                    break;
                case 'quoted':
                    lineDiv.appendChild(createQuotedElement(token.content));
                    break;
            }
        });

        return lineDiv;
    }

    // ====================
    // UI 控制函数
    // ====================
    function createFormatButton() {
        const btn = document.createElement('button');
        btn.id = 'format-toggle-global';
        btn.textContent = '格式化字符串';
        btn.title = '格式化转义符、JSON和长字符串';

        btn.addEventListener('click', () => {
            formatAllStrings();
            btn.remove();
        });

        document.body.appendChild(btn);
        return btn;
    }

    function formatAllStrings() {
        const logContainers = document.querySelectorAll('.log-container');

        logContainers.forEach(container => {
            const quotedElements = container.querySelectorAll('.log-value-string');

            quotedElements.forEach(quotedEl => {
                const originalText = quotedEl.textContent;

                if (originalText.length >= 2 &&
                    ((originalText[0] === '"' && originalText[originalText.length - 1] === '"') ||
                     (originalText[0] === "'" && originalText[originalText.length - 1] === "'"))) {

                    const displayElement = createFormattedDisplay(originalText);
                    if (displayElement) {
                        quotedEl.innerHTML = '';
                        quotedEl.appendChild(displayElement);
                    }
                }
            });
        });
    }

    // ====================
    // 主流程函数
    // ====================
    function processLogs() {
        const preElements = document.querySelectorAll('pre:not(.processed-log)');

        if (preElements.length > 0) {
            createFormatButton();
        }

        preElements.forEach(pre => {
            const originalContent = pre.textContent;
            const lines = originalContent.split('\n');

            const container = document.createElement('div');
            container.className = 'log-container';

            lines.forEach(line => {
                if (!line.includes('long-running') && line.trim()) {
                    const lineElement = parseLogLine(line);
                    container.appendChild(lineElement);
                }
            });

            pre.classList.add('processed-log');

            if (container.children.length > 0) {
                pre.parentNode.replaceChild(container, pre);
            }
        });
    }

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', processLogs);
        } else {
            processLogs();
        }
    }

    // ====================
    // 启动
    // ====================
    init();

})();
