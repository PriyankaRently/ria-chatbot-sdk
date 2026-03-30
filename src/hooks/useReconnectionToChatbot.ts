import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getLivekitTokenAction } from "../store/actions";
import { useExternalState } from "../context/RiaChatBotSDKContext";

/**
 * Custom hook to manage reconnection logic to the chatbot.
 * Monitors Redux state for conditions to trigger a reconnection.
 */
export const useReconnectionToChatbot = () => {
  const dispatch = useDispatch();
  const { reconnectToRoom, showChatWithUsModal, isLiveAgentConnected, connectedToRoom } =
    useSelector((state: any) => state.riaChatBot);
  const externalState = useExternalState();
  const isOffline = externalState.isOffline;
  const [connectToRoom, setConnectToRoom] = useState(false);

  /**
   * Reconnection Effect
   *
   * Triggers when the chat window is visible, reconnection is needed,
   * and the user is not connected to a live agent or offline.
   */
  useEffect(() => {
    if (showChatWithUsModal && reconnectToRoom && !isOffline) {
      if (!connectedToRoom && !isLiveAgentConnected) {
        dispatch(getLivekitTokenAction(true));
      }
    }
  }, [showChatWithUsModal, isLiveAgentConnected, isOffline]);

  return { connectToRoom, setConnectToRoom };
};
