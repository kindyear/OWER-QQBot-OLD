const WebSocket = require('websocket');
const axios = require('axios');
const config = require('../config/config');
const httpHost = config.HTTP_HOST;
const owerApi = config.OWER_API;
const owerApiKey = config.OWER_API_KEY;
const { getCurrentTime } = require('../utils');
const sqlite3 = require('sqlite3').verbose();
const { isBotEnabledForGroup } = require('./dataBase'); // 引入数据库操作函数

let connection = null;

function setConnection(conn) {
    if (!connection) {
        connection = conn;
        connection.on('message', handleMessage);
    }
}

function handleMessage(message) {
    if (message.type === 'utf8') {
        const data = JSON.parse(message.utf8Data);
        const command = '/玩家信息'; // 监听的指令，调整为新指令
        if (data.post_type === 'message' && data.message_type === 'group' && data.message.startsWith(command)) {

            // 检查群号是否存在于数据库并且是否启用机器人功能
            isBotEnabledForGroup(data.group_id)
                .then((isEnabled) => {
                    if (isEnabled) {

                        // 获取玩家的 BattleTag，格式为 "/玩家信息KINDYEAR#1336"
                        const playerTag = data.message.replace(command, '').replace('#', '-').trim();

                        // 先回复正在查询信息中
                        const loadingMessage = `正在查询 ${playerTag} 的信息中，请稍等...`;

                        sendGroupMessage(data.group_id, loadingMessage);
                        // 发起 HTTP GET 请求获取玩家信息
                        const url = `${owerApi}/v1/api/playerinfo?apiKey=${owerApiKey}&playerTag=${playerTag}`;
                        axios.get(url)
                            .then((response) => {
                                const playerInfo = response.data;
                                if (playerInfo.error === 'Failed to scrape data.') {
                                    const errorMessage = '获取玩家信息失败，请检查BattleTag是否正确或稍后重试';
                                    sendGroupMessage(data.group_id, errorMessage);
                                } else {
                                    const replyMessage = constructReplyMessage(playerInfo); // 调用 constructReplyMessage 函数
                                    sendGroupMessage(data.group_id, replyMessage);
                                }
                            })
                            .catch((error) => {
                                console.error(`${getCurrentTime()} 获取玩家信息失败：`, error.message);
                                const errorMessage = '获取玩家信息失败，请检查BattleTag是否正确或稍后重试';
                                sendGroupMessage(data.group_id, errorMessage);
                            });
                    } else {
                        // 群号未启用机器人功能，不做处理
                        console.log(`${getCurrentTime()} 群号 ${data.group_id} 未启用机器人功能，不处理指令。`);
                    }
                })
                .catch((error) => {
                    console.error(`${getCurrentTime()} 查询群号状态失败：`, error.message);
                });
        }
    }
}

function constructReplyMessage(playerInfo) {
    if (playerInfo && playerInfo.playerBaseInfo) {
        const { playerTag, playerTitle, endorsementLevel } = playerInfo.playerBaseInfo;
        const { PC } = playerInfo.playerCompetitiveInfo;

        // 处理竞技信息
        const tank = PC?.Tank ? `${PC.Tank.playerCompetitivePCTank} - ${PC.Tank.playerCompetitivePCTankTier}` : "无段位信息";
        const damage = PC?.Damage ? `${PC.Damage.playerCompetitivePCDamage} - ${PC.Damage.playerCompetitivePCDamageTier}` : "无段位信息";
        const support = PC?.Support ? `${PC.Support.playerCompetitivePCSupport} - ${PC.Support.playerCompetitivePCSupportTier}` : "无段位信息";

        // 构建回复消息
        const replyMessage = `BattleTag：${playerTag}\n玩家头衔：${playerTitle}\n赞赏等级：${endorsementLevel}\n\n竞技信息：\n坦克：${tank}\n输出：${damage}\n辅助：${support}`;

        return replyMessage;
    }

    return "获取玩家信息失败或无相关信息";
}

function sendGroupMessage(groupID, message) {
    const url = `${httpHost}/send_group_msg?group_id=${groupID}&message=${encodeURIComponent(message)}`;

    axios.get(url)
        .then((response) => {
            console.log(`${getCurrentTime()} 消息发送成功: ${message}`);
            console.log(response.data); // 如果需要获取响应数据，可以在这里进行处理
        })
        .catch((error) => {
            console.error(`${getCurrentTime()} 消息发送失败: ${message}`);
            console.error(error.message);
        });
}

// 检查 BattleTag 的合法性
function isValidBattleTag(playerTag) {
    const regex = /^[a-zA-Z0-9]{3,10}-[0-9]{4,5}$/;
    return regex.test(playerTag);
}

module.exports = {
    setConnection,
    // 可以导出其他功能函数，供其他文件引用
};
