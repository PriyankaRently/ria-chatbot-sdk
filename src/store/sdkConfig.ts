import type { RiaChatSDKConfig } from "../context/types";

/**
 * Module-level SDK configuration reference.
 * Used by non-React code (sagas) that cannot access React context.
 * Set by RiaChatSDKProvider on mount.
 */
let _sdkConfig: RiaChatSDKConfig | null = null;

export const setSDKConfig = (config: RiaChatSDKConfig): void => {
  _sdkConfig = config;
};

export const getSDKConfig = (): RiaChatSDKConfig => {
  if (!_sdkConfig) {
    throw new Error(
      "RiaChatSDK not initialized. Wrap your app in <RiaChatSDKProvider>."
    );
  }
  return _sdkConfig;
};
