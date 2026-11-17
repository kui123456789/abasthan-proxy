# Abasthan 代理节点
- 平台：Abasthan PaaS，Free 档第一个应用免费，$0/月，512MB + 0.1 vCPU，免费 .abasthan.app 子域名，免绑卡。Free 实例 Sleeps after inactivity。
- 架构：Node 包装器监听 $PORT（process.env.PORT || 3000），/health 检测 Xray，/vless WebSocket 升级转发到本地 127.0.0.1:10000 的 Xray，VLESS+WS over TLS（平台自带 HTTPS 443）。
- 部署（Abasthan 表单无 Dockerfile 选项）：Source = Public Git Repository，App Language = Node.js，Runtime 22，Build Command = `chmod +x start.sh`，Start Command = `bash start.sh`，Instance Type = Free。
- start.sh 首次启动时下载 Xray-linux-64（curl/unzip 或 python3 解压），无需 Dockerfile。
- 本地实测 2026-11-17：bash start.sh，PORT=3100，Xray 26.11.9 启动，/health 返回 {"status":"ok"}。
- UUID 与订阅链接只存本地，不贴聊天。
- UUID 不进仓库：在 Abasthan 里把 UUID 设为环境变量（SECRET），start.sh 启动时据此生成 xray-config.json；本地测试可用同名环境变量。
