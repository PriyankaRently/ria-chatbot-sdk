// Context & Provider
export { RiaChatBotSDKProvider, useRiaChatBotSDK, useExternalState } from "./context/RiaChatBotSDKContext";
export type {
  RiaChatBotSDKConfig,
  RiaChatBotSDKComponents,
  RiaChatBotSDKTheme,
  RiaChatBotSDKScaling,
  RiaChatBotSDKApi,
  RiaChatBotSDKServiceConfig,
  RiaChatBotSDKLogger,
  RiaChatBotSDKDateUtils,
  RiaChatBotSDKAssets,
  RiaChatBotSDKNavigation,
  RiaChatBotSDKStorage,
  RiaChatBotSDKExternalState,
} from "./context/types";

// Store
export {
  // Actions
  showChatWithUsModalAction,
  hideChatWithUsModalAction,
  getLivekitTokenAction,
  clearLivekitTokenAction,
  storeChatMessageAction,
  storeLiveAgentHandoffDetailsAction,
  setLiveAgentHandoffStatusAction,
  setIsLiveAgentConnectedAction,
  setLiveAgentToAIHandoffAction,
  showChatBotLoaderAction,
  setConnectedToUltronAction,
  persistChatSessionIdAction,
  persistPreviousChatHistoryAction,
  setCurrentAIScreenNameAction,
  updateMessageLikeAction,
  toggleMessageLikeAction,
  persistCurrentPropIdAction,
  setReconnectionAttemptAction,
  sendMessageToChatwootAction,
  changeChatOwnershipAction,
} from "./store/actions";

// Action Types
export {
  SHOW_CHAT_WITH_US_MODAL,
  HIDE_CHAT_WITH_US_MODAL,
  GET_LIVEKIT_TOKEN,
  CLEAR_LIVEKIT_TOKEN,
  STORE_CHAT_MESSAGE,
  STORE_LIVE_AGENT_HANDOFF_DETAILS,
  SET_LIVE_AGENT_HANDOFF_STATUS,
  SET_IS_LIVE_AGENT_CONNECTED,
  SET_LIVE_AGENT_TO_AI_HANDOFF,
  SHOW_CHATBOT_LOADER,
  SET_CONNECTED_TO_ULTRON,
  PERSIST_CHAT_SESSION_ID,
  PERSIST_PREVIOUS_CHAT_HISTORY,
  SET_CURRENT_AI_SCREEN_NAME,
  UPDATE_MESSAGE_LIKE,
  TOGGLE_MESSAGE_LIKE,
  PERSIST_CURRENT_PROP_ID,
  SET_RECONNECT_ATTEMPT_ACTION,
  PERSIST_LIVEKIT_TOKEN,
  CONNECTED_TO_ROOM,
  SET_RECONNECT_TO_ROOM,
  PERSIST_PREVIOUS_CHAT_SESSION,
  SEND_MESSAGE_TO_CHATWOOT,
  CHANGE_OWNERSHIP,
  FETCH_LIVEKIT_TOKEN,
  CHECK_PREVIOUS_CHAT_SESSION,
  FETCH_PREVIOUS_CHAT_HISTORY,
  CLEAR_CHAT_MESSAGES,
} from "./store/actionTypes";

// Reducer
export {
  riaChatBot,
  riaChatBotInitialState,
} from "./store/reducer";
export type {
  TRiaChatBotStateTypes,
  TChatMessageType,
  TPreviousChatSessionType,
  TPreviousChatMessageType,
  TLiveAgentHandoffDetailsType,
} from "./store/reducer";

// Sagas
export { riaChatBotSaga } from "./store/sagas";

// SDK Config (for advanced usage)
export { setSDKConfig, getSDKConfig } from "./store/sdkConfig";

// Constants
export {
  CHATBOT_USER_ENUM,
  TYPING_CONSTANT,
  CHATBOT_MODALITY,
  VR_PLAN_TYPES,
  INDEFINITE_PRICE,
  COMMUNITY_TAB_MAPPING,
  COMMUNITY_TYPE_TO_PROPERTY_TYPE,
} from "./constants";
export { HEAP_RIA_CHATBOT_EVENTS } from "./constants/heapEvents";

// Utils
export {
  decodeMessage,
  generateRandomKey,
  formatListedPropertyDetailsForChatBot,
  formatPropertyDetailsForChatBot,
  formatCommunityDetailsForChatBot,
  formatFilterDataForChatBot,
  publishDataToRoom,
  sendTextToRoom,
  createAnonymousToken,
} from "./utils/chatbotHelperFunctions";
export { connectToChatwoot } from "./utils/ChatwootIntegration";
export { LiveKitProvider } from "./utils/LiveKitProvider";

// Hooks
export { useChatbotContext } from "./hooks/useChatbotContext";
export { useChatMessages } from "./hooks/useChatMessages";
export { useLiveAgent } from "./hooks/useLiveAgent";
export { useLiveKitRoom } from "./hooks/useLiveKitRoom";
export { useReconnectionToChatbot } from "./hooks/useReconnectionToChatbot";

// Components
export { AiDisclaimer } from "./components/AiDisclaimer";
export { LiveAgentHandoffBadge, NoNetworkBadge } from "./components/ChatbotBadges";
export { ChatbotLoader } from "./components/ChatbotLoader";
export {
  ChatMessageText,
  AIChatMessageText,
  UserChatMessageText,
  LiveAgentMessageText,
} from "./components/ChatMessageText";
export { ChatWidgetIcon } from "./components/ChatWidgetIcon";
export { createChatWithUsModalStyles } from "./components/ChatWithUsModal.style";
export { ChatWithUsModal } from "./components/ChatWithUsModal";
export { MessageInput } from "./components/MessageInput";
export { PopupBubbleText } from "./components/PopupBubbleText";
export { RiaWidget } from "./components/RiaWidget";
export { TypingDots } from "./components/TypingDotsComponent";
