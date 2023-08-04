/*

    app.js
    主程序入口

 */

console.log('Starting OWER-QQBot...');
const WebSocket = require('websocket');
const axios = require('axios');
const config = require('./config/config');
const wsUrl = config.WEBSOCKET_HOST;
const getPlayerInfo = require('./function/getPlayerInfo');
const {getCurrentTime} = require('./utils');
const packageInfo = require('./package.json');


// 创建 WebSocket 连接
const ws = new WebSocket.client();

ws.on('connectFailed', (error) => {
    console.log(`${getCurrentTime()} WebSocket Connection failure:`, error);
});

ws.on('connect', (connection) => {
    console.log(`${getCurrentTime()} OWER-QQBot v${packageInfo.version} started.`);
    console.log(`${getCurrentTime()} Connected to the go-cqhttp WebSocket: ${wsUrl}`);

    connection.on('error', (error) => {
        console.log(`${getCurrentTime()} Websocket connection failure:`, error);
    });

    connection.on('close', () => {
        console.log(`${getCurrentTime()} Websocket connection closed:`);
    });

    getPlayerInfo.setConnection(connection); // 将连接传递给 getPlayerInfo.js 文件

    // 可以在这里添加其他逻辑，或者启动其他功能模块
});

ws.connect(wsUrl, null, null, null, null, { headers: { 'Authorization': 'Bearer your_access_token' } });

// 导出 WebSocket 连接对象，供其他文件引用
module.exports = ws;

