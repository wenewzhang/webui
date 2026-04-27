#!/bin/bash
set -e

# 切换到脚本所在目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo ">>> 安装依赖..."
npm install

echo ">>> 构建生产环境 dist..."
npm run build

if [ ! -d "dist" ]; then
    echo "错误：dist 目录未生成，构建失败"
    exit 1
fi

OUTPUT="dist.tar.gz"

echo ">>> 打包 $OUTPUT ..."
tar -czf "$OUTPUT" dist/ deploy/nginx.conf

echo ">>> 打包完成"
ls -lh "$OUTPUT"
