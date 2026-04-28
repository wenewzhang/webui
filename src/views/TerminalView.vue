<template>
  <div class="terminal-wrapper">
    <div class="terminal-toolbar">
      <span
        class="status-dot"
        :class="{ connected: isConnected, disconnected: !isConnected }"
      />
      <span class="status-text">{{ statusText }}</span>
      <button v-if="!isConnected" class="toolbar-btn" @click="connect">
        {{ $t('common.retry') || 'Reconnect' }}
      </button>
    </div>
    <div ref="terminalContainer" class="terminal-container" tabindex="0" @click="handleClick" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Terminal } from '@xterm/xterm'
import '@xterm/xterm/css/xterm.css'

const terminalContainer = ref<HTMLDivElement>()
let term: Terminal | null = null
let ws: WebSocket | null = null
const isConnected = ref(false)
const statusText = ref('Disconnected')

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

let reconnectTimer: ReturnType<typeof setTimeout> | null = null
let disposeOnData: (() => void) | null = null

function handleClick() {
  term?.focus()
}

function getWsUrl(): string {
  const envUrl = import.meta.env.VITE_TTYD_WS_URL as string | undefined
  if (envUrl) {
    return envUrl
  }
  // Use current host via Vite proxy /ttyd -> ttyd server
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ttyd/ws`
}

function connect() {
  if (ws) {
    try {
      ws.close()
    } catch { /* ignore */ }
    ws = null
  }

  const url = getWsUrl()
  statusText.value = 'Connecting...'
  isConnected.value = false

  console.log('[ttyd] Connecting to:', url)
  try {
    ws = new WebSocket(url, ['tty'])
  } catch (err) {
    statusText.value = 'Connection failed'
    console.error('WebSocket error:', err)
    scheduleReconnect()
    return
  }

  ws.binaryType = 'arraybuffer'

  ws.onopen = () => {
    isConnected.value = true
    statusText.value = 'Connected'
    console.log('[ttyd] WebSocket connected')

    // Send initial terminal size (ttyd protocol: plain JSON on open)
    if (term) {
      const init = JSON.stringify({ columns: term.cols, rows: term.rows })
      ws?.send(textEncoder.encode(init))
    }
  }

  ws.onmessage = (event) => {
    if (!term) return
    const rawData = event.data as ArrayBuffer
    const dataView = new Uint8Array(rawData)
    if (dataView.length === 0) return

    const cmd = String.fromCharCode(dataView[0])
    const payload = rawData.slice(1)

    switch (cmd) {
      case '0': // OUTPUT
        term.write(textDecoder.decode(payload))
        break
      case '1': // SET_WINDOW_TITLE
        // Optionally handle title
        break
      case '2': // SET_PREFERENCES
        // Optionally handle preferences
        break
      default:
        console.warn('[ttyd] unknown command:', cmd)
    }
  }

  ws.onerror = (err) => {
    console.error('[ttyd] WebSocket error:', err)
    statusText.value = `Connection error (${ws?.readyState})`
    isConnected.value = false
  }

  ws.onclose = () => {
    console.log('[ttyd] WebSocket closed')
    isConnected.value = false
    statusText.value = 'Disconnected'
    scheduleReconnect()
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null
    if (!isConnected.value) {
      connect()
    }
  }, 3000)
}

onMounted(() => {
  if (!terminalContainer.value) return

  term = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    theme: {
      background: '#0d1117',
      foreground: '#c9d1d9',
      cursor: '#c9d1d9',
      selectionBackground: '#264f78',
    },
    scrollback: 10000,
    allowProposedApi: true,
  })

  term.open(terminalContainer.value)
  term.focus()

  // Send user input to ttyd via WebSocket
  // ttyd protocol: first byte '0' means stdin input
  disposeOnData = term.onData((data) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const payload = new Uint8Array(data.length * 3 + 1)
      payload[0] = 48 // '0'.charCodeAt(0)
      const stats = textEncoder.encodeInto(data, payload.subarray(1))
      ws.send(payload.subarray(0, (stats.written as number) + 1))
    }
  }).dispose

  // Fit terminal to container and notify ttyd of resize
  const fitTerminal = () => {
    if (term && terminalContainer.value) {
      const { width, height } = terminalContainer.value.getBoundingClientRect()
      const cols = Math.max(10, Math.floor(width / 9))
      const rows = Math.max(5, Math.floor(height / 17))
      term.resize(cols, rows)

      // ttyd protocol: first byte '1' means resize
      if (ws && ws.readyState === WebSocket.OPEN) {
        const msg = JSON.stringify({ columns: cols, rows: rows })
        ws.send(textEncoder.encode('1' + msg))
      }
    }
  }

  fitTerminal()
  window.addEventListener('resize', fitTerminal)

  // Initial connection
  connect()

  onUnmounted(() => {
    window.removeEventListener('resize', fitTerminal)
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (disposeOnData) {
      disposeOnData()
      disposeOnData = null
    }
    ws?.close()
    ws = null
    term?.dispose()
    term = null
  })
})
</script>

<style scoped>
.terminal-wrapper {
  height: calc(100vh - 4rem);
  width: 100%;
  display: flex;
  flex-direction: column;
}

.terminal-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #161b22;
  border-bottom: 1px solid #30363d;
  color: #c9d1d9;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #da3633;
  transition: background 0.3s;
}

.status-dot.connected {
  background: #238636;
}

.status-text {
  flex: 1;
}

.toolbar-btn {
  padding: 2px 10px;
  font-size: 12px;
  color: #c9d1d9;
  background: #21262d;
  border: 1px solid #30363d;
  border-radius: 4px;
  cursor: pointer;
}

.toolbar-btn:hover {
  background: #30363d;
}

.terminal-container {
  flex: 1;
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  overflow: hidden;
}
</style>
