import * as React from 'react'
import useEventListener from './useEventListener'

function getDocument () {
  const anyGlobal: any = global
  return anyGlobal.document || {}
}

function getVisibilityPropertyNames () {
  const document = getDocument()

  if (typeof document.hidden !== 'undefined') {
    return ['hidden', 'visibilitychange']
  }

  if (typeof document.msHidden !== 'undefined') {
    return ['msHidden', 'msvisibilitychange']
  }

  if (typeof document.webkitHidden !== 'undefined') {
    return ['webkitHidden', 'webkitvisibilitychange']
  }

  return ['hidden', 'visibilitychange']
}

function isDocumentHidden (hiddenProp: string) {
  return !!getDocument()[hiddenProp]
}

export function useDocumentVisibilityChange (callback: any) {
  const [hidden, visibilityChange] = getVisibilityPropertyNames()
  const onChange = React.useCallback(() => {
    callback(isDocumentHidden(hidden))
  }, [callback])
  useEventListener(visibilityChange, onChange, getDocument())
}

export function useDocumentVisibility () {
  const [hidden] = getVisibilityPropertyNames()
  const [isHidden, setHidden] = React.useState(isDocumentHidden(hidden))
  const onChange = React.useCallback(state => setHidden(state), [setHidden])
  useDocumentVisibilityChange(onChange)
  return isHidden
}
