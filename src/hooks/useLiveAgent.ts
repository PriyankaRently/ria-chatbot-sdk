import { useDispatch, useSelector } from "react-redux";
import { useRoomContext } from "@livekit/react-native";
import { useCallback, useEffect, useState } from "react";
import { connectToChatwoot } from "../utils/ChatwootIntegration";
import {
  getLivekitTokenAction,
  setLiveAgentToAIHandoffAction,
  setIsLiveAgentConnectedAction,
  setLiveAgentHandoffStatusAction,
  storeChatMessageAction,
  storeLiveAgentHandoffDetailsAction,
} from "../store/actions";
import { TChatMessageType } from "../store/reducer";
import { publishDataToRoom } from "../utils/chatbotHelperFunctions";
import { HEAP_RIA_CHATBOT_EVENTS } from "../constants/heapEvents";
import { useRiaChatSDK } from "../context/RiaChatSDKContext";

/**
 * Custom hook to manage live agent handoff logic, Chatwoot WebSocket connection,
 * and related Redux state for chatbot interactions.
 *
 * @returns {Object} Contains the Chatwoot WebSocket instance and time exceeded flag.
 */
export const useLiveAgent = () => {
  const {
    liveAgentHandoffDetails,
    isLiveAgentHandoff,
    isLiveAgentConnected,
    chatMessages,
    livekitToken,
    connectedToRoom,
    chatSessionId,
  } = useSelector((state: any) => state.riaChatBot);
  const [chatwootWebSocket, setChatwootWebSocket] = useState<WebSocket | null>(null);
  const [liveagentTimeExceeded, setLiveAgentTimeExceeded] = useState(false);
  const dispatch = useDispatch();
  const room = useRoomContext();
  const { trackEvent } = useRiaChatSDK();

  // Handle incoming messages from live agent
  const onMessage = useCallback(
    (message: TChatMessageType) => {
      if (!chatMessages.some((msg: TChatMessageType) => msg.id === message.id)) {
        trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.USER_RECEIVED_MESSAGE_FROM_LIVEAGENT, {
          chat_session_id: chatSessionId,
          message_id: message.id,
        });
        dispatch(storeChatMessageAction(message));
      }
      if (!isLiveAgentConnected) {
        dispatch(setIsLiveAgentConnectedAction(true));
        trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.LIVE_AGENT_HANDOFF_CONNECTED, {
          chat_session_id: chatSessionId,
          time_exceeded: liveagentTimeExceeded,
        });
        room.disconnect();
      }
    },
    [chatMessages]
  );

  // Handle conversation resolved from live agent
  const onConversationResolved = useCallback(() => {
    trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.LIVE_AGENT_HANDOFF_CONVERSATION_RESOLVED);
    chatwootWebSocket?.close();
    setChatwootWebSocket(null);
    dispatch(setLiveAgentHandoffStatusAction({ isLiveAgentHandoff: false }));
    dispatch(setIsLiveAgentConnectedAction(false));
    dispatch(setLiveAgentToAIHandoffAction(true));
  }, []);

  /**
   * Live Agent Handoff Connection Manager
   */
  useEffect(() => {
    if (livekitToken) {
      if (isLiveAgentHandoff) {
        // CONNECTING TO LIVE AGENT
        try {
          const ws = connectToChatwoot(
            liveAgentHandoffDetails.pubsub_token,
            onMessage,
            onConversationResolved
          );
          setChatwootWebSocket(ws);
        } catch (error: any) {
          trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.LIVE_AGENT_HANDOFF_CONNECTION_FAILED, {
            chat_session_id: chatSessionId,
            error: error?.message,
          });
          dispatch(setLiveAgentHandoffStatusAction({ isLiveAgentHandoff: false }));
          publishDataToRoom(
            room,
            { success: false, error: error?.message },
            "chatHandOffStatus"
          );
        }
      } else {
        // CLEANUP WHEN HANDOFF ENDS
        dispatch(setIsLiveAgentConnectedAction(false));
        if (!connectedToRoom) {
          dispatch(getLivekitTokenAction(true));
        }
        dispatch(
          storeLiveAgentHandoffDetailsAction({
            contact_id: "",
            conversation_id: "",
            email: "",
            name: "",
            phone_number: "",
            pubsub_token: "",
            salesforce_case_id: "",
          })
        );
      }
    }
  }, [isLiveAgentHandoff]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    if (isLiveAgentHandoff && !isLiveAgentConnected) {
      timeout = setTimeout(() => {
        setLiveAgentTimeExceeded(true);
      }, 5 * 60 * 1000);
    } else if (isLiveAgentConnected) {
      setLiveAgentTimeExceeded(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isLiveAgentHandoff, isLiveAgentConnected]);

  return {
    chatwootWebSocket,
    liveagentTimeExceeded,
  };
};
