import type { Composer } from 'vue-i18n'

export function permissionDeniedMessage(t: Composer['t'], message: string | any) {
  let msg = ''
  if (typeof message === 'string') {
    msg = message
  } else if (message && typeof message === 'object') {
    msg = message.message || message.error || ''
  }

  if (msg.toLowerCase().includes('permission denied') ||
      msg.toLowerCase().includes('only admin users can perform this operation')) {
    msg = t('common.permissionDenied')
  }
  return msg
}
