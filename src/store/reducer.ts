import { CHATBOT_USER_ENUM } from "../constants";
import { getActionType } from "./actionUtils";
import {
  clearChatMessagesAction,
  clearLivekitTokenAction,
  setConnectedToRoomAction,
  getLivekitTokenAction,
  hideChatWithUsModalAction,
  persistChatSessionIdAction,
  persistLivekitTokenAction,
  persistPreviousChatHistoryAction,
  persistPreviousChatSessionDetailsAction,
  setIsLiveAgentConnectedAction,
  setLiveAgentHandoffStatusAction,
  setReconnectToRoomAction,
  showChatWithUsModalAction,
  storeChatMessageAction,
  storeLiveAgentHandoffDetailsAction,
  updateMessageLikeAction,
  setLiveAgentToAIHandoffAction,
  showChatBotLoaderAction,
  setReconnectionAttemptAction,
  setConnectedToUltronAction,
  persistCurrentPropIdAction,
  setCurrentAIScreenNameAction,
} from "./actions";

export interface TChatMessageType {
  user: number;
  timestamp?: string;
  content: string;
  id: string;
  likeStatus?: number;
  senderName?: string;
}

export interface TPreviousChatSessionType {
  id: string;
  created_at: string;
  ended_at: string | null;
  livekit_session_id: string;
  participant_id: string;
  participant_type: string;
  phone_number: string | null;
  started_at: string;
  summary: string | null;
  tags: string[] | null;
  updated_at: string;
}

export interface TPreviousChatMessageType {
  created_at: string;
  updated_at: string;
  id: string;
  chat_session_id: string;
  modality: number;
  content: string;
  role: number;
  confidence_score: number;
  helpful?: number;
  agent_name?: string;
}

export interface TLiveAgentHandoffDetailsType {
  contact_id: string;
  conversation_id: string;
  email: string;
  name: string;
  phone_number: string;
  pubsub_token: string;
  salesforce_case_id: string;
}

export interface TRiaChatBotStateTypes {
  chatbotLoading: boolean;
  showChatbotLoadingMessage: boolean;
  showChatWithUsModal?: boolean;
  currentPropId?: number;
  screenName?: string;
  livekitToken: string | null;
  getLivekitToken: boolean;
  reconnectionAttempt: number;
  connectedToRoom: boolean;
  connectedToUltron: boolean;
  reconnectToRoom: boolean;
  previousChatSession: TPreviousChatSessionType | null;
  previousChatHistory?: TPreviousChatMessageType[];
  chatMessages: TChatMessageType[];
  chatSessionId?: string;
  liveAgentHandoffDetails: TLiveAgentHandoffDetailsType;
  isLiveAgentHandoff: boolean;
  isLiveAgentConnected: boolean;
  liveAgentToAIHandoff?: boolean;
}

export const riaChatBotInitialState: TRiaChatBotStateTypes = {
  chatbotLoading: false,
  showChatbotLoadingMessage: false,
  showChatWithUsModal: false,
  currentPropId: null,
  livekitToken: null,
  getLivekitToken: false,
  reconnectionAttempt: 0,
  connectedToRoom: false,
  connectedToUltron: false,
  reconnectToRoom: false,
  screenName: "",
  previousChatSession: {
    id: null,
    created_at: "",
    ended_at: null,
    livekit_session_id: "",
    participant_id: "",
    participant_type: "",
    phone_number: null,
    started_at: "",
    summary: null,
    tags: null,
    updated_at: "",
  },
  liveAgentHandoffDetails: {
    contact_id: "",
    conversation_id: "",
    email: "",
    name: "",
    phone_number: "",
    pubsub_token: "",
    salesforce_case_id: "",
  },
  isLiveAgentHandoff: false,
  isLiveAgentConnected: false,
  previousChatHistory: [],
  chatMessages: [],
  chatSessionId: null,
  liveAgentToAIHandoff: false,
};

export const riaChatBot = (
  state = riaChatBotInitialState,
  actionObj: any
) => {
  switch (actionObj.type) {
    case getActionType(showChatBotLoaderAction):
      return {
        ...state,
        chatbotLoading: actionObj.payload.showLoader,
        showChatbotLoadingMessage: actionObj.payload.showMessage,
      };
    case getActionType(showChatWithUsModalAction): {
      const { screenName = "" } = actionObj.payload;
      return {
        ...state,
        showChatWithUsModal: true,
        screenName: screenName,
      };
    }
    case getActionType(setCurrentAIScreenNameAction): {
      const currentScreenName = actionObj.payload;
      return {
        ...state,
        screenName: currentScreenName,
      };
    }
    case getActionType(hideChatWithUsModalAction):
      return {
        ...state,
        showChatWithUsModal: false,
        showChatbotLoadingMessage: false,
      };
    case getActionType(persistLivekitTokenAction):
      return {
        ...state,
        livekitToken: actionObj.payload,
      };
    case getActionType(getLivekitTokenAction): {
      const getLivekitToken = actionObj.payload;
      return {
        ...state,
        livekitToken: getLivekitToken ? null : state.livekitToken,
        getLivekitToken: actionObj.payload,
      };
    }
    case getActionType(setReconnectionAttemptAction):
      return {
        ...state,
        reconnectionAttempt: actionObj.payload,
      };
    case getActionType(clearLivekitTokenAction):
      return {
        ...state,
        livekitToken: null,
      };
    case getActionType(setConnectedToRoomAction):
      return {
        ...state,
        connectedToRoom: actionObj.payload,
      };
    case getActionType(setConnectedToUltronAction):
      return {
        ...state,
        connectedToUltron: actionObj.payload,
      };
    case getActionType(setReconnectToRoomAction):
      return {
        ...state,
        reconnectToRoom: actionObj.payload,
      };
    case getActionType(persistChatSessionIdAction):
      return {
        ...state,
        chatSessionId: actionObj.payload.chatSessionId,
      };
    case getActionType(storeChatMessageAction):
      if (Array.isArray(actionObj.payload)) {
        return {
          ...state,
          chatMessages: actionObj.payload,
        };
      }
      {
        const existingIndex = state.chatMessages.findIndex(
          (msg: TChatMessageType) => msg.id === actionObj.payload.id
        );
        if (existingIndex !== -1) {
          if (actionObj.payload.user === CHATBOT_USER_ENUM.AI) {
            const updatedMessages = [...state.chatMessages];
            updatedMessages[existingIndex] = {
              ...updatedMessages[existingIndex],
              content:
                updatedMessages[existingIndex].content +
                actionObj.payload.content,
            };
            return {
              ...state,
              chatMessages: updatedMessages,
            };
          } else {
            return state;
          }
        } else {
          return {
            ...state,
            chatMessages: [...state.chatMessages, actionObj.payload],
          };
        }
      }
    case getActionType(clearChatMessagesAction):
      return {
        ...state,
        chatMessages: [],
      };
    case getActionType(persistPreviousChatSessionDetailsAction):
      return {
        ...state,
        previousChatSession: actionObj.payload,
      };
    case getActionType(persistPreviousChatHistoryAction):
      return {
        ...state,
        previousChatHistory: actionObj.payload,
      };
    case getActionType(updateMessageLikeAction): {
      const { messageId, likeStatus } = actionObj.payload;
      const updatedMessages = state.chatMessages.map((msg: TChatMessageType) => {
        if (msg.id === messageId) {
          return { ...msg, likeStatus };
        }
        return msg;
      });
      return {
        ...state,
        chatMessages: updatedMessages,
      };
    }
    case getActionType(storeLiveAgentHandoffDetailsAction):
      return {
        ...state,
        liveAgentHandoffDetails: actionObj.payload,
      };
    case getActionType(setLiveAgentHandoffStatusAction):
      return {
        ...state,
        isLiveAgentHandoff: actionObj.payload.isLiveAgentHandoff,
      };
    case getActionType(setIsLiveAgentConnectedAction):
      return {
        ...state,
        isLiveAgentConnected: actionObj.payload,
      };
    case getActionType(setLiveAgentToAIHandoffAction):
      return {
        ...state,
        liveAgentToAIHandoff: actionObj.payload,
      };
    case getActionType(persistCurrentPropIdAction):
      return {
        ...state,
        currentPropId: actionObj.payload,
      };
    default:
      return state;
  }
};
