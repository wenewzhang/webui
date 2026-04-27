# Linux 服务器部署指南

## 部署架构

```
用户浏览器 --> Nginx (80/443端口)
                ├── /          --> 前端静态资源 (dist/)
                ├── /api/*     --> 反向代理到后端 (https://192.168.3.203:8443)
                └── /ttyd/*    --> 反向代理到 ttyd WebSocket (ws://192.168.3.203:7681)
```

## 1. 安装依赖并构建

在服务器上（或本地构建后上传）：

```bash
# 进入项目目录
cd /path/to/webui

# 安装依赖
npm ci

# 构建生产包（会自动读取 .env.production）
npm run build
```

构建完成后会生成 `dist/` 目录。

## 2. 配置 Nginx

将构建产物和配置复制到服务器：

```bash
# 创建目录
sudo mkdir -p /var/www/webui

# 复制构建产物（如果在本地构建，先上传到服务器）
sudo cp -r dist /var/www/webui/

# 复制 Nginx 配置
sudo cp deploy/nginx.conf /etc/nginx/conf.d/webui.conf
```

编辑 `/etc/nginx/conf.d/webui.conf`，修改以下关键配置：

- `server_name`：改为你的域名或服务器 IP
- `proxy_pass https://192.168.3.203:8443/`：改为你的实际后端 API 地址
- `proxy_pass http://192.168.3.203:7681/`：改为你的实际 ttyd 地址

检查配置并重载 Nginx：

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 3. 访问方式

| 场景 | 访问地址 |
|------|---------|
| 本机测试 | `http://localhost` 或 `http://服务器IP` |
| 局域网 | `http://<服务器IP>` |
| 公网域名 | `http://your-domain.com`（建议配 HTTPS） |

## 4. 配置 HTTPS（推荐）

使用 Let's Encrypt 免费证书：

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 申请证书（自动修改 Nginx 配置）
sudo certbot --nginx -d your-domain.com
```

## 5. 更新部署

代码更新后重新构建并替换：

```bash
cd /path/to/webui
npm run build
sudo rm -rf /var/www/webui/dist
sudo cp -r dist /var/www/webui/
```

## 常见问题

### 1. 后端使用自签名证书

如果后端 API 使用自签名的 HTTPS 证书，在 `nginx.conf` 的 `/api/` 位置中取消注释：

```nginx
proxy_ssl_verify off;
proxy_ssl_server_name off;
```

### 2. API 请求 404

确保 `.env.production` 中 `VITE_API_BASE_URL=/api`，这样前端会请求同源的 `/api/xxx`，由 Nginx 代理到后端。

### 3. ttyd WebSocket 连接失败

检查 `nginx.conf` 中 `/ttyd/` 配置的 `proxy_set_header Upgrade` 和 `proxy_set_header Connection` 是否正确设置。

### 4. 刷新页面 404

确保 Nginx 配置中包含 Vue Router history 模式支持：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
