import { Flags } from './FeatureFlags'

let featureFlags: any

export function getRuntimeFeatureFlags () {
  return featureFlags
}

export function setRuntimeFeatureFlags (flags: Flags) {
  featureFlags = flags
}
