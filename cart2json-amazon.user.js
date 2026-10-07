// ==UserScript==
// @name         Amazon Cart to JSON Extractor
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Extracts Amazon shopping cart items to a JSON array of objects (Product Name, Link, Cost, Qty).
// @author       You
// @match        https://www.amazon.com/gp/cart/view.html*
// @match        https://www.amazon.com/cart*
// @grant        GM_setClipboard
// @updateURL    https://github.com/TechplexEngineer/userscript-amazon-cart-export/raw/refs/heads/main/cart2json-amazon.user.js
// @downloadURL  https://github.com/TechplexEngineer/userscript-amazon-cart-export/raw/refs/heads/main/cart2json-amazon.user.js
// ==/UserScript==

(function() {
    'use strict';

    function extractCart() {
        const items = [];
        // Amazon cart items are generally stored in containers with the 'sc-list-item' class
        const cartItems = document.querySelectorAll('.sc-list-item, div[data-asin]');

        cartItems.forEach(item => {
            // Ignore hidden items or items moved to "Save for later" without a visible title
            const titleElement = item.querySelector('.sc-product-title, .sc-item-product-title, .a-truncate-cut');
            if (!titleElement) return;

            const product_name = titleElement.innerText.trim();

            const linkElement = item.querySelector('.sc-product-link, a.a-link-normal');
            const link = linkElement ? linkElement.href.split('?')[0] : ''; // Splits at '?' to remove tracking parameters

            const priceElement = item.querySelector('.sc-product-price, .sc-badge-price, .a-price .a-offscreen');
            const cost = priceElement ? priceElement.innerText.trim() : '';

            let qty = "1";
            const qtyElement = item.querySelector('span.a-dropdown-prompt');
            if (qtyElement) {
                qty = qtyElement.innerText.trim();
            } else {
                const qtyInput = item.querySelector('input[name="quantity"], select[name="quantity"]');
                if (qtyInput) {
                    qty = qtyInput.value;
                }
            }

            // Only add items that successfully parsed a product name and cost
            if (product_name && cost) {
                items.push({
                    product_name,
                    link,
                    cost,
                    qty
                });
            }
        });

        const jsonOutput = JSON.stringify(items, null, 2);
        console.log("Extracted Cart JSON:", jsonOutput);

        // Copy to clipboard using Tampermonkey's API
        if (typeof GM_setClipboard !== "undefined") {
            GM_setClipboard(jsonOutput);
            alert(`Successfully extracted ${items.length} items to your clipboard!`);
        } else {
            alert(`Successfully extracted ${items.length} items! Please check your browser's Developer Console.`);
        }
    }

    // Create and style the floating extraction button
    const btn = document.createElement('button');
    btn.innerText = "Extract Cart to JSON";
    btn.style.position = "fixed";
    btn.style.bottom = "20px";
    btn.style.right = "20px";
    btn.style.zIndex = "999999";
    btn.style.padding = "12px 18px";
    btn.style.backgroundColor = "#FF9900";
    btn.style.color = "#111";
    btn.style.border = "1px solid #a88734";
    btn.style.borderRadius = "8px";
    btn.style.cursor = "pointer";
    btn.style.fontWeight = "bold";
    btn.style.fontSize = "14px";
    btn.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";

    // Hover effects
    btn.onmouseover = () => btn.style.backgroundColor = "#e78a00";
    btn.onmouseout = () => btn.style.backgroundColor = "#FF9900";

    btn.onclick = (e) => {
        e.preventDefault();
        extractCart();
    };

    document.body.appendChild(btn);
})();
