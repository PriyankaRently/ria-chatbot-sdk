import React, { createContext, useContext } from "react";
import type { RiaChatSDKConfig, RiaChatSDKExternalState } from "./types";
import { useSelector } from "react-redux";
import { setSDKConfig } from "../store/sdkConfig";

const RiaChatSDKContext = createContext<RiaChatSDKConfig | null>(null);

/**
 * Hook to access the SDK configuration context.
 * Must be called within a RiaChatSDKProvider.
 */
export const useRiaChatSDK = (): RiaChatSDKConfig => {
  const ctx = useContext(RiaChatSDKContext);
  if (!ctx) {
    throw new Error("useRiaChatSDK must be used within a <RiaChatSDKProvider>");
  }
  return ctx;
};

/**
 * Hook to access the external app state provided by the host app.
 * Uses the externalStateSelector from the SDK config.
 */
export const useExternalState = (): RiaChatSDKExternalState => {
  const { externalStateSelector } = useRiaChatSDK();
  return useSelector(externalStateSelector);
};

interface RiaChatSDKProviderProps {
  config: RiaChatSDKConfig;
  children: React.ReactNode;
}

/**
 * RiaChatSDKProvider - Wraps the app to provide SDK configuration.
 *
 * The host app must wrap its component tree with this provider and pass
 * all required configuration (theme, API functions, assets, etc.).
 *
 * This provider also sets a module-level config reference so that
 * non-React code (sagas) can access the config.
 */
export const RiaChatSDKProvider = ({
  config,
  children,
}: RiaChatSDKProviderProps): React.ReactElement => {
  // Set the module-level config for non-React code (sagas)
  setSDKConfig(config);

  return (
    <RiaChatSDKContext.Provider value={config}>
      {children}
    </RiaChatSDKContext.Provider>
  );
};
