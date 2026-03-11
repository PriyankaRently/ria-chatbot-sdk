import React, { JSX, useState } from "react";
import { useChat, useRoomContext } from "@livekit/react-native";
import { Keyboard, StyleSheet, TextStyle, View, ViewStyle, Platform } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useDispatch, useSelector } from "react-redux";
import {
  getLivekitTokenAction,
  sendMessageToChatwootAction,
  storeChatMessageAction,
} from "../store/actions";
import { CHATBOT_USER_ENUM } from "../constants";
import { TChatMessageType } from "../store/reducer";
import { generateRandomKey } from "../utils/chatbotHelperFunctions";
import { HEAP_RIA_CHATBOT_EVENTS } from "../constants/heapEvents";
import { useRiaChatSDK, useExternalState } from "../context/RiaChatSDKContext";

interface TMessageInputProps {
  onInputFocus: () => void;
  keyboardVisible?: boolean;
  onInputHeightChange: () => void;
}

export const MessageInput = ({
  onInputFocus,
  keyboardVisible,
  onInputHeightChange,
}: TMessageInputProps): JSX.Element => {
  const [textMessage, setTextMessage] = useState("");
  const room = useRoomContext();
  const { send } = useChat();
  const dispatch = useDispatch();
  const [isSending, setIsSending] = useState(false);
  const { isLiveAgentConnected, chatSessionId, connectedToRoom } = useSelector(
    (state: any) => state.riaChatBot
  );
  const { components, theme, scaling, trackEvent, dateUtils } = useRiaChatSDK();
  const { RDBadge, RDPressableOpacity } = components;
  const { colors, spacings } = theme;
  const { vs } = scaling;
  const externalState = useExternalState();
  const isOffline = externalState.isOffline;

  const disableSend =
    isOffline || !textMessage.trim() || (!connectedToRoom && !isLiveAgentConnected);
  const [inputHeight, setInputHeight] = useState(40);

  const sendBackgroundColor = !disableSend
    ? colors.secondary[600]
    : colors.neutral[300];

  const handleHeightChange = (height: number) => {
    if (height !== inputHeight) {
      setInputHeight(height);
      onInputHeightChange?.();
    }
  };

  const handleSendMessage = async () => {
    if (!textMessage.trim()) return;
    Keyboard.dismiss();
    if (isLiveAgentConnected) {
      const message: TChatMessageType = {
        id: generateRandomKey(),
        content: textMessage,
        timestamp: dateUtils.getCurrentDateTime("h:mm a"),
        user: CHATBOT_USER_ENUM.PROSPECT,
      };
      dispatch(storeChatMessageAction(message));
      dispatch(sendMessageToChatwootAction({ messageContent: textMessage }));
      trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.LIVE_AGENT_SEND_MESSAGE_TO_USER, {
        chat_session_id: chatSessionId,
        isLiveAgentConnected: true,
      });
    } else {
      if (textMessage.trim() && !isSending && room) {
        setIsSending(true);
        try {
          await send(textMessage);
          trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.MESSAGE_SENT, {
            chat_session_id: chatSessionId,
            isLiveAgentConnected: false,
          });
        } catch (error: any) {
          trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.MESSAGE_SEND_FAILED, {
            chat_session_id: chatSessionId,
            error: error.message,
          });
          dispatch(getLivekitTokenAction(true));
        } finally {
          setIsSending(false);
        }
      }
    }
    setTextMessage("");
  };

  const styles = StyleSheet.create<{
    sendTextContainer: ViewStyle;
    sendIconContainer: ViewStyle;
    sendIconStyle: ViewStyle;
    textInput: TextStyle;
  }>({
    sendTextContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: colors.neutral[500],
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.7,
      shadowRadius: 15,
      elevation: 10,
      borderColor: colors.neutral[300],
      borderWidth: 1,
      borderRadius: spacings.big,
      paddingHorizontal: vs(10),
      marginTop: spacings.sm,
      backgroundColor: colors.shades[0],
      paddingVertical: Platform.OS === "ios" ? vs(12) : vs(8),
    },
    sendIconStyle: {
      transform: [{ rotate: "90deg" }],
    },
    sendIconContainer: {
      alignSelf: "flex-end",
    },
    textInput: {
      flex: 1,
      fontSize: vs(14),
      marginRight: spacings.md,
      marginLeft: spacings.xx_sm,
      color: colors.neutral[800],
      minHeight: vs(40),
      maxHeight: vs(100),
    },
  });

  return (
    <View
      style={[
        styles.sendTextContainer,
        {
          marginBottom:
            Platform.OS === "android" && keyboardVisible ? -20 : 0,
        },
      ]}
      onLayout={(event) => {
        const { height } = event.nativeEvent.layout;
        handleHeightChange(height);
      }}
    >
      <BottomSheetTextInput
        style={styles.textInput}
        placeholder="Start a search or ask a question..."
        placeholderTextColor={colors.neutral[400]}
        onChangeText={setTextMessage}
        value={textMessage}
        multiline={true}
        onFocus={onInputFocus}
      />
      <RDPressableOpacity
        disabled={disableSend}
        onPress={() => handleSendMessage()}
        style={styles.sendIconContainer}
      >
        <RDBadge
          iconName="PaperAirplaneIcon"
          iconColor={colors.neutral[50]}
          backgroundColor={sendBackgroundColor}
          iconSize={24}
          iconStyle={styles.sendIconStyle}
          borderRadius={12}
          paddingHorizontal={10}
          paddingVertical={10}
        />
      </RDPressableOpacity>
    </View>
  );
};
