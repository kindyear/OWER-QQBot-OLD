const axios = require('axios');
const config = require('../config/config');
const httpHost = config.HTTP_HOST;
const owerApi = config.OWER_API;
const owerApiKey = config.OWER_API_KEY;
const { getCurrentTime } = require('../utils');
require('sqlite3').verbose();
const { isBotEnabledForGroup , getChineseTranslation} = require('./dataBase'); // 引入数据库操作函数

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
                                // console.log('API返回结果：', response.data); // 添加调试信息
                                const playerInfo = response.data;
                                if (playerInfo.error === 'Failed to scrape data.') {
                                    const errorMessage = '查询出错，请稍后重试或咨询机器人管理员。';
                                    sendGroupMessage(data.group_id, errorMessage);
                                } else if (playerInfo.error === 'Player not found.') {
                                    const errorMessage = `无法找到${playerTag}的信息，请检查BattleTag是否正确。`;
                                    sendGroupMessage(data.group_id, errorMessage);
                                } else {
                                    // 对玩家信息进行翻译处理
                                    translatePlayerInfo(playerInfo)
                                        .then((translatedInfo) => {
                                            const replyMessage = constructReplyMessage(translatedInfo); // 调用 constructReplyMessage 函数
                                            sendGroupMessage(data.group_id, replyMessage);
                                        })
                                        .catch((error) => {
                                            console.error(`${getCurrentTime()} 翻译玩家信息时出错：`, error.message);
                                            const errorMessage = '获取玩家信息失败，请检查BattleTag是否正确或稍后重试';
                                            sendGroupMessage(data.group_id, errorMessage);
                                        });
                                }
                            })
                            .catch((error) => {
                                console.error(`${getCurrentTime()} 获取玩家信息失败：`, error.message);
                                const errorMessage = '查询出错，请稍后重试或咨询机器人管理员。';
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

async function translatePlayerInfo(playerInfo) {
    const translatedInfo = { ...playerInfo }; // 复制一份玩家信息

    // 处理竞技信息
    const pc = translatedInfo.playerCompetitiveInfo.PC;
    if (pc) {
        if (pc.Tank && pc.Tank.playerCompetitivePCTank) {
            pc.Tank.playerCompetitivePCTank = await getChineseTranslation(pc.Tank.playerCompetitivePCTank);
        }
        if (pc.Damage && pc.Damage.playerCompetitivePCDamage) {
            pc.Damage.playerCompetitivePCDamage = await getChineseTranslation(pc.Damage.playerCompetitivePCDamage);
        }
        if (pc.Support && pc.Support.playerCompetitivePCSupport) {
            pc.Support.playerCompetitivePCSupport = await getChineseTranslation(pc.Support.playerCompetitivePCSupport);
        }
    }

    return translatedInfo;
}


function constructReplyMessage(playerInfo) {
    if (playerInfo && playerInfo.playerBaseInfo) {
        const { playerTag, playerTitle, endorsementLevel } = playerInfo.playerBaseInfo;
        const { PC } = playerInfo.playerCompetitiveInfo;

        // 检查玩家信息是否存在
        const isPlayerNotExist = playerInfo.error === "Player not found.";
        // console.log(isPlayerNotExist);
        if (isPlayerNotExist) {
            return `无法找到${playerTag}的信息，请检查BattleTag是否正确。`;
        } else {
            // 检查玩家生涯私密状态
            const isPrivate = playerInfo.private === true;
            if (isPrivate) {
                return `BattleTag：${playerTag}\n玩家头衔：${playerTitle}\n赞赏等级：${endorsementLevel}\n\n竞技信息：\n生涯不公开，无法查询`;
            }
        }

        // 处理竞技信息
        const tank = PC?.Tank ? `${PC.Tank.playerCompetitivePCTank} - ${PC.Tank.playerCompetitivePCTankTier}` : "无段位信息";
        const damage = PC?.Damage ? `${PC.Damage.playerCompetitivePCDamage} - ${PC.Damage.playerCompetitivePCDamageTier}` : "无段位信息";
        const support = PC?.Support ? `${PC.Support.playerCompetitivePCSupport} - ${PC.Support.playerCompetitivePCSupportTier}` : "无段位信息";

        // 构建回复消息
        return `BattleTag：${playerTag}\n玩家头衔：${playerTitle}\n赞赏等级：${endorsementLevel}\n\n竞技信息：\n坦克：${tank}\n输出：${damage}\n辅助：${support}`;
    }

    return "查询出错，请稍后重试或咨询机器人管理员。";
}

function sendGroupMessage(groupID, message) {
    const url = `${httpHost}/send_group_msg?group_id=${groupID}&message=${encodeURIComponent(message)}`;

    axios.get(url)
        .then((response) => {
            console.log(`${getCurrentTime()} 消息发送成功: ${message}`);
            // console.log(response.data);
        })
        .catch((error) => {
            console.error(`${getCurrentTime()} 消息发送失败: ${message}`);
            // console.error(error.message);
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
