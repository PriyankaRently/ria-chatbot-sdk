import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LiveKitRoom } from "@livekit/react-native";
import { useRiaChatBotSDK, useExternalState } from "../context/RiaChatBotSDKContext";
import { HEAP_RIA_CHATBOT_EVENTS } from "../constants/heapEvents";
import {
  checkPreviousChatSessionAction,
  fetchLivekitTokenAction,
  getLivekitTokenAction,
  setConnectedToRoomAction,
  setReconnectionAttemptAction,
  setReconnectToRoomAction,
  showChatBotLoaderAction,
} from "../store/actions";
import { useReconnectionToChatbot } from "../hooks";

interface LiveKitProviderProps {
  children: React.ReactNode;
}

/**
 * LiveKit Provider Component
 *
 * Provides LiveKit real-time communication infrastructure for the chatbot.
 * Manages connection lifecycle, token generation, and retry logic.
 */
export const LiveKitProvider = ({
  children,
}: LiveKitProviderProps): React.ReactElement => {
  const sdkConfig = useRiaChatBotSDK();
  const { trackEvent, serviceConfig } = sdkConfig;

  const { authKey } = useExternalState();

  const {
    livekitToken: livekitAccessToken,
    getLivekitToken,
    reconnectionAttempt,
    chatMessages,
  } = useSelector((state: any) => state.riaChatBot);

  const dispatch = useDispatch();
  const { connectToRoom, setConnectToRoom } = useReconnectionToChatbot();

  useEffect(() => {
    if (chatMessages.length > 0) return;
    dispatch(checkPreviousChatSessionAction());
  }, [authKey]);

  useEffect(() => {
    if (!getLivekitToken) return;

    setConnectToRoom(false);

    if (reconnectionAttempt === 0) {
      dispatch(fetchLivekitTokenAction({}));
      dispatch(setReconnectionAttemptAction(1));
    }

    const intervalId = setInterval(() => {
      if (livekitAccessToken) {
        trackEvent(HEAP_RIA_CHATBOT_EVENTS.LIVEKIT_TOKEN_GENERATED, {
          reconnectAttempts: reconnectionAttempt,
        });
        dispatch(getLivekitTokenAction(false));
        setConnectToRoom(true);
        clearInterval(intervalId);
      } else if (reconnectionAttempt < 10) {
        dispatch(fetchLivekitTokenAction({}));
        dispatch(setReconnectionAttemptAction(reconnectionAttempt + 1));
      } else if (reconnectionAttempt === 10) {
        dispatch(
          showChatBotLoaderAction({ showLoader: true, showMessage: true })
        );
        trackEvent(
          HEAP_RIA_CHATBOT_EVENTS.EXHAUSTED_10_ATTEMPTS_FOR_TOKEN
        );
        clearInterval(intervalId);
      } else {
        clearInterval(intervalId);
      }
    }, 1500);

    return () => clearInterval(intervalId);
  }, [getLivekitToken, livekitAccessToken, reconnectionAttempt]);

  return (
    <LiveKitRoom
      serverUrl={serviceConfig.liveKitWebSocketUrl}
      token={livekitAccessToken}
      connect={connectToRoom}
      audio={false}
      onConnected={() => {
        trackEvent(HEAP_RIA_CHATBOT_EVENTS.CONNECTED_TO_LIVEKIT_ROOM);
        dispatch(setConnectedToRoomAction(true));
      }}
      onDisconnected={() => {
        dispatch(setConnectedToRoomAction(false));
        dispatch(setReconnectToRoomAction(true));
      }}
    >
      {children}
    </LiveKitRoom>
  );
};
