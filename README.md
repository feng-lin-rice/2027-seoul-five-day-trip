# 2027 首爾五天四夜旅遊網站

手機優先的靜態旅遊手冊，保留原始 v1.8 行程與版面。網站內容、樣式、圖片與互動程式均收在單一 `index.html`。

## 功能

- Day 1～5 每日行程與交通提示
- NAVER Map 外部連結
- 店家與超市購物清單
- 勾選結果保存在目前瀏覽器的 localStorage
- 手機與桌面版響應式排版

## 本機預覽

可直接開啟 `index.html`，或在專案目錄啟動靜態伺服器：

```sh
python3 -m http.server 8000
```

再開啟 `http://127.0.0.1:8000/`。

## 正式網址

- GitHub Repository：https://github.com/feng-lin-rice/2027-seoul-five-day-trip
- GitHub Pages：https://feng-lin-rice.github.io/2027-seoul-five-day-trip/

## 注意事項

- NAVER Map 需要網路連線。
- 勾選狀態不會跨瀏覽器或跨裝置同步。
- 商品圖片為包裝示意，不保證與現場品牌或 2027 年包裝相同。
- 2027 年營業時間、交通班次與休館日仍須依當期公告確認。
