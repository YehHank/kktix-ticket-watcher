// ==UserScript==
// @name         KKTIX 票券監控送到 TEAMS
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  每 1 分鐘傳送資料到 TEAMS webhook
// @match        https://kktix.com/events/*/registrations/new
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 取得或設定 webhook URL
    let webhookUrl = localStorage.getItem('kk_webhook_url');
    if (!webhookUrl) {
        webhookUrl = prompt("請輸入你的 Power Automate Webhook URL：");
        if (webhookUrl) {
            localStorage.setItem('kk_webhook_url', webhookUrl);
            alert("✅ 已儲存 Webhook URL，重新整理後生效！");
        } else {
            alert("❌ 沒有輸入 Webhook URL，腳本將不會運作！");
            return;
        }
    }

    // ⛏️ 從網址擷取 event ID
    const match = window.location.pathname.match(/\/events\/([^/]+)\/registrations\/new/);
    if (!match || !match[1]) {
        console.warn('❌ 無法擷取 Event ID');
        return;
    }
    const eventId = match[1];
    console.log('🎯 擷取到 event ID:', eventId);

    const JsonUrl = `https://kktix.com/g/events/${eventId}/base_info`;

    function extractInventoryFromWindow() {
        try {
            const rawScript = [...document.scripts].find(s => s.textContent.includes('window.inventory ='));
            const match = rawScript.textContent.match(/window\.inventory\s*=\s*(\{.*?\});/s);
            if (match && match[1]) {
                return JSON.parse(match[1]).inventory.ticketInventory;
            }
        } catch (err) {
            console.error('❌ 無法解析 window.inventory', err);
        }
        return null;
    }

    async function fetchAndSend() {
        try {
            const inventoryMap = extractInventoryFromWindow();
            if (!inventoryMap) {
                console.warn('❌ 找不到 ticketInventory');
                return;
            }

            const baseInfo = await fetch(JsonUrl, { credentials: 'include' }).then(res => res.json());
            const tickets = baseInfo.eventData.tickets;

            const merged = tickets.map(t => ({
                name: t.name,
                id: t.id,
                price: t.price.cents / 100,
                remaining: inventoryMap[t.id] ?? null,
                status: (inventoryMap[t.id] ?? 0) > 0 ? '✅ 有票' : '❌ 售完'
            }));

            const mergedText = merged.map(t => `${t.name} - ${t.status}（剩餘 ${t.remaining} 張 / NT$${t.price}）`).join('<br/>');

            const availableTickets = merged.filter(t => t.remaining > 0);
            if (availableTickets.length === 0) {
                console.log('🛑 全部票種售完，不送出 webhook');
                return;
            }

            console.table(merged);

            const concertTitle = document.title.trim();
            console.log('🎯 擷取到 concert Title:', concertTitle);

            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: "message",
                    attachments: [
                        {
                            contentType: "application/vnd.microsoft.card.adaptive",
                            content: {
                                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                                type: "AdaptiveCard",
                                version: "1.4",
                                body: [
                                    {
                                        type: "TextBlock",
                                        text: `演唱會名稱:<br/>${concertTitle}<br/>售票資訊:<br/>${mergedText}<br/>連結網址:<a href='${document.URL}'>這裡</a>`,
                                        wrap: true
                                    }
                                ]
                            }
                        }
                    ]
                })
            });

        } catch (err) {
            console.error('❌ 發送失敗', err);
        }
    }

    // 一進頁面就執行一次
    fetchAndSend();

    // 每 1 分鐘重新整理頁面
    const RELOAD_INTERVAL = 60000;
    setTimeout(() => {
        location.reload();
    }, RELOAD_INTERVAL);
})();