<div align="center">

<img width="400" src="./docs/logo.png" alt="logo"></img>

----

OWER-QQBot是一个基于GO-CQHttp和OWER-API的守望先锋2国际服QQ群内玩家信息查询的一个QQ机器人

<img src="https://img.shields.io/github/stars/kindyear/OWER-QQBot.svg?style=flat-square">
<img src="https://img.shields.io/github/forks/kindyear/OWER-QQBot.svg?style=flat-square">
<img src="https://img.shields.io/github/issues/kindyear/OWER-QQBot.svg?style=flat-square">
<img src="https://img.shields.io/github/license/kindyear/OWER-QQBot.svg?style=flat-square">
<img src="https://img.shields.io/github/last-commit/kindyear/OWER-QQBot.svg?style=flat-square">
<img src="https://img.shields.io/github/repo-size/kindyear/OWER-QQBot.svg?style=flat-square">
<img src="https://img.shields.io/github/release/kindyear/OWER-QQBot.svg?style=flat-square">
</div>

# 部署

运行环境要求：
- NodeJS V18.15.0（此版本上正常运行，其他版本未做测试）
- [OWER-API](https://github.com/kindyear/OWER-API)
- [Go-CQHttp](https://github.com/Mrs4s/go-cqhttp)

先在主机上安装部署OWER-API以及登录Go-CQHttp，有关安装部署信息请点击上述链接内进行查看

确保部署主机上已经安装了Git，并在准备部署的目录下执行以下命令：

```bash
git clone https://github.com/kindyear/OWER-QQBot.git
```

编辑config.js文件，将其中的配置信息修改为自己的配置信息

然后运行项目

```bash
node app.js
```

# TODO
-[x] 玩家基础信息查询

-[ ] 玩家竞技/休闲英雄信息查询

-[ ] 玩家竞技/休闲数据查询

-[ ] 中文翻译功能

# 启发 / 感谢

> 排名不分前后

- 残影
- Linus
- 花散里
- 低调做人

# 免责声明

OWER项目不隶属于暴雪，也不反映暴雪或任何正式参与制作或管理《守望先锋》的人的观点或意见。Overwatch 和 Blizzard 是 Blizzard
Entertainment, Inc. 的商标或注册商标。 Overwatch © Blizzard Entertainment, Inc.

其中所产生的部分数据内容版权归暴雪娱乐所有，OWER项目仅用于学习交流，不得用于商业用途。

此外，暴雪随时可能会调整数据来源网页的访问规则或者数据格式，项目不保证即时更新。

我们不保证正常运行时间、响应时间或支持。您使用此项目的风险由您自行承担。

# 许可证

Copyright (c) 2023, KINDYEAR. All rights reserved.

如果满足以下条件，则允许以源代码和二进制形式重新分发和使用，无论是否经过修改：

- 源代码的重新分发必须保留上述版权声明、此条件列表和以下免责声明。

- 以二进制形式重新分发必须在随分发提供的文档和/或其他材料中复制上述版权声明、此条件列表以及以下免责声明。

- 未经事先书面许可，OWER 的名称及其贡献者的名称均不得用于认可或推广源自本软件的产品。

本软件由版权所有者和贡献者“按原样”提供，不承担任何明示或默示的保证，包括但不限于适销性和特定用途适用性的默示保证。在任何情况下，版权持有人或贡献者均不对任何直接、间接、附带、特殊、惩戒性或后果性损害（包括但不限于采购替代商品或服务；使用、数据或利润损失；或业务中断）承担责任因使用本软件而以任何方式引起的以及基于任何责任理论的责任，无论是合同责任、严格责任还是侵权行为（包括疏忽或其他），即使已被告知可能发生此类损害。

# 碎碎念

傻逼暴雪还老子国服，草