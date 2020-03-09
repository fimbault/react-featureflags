import * as React from 'react';
export interface FeatureFlagsProviderProps {
    clientID: string;
    namespace: string;
    featureFlagsAPI?: string;
    uniqueID?: string;
    fetchInterval?: number;
    logging?: (flags: Flags) => any;
    children: React.ReactNode;
}
export declare const useInterval: (callback: () => any, delay: number | null) => void;
export interface Flags {
    [key: string]: any;
}
export interface FeatureFlagsContextProps {
    flags: Flags;
    setUniqueID: (uid: string) => any;
}
export declare const FeatureFlagsContext: React.Context<FeatureFlagsContextProps | null>;
export interface GetFeatureFlagsParams {
    clientID: string;
    namespace: string;
    environment?: string;
    featureFlagsAPI?: string;
    uniqueID?: string;
}
export declare const getFeatureFlags: ({ clientID, namespace, environment, featureFlagsAPI, uniqueID }: GetFeatureFlagsParams) => Promise<any>;
export declare const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps>;
export declare const useFeatureFlags: () => any;
export declare const useFeatureFlagsEnvironment: () => any;
export declare const useFeatureFlagsNamespace: () => any;
export declare const useFeatureFlagsUniqueIDUpdater: () => ((uid: string) => any) | null;
