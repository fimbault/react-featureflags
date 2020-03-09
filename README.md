# react-featureflags

React helper components and hooks for Feature Flags service.

This package is compatible with any feature flags service using
an API similar to what twoflags.io provide. 
 
_In the case of twoflags.io You need to create a an account or use the on-premise service._

## Usage

**react-featureflags** contains several ways to query and use feature flags 

First is using a Provider component that wraps your application.

```typescript jsx
import * as React from 'react'
import { FeatureFlagsProvider } from '@twoflags/react-featureflags'

const CLIENT_ID = '<account-id>'
const NAMESPACE = '<app-namespace>'

const App: React.FC = () => {
  return (
    <FeatureFlagsProvider 
      clientID={CLIENT_ID} 
      namespace={NAMESPACE}
    >
      <AppComponents />
    </FeatureFlagsProvider>  
  )
}

export default App
```

This will provide a context with the loaded feature flags with 
default refresh rate of 60 seconds (minimum refresh rate is 30 seconds)
and a immediate flag refresh on page visibility.

Other properties for the `FeatureFlagsProvider` component are:
- `clientID` (string): TwoFlags Account ID (or equivalent if using a different provider)
- `namespace` (string): Namespace ID
- `uniqueID`? (string): User related unique identifier. You don't have to use the actual user 
identifier. A unique deterministic hash of the user identifier is all you need 
to make weight segmented feature flags resolve the same value constantly. This way
you avoid leaking your data to a third party service. 
- `featureFlagsAPI`? (string): For on-premise services or compatible services
- `fetchInterval`? (number): Fetch interval in seconds (minimum is 30 seconds)
- `logging`? ((flags: Flags) => any): Logging function, receives the flags on first fetch and every time they change

Once you have the context in place from any component inside it
you can access the feature flags by using the `useFeatureFlags` hook
or in places where hooks cannot be used then you can use the 
`getRuntimeFeatureFlags` function.

You can also use the `useFeatureFlagsEnvironment` and `useFeatureFlagsNamespace` hooks 
to obtain environment and namespace values returned by the Feature Flags API. (The runtime equivalent
of this hooks are `getRuntimeEnvironment` and `getRuntimeNamespace`)

### Using `useFeatureFlags` hook
```typescript jsx
import * as React from 'react'
import { useFeatureFlags } from '@twoflags/react-featureflags'

export const DummyComponent: React.FC = () => {
  const flags = useFeatureFlags()
  
  return (
    <Pane>
      {flags.maintenance && (
        <Alert intent='danger'>
          MAINTENANCE MODE
        </Alert>  
      )}
      
      <SomeOtherComponents />
    </Pane>
  ) 
}
```

### Using `getRuntimeFeatureFlags` function

```typescript
import { getRuntimeFeatureFlags } from '@twoflags/react-featureflags'

export const fetchData = async () => {
  const flags = getRuntimeFeatureFlags()
  
  const response = await fetch(`${flags.api_url}/data`)
  const data = await response.json()
  
  return data    
}
```

## Server Side Rendering (SSR)

Server Side Rendering is also supported via a third function `getFeatureFlags`

Now, from the client the API resolves the origin
of the request to match the environment we are requesting. This helps
support truly agnostic frontend builds. You can deploy your frontend 
application to any environment using the exact same code, letting the 
Feature Flags API provide the runtime environments flags 
dynamically. 

On the server on the other hand we don't have an origin HTTP header. But since 
we do have a server, it will always know in what environment is running so, for
server side rendering we can use the `getFeatureFlags` asynchronous function in
this case explicitly providing the environment. 

This example code shows how it will work on NextJS:

```typescript
import * as React from 'react'
import { getFeatureFlags } from '@twoflags/react-featureflags'
import { NextPage } from 'next'
import { DataComponent } from '../components/DataComponent'

interface Props {
  data: any
}

const Page: NextPage<Props> = ({ data }) => {
  return (
    <div>
      <DataComponent data={data} />
    </div>
  ) 
}

Page.getInitialProps = async () => {
  const flags = await getFeatureFlags({
    clientID: process.env.CLIENT_ID,
    namespace: process.env.NAMESPACE,
    environment: process.env.ENVIRONMENT
  })

  const response = await fetch(`${flags['api-url']}/data`)
  const data = await response.json()
  
  return { data }
}
```   

## Feature Flags API

Your Feature Flags API must provide an endpoint that returns the following payload:

```json
{
  "namespace": "<namespace-id>",
  "environment": "<environment-id>",
  "flags": {
    "flag1": value1,
    "flag2": value2,
    ...
    "flagN": valueN
  }
}
```

## Weighted Segments Feature Flags

Having a flag returning two possible values according to a weighted segment
is what powers most Blue/Green feature deployment. 

A weighted segment works the following way. The flag's numeric value goes from 0% to 100%
indicating how many users will see the feature, controlled by two values: Value `A`
is no feature, value `B` feature is present. A value of 20% means that approximate 20% of 
users will see option `B` and 80% remainder will see option `A`.

To guarantee users see consistently the same option you need to specify a unique identifier. 
So every time the Feature Flags API gets a request from the same user it will always resolve 
the same value according to the weight. This also works while increasing the weight since users 
that already saw the feature should keep seeing it.

There are two ways to specify the `uniqueID` via the `FeatureFlagsProvider` or
using the `useFeatureFlagsUniqueIDUpdater` hook that returns an updater function.

```typescript jsx
import * as React from 'react'
import { FeatureFlagsProvider } from '@twoflags/react-featureflags'

const CLIENT_ID = '<account-id>'
const NAMESPACE = '<app-namespace>'

const App: React.FC = ({ userHash }) => {
  return (
    <FeatureFlagsProvider 
      clientID={CLIENT_ID} 
      namespace={NAMESPACE}
      uniqueID={userHash}
    >
      <AppComponents />
    </FeatureFlagsProvider>  
  )
}

export default App
```

Or via the `useFeatureFlagsUniqueIDUpdater` hook

```typescript jsx
import * as React from 'react'
import { FeatureFlagsProvider, useFeatureFlagsUniqueIDUpdater } from '@twoflags/react-featureflags'

const CLIENT_ID = '<account-id>'
const NAMESPACE = '<app-namespace>'

const AppComponents: React.FC = () => {
  const uniqueIDUpdater = useFeatureFlagsUniqueIDUpdater()
  const { user } = useAuth()
  
  React.useEffect(() => {
    uniqueIDUpdater(sha256Hash(user.email))
  }, [user])
  
  return (
    <SecuredAppComponent />
  )
}


const App: React.FC = () => {
  return (
    <FeatureFlagsProvider 
      clientID={CLIENT_ID} 
      namespace={NAMESPACE}
    >
      <AppComponents />
    </FeatureFlagsProvider>  
  )
}

export default App
```

**Note:** While `uniqueID` is not provided all weighted feature flags will resolve to 
their most probable value, this is `A` if weight < 100%, `B` if weight = 100%
