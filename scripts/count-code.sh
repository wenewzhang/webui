#!/bin/bash

echo "=== Code Statistics ==="
echo ""

echo "By file (.ts & .vue):"
find ./src -type f \( -name "*.ts" -o -name "*.vue" \) | xargs wc -l
echo ""

echo "--- Summary ---"
TS_LINES=$(find ./src -type f -name "*.ts" | xargs wc -l 2>/dev/null | tail -n 1 | awk '{print $1}')
VUE_LINES=$(find ./src -type f -name "*.vue" | xargs wc -l 2>/dev/null | tail -n 1 | awk '{print $1}')

echo "TypeScript (.ts) lines: ${TS_LINES:-0}"
echo "Vue (.vue) lines:     ${VUE_LINES:-0}"
echo "Total lines:          $((${TS_LINES:-0} + ${VUE_LINES:-0}))"
