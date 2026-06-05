import type { Composer } from 'vue-i18n'

export function permissionDeniedMessage(t: Composer['t'], message: string | any) {
  let msg = ''
  if (typeof message === 'string') {
    msg = message
  } else if (message && typeof message === 'object') {
    msg = message.message || message.error || ''
  }

  if (msg.toLowerCase().startsWith('failed to chmod for directory')) {
    const match = msg.match(/^Failed to chmod for directory '([^']+)'/i)
    const path = match ? match[1] : ''
    msg = t('common.chmodFailedForDirectory', { path })
  } else if (msg.toLowerCase().includes('permission denied') ||
      msg.toLowerCase().includes('only admin users can perform this operation')) {
    msg = t('common.permissionDenied')
  } else if (msg.toLowerCase().includes('operation not permitted')) {
    msg = t('common.operationNotPermitted')
  }
  return msg
}
