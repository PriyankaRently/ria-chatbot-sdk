import React from "react";

/**
 * Theme component interfaces expected by the SDK.
 * The host app provides its own design system components matching these signatures.
 */
export interface RiaChatSDKComponents {
  RDText: React.ComponentType<any>;
  RDButton: React.ComponentType<any>;
  RDButtonContainer: React.ComponentType<any>;
  RDHeroIcon: React.ComponentType<any>;
  RDPressableOpacity: React.ComponentType<any>;
  RDBadge: React.ComponentType<any>;
  TextStyleFromMarkup: React.ComponentType<any>;
}

/**
 * Theme tokens expected by the SDK.
 */
export interface RiaChatSDKTheme {
  colors: Record<string, any>;
  spacings: Record<string, any>;
}

/**
 * Scaling functions for responsive sizing.
 */
export interface RiaChatSDKScaling {
  hs: (size: number) => number;
  vs: (size: number) => number;
}

/**
 * API functions the SDK uses to make network requests.
 */
export interface RiaChatSDKApi {
  fetchAPI: (params: any, options?: any) => Promise<any>;
  fetchMFDAPI: (params: any) => Promise<any>;
}

/**
 * Configuration URLs and keys for external services.
 */
export interface RiaChatSDKServiceConfig {
  gilfoyleBaseUrl: string;
  liveKitWebSocketUrl: string;
  chatWootWSUrl: string;
  chatwootAccountId: string;
}

/**
 * Logger interface.
 */
export interface RiaChatSDKLogger {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

/**
 * Date utility functions.
 */
export interface RiaChatSDKDateUtils {
  getCurrentDateTime: (format: string) => string;
  formatISOToLocal: (isoString: string, format: string) => string;
}

/**
 * Image asset sources (result of require() calls).
 */
export interface RiaChatSDKAssets {
  rentlyIcon: any;
  chatWidgetIcon: any;
  rentlyChatIcon: any;
}

/**
 * Navigation callbacks for the SDK to trigger host app navigation.
 */
export interface RiaChatSDKNavigation {
  navigateToSearch: (params: any) => void;
  popToTop: () => void;
}

/**
 * Storage interface for persisting key-value data.
 */
export interface RiaChatSDKStorage {
  get: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
}

/**
 * External app state that the SDK needs from the host app's Redux store.
 * The host app provides a selector function that extracts this from its root state.
 */
export interface RiaChatSDKExternalState {
  authKey: string | null;
  prospectId: string | number | null;
  email: string;
  phone: string;
  fullname: string;
  isOffline: boolean;
  currentPlan: string | null;
  activeIqualProfile: boolean;
  filterDetails: any;
  listData: any[];
  propertyDetails: any;
  communityDetails: any;
  availableUnits: any;
  agentTourEnabled: boolean;
  activeFloorPlan: string;
  availableFloorplans: number[];
  waitListFloorplans: number[];
  activeUnits: any[];
  leadActivityId: string | null;
  rentlyGeoCodeData: any;
}

/**
 * Callback dispatched by the SDK when AI sends search params.
 * The host app should handle fetching geocode suggestions.
 */
export type OnSearchFromAI = (params: { address: string }) => void;

/**
 * Full configuration object for the RIA Chat SDK.
 */
export interface RiaChatSDKConfig {
  /** Design system UI components */
  components: RiaChatSDKComponents;

  /** Theme tokens (colors, spacings) */
  theme: RiaChatSDKTheme;

  /** Responsive scaling functions */
  scaling: RiaChatSDKScaling;

  /** API call functions */
  api: RiaChatSDKApi;

  /** Service configuration (URLs, keys) */
  serviceConfig: RiaChatSDKServiceConfig;

  /** Logger */
  logger: RiaChatSDKLogger;

  /** Analytics tracking function */
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;

  /** Date formatting utilities */
  dateUtils: RiaChatSDKDateUtils;

  /** Image assets */
  assets: RiaChatSDKAssets;

  /** Navigation callbacks */
  navigation: RiaChatSDKNavigation;

  /** Persistent storage */
  storage: RiaChatSDKStorage;

  /** Selector that extracts external app state from the host Redux store */
  externalStateSelector: (state: any) => RiaChatSDKExternalState;

  /** Callback when AI requests a property search */
  onSearchFromAI: OnSearchFromAI;

  /**
   * Function to get current Redux store state (used by sagas).
   * Typically: () => store.getState()
   */
  getStoreState: () => any;
}
