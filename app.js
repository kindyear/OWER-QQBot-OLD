/*

    app.js
    主程序入口

 */
const WebSocket = require('websocket');
const axios = require('axios');
const config = require('./config/config');
const wsUrl = config.WEBSOCKET_HOST;
const getPlayerInfo = require('./function/getPlayerInfo');
const {getCurrentTime} = require('./utils');


// 创建 WebSocket 连接
const ws = new WebSocket.client();

ws.on('connectFailed', (error) => {
    console.log(`${getCurrentTime()} 连接失败:`, error);
});

ws.on('connect', (connection) => {
    console.log(`${getCurrentTime()} 已连接到go-cqhttp WebSocket`);

    connection.on('error', (error) => {
        console.log(`${getCurrentTime()} 连接错误:`, error);
    });

    connection.on('close', () => {
        console.log(`${getCurrentTime()} 连接已关闭`);
    });

    getPlayerInfo.setConnection(connection); // 将连接传递给 getPlayerInfo.js 文件

    // 可以在这里添加其他逻辑，或者启动其他功能模块
});

ws.connect(wsUrl, null, null, null, null, { headers: { 'Authorization': 'Bearer your_access_token' } });

// 导出 WebSocket 连接对象，供其他文件引用
module.exports = ws;

