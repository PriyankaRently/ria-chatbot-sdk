import type { RiaChatBotSDKConfig } from "../context/types";

/**
 * Module-level SDK configuration reference.
 * Used by non-React code (sagas) that cannot access React context.
 * Set by RiaChatBotSDKProvider on mount.
 */
let _sdkConfig: RiaChatBotSDKConfig | null = null;

export const setSDKConfig = (config: RiaChatBotSDKConfig): void => {
  _sdkConfig = config;
};

export const getSDKConfig = (): RiaChatBotSDKConfig => {
  if (!_sdkConfig) {
    throw new Error(
      "RiaChatBotSDK not initialized. Wrap your app in <RiaChatBotSDKProvider>."
    );
  }
  return _sdkConfig;
};
