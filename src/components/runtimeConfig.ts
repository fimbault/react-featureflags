import { Flags } from './FeatureFlags'

let featureFlags: any

export function getRuntimeFeatureFlags () {
  return (featureFlags && featureFlags.flags) || null
}

export function getRuntimeEnvironment () {
  return (featureFlags && featureFlags.environment) || null
}

export function getRuntimeNamespace () {
  return (featureFlags && featureFlags.namespace) || null
}

export function setRuntimeFeatureFlags (flags: Flags) {
  featureFlags = flags
}
