import { useEffect, useCallback, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConnectionState, RoomEvent, TextStreamReader } from "livekit-client";
import { CHATBOT_USER_ENUM } from "../constants";
import { decodeMessage, publishDataToRoom } from "../utils/chatbotHelperFunctions";
import {
  clearLivekitTokenAction,
  getLivekitTokenAction,
  hideChatWithUsModalAction,
  persistChatSessionIdAction,
  setConnectedToUltronAction,
  setLiveAgentHandoffStatusAction,
  setReconnectionAttemptAction,
  showChatBotLoaderAction,
  storeChatMessageAction,
  storeLiveAgentHandoffDetailsAction,
} from "../store/actions";
import { useRoomContext } from "@livekit/react-native";
import { HEAP_RIA_CHATBOT_EVENTS } from "../constants/heapEvents";
import { useRiaChatBotSDK, useExternalState } from "../context/RiaChatBotSDKContext";

/**
 * Custom hook to manage LiveKit room interactions for the chatbot.
 * Handles participant attributes, data reception, transcription, and disconnection logic.
 *
 * @returns {Object} Contains raw data received from AI via LiveKit data messages.
 */
export const useLiveKitRoom = () => {
  const dispatch = useDispatch();
  const room = useRoomContext();
  const { trackEvent, dateUtils, onSearchFromAI } = useRiaChatBotSDK();
  const externalState = useExternalState();
  const authKey = externalState.authKey;
  const fullname = externalState.fullname ?? "";
  const phone = externalState.phone;
  const email = externalState.email ?? "";

  const isConnected = room?.state === ConnectionState.Connected;
  const showChatWindowTimeoutRef10s = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showChatWindowTimeoutRef20s = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showChatWindowTimeoutRef30s = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isLiveAgentHandoff, chatSessionId, reconnectionAttempt, connectedToUltron } =
    useSelector((state: any) => state.riaChatBot);
  const [rawDataFromAI, setRawDataFromAI] = useState<any>(null);
  const remoteParticipant: any = Array.from(room.remoteParticipants.values())[0];
  const participantState =
    remoteParticipant && remoteParticipant.attributes?.["lk.agent.state"];
  const isRemoteParticipantListening =
    participantState && participantState.length
      ? ["listening", "speaking"].includes(participantState)
      : false;

  // Update Redux state when connected to Ultron (AI agent)
  useEffect(() => {
    if (remoteParticipant && isRemoteParticipantListening && !connectedToUltron) {
      dispatch(setConnectedToUltronAction(true));
    } else if (!remoteParticipant) {
      dispatch(setConnectedToUltronAction(false));
    }
  }, [remoteParticipant, isRemoteParticipantListening]);

  // Manage timeouts for agent response after connecting to LiveKit room
  useEffect(() => {
    if (isConnected) {
      if (showChatWindowTimeoutRef10s.current) {
        clearTimeout(showChatWindowTimeoutRef10s.current);
      }
      if (showChatWindowTimeoutRef20s.current) {
        clearTimeout(showChatWindowTimeoutRef20s.current);
      }
      if (showChatWindowTimeoutRef30s.current) {
        clearTimeout(showChatWindowTimeoutRef30s.current);
      }

      showChatWindowTimeoutRef10s.current = setTimeout(() => {
        if (room.remoteParticipants.size === 0 || !isRemoteParticipantListening) {
          trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.NO_MESSAGE_RECEIVED_IN_10S, {
            chat_session_id: chatSessionId,
          });
        }
      }, 10000);

      showChatWindowTimeoutRef20s.current = setTimeout(() => {
        if (room.remoteParticipants.size === 0 || !isRemoteParticipantListening) {
          trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.NO_MESSAGE_RECEIVED_IN_20S, {
            chat_session_id: chatSessionId,
          });
          dispatch(showChatBotLoaderAction({ showLoader: true, showMessage: true }));
        }
      }, 20000);

      showChatWindowTimeoutRef30s.current = setTimeout(() => {
        if (room.remoteParticipants.size === 0 || !isRemoteParticipantListening) {
          trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.NO_MESSAGE_RECEIVED_IN_30S, {
            chat_session_id: chatSessionId,
          });
          if (reconnectionAttempt < 10) {
            dispatch(getLivekitTokenAction(true));
          }
        }
      }, 30000);

      return () => {
        if (showChatWindowTimeoutRef10s.current) {
          clearTimeout(showChatWindowTimeoutRef10s.current);
        }
        if (showChatWindowTimeoutRef20s.current) {
          clearTimeout(showChatWindowTimeoutRef20s.current);
        }
        if (showChatWindowTimeoutRef30s.current) {
          clearTimeout(showChatWindowTimeoutRef30s.current);
        }
      };
    }
  }, [isConnected]);

  // Send user login status to LiveKit room
  // Topic: 'logInStatus'
  useEffect(() => {
    if (isConnected) {
      const userDetails = authKey
        ? { name: fullname, email, phone }
        : { name: null, email: null, phone: null };
      publishDataToRoom(room, userDetails, "logInStatus");
    }
  }, [room, isConnected, authKey, fullname, email, phone]);

  /**
   * Data Received Handler - AI Command Processor
   */
  const handleDataReceived = useCallback((payload: any, participant: any, kind: any, topic: string) => {
    const rawText = payload.toString("utf8");
    const { rawDataFromAI: decodedData } = decodeMessage(rawText);
    setRawDataFromAI(decodedData);
    trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.CONTEXT_RECEIVED, {
      topic,
      rawDataFromAI: decodedData,
      chat_session_id: chatSessionId,
    });
    switch (topic) {
      case "search_params":
        trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.SEARCH_FROM_CHATBOT, {
          chat_session_id: chatSessionId,
          rawDataFromAI: decodedData,
        });
        onSearchFromAI?.(decodedData?.city || "Las Vegas");
        break;
      case "pod_name":
        break;
      case "book_tour_redirection":
        break;
      case "redirection_prop_id":
        break;
      case "terminate_session":
        dispatch(hideChatWithUsModalAction());
        room.disconnect();
        dispatch(clearLivekitTokenAction());
        if (isLiveAgentHandoff) {
          dispatch(setLiveAgentHandoffStatusAction({ isLiveAgentHandoff: false }));
        }
        trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.IDLE_SESSION_TERMINATED, {
          chat_session_id: chatSessionId,
          rawDataFromAI: decodedData,
        });
        break;
      case "live_agent_redirect":
        dispatch(storeLiveAgentHandoffDetailsAction(decodedData));
        dispatch(setLiveAgentHandoffStatusAction({ isLiveAgentHandoff: true }));
        trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.LIVE_AGENT_HANDOFF, {
          chat_session_id: chatSessionId,
          rawDataFromAI: decodedData,
        });
        break;
    }
  }, []);

  /**
   * Transcription Handler - AI Message Stream Processor
   */
  const transcriptionHandler = useCallback(async (reader: TextStreamReader) => {
    trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.MESSAGE_RECEIVED, {
      chat_session_id: chatSessionId,
    });
    let chunkCount = 0;
    let accumulatedChunks = "";

    for await (const chunk of reader) {
      accumulatedChunks += chunk;
      chunkCount++;

      if (chunkCount % 5 === 0) {
        const message = {
          user: CHATBOT_USER_ENUM.AI,
          content: accumulatedChunks,
          timestamp: dateUtils.formatISOToLocal(
            new Date(reader.info.timestamp).toISOString(),
            "MMM d, h:mm a"
          ),
          id: reader.info.id,
          likeStatus: 0,
        };
        dispatch(storeChatMessageAction(message));
        accumulatedChunks = "";
      }
    }

    if (accumulatedChunks.length > 0) {
      const message = {
        user: CHATBOT_USER_ENUM.AI,
        content: accumulatedChunks,
        timestamp: dateUtils.formatISOToLocal(
          new Date(reader.info.timestamp).toISOString(),
          "MMM d, h:mm a"
        ),
        id: reader.info.id,
        likeStatus: 0,
      };
      dispatch(storeChatMessageAction(message));
    }
  }, []);

  /**
   * Attributes change handler
   */
  const attributesChangeHandler = useCallback((changedAttributes: Record<string, string>) => {
    if (["listening", "speaking"].includes(changedAttributes["lk.agent.state"])) {
      if (showChatWindowTimeoutRef10s.current) {
        clearTimeout(showChatWindowTimeoutRef10s.current);
      }
      if (showChatWindowTimeoutRef20s.current) {
        clearTimeout(showChatWindowTimeoutRef20s.current);
      }
      if (showChatWindowTimeoutRef30s.current) {
        clearTimeout(showChatWindowTimeoutRef30s.current);
      }
      if (reconnectionAttempt > 0) {
        dispatch(setReconnectionAttemptAction(0));
      }
      dispatch(showChatBotLoaderAction({ showLoader: false }));
    }
    if (changedAttributes.chat_session_id) {
      dispatch(
        persistChatSessionIdAction({
          chatSessionId: changedAttributes.chat_session_id,
        })
      );
    }
  }, []);

  const participantDisconnectedHandler = (_participant: any) => {
    dispatch(getLivekitTokenAction(true));
  };

  const disconnectedHandler = (reason: any) => {
    trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.DISCONNECTED_FROM_LIVEKIT_ROOM, {
      reason,
      chat_session_id: chatSessionId,
    });
  };

  const reconnectedHandler = () => {
    trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.RECONNECTED_TO_LIVEKIT_ROOM, {
      chat_session_id: chatSessionId,
    });
    dispatch(showChatBotLoaderAction({ showLoader: false }));
  };

  /**
   * LiveKit Room Event Registration Manager
   */
  useEffect(() => {
    if (!room) return;

    const registerHandlers = () => {
      room.unregisterTextStreamHandler("lk.transcription");
      room.registerTextStreamHandler("lk.transcription", transcriptionHandler);
      room.on(RoomEvent.DataReceived, handleDataReceived);
      room.on(RoomEvent.ParticipantAttributesChanged, attributesChangeHandler);
      room.on(RoomEvent.ParticipantDisconnected, participantDisconnectedHandler);
      room.on(RoomEvent.Disconnected, disconnectedHandler);
      room.on(RoomEvent.Reconnected, reconnectedHandler);
    };

    registerHandlers();
    room.on(RoomEvent.Connected, registerHandlers);

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
      room.off(RoomEvent.ParticipantAttributesChanged, attributesChangeHandler);
      room.off(RoomEvent.Connected, registerHandlers);
      room.off(RoomEvent.ParticipantDisconnected, participantDisconnectedHandler);
      room.off(RoomEvent.Disconnected, disconnectedHandler);
      room.off(RoomEvent.Reconnected, reconnectedHandler);
      room.unregisterTextStreamHandler("lk.transcription");
    };
  }, [room]);

  return { rawDataFromAI };
};
