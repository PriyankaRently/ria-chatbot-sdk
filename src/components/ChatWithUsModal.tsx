import React, { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getLivekitTokenAction,
  hideChatWithUsModalAction,
  persistChatSessionIdAction,
  persistPreviousChatHistoryAction,
  setLiveAgentToAIHandoffAction,
  setLiveAgentHandoffStatusAction,
  showChatBotLoaderAction,
  storeChatMessageAction,
  setIsLiveAgentConnectedAction,
  sendMessageToChatwootAction,
} from "../store/actions";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Keyboard, Platform, Pressable, View } from "react-native";
import { useRoomContext } from "@livekit/react-native";
import { ConnectionState } from "livekit-client";
import { createChatWithUsModalStyles } from "./ChatWithUsModal.style";
import { useLiveKitRoom } from "../hooks/useLiveKitRoom";
import { useChatMessages } from "../hooks/useChatMessages";
import { useChatbotContext } from "../hooks/useChatbotContext";
import { ChatMessageText } from "./ChatMessageText";
import { ChatbotLoader } from "./ChatbotLoader";
import { LiveAgentHandoffBadge, NoNetworkBadge } from "./ChatbotBadges";
import { useLiveAgent } from "../hooks/useLiveAgent";
import { AiDisclaimer } from "./AiDisclaimer";
import { HEAP_RIA_CHATBOT_EVENTS } from "../constants/heapEvents";
import { CHATBOT_USER_ENUM } from "../constants";
import { useRiaChatSDK, useExternalState } from "../context/RiaChatSDKContext";
import { ScrollView } from "react-native-gesture-handler";
import { BlurView } from "@react-native-community/blur";
import { MessageInput } from "./MessageInput";
import { TypingDots } from "./TypingDotsComponent";

/**
 * ChatWithUsModal renders a chat modal for users to interact with RIA chatbot or a live agent.
 */
export const ChatWithUsModal = (): JSX.Element => {
  const dispatch = useDispatch();
  const { components, theme, scaling, trackEvent } = useRiaChatSDK();
  const { RDText, RDButton, RDButtonContainer, RDHeroIcon, RDPressableOpacity, RDBadge } =
    components;
  const { colors, spacings } = theme;
  const { hs, vs } = scaling;
  const ChatWithUsModalStyles = createChatWithUsModalStyles(theme, scaling);
  const externalState = useExternalState();
  const isOffline = externalState.isOffline;
  const prospectId = externalState.prospectId;

  const {
    showChatWithUsModal,
    screenName,
    chatMessages,
    isLiveAgentHandoff,
    isLiveAgentConnected,
    previousChatSession,
    previousChatHistory,
    livekitToken,
    liveAgentToAIHandoff,
    chatbotLoading,
    connectedToRoom,
  } = useSelector((state: any) => state.riaChatBot);

  const snapPoints = ["100%"];

  const [showTextInput, setShowTextInput] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [showEndDropdown, setShowEndDropdown] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const scrollDownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevMessagesLengthRef = useRef(0);
  const prevLastMessage = useRef<string | undefined>(undefined);

  const room = useRoomContext();
  const isConnected = room?.state === ConnectionState.Connected;

  const { rawDataFromAI } = useLiveKitRoom();
  useChatbotContext({ rawDataFromAI, screenName });
  const { isTyping } = useChatMessages();
  const { chatwootWebSocket, liveagentTimeExceeded } = useLiveAgent();

  useEffect(() => {
    if (connectedToRoom && isOffline) {
      room?.disconnect();
    }
  }, [connectedToRoom, isOffline]);

  useEffect(() => {
    const showSub =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillShow", () => setKeyboardVisible(true))
        : Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));

    const hideSub =
      Platform.OS === "ios"
        ? Keyboard.addListener("keyboardWillHide", () => setKeyboardVisible(false))
        : Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
      clearScrollDownTimeout();
    };
  }, []);

  useEffect(() => {
    if (!isConnected && !isLiveAgentConnected && !isOffline && previousChatHistory.length === 0) {
      dispatch(showChatBotLoaderAction({ showLoader: true }));
      if (liveAgentToAIHandoff) {
        dispatch(showChatBotLoaderAction({ showLoader: false }));
      }
    }
  }, [isConnected, liveAgentToAIHandoff, isOffline]);

  useEffect(() => {
    if (showChatWithUsModal) {
      trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.CHAT_WITH_US_MODAL_OPENED, {
        screenName,
        prospectId,
      });
      bottomSheetModalRef.current?.present();
      const hasNoPreviousChatHistory = !previousChatSession?.id;
      if (!livekitToken && hasNoPreviousChatHistory) {
        setShowTextInput(true);
        dispatch(getLivekitTokenAction(true));
      }
      if (previousChatHistory.length > 0) {
        dispatch(showChatBotLoaderAction({ showLoader: false }));
      }
      if (previousChatHistory && previousChatHistory.length === 0) {
        setShowTextInput(true);
      }
    } else {
      onCloseModal();
    }
  }, [showChatWithUsModal]);

  const onCloseModal = () => {
    if (keyboardVisible) {
      Keyboard.dismiss();
    }
    trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.CHAT_WITH_US_MODAL_CLOSED, { screenName });
    bottomSheetModalRef.current?.dismiss();
    dispatch(hideChatWithUsModalAction());
  };

  const onPressNotContinueChat = useCallback(() => {
    setShowTextInput(true);
    dispatch(showChatBotLoaderAction({ showLoader: true }));
    dispatch(persistPreviousChatHistoryAction([]));
    dispatch(persistChatSessionIdAction({ chatSessionId: null }));
    dispatch(storeChatMessageAction([]));
    dispatch(getLivekitTokenAction(true));
  }, []);

  const onPressYesContinueChat = useCallback(() => {
    setShowTextInput(true);
    dispatch(persistPreviousChatHistoryAction([]));
    dispatch(showChatBotLoaderAction({ showLoader: true }));
    dispatch(getLivekitTokenAction(true));
  }, []);

  const onEndChat = useCallback(() => {
    if (isLiveAgentHandoff) {
      dispatch(
        sendMessageToChatwootAction({
          messageContent:
            "This is a system generated message,\n The user has ended the conversation.",
          systemGenerated: true,
        })
      );
      chatwootWebSocket?.close();
      dispatch(setLiveAgentHandoffStatusAction({ isLiveAgentHandoff: false }));
      dispatch(setIsLiveAgentConnectedAction(false));
      dispatch(setLiveAgentToAIHandoffAction(true));
      trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.LIVE_AGENT_HANDOFF_CLOSED_BY_USER);
    }
  }, [isLiveAgentHandoff]);

  useEffect(() => {
    const backAction = () => {
      if (bottomSheetModalRef.current) {
        dispatch(hideChatWithUsModalAction());
        return true;
      }
      return false;
    };

    if (showChatWithUsModal) {
      const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
      return () => backHandler.remove();
    }
  }, [showChatWithUsModal]);

  const clearScrollDownTimeout = () => {
    if (scrollDownTimeoutRef.current) {
      clearTimeout(scrollDownTimeoutRef.current);
      scrollDownTimeoutRef.current = null;
    }
  };

  const onInputHeightChange = () => {
    handleScrollDown();
  };

  const handleScrollDown = () => {
    clearScrollDownTimeout();
    scrollDownTimeoutRef.current = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 150);
  };

  useEffect(() => {
    if (chatMessages.length === 0) return;

    const lastMessage = chatMessages[chatMessages.length - 1];
    const prevLength = prevMessagesLengthRef.current;
    const prevContent = prevLastMessage.current;

    const isNewMessage = prevLength !== chatMessages.length;
    const isContentChanged = prevContent !== lastMessage.content;

    if (isNewMessage || isContentChanged) {
      if (lastMessage.user === CHATBOT_USER_ENUM.AI) {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      } else {
        handleScrollDown();
      }
      prevMessagesLengthRef.current = chatMessages.length;
      prevLastMessage.current = lastMessage.content;
    }
  }, [chatMessages]);

  const handleInputFocus = () => {
    setShowDisclaimer(false);
    handleScrollDown();
  };

  return (
    <BottomSheetModalProvider>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        onDismiss={() => {
          if (showChatWithUsModal) {
            dispatch(hideChatWithUsModalAction());
          }
        }}
        enableOverDrag={false}
        enablePanDownToClose={true}
        handleIndicatorStyle={[
          ChatWithUsModalStyles.indicatorStyle,
          Platform.OS === "ios" ? { marginTop: spacings.xx_big ?? 32 } : null,
        ]}
        backgroundComponent={({ style }) =>
          Platform.OS === "ios" ? (
            <BlurView
              style={[
                style,
                {
                  flex: 1,
                  backgroundColor: colors["chat-bot"]?.[100] ?? "#F1F8FFB3",
                },
              ]}
              blurType="light"
              blurAmount={10}
            />
          ) : (
            <View style={[style, ChatWithUsModalStyles.backgroundContainer]} />
          )
        }
      >
        <BottomSheetView style={ChatWithUsModalStyles.modalContainer}>
          {chatbotLoading ? (
            <ChatbotLoader />
          ) : (
            <Pressable
              style={ChatWithUsModalStyles.contentContainer}
              onPress={() => {
                if (showEndDropdown) setShowEndDropdown(false);
              }}
            >
              <View style={ChatWithUsModalStyles.headingContainer}>
                <View>
                  <RDText variant="H5" weight="SemiBold">
                    Chat with us
                  </RDText>
                  {isLiveAgentConnected && (
                    <RDText variant="XSmall" weight="Medium">
                      🟢 Connected to live agent
                    </RDText>
                  )}
                </View>
                <View style={ChatWithUsModalStyles.sideHeader}>
                  {isLiveAgentHandoff && (
                    <RDPressableOpacity
                      onPress={() => setShowEndDropdown(!showEndDropdown)}
                    >
                      <RDBadge
                        text="End"
                        backgroundColor={colors["background-overlays"]?.[601] ?? "#00000099"}
                        borderColor={colors.neutral[300]}
                        textColor={colors.shades[200]}
                        paddingHorizontal={spacings.md}
                        paddingVertical={hs(6)}
                        borderWidth={1}
                        borderRadius={vs(12)}
                        textVariant="Small"
                        textWeight="Medium"
                      />
                    </RDPressableOpacity>
                  )}
                  <RDPressableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      bottomSheetModalRef.current?.dismiss();
                      dispatch(hideChatWithUsModalAction());
                    }}
                  >
                    <RDHeroIcon iconName="MinusIcon" color={colors.neutral[700]} size={24} />
                  </RDPressableOpacity>
                </View>
              </View>
              <RDPressableOpacity
                style={[
                  ChatWithUsModalStyles.endChatButton,
                  {
                    display:
                      showEndDropdown && isLiveAgentHandoff ? "flex" : "none",
                  },
                ]}
                onPress={() => {
                  setShowEndDropdown(false);
                  onEndChat();
                }}
              >
                <RDBadge
                  text="Leave conversation"
                  backgroundColor={colors.neutral[100]}
                  textColor={colors.shades[200]}
                  paddingHorizontal={spacings.sm}
                  paddingVertical={spacings.x_sm}
                  borderRadius={vs(8)}
                  textVariant="Small"
                  textWeight="Medium"
                />
              </RDPressableOpacity>
              <View style={ChatWithUsModalStyles.messageArea}>
                <ScrollView
                  ref={scrollViewRef}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={
                    keyboardVisible ? ChatWithUsModalStyles.scrollViewContent : {}
                  }
                  onContentSizeChange={() => {
                    handleScrollDown();
                  }}
                  simultaneousHandlers={[]}
                >
                  {chatMessages.map((item: any, index: number) => (
                    <ChatMessageText key={index} message={item} />
                  ))}
                  {isTyping && <TypingDots />}
                </ScrollView>
              </View>
              {isLiveAgentHandoff && !isLiveAgentConnected && (
                <LiveAgentHandoffBadge timeExceeded={liveagentTimeExceeded} />
              )}
              {isOffline && <NoNetworkBadge />}
              <AiDisclaimer showDisclaimer={showDisclaimer} />
              {showTextInput ? (
                <MessageInput
                  onInputFocus={handleInputFocus}
                  keyboardVisible={keyboardVisible}
                  onInputHeightChange={onInputHeightChange}
                />
              ) : (
                <View style={ChatWithUsModalStyles.footerContainer}>
                  <RDText weight="Medium">Show previous conversation?</RDText>
                  <RDButtonContainer
                    horizontal
                    containerStyle={ChatWithUsModalStyles.footerButtonContainer}
                  >
                    <RDButton
                      text="No"
                      variant="Secondary"
                      isDisabled={isOffline}
                      half
                      onPress={() => onPressNotContinueChat()}
                    />
                    <RDButton
                      text="Yes"
                      variant="Primary"
                      isDisabled={isOffline}
                      half
                      onPress={() => onPressYesContinueChat()}
                    />
                  </RDButtonContainer>
                </View>
              )}
              {showTextInput && !keyboardVisible && (
                <RDText
                  style={ChatWithUsModalStyles.accuracyText}
                  variant="XSmall"
                  weight="Regular"
                >
                  RIA Beta • AI-generated content may not always be accurate, be sure to
                  verify any information.
                </RDText>
              )}
            </Pressable>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    </BottomSheetModalProvider>
  );
};
