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
- `featureFlagsAPI`? (string): For on-premise services or compatible services
- `fetchInterval`? (number): Fetch interval in seconds (minimum is 30 seconds)
- `logging`? ((flags: Flags) => any): Logging function, receives the flags on first fetch and every time they change

Once you have the context in place from any component inside it
you can access the feature flags by using the `useFeatureFlags` hook
or in places where hooks cannot be used then you can use the 
`getRuntimeFeatureFlags` function.

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
  
  const response = await fetch(`${flags['apiUrl']}/data`)
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
