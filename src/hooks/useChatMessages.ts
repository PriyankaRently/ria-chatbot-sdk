import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { storeChatMessageAction } from "../store/actions";
import { CHATBOT_USER_ENUM, TYPING_CONSTANT } from "../constants";
import { useChat, useRoomContext } from "@livekit/react-native";
import { ConnectionState } from "livekit-client";
import { TChatMessageType } from "../store/reducer";
import { useRiaChatBotSDK } from "../context/RiaChatBotSDKContext";

/**
 * Custom hook to manage chat messages and typing state for the chatbot.
 * Handles storing new messages, formatting previous chat history, and managing typing indicators.
 * Returns the current typing state.
 */
export const useChatMessages = () => {
  const dispatch = useDispatch();
  const { chatMessages: userChatMessages } = useChat();
  const room = useRoomContext();
  const isConnected = room?.state === ConnectionState.Connected;
  const { previousChatHistory, chatMessages } = useSelector(
    (state: any) => state.riaChatBot
  );
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { dateUtils } = useRiaChatBotSDK();

  // Storing message sent by local user to redux
  useEffect(() => {
    if (userChatMessages.length > 0) {
      const latestChatMessage = userChatMessages[userChatMessages.length - 1];
      if (!chatMessages.some((msg: TChatMessageType) => msg.id === latestChatMessage.id)) {
        const newMessage: TChatMessageType = {
          id: latestChatMessage.id,
          user: CHATBOT_USER_ENUM.PROSPECT,
          content: latestChatMessage.message,
          timestamp: dateUtils.formatISOToLocal(
            new Date(latestChatMessage.timestamp).toISOString(),
            "h:mm a"
          ),
          likeStatus: 0,
        };
        dispatch(storeChatMessageAction(newMessage));
      }
    }
  }, [userChatMessages, chatMessages]);

  // Format and store previous chat history to redux
  useEffect(() => {
    if (previousChatHistory && previousChatHistory.length > 0) {
      const formattedMessages: TChatMessageType[] = previousChatHistory.map((item: any) => ({
        user: item.role,
        content: item.content,
        id: item.id,
        timestamp: dateUtils.formatISOToLocal(item.created_at, "LLL dd, h:mm a"),
        likeStatus: item.helpful,
        senderName: item.agent_name || "Live Agent",
      }));
      dispatch(storeChatMessageAction(formattedMessages));
    }
  }, [previousChatHistory]);

  // Determine if typing based on chatMessages
  useEffect(() => {
    if (chatMessages.length === 0) {
      return;
    }
    const lastMessage = chatMessages[chatMessages.length - 1];
    setIsTyping(
      lastMessage.user === CHATBOT_USER_ENUM.PROSPECT && previousChatHistory.length === 0
    );
  }, [chatMessages, isConnected]);

  // Timeout for typing indicator
  useEffect(() => {
    if (isTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, TYPING_CONSTANT); // 30 seconds
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [isTyping]);

  return { isTyping };
};
