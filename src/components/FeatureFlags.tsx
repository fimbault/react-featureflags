import * as React from 'react'
import fetch from 'unfetch'
import { useDocumentVisibilityChange } from './useDocumentVisibility'
import { setRuntimeFeatureFlags } from './runtimeConfig'

export interface FeatureFlagsProviderProps {
  clientID: string
  namespace: string
  featureFlagsAPI?: string
  fetchInterval?: number
  logging?: (flags: Flags) => any
  children: React.ReactNode
}

export const useInterval = (callback: () => any, delay: number | null) => {
  const savedCallback = React.useRef<any>()

  React.useEffect(() => {
    savedCallback.current = callback
  })

  React.useEffect(() => {
    function tick () {
      savedCallback.current && savedCallback.current()
    }

    if (delay !== null) {
      const id = setInterval(tick, delay)

      return () => clearTimeout(id)
    }

    return undefined
  }, [delay])
}

export interface Flags {
  [key: string]: any
}
export const FeatureFlagsContext = React.createContext<Flags | null>(null)

const flagDiff = (a: Flags, b: Flags): Flags => {
  return Object.keys(b).reduce((acc, key) => {
    if (a[key] !== b[key]) {
      acc[key] = b[key]
    }

    return acc
  }, {})
}

function isObjectEmpty (obj: any) {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false
    }
  }

  return true
}

const MINIMUM_INTERVAL = 30000

export interface GetFeatureFlagsParams {
  clientID: string
  namespace: string
  environment?: string
  featureFlagsAPI?: string
}

export const getFeatureFlags = ({
  clientID,
  namespace,
  environment,
  featureFlagsAPI
}: GetFeatureFlagsParams) =>
  fetch(
    `${featureFlagsAPI ||
      'https://resolver.twoflags.io'}/?account=${clientID}&ns=${namespace}${
      environment ? '&env=' + environment : ''
    }`
  ).then(res => res.json())

const getInterval = (interval?: number) => {
  if (!interval || (interval && interval < MINIMUM_INTERVAL)) {
    return MINIMUM_INTERVAL
  }

  return interval
}

export const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps> = ({
  clientID,
  namespace,
  featureFlagsAPI,
  fetchInterval,
  logging,
  children
}) => {
  const [data, setData] = React.useState<any>(null)
  const [interval, setInterval] = React.useState<number | null>(null)

  const getFlags = () =>
    getFeatureFlags({ clientID, namespace, featureFlagsAPI }).then(nextData => {
      if (!data) {
        setData(nextData.flags)
        setRuntimeFeatureFlags(nextData.flags)
      } else {
        const diff = flagDiff(data, nextData.flags)
        if (!isObjectEmpty(diff)) {
          const newData = Object.assign({}, data, diff)
          setData(newData)
          setRuntimeFeatureFlags(newData)
        }
      }
    })

  useDocumentVisibilityChange((invisible: boolean) => {
    setInterval(null)
    if (!invisible) {
      getFlags().then(() => setInterval(getInterval(fetchInterval)))
    }
  })

  React.useEffect(() => {
    if (logging && data) {
      logging(data)
    }
  }, [data])

  React.useEffect(() => {
    getFlags()
    setInterval(getInterval(fetchInterval))
  }, [])

  useInterval(() => getFlags(), interval)

  if (!data) {
    return null
  }

  return (
    <FeatureFlagsContext.Provider value={data}>
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export const useFeatureFlags = () => React.useContext(FeatureFlagsContext)
