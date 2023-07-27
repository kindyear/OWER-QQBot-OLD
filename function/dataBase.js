const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const DB_FILE_PATH = './database/bot.db';

// 函数用于检查数据库文件是否存在
function isDatabaseExists(filePath) {
    try {
        fs.accessSync(filePath);
        return true;
    } catch (err) {
        return false;
    }
}

// 初始化数据库
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_FILE_PATH, (err) => {
            if (err) {
                console.error('连接数据库时出错：', err.message);
                reject(err);
            } else {
                console.log('已连接到数据库。');

                // 检查 groups 表是否存在
                db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='groups'", [], (err, row) => {
                    if (err) {
                        console.error('检查表是否存在时出错：', err.message);
                        reject(err);
                    } else {
                        if (!row) {
                            // groups 表不存在，创建它
                            const createTableSQL = `
                                CREATE TABLE groups (
                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                    group_id INTEGER NOT NULL UNIQUE,
                                    is_bot_enabled INTEGER DEFAULT 1
                                )
                            `;

                            db.run(createTableSQL, (err) => {
                                if (err) {
                                    console.error('创建 groups 表时出错：', err.message);
                                    reject(err);
                                } else {
                                    console.log('成功创建 groups 表。');
                                    resolve();
                                }
                            });
                        } else {
                            resolve();
                        }
                    }
                });
            }
        });

        // 在所有数据库操作完成后关闭数据库连接
        db.close((err) => {
            if (err) {
                console.error('关闭数据库连接时出错：', err.message);
            } else {
                console.log('数据库连接已关闭。');
            }
        });
    });
}

// 函数用于插入群信息到数据库
function insertGroupInfo(groupID, isBotEnabled) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_FILE_PATH, (err) => {
            if (err) {
                console.error('连接数据库时出错：', err.message);
                reject(err);
            } else {
                console.log('已连接到数据库。');

                const insertSQL = `INSERT INTO groups (group_id, is_bot_enabled) VALUES (?, ?)`;
                db.run(insertSQL, [groupID, isBotEnabled], (err) => {
                    if (err) {
                        console.error('插入群信息时出错：', err.message);
                        reject(err);
                    } else {
                        console.log('成功插入群信息。');
                        resolve();
                    }
                });

                // 插入完成后关闭数据库连接
                db.close((err) => {
                    if (err) {
                        console.error('关闭数据库连接时出错：', err.message);
                    } else {
                        console.log('数据库连接已关闭。');
                    }
                });
            }
        });
    });
}

// 函数用于检查群是否启用机器人功能
function isBotEnabledForGroup(groupID) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_FILE_PATH, (err) => {
            if (err) {
                console.error('连接数据库时出错：', err.message);
                reject(err);
            } else {
                console.log('已连接到数据库。');

                const query = `SELECT is_bot_enabled FROM groups WHERE group_id = ?`;
                db.get(query, [groupID], (err, row) => {
                    if (err) {
                        console.error('查询群信息时出错：', err.message);
                        reject(err);
                    } else {
                        const isEnabled = row ? !!row.is_bot_enabled : false;
                        console.log(`群 ${groupID} 是否启用机器人功能：${isEnabled}`);
                        resolve(isEnabled);
                    }

                    // 查询完成后关闭数据库连接
                    db.close((err) => {
                        if (err) {
                            console.error('关闭数据库连接时出错：', err.message);
                        } else {
                            console.log('数据库连接已关闭。');
                        }
                    });
                });
            }
        });
    });
}

// 如果数据库文件不存在，则初始化数据库
if (!isDatabaseExists(DB_FILE_PATH)) {
    initializeDatabase();
}

module.exports = {
    insertGroupInfo,
    isBotEnabledForGroup
};
