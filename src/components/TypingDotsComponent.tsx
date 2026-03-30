import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withDelay,
} from "react-native-reanimated";
import { useRiaChatBotSDK } from "../context/RiaChatBotSDKContext";

interface TypingDotsProps {
  dotColor?: string;
  animationDuration?: number;
  textStyle?: any;
}

export const TypingDots = ({
  dotColor,
  animationDuration = 1500,
  textStyle = {},
}: TypingDotsProps = {}) => {
  const { components, theme } = useRiaChatBotSDK();
  const { RDText } = components;
  const { colors, spacings } = theme;

  const resolvedDotColor = dotColor ?? colors.neutral[600];

  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);

  useEffect(() => {
    scale1.value = withRepeat(
      withTiming(1.6, { duration: animationDuration / 2 }),
      -1,
      true
    );
    scale2.value = withDelay(
      200,
      withRepeat(withTiming(1.6, { duration: animationDuration / 2 }), -1, true)
    );
    scale3.value = withDelay(
      400,
      withRepeat(withTiming(1.6, { duration: animationDuration / 2 }), -1, true)
    );
  }, [animationDuration, scale1, scale2, scale3]);

  const dot1Style = useAnimatedStyle(
    () => ({
      transform: [{ scale: scale1.value }],
      opacity: 0.4 + 0.6 * ((scale1.value - 1) / 0.6),
      backgroundColor: scale1.value > 1.2 ? colors.neutral[300] : resolvedDotColor,
    }),
    [resolvedDotColor]
  );

  const dot2Style = useAnimatedStyle(
    () => ({
      transform: [{ scale: scale2.value }],
      opacity: 0.4 + 0.6 * ((scale2.value - 1) / 0.6),
      backgroundColor: scale2.value > 1.2 ? colors.neutral[300] : resolvedDotColor,
    }),
    [resolvedDotColor]
  );

  const dot3Style = useAnimatedStyle(
    () => ({
      transform: [{ scale: scale3.value }],
      opacity: 0.4 + 0.6 * ((scale3.value - 1) / 0.6),
      backgroundColor: scale3.value > 1.2 ? colors.neutral[300] : resolvedDotColor,
    }),
    [resolvedDotColor]
  );

  const styles = StyleSheet.create<{
    typingIndicator: ViewStyle;
    typingIndicatorAnimated: ViewStyle;
    typingIndicatorDots: ViewStyle;
    dot: ViewStyle;
  }>({
    typingIndicator: {
      paddingBottom: spacings.sm,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "baseline",
      backgroundColor: "transparent",
    },
    typingIndicatorAnimated: {
      display: "flex",
      alignItems: "baseline",
      marginLeft: spacings.x_sm,
      marginRight: spacings.xx_sm,
    },
    typingIndicatorDots: {
      flexDirection: "row",
      alignItems: "baseline",
      gap: spacings.xx_sm,
    },
    dot: {
      width: 2,
      height: 2,
      backgroundColor: colors.neutral[600],
      borderRadius: 9999,
      opacity: 0.4,
    },
  });

  return (
    <View style={styles.typingIndicator}>
      <RDText
        style={[styles.typingIndicatorAnimated, textStyle]}
        variant="Small"
      >
        Typing
      </RDText>
      <View style={styles.typingIndicatorDots}>
        <Animated.View style={[styles.dot, dot1Style]} />
        <Animated.View style={[styles.dot, dot2Style]} />
        <Animated.View style={[styles.dot, dot3Style]} />
      </View>
    </View>
  );
};
