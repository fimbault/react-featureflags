import * as React from 'react'
import {
  Flags,
  getFeatureFlags,
  FeatureFlagsProvider,
  useFeatureFlags
} from './FeatureFlags'
import { getRuntimeFeatureFlags } from './runtimeConfig'
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

const ShowFlags: React.FC<{}> = () => {
  const flags = useFeatureFlags()

  if (!flags) {
    return <div>Loading flags...</div>
  }

  return <FlagSet flags={flags} />
}

const ShowEffectFlags: React.FC<{}> = () => {
  const [flags, setFlags] = React.useState<Flags | null>(null)

  React.useEffect(() => {
    getFeatureFlags({
      clientID: '5e587dc101d0890d545afff0',
      namespace: 'front-end',
      environment: 'local',
      featureFlagsAPI: 'http://localhost:3010'
    }).then(data => setFlags(data.flags))
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

  return <FlagSet flags={flags} />
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
