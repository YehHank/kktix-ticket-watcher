# 🎫 KKTIX 報名監控器 + Power Automate Webhook 整合版

這是一個 Tampermonkey 腳本，能夠在你打開 KKTIX 報名頁時，自動監控票券是否有剩餘票。如果有票，會透過 Webhook 將資訊傳送到你設定好的 Power Automate 流程，發送 Adaptive Card 訊息到 Teams、Email 或任何你設定的流程！

---

## ✨ 功能特色

- ⏱ 一打開報名頁就會偵測票券狀態
- ✅ 若有票自動送出 webhook，沒有票則安靜不打擾
- 🔁 每 1 分鐘自動刷新頁面，持續監控
- 🧠 提供 UI 視窗讓你輸入 Webhook URL，一次設定永久使用（儲存在 localStorage）

---

## 🖥 安裝方式

### 1. 安裝 [Tampermonkey 擴充套件](https://www.tampermonkey.net/)

請先到你的瀏覽器（Chrome、Edge）安裝 Tampermonkey。

### 2. 點擊以下連結安裝腳本

👉 [安裝腳本](https://raw.githubusercontent.com/YehHank/kktix-ticket-watcher/main/kktix-watcher.user.js)

安裝後，腳本會自動在你瀏覽以下網址時啟動：

https://kktix.com/events/*/registrations/new

## 🧪 初次使用教學

1. 打開任意一個 KKTIX 報名頁（ex: https://kktix.com/events/xxx/registrations/new）
2. 腳本會跳出一個輸入框，讓你貼上 Power Automate 的 Webhook URL
3. 貼上後會儲存到 localStorage，之後就自動執行
4. 有票 → 傳送 webhook，沒票 → 安靜潛水

如需更改 Webhook，可打開瀏覽器 Console，輸入以下指令清除設定：
```js
localStorage.removeItem('kk_webhook_url');
```
