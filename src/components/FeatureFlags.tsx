import * as React from 'react'
import fetch from 'unfetch'
import { useDocumentVisibilityChange } from './useDocumentVisibility'
import { setRuntimeFeatureFlags } from './runtimeConfig'

export interface FeatureFlagsProviderProps {
  clientID: string
  namespace: string
  featureFlagsAPI?: string
  uniqueID?: string
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
export interface FeatureFlagsContextProps {
  flags: Flags
  setUniqueID: (uid: string) => any
}

export const FeatureFlagsContext = React.createContext<FeatureFlagsContextProps | null>(
  null
)

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
  uniqueID?: string
}

export const getFeatureFlags = ({
  clientID,
  namespace,
  environment,
  featureFlagsAPI,
  uniqueID
}: GetFeatureFlagsParams) =>
  fetch(
    `${featureFlagsAPI ||
      'https://resolver.twoflags.io'}/?account=${clientID}&ns=${namespace}${(environment
      ? '&env=' + environment
      : '') + (uniqueID ? '&uid=' + uniqueID : '')}`
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
  uniqueID,
  fetchInterval,
  logging,
  children
}) => {
  const [data, setData] = React.useState<any>(null)
  const [interval, setInterval] = React.useState<number | null>(null)
  const [internalUniqueID, setInternalUniqueID] = React.useState(uniqueID)

  const getFlags = () =>
    getFeatureFlags({
      clientID,
      namespace,
      featureFlagsAPI,
      uniqueID: internalUniqueID
    }).then(nextData => {
      if (!data) {
        setData(nextData)
        setRuntimeFeatureFlags(nextData)
      } else {
        const diff = flagDiff(data, nextData)
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
  }, [internalUniqueID])

  useInterval(() => getFlags(), interval)

  const handleUpdateUniqueID = (uid: string) => {
    setInternalUniqueID(uid)
  }

  if (!data) {
    return null
  }

  return (
    <FeatureFlagsContext.Provider
      value={{ flags: data, setUniqueID: handleUpdateUniqueID }}
    >
      {children}
    </FeatureFlagsContext.Provider>
  )
}

export const useFeatureFlags = () => {
  const flagsContext = React.useContext(FeatureFlagsContext)
  if (!flagsContext) {
    return flagsContext
  }

  return flagsContext.flags.flags
}

export const useFeatureFlagsEnvironment = () => {
  const flagsContext = React.useContext(FeatureFlagsContext)
  if (!flagsContext) {
    return flagsContext
  }

  return flagsContext.flags.environment
}

export const useFeatureFlagsNamespace = () => {
  const flagsContext = React.useContext(FeatureFlagsContext)
  if (!flagsContext) {
    return flagsContext
  }

  return flagsContext.flags.namespace
}

export const useFeatureFlagsUniqueIDUpdater = () => {
  const flagsContext = React.useContext(FeatureFlagsContext)
  if (!flagsContext) {
    return flagsContext
  }

  return flagsContext.setUniqueID
}
