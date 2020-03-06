import * as React from 'react';
export interface TwoFlagsProviderProps {
    clientID: string;
    namespace: string;
    twoflagsAPI?: string;
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
    twoflagsAPI?: string;
}
export declare const getFeatureFlags: ({ clientID, namespace, environment, twoflagsAPI }: GetFeatureFlagsParams) => Promise<any>;
export declare const TwoFlagsProvider: React.FC<TwoFlagsProviderProps>;
export declare const useFeatureFlags: () => Flags | null;
