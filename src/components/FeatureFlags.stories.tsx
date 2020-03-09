import * as React from 'react'
import {
  Flags,
  getFeatureFlags,
  FeatureFlagsProvider,
  useFeatureFlags,
  useFeatureFlagsUniqueIDUpdater,
  useFeatureFlagsEnvironment,
  useFeatureFlagsNamespace
} from './FeatureFlags'
import {
  getRuntimeEnvironment,
  getRuntimeFeatureFlags,
  getRuntimeNamespace
} from './runtimeConfig'
import { action } from '@storybook/addon-actions'

export default { title: 'FeatureFlags' }

const FlagSet: React.FC<{ flags: Flags }> = ({ flags }) => (
  <ol>
    {flags &&
      Object.keys(flags).map(k => (
        <li key={k}>
          {k} = {JSON.stringify(flags[k])}
        </li>
      ))}
  </ol>
)

const ShowFlags: React.FC<{ withUniqueID?: boolean }> = ({ withUniqueID }) => {
  const flags = useFeatureFlags()
  const updateUID = useFeatureFlagsUniqueIDUpdater()
  const environment = useFeatureFlagsEnvironment()
  const namespace = useFeatureFlagsNamespace()

  if (!flags) {
    return <div>Loading flags...</div>
  }

  const handleUpdateUID = () => {
    updateUID &&
      updateUID(
        '4733f0b0ddd035942d0ef395e9c62c36de882a66f2917f1d8c072cc9470bb2e9'
      )
  }

  return (
    <div>
      <FlagSet flags={flags} />
      <ul>
        <li>
          <strong>environment</strong>: {environment}
        </li>
        <li>
          <strong>namespace</strong>: {namespace}
        </li>
      </ul>
      {withUniqueID && <button onClick={handleUpdateUID}>Update UID</button>}
    </div>
  )
}

const ShowEffectFlags: React.FC<{}> = () => {
  const [flags, setFlags] = React.useState<Flags | null>(null)

  React.useEffect(() => {
    getFeatureFlags({
      clientID: '5e587dc101d0890d545afff0',
      namespace: 'front-end',
      environment: 'local',
      featureFlagsAPI: 'http://localhost:3010'
    }).then(data => setFlags(data))
  }, [])

  if (!flags) {
    return <div>Loading flags...</div>
  }

  return <FlagSet flags={flags} />
}

const ShowRuntimeFlags: React.FC<{}> = () => {
  const flags = getRuntimeFeatureFlags()

  if (!flags) {
    return <div>Loading flags...</div>
  }

  return (
    <div>
      <FlagSet flags={flags} />
      <ul>
        <li>
          <strong>environment</strong>: {getRuntimeEnvironment()}
        </li>
        <li>
          <strong>namespace</strong>: {getRuntimeNamespace()}
        </li>
      </ul>
    </div>
  )
}

const logFlags = (flags: Flags) => {
  action('Logging')(JSON.stringify(flags))
}

export const fromContext = () => (
  <FeatureFlagsProvider
    namespace='front-end'
    clientID='5e587dc101d0890d545afff0'
    featureFlagsAPI='http://localhost:3010'
    logging={logFlags}
    fetchInterval={10000}
  >
    <div>This flags do update dynamically</div>
    <ShowFlags />
  </FeatureFlagsProvider>
)

export const fromRuntime = () => (
  <FeatureFlagsProvider
    namespace='front-end'
    clientID='5e587dc101d0890d545afff0'
    featureFlagsAPI='http://localhost:3010'
    logging={logFlags}
    fetchInterval={10000}
  >
    <div>This flags do not update dynamically (used in logic bits)</div>
    <ShowRuntimeFlags />
  </FeatureFlagsProvider>
)

export const usingEffect = () => (
  <div>
    <div>This loads feature flags using async effect (good for SSR)</div>
    <ShowEffectFlags />
  </div>
)

export const usingUniqueID = () => (
  <FeatureFlagsProvider
    namespace='front-end'
    clientID='5e587dc101d0890d545afff0'
    featureFlagsAPI='http://localhost:3010'
    uniqueID='4733f0b0ddd035942d0ef395e9c62c36de882a66f2917f1d8c072cc9470bb2e9'
    logging={logFlags}
    fetchInterval={10000}
  >
    <div>This flags where requested with a Unique ID</div>
    <ShowFlags />
  </FeatureFlagsProvider>
)

export const updatingUniqueID = () => (
  <FeatureFlagsProvider
    namespace='front-end'
    clientID='5e587dc101d0890d545afff0'
    featureFlagsAPI='http://localhost:3010'
    logging={logFlags}
    fetchInterval={10000}
  >
    <div>This flags where requested with a Unique ID</div>
    <ShowFlags withUniqueID />
  </FeatureFlagsProvider>
)
