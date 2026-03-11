import React, { JSX, useState, useEffect } from "react";
import { Image, ImageStyle, StyleSheet, ViewStyle, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { showChatWithUsModalAction } from "../store/actions";
import { HEAP_RIA_CHATBOT_EVENTS } from "../constants/heapEvents";
import { useRiaChatSDK } from "../context/RiaChatSDKContext";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolate,
  Extrapolate,
  Easing,
} from "react-native-reanimated";
import LinearGradient from "react-native-linear-gradient";
import { PopupBubbleText } from "./PopupBubbleText";

interface ChatWidgetIconProps {
  bottom?: number;
  right?: number;
  screenName: string;
  enableShineAnimation?: boolean;
}

export const ChatWidgetIcon = ({
  bottom = 16,
  right = 16,
  screenName,
  enableShineAnimation = true,
}: ChatWidgetIconProps): JSX.Element | null => {
  const dispatch = useDispatch();
  const { components, trackEvent, assets } = useRiaChatSDK();
  const { RDPressableOpacity } = components;

  const showChatWithUsModal = useSelector(
    (state: any) => state.riaChatBot.showChatWithUsModal
  );
  const [showBubble, setShowBubble] = useState(false);
  const shineProgress = useSharedValue(0);

  useEffect(() => {
    if (!enableShineAnimation || showChatWithUsModal) return;

    const startShineAnimation = () => {
      shineProgress.value = withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 0 })
      );
    };

    startShineAnimation();

    const interval = setInterval(() => {
      startShineAnimation();
    }, 3000);

    return () => clearInterval(interval);
  }, [enableShineAnimation, showChatWithUsModal, shineProgress]);

  const onPress = () => {
    trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.CLICK_ON_CHATBOT_ICON, { screenName });
    dispatch(showChatWithUsModalAction({ screenName }));
  };

  const onLongPress = () => {
    setShowBubble(true);
  };

  const onPressOut = () => {
    setShowBubble(false);
  };

  const shineAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      shineProgress.value,
      [0, 0.3, 0.7, 1],
      [0, 1, 1, 0],
      Extrapolate.CLAMP
    );

    const translateX = interpolate(
      shineProgress.value,
      [0, 1],
      [-80, 80],
      Extrapolate.CLAMP
    );

    const translateY = interpolate(
      shineProgress.value,
      [0, 1],
      [-80, 80],
      Extrapolate.CLAMP
    );

    return {
      opacity,
      transform: [{ translateX }, { translateY }] as any,
    };
  });

  if (showChatWithUsModal) {
    return null;
  }

  return (
    <View style={[styles.container, { bottom, right }]}>
      <RDPressableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        onPressOut={onPressOut}
      >
        <View style={styles.iconWrapper}>
          <Image source={assets?.chatWidgetIcon} style={styles.chatIcon} />
          {enableShineAnimation && (
            <Animated.View
              pointerEvents="none"
              style={[styles.shineContainer, shineAnimatedStyle]}
            >
              <LinearGradient
                colors={[
                  "transparent",
                  "transparent",
                  "transparent",
                  "rgba(220, 220, 220, 0.99)",
                  "rgba(255, 255, 255, 1)",
                  "rgba(220, 220, 220, 0.99)",
                  "transparent",
                  "transparent",
                  "transparent",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.shineGradient}
              />
            </Animated.View>
          )}
        </View>
      </RDPressableOpacity>
      {showBubble && (
        <PopupBubbleText text="Chat with us" style={styles.bubblePosition} />
      )}
    </View>
  );
};

const styles = StyleSheet.create<{
  container: ViewStyle;
  bubblePosition: ViewStyle;
  chatIcon: ImageStyle;
  iconWrapper: ViewStyle;
  shineContainer: ViewStyle;
  shineGradient: ViewStyle;
}>({
  container: {
    position: "absolute",
    zIndex: 10,
    alignItems: "flex-end",
    flexDirection: "row",
  },
  iconWrapper: {
    width: 50,
    height: 50,
    overflow: "hidden",
    borderRadius: 25,
    position: "relative",
  },
  chatIcon: {
    height: 50,
    width: 50,
  },
  bubblePosition: {
    position: "absolute",
    right: 60,
    bottom: 0,
  },
  shineContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 50,
    height: 50,
  },
  shineGradient: {
    width: "100%",
    height: "100%",
  },
});
