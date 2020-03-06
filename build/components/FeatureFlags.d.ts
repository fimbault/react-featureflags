import * as React from 'react';
export interface FeatureFlagsProviderProps {
    clientID: string;
    namespace: string;
    featureFlagsAPI?: string;
    fetchInterval?: number;
    logging?: (flags: Flags) => any;
    children: React.ReactNode;
}
export declare const useInterval: (callback: () => any, delay: number | null) => void;
export interface Flags {
    [key: string]: any;
}
export declare const FeatureFlagsContext: React.Context<Flags | null>;
export interface GetFeatureFlagsParams {
    clientID: string;
    namespace: string;
    environment?: string;
    featureFlagsAPI?: string;
}
export declare const getFeatureFlags: ({ clientID, namespace, environment, featureFlagsAPI }: GetFeatureFlagsParams) => Promise<any>;
export declare const FeatureFlagsProvider: React.FC<FeatureFlagsProviderProps>;
export declare const useFeatureFlags: () => Flags | null;
