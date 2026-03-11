import { action } from "./actionUtils";
import {
  CHECK_PREVIOUS_CHAT_SESSION,
  CLEAR_CHAT_MESSAGES,
  CLEAR_LIVEKIT_TOKEN,
  CONNECTED_TO_ROOM,
  FETCH_LIVEKIT_TOKEN,
  FETCH_PREVIOUS_CHAT_HISTORY,
  GET_LIVEKIT_TOKEN,
  HIDE_CHAT_WITH_US_MODAL,
  PERSIST_CHAT_SESSION_ID,
  PERSIST_LIVEKIT_TOKEN,
  PERSIST_PREVIOUS_CHAT_HISTORY,
  PERSIST_PREVIOUS_CHAT_SESSION,
  SEND_MESSAGE_TO_CHATWOOT,
  SHOW_CHATBOT_LOADER,
  SET_IS_LIVE_AGENT_CONNECTED,
  SET_LIVE_AGENT_HANDOFF_STATUS,
  SET_RECONNECT_TO_ROOM,
  SHOW_CHAT_WITH_US_MODAL,
  STORE_CHAT_MESSAGE,
  STORE_LIVE_AGENT_HANDOFF_DETAILS,
  TOGGLE_MESSAGE_LIKE,
  UPDATE_MESSAGE_LIKE,
  SET_LIVE_AGENT_TO_AI_HANDOFF,
  CHANGE_OWNERSHIP,
  SET_RECONNECT_ATTEMPT_ACTION,
  SET_CONNECTED_TO_ULTRON,
  PERSIST_CURRENT_PROP_ID,
  SET_CURRENT_AI_SCREEN_NAME,
} from "./actionTypes";
import type { TChatMessageType, TLiveAgentHandoffDetailsType, TPreviousChatMessageType, TPreviousChatSessionType } from "./reducer";

interface TShowChatbotLoaderActionPayload {
  showLoader: boolean;
  showMessage?: boolean;
}

interface TFetchLivekitTokenActionPayload {
  modality?: string;
  reconnect?: boolean;
}

interface TPersistLivekitTokenActionPayload {
  livekitToken: string;
}

interface TPersistPreviousChatSessionDetailsActionPayload {
  chatSession: TPreviousChatSessionType | null;
}

interface TFetchPreviousChatHistoryActionPayload {
  chatSessionId: string;
}

interface TToggleMessageLikeActionPayload {
  messageId: string;
  likeStatus: number;
}

interface TShowChatWithUsModalActionPayload {
  screenName?: string;
}

interface TPersistChatSessionIdActionPayload {
  chatSessionId: string;
}

interface TSetLiveAgentHandoffStatusPayload {
  isLiveAgentHandoff: boolean;
}

interface TSendMessageToChatwootPayload {
  messageContent: string;
  systemGenerated?: boolean;
}

export const showChatBotLoaderAction = (payload: TShowChatbotLoaderActionPayload): any =>
  action(SHOW_CHATBOT_LOADER, payload);
export const showChatWithUsModalAction = (payload: TShowChatWithUsModalActionPayload): any =>
  action(SHOW_CHAT_WITH_US_MODAL, payload);
export const setCurrentAIScreenNameAction = (payload: string): any =>
  action(SET_CURRENT_AI_SCREEN_NAME, payload);
export const hideChatWithUsModalAction = (): any =>
  action(HIDE_CHAT_WITH_US_MODAL);
export const setReconnectionAttemptAction = (payload: number): any =>
  action(SET_RECONNECT_ATTEMPT_ACTION, payload);
export const getLivekitTokenAction = (payload: boolean): any =>
  action(GET_LIVEKIT_TOKEN, payload);
export const fetchLivekitTokenAction = (payload: TFetchLivekitTokenActionPayload): any =>
  action(FETCH_LIVEKIT_TOKEN, payload);
export const persistLivekitTokenAction = (payload: TPersistLivekitTokenActionPayload): any =>
  action(PERSIST_LIVEKIT_TOKEN, payload);
export const clearLivekitTokenAction = (): any =>
  action(CLEAR_LIVEKIT_TOKEN);
export const setReconnectToRoomAction = (payload: boolean): any =>
  action(SET_RECONNECT_TO_ROOM, payload);
export const setConnectedToRoomAction = (payload: boolean): any =>
  action(CONNECTED_TO_ROOM, payload);
export const setConnectedToUltronAction = (payload: boolean): any =>
  action(SET_CONNECTED_TO_ULTRON, payload);
export const checkPreviousChatSessionAction = (): any =>
  action(CHECK_PREVIOUS_CHAT_SESSION);
export const persistChatSessionIdAction = (payload: TPersistChatSessionIdActionPayload): any =>
  action(PERSIST_CHAT_SESSION_ID, payload);
export const persistPreviousChatSessionDetailsAction = (payload: TPersistPreviousChatSessionDetailsActionPayload): any =>
  action(PERSIST_PREVIOUS_CHAT_SESSION, payload);
export const fetchPreviousChatHistoryAction = (payload: TFetchPreviousChatHistoryActionPayload): any =>
  action(FETCH_PREVIOUS_CHAT_HISTORY, payload);
export const persistPreviousChatHistoryAction = (payload: TPreviousChatMessageType[]): any =>
  action(PERSIST_PREVIOUS_CHAT_HISTORY, payload);
export const storeChatMessageAction = (payload: TChatMessageType | TChatMessageType[]): any =>
  action(STORE_CHAT_MESSAGE, payload);
export const clearChatMessagesAction = (): any =>
  action(CLEAR_CHAT_MESSAGES);
export const toggleMessageLikeAction = (payload: TToggleMessageLikeActionPayload): any =>
  action(TOGGLE_MESSAGE_LIKE, payload);
export const updateMessageLikeAction = (payload: TToggleMessageLikeActionPayload): any =>
  action(UPDATE_MESSAGE_LIKE, payload);
export const storeLiveAgentHandoffDetailsAction = (payload: TLiveAgentHandoffDetailsType): any =>
  action(STORE_LIVE_AGENT_HANDOFF_DETAILS, payload);
export const setLiveAgentHandoffStatusAction = (payload: TSetLiveAgentHandoffStatusPayload): any =>
  action(SET_LIVE_AGENT_HANDOFF_STATUS, payload);
export const setIsLiveAgentConnectedAction = (payload: boolean): any =>
  action(SET_IS_LIVE_AGENT_CONNECTED, payload);
export const sendMessageToChatwootAction = (payload: TSendMessageToChatwootPayload): any =>
  action(SEND_MESSAGE_TO_CHATWOOT, payload);
export const setLiveAgentToAIHandoffAction = (payload: boolean): any =>
  action(SET_LIVE_AGENT_TO_AI_HANDOFF, payload);
export const changeChatOwnershipAction = (): any =>
  action(CHANGE_OWNERSHIP);
export const persistCurrentPropIdAction = (payload: any): any =>
  action(PERSIST_CURRENT_PROP_ID, payload);
