import React, { createContext, useContext } from "react";
import type { RiaChatBotSDKConfig, RiaChatBotSDKExternalState } from "./types";
import { useSelector } from "react-redux";
import { setSDKConfig } from "../store/sdkConfig";

const RiaChatBotSDKContext = createContext<RiaChatBotSDKConfig | null>(null);

/**
 * Hook to access the SDK configuration context.
 * Must be called within a RiaChatBotSDKProvider.
 */
export const useRiaChatBotSDK = (): RiaChatBotSDKConfig => {
  const ctx = useContext(RiaChatBotSDKContext);
  if (!ctx) {
    throw new Error("useRiaChatBotSDK must be used within a <RiaChatBotSDKProvider>");
  }
  return ctx;
};

/**
 * Hook to access the external app state provided by the host app.
 * Uses the externalStateSelector from the SDK config.
 */
export const useExternalState = (): RiaChatBotSDKExternalState => {
  const { externalStateSelector } = useRiaChatBotSDK();
  return useSelector(externalStateSelector);
};

interface RiaChatBotSDKProviderProps {
  config: RiaChatBotSDKConfig;
  children: React.ReactNode;
}

/**
 * RiaChatBotSDKProvider - Wraps the app to provide SDK configuration.
 *
 * The host app must wrap its component tree with this provider and pass
 * all required configuration (theme, API functions, assets, etc.).
 *
 * This provider also sets a module-level config reference so that
 * non-React code (sagas) can access the config.
 */
export const RiaChatBotSDKProvider = ({
  config,
  children,
}: RiaChatBotSDKProviderProps): React.ReactElement => {
  // Set the module-level config for non-React code (sagas)
  setSDKConfig(config);

  return (
    <RiaChatBotSDKContext.Provider value={config}>
      {children}
    </RiaChatBotSDKContext.Provider>
  );
};
