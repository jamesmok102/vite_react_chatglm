# vite_react_chatglm

## 介紹

使用了Vite＋React＋ChakraUI做出來的ChatGLM的前端項目，有上下文＋SSE流傳輸，代碼有格式有高亮。

- ChatGLM后端API請看[ChatGLM-6B流式HTTP API示例](https://github.com/TylunasLi/ChatGLM-web-stream-demo)
- 這項目的SSE庫請看[sse.js](https://github.com/mpetazzoni/sse.js)

## 食用方法
1. 在你的ChatGLM配置好上面提供API
2. 在項目根目錄新建.env.local文件然後增加環境變量
```
VITE_CHATGLM_STREAM_API = "http://你的API/stream"
```
3. 回到這個項目生成靜態文件
```
yarn build
```

## 開發計劃

- [ ] 流輸出強制中止
- [ ] 對話記錄本地序列化保存

## 目前發現的Bug

- [ ] 輸出Solidity語言等小語種的代碼，代碼區域背景會不見，代碼會超出父容器的寬度

## 效果

![Result](https://i.328888.xyz/2023/04/19/iFrgYH.gif)



