import { call, put, takeLatest } from "redux-saga/effects";
import {
  changeChatOwnershipAction,
  checkPreviousChatSessionAction,
  fetchLivekitTokenAction,
  fetchPreviousChatHistoryAction,
  persistChatSessionIdAction,
  persistLivekitTokenAction,
  persistPreviousChatHistoryAction,
  persistPreviousChatSessionDetailsAction,
  sendMessageToChatwootAction,
  toggleMessageLikeAction,
  updateMessageLikeAction,
} from "./actions";
import { getActionType } from "./actionUtils";
import { getSDKConfig } from "./sdkConfig";
import { CHATBOT_MODALITY, VR_PLAN_TYPES } from "../constants";
import { HEAP_RIA_CHATBOT_EVENTS } from "../constants/heapEvents";
import { createAnonymousToken } from "../utils";

const API_ENDPOINTS = {
  LIVEKIT_TOKEN: "/api/v1/livekit/tokens",
  CHAT_HISTORY: "/api/v1/chat_sessions/last",
  CHAT_MESSAGE: "/api/v1/chat_sessions",
  CHATWOOT_SEND_MESSAGE: "/api/v1/chatwoot/messages",
  CHANGE_OWNERSHIP: "/api/v1/chat_sessions/change_ownership",
};

interface TGilfoyleHeadersType {
  "Participant-Token": string;
  "Participant-Type": string;
}

const getGilfoyleHeaders = (): TGilfoyleHeadersType => {
  const config = getSDKConfig();
  const state = config.getStoreState();
  const externalState = config.externalStateSelector(state);
  const authKey = externalState.authKey;
  const token = authKey || createAnonymousToken();
  const participantType = authKey ? "Prospect" : "AnonymousUser";

  return {
    "Participant-Token": token,
    "Participant-Type": participantType,
  };
};

export function* fetchLiveKitTokenSaga(action: any) {
  const config = getSDKConfig();
  const { logger, trackEvent, api, serviceConfig, getStoreState, externalStateSelector } = config;
  try {
    logger.log("ria-chat-sdk/sagas ~ fetchLiveKitTokenSaga", action.payload);
    const { modality = CHATBOT_MODALITY.TEXT, reconnect = "false" } = action.payload || {};
    const state = getStoreState();
    const externalState = externalStateSelector(state);
    const authKey = externalState.authKey;
    const { chatSessionId, liveAgentToAIHandoff } = state.riaChatBot;
    const { email = "", phone = "", fullname = "" } = externalState;
    const currentPlan = externalState.currentPlan;
    const isVerifiedRenter = VR_PLAN_TYPES.includes(currentPlan as any) && externalState.activeIqualProfile;
    const disableGreet = liveAgentToAIHandoff;

    const authToken = authKey || createAnonymousToken();
    const participantToken = authToken;
    const participantType = authKey ? "Prospect" : "AnonymousUser";
    const identity = authToken;

    const apiPayload = {
      room_name: Math.random().toString(36).substring(2),
      participant: {
        name: "user",
        identity: identity,
        attributes: {
          isVerifiedRenter: isVerifiedRenter ? "1" : "0",
          modality: modality,
          "participant-token": participantToken,
          "participant-type": participantType,
          reconnect: reconnect,
          source: "homes",
          ...(authKey && {
            email,
            phone,
            name: fullname,
          }),
          ...(chatSessionId && { chat_session_id: chatSessionId }),
          ...(liveAgentToAIHandoff && {
            disable_greet: disableGreet ? "true" : "false",
          }),
        },
      },
    };

    const headers = getGilfoyleHeaders();
    const response = yield call(api.fetchMFDAPI, {
      path: `${serviceConfig.gilfoyleBaseUrl}${API_ENDPOINTS.LIVEKIT_TOKEN}`,
      method: "POST",
      body: JSON.stringify(apiPayload),
      headers: headers,
    });

    if (response.success) {
      const accessToken = response.access_token;
      yield put(persistLivekitTokenAction(accessToken));
    }
  } catch (error) {
    logger.error("Error fetching LiveKit token:", error);
    trackEvent(HEAP_RIA_CHATBOT_EVENTS.LIVEKIT_TOKEN_GENERATION_FAILED);
    yield put(persistLivekitTokenAction(null));
  }
}

export function* checkPreviousChatSessionSaga() {
  const config = getSDKConfig();
  const { logger, api, serviceConfig } = config;
  try {
    const headers = getGilfoyleHeaders();

    const response = yield call(api.fetchMFDAPI, {
      path: `${serviceConfig.gilfoyleBaseUrl}${API_ENDPOINTS.CHAT_HISTORY}`,
      method: "GET",
      headers: headers,
    });

    if (response.success) {
      const chatSession = response.chat_session;
      yield put(persistPreviousChatSessionDetailsAction(chatSession));
      if (chatSession && chatSession.id) {
        yield put(fetchPreviousChatHistoryAction({ chatSessionId: chatSession.id }));
      }
    }
  } catch (error) {
    logger.error("Error checking previous chat session:", error);
    yield put(persistPreviousChatSessionDetailsAction(null));
  }
}

export function* fetchPreviousChatHistorySaga(action: any) {
  const config = getSDKConfig();
  const { logger, api, serviceConfig, getStoreState } = config;
  try {
    const { chatSessionId } = action.payload || {};
    const currentChatSessionId = getStoreState().riaChatBot.chatSessionId;

    const headers = getGilfoyleHeaders();

    if (!chatSessionId) {
      yield put(persistPreviousChatHistoryAction([]));
      return;
    }
    const fetchResponse = yield call(
      api.fetchAPI,
      {
        path: `${serviceConfig.gilfoyleBaseUrl}${API_ENDPOINTS.CHAT_MESSAGE}/${chatSessionId}/chat_messages`,
        method: "GET",
        headers: headers,
      },
      { retry: true }
    );

    if (fetchResponse) {
      const chatHistory = fetchResponse;
      if (!currentChatSessionId) {
        yield put(persistPreviousChatHistoryAction(chatHistory));
        yield put(persistChatSessionIdAction({ chatSessionId }));
      }
    }
  } catch (error) {
    logger.error("Error fetching previous chat history:", error);
    yield put(persistPreviousChatHistoryAction(null));
  }
}

export function* toggleMessageLikeSaga(action: any) {
  const config = getSDKConfig();
  const { logger, trackEvent, api, serviceConfig, getStoreState } = config;
  try {
    const { messageId, likeStatus } = action.payload || {};
    const chatSessionId = getStoreState().riaChatBot.chatSessionId || null;

    const headers = getGilfoyleHeaders();

    const apiPayload = {
      chat_message: {
        helpful: likeStatus,
      },
    };

    const response = yield call(api.fetchMFDAPI, {
      path: `${serviceConfig.gilfoyleBaseUrl}${API_ENDPOINTS.CHAT_MESSAGE}/${chatSessionId}/chat_messages/${messageId}`,
      body: JSON.stringify(apiPayload),
      method: "PATCH",
      headers: headers,
    });

    if (!response.success) {
      trackEvent(HEAP_RIA_CHATBOT_EVENTS.MESSAGE_LIKES_AND_DISLIKES_FAILED, {
        message_id: messageId,
        like_status: likeStatus,
      });
    }
  } catch (error) {
    logger.error("Error toggling message like:", error);
  }
}

export function* sendMessageToChatwootSaga(action: any) {
  const config = getSDKConfig();
  const { logger, api, serviceConfig, getStoreState } = config;
  try {
    const { messageContent, systemGenerated } = action.payload || {};
    const chatSessionId = getStoreState().riaChatBot.chatSessionId;
    const { contact_id, conversation_id } =
      getStoreState().riaChatBot.liveAgentHandoffDetails;

    const headers = getGilfoyleHeaders();

    const apiPayload = {
      chat_session_id: chatSessionId,
      contact_id: contact_id,
      conversation_id: conversation_id,
      message: {
        content: messageContent,
      },
      system_generated: systemGenerated || false,
    };

    yield call(api.fetchMFDAPI, {
      path: `${serviceConfig.gilfoyleBaseUrl}${API_ENDPOINTS.CHATWOOT_SEND_MESSAGE}`,
      body: JSON.stringify(apiPayload),
      method: "POST",
      headers: headers,
    });
  } catch (error) {
    logger.error("Error sending message to Chatwoot:", error);
  }
}

export function* changeChatOwnershipSaga() {
  const config = getSDKConfig();
  const { logger, api, serviceConfig, getStoreState, externalStateSelector } = config;
  try {
    const state = getStoreState();
    const authKey = externalStateSelector(state).authKey;
    const headers = getGilfoyleHeaders();

    const apiPayload = {
      new_participant_token: authKey,
    };

    yield call(api.fetchMFDAPI, {
      path: `${serviceConfig.gilfoyleBaseUrl}${API_ENDPOINTS.CHANGE_OWNERSHIP}`,
      method: "POST",
      headers: headers,
      body: JSON.stringify(apiPayload),
    });
  } catch (error) {
    logger.error("Error changing chat ownership:", error);
  }
}

export const riaChatBotSaga: any[] = [
  takeLatest(getActionType(fetchLivekitTokenAction), fetchLiveKitTokenSaga),
  takeLatest(getActionType(checkPreviousChatSessionAction), checkPreviousChatSessionSaga),
  takeLatest(getActionType(fetchPreviousChatHistoryAction), fetchPreviousChatHistorySaga),
  takeLatest(getActionType(toggleMessageLikeAction), toggleMessageLikeSaga),
  takeLatest(getActionType(sendMessageToChatwootAction), sendMessageToChatwootSaga),
  takeLatest(getActionType(changeChatOwnershipAction), changeChatOwnershipSaga),
];
