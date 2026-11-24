# 2027 首爾五天四夜旅遊網站

手機優先的靜態旅遊手冊。網站功能版本為 v1.9.2，原正式行程基準為 v1.8；v1.8 原始文件與 Git 歷史均保留。

## 版本

- 網站功能版本：v1.9.2
- 原正式行程基準：v1.8
- 升級基準：`80206d02710207ee18ab6f233786fb98dc0db0b8`

## 功能

- Day 1～5 每日行程與交通提示
- NAVER Map 外部連結
- 店家與超市購物清單
- 下一站快捷導航與手動指定
- 行程完成勾選、雙重確認重設
- 韓文地址一鍵複製
- 重要時間分類與 iPhone 行事曆 `.ics`
- PWA 離線閱讀與加入主畫面
- 淺色、深色、跟隨系統三種主題（預設淺色）
- Day 2 棉被購物與 Day 5 寄物失敗備案
- Day 5 AREX 預計時段與未確認班次提示
- Day 3 晚餐首選、蠶室熱湯備案與景福宮美食候選
- Day 4 通大排骨晚餐首選及雪冰、回飯店、SPAREX 動線
- 購物與行程勾選分開保存在 localStorage
- 手機與桌面版響應式排版

## 本機預覽

可直接開啟 `index.html`，或在專案目錄啟動靜態伺服器：

```sh
python3 -m http.server 8000
```

再開啟 `http://127.0.0.1:8000/`。

Service Worker 只會在 HTTP／HTTPS 環境啟用；直接以 `file://` 開啟時無法測試離線功能。

## 測試

靜態與內容比對：

```sh
node --test tests/static.test.cjs
```

手機、localStorage、剪貼簿、ICS、PWA 更新與離線 E2E：

```sh
NODE_PATH=/path/to/node_modules node tests/e2e.cjs
```

## 正式網址

- GitHub Repository：https://github.com/feng-lin-rice/2027-seoul-five-day-trip
- GitHub Pages：https://feng-lin-rice.github.io/2027-seoul-five-day-trip/

## 注意事項

- NAVER Map 需要網路連線。
- 第一次離線使用前，必須先在有網路時完整開啟網站。
- Safari 與 iPhone 主畫面 Web App 可能使用不同儲存環境，勾選資料不保證自動同步。
- 勾選狀態不會跨瀏覽器或跨裝置同步。
- 商品圖片為包裝示意，不保證與現場品牌或 2027 年包裝相同。
- 2027 年營業時間、交通班次與休館日仍須依當期公告確認。
