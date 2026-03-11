import React, { JSX } from "react";
import { View, StyleSheet, TextStyle, ViewStyle } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useRiaChatSDK } from "../context/RiaChatSDKContext";

interface TPopupBubbleTextProps {
  text: string;
  style?: ViewStyle;
}

/**
 * PopupBubbleText component for displaying a pop up bubble with text.
 * Uses a linear gradient background for the bubble border.
 */
export const PopupBubbleText = ({ text, style = {} }: TPopupBubbleTextProps): JSX.Element => {
  const { components, theme, scaling } = useRiaChatSDK();
  const { RDText } = components;
  const { colors, spacings } = theme;
  const { vs } = scaling;

  const styles = StyleSheet.create<{
    container: ViewStyle;
    gradientBorder: ViewStyle;
    textContainer: ViewStyle;
    text: TextStyle;
  }>({
    container: {
      zIndex: 1,
      alignSelf: "flex-start",
    },
    gradientBorder: {
      borderRadius: 80,
      opacity: 1,
      alignSelf: "flex-start",
      overflow: "hidden",
    },
    textContainer: {
      backgroundColor: colors.shades[200],
      paddingHorizontal: spacings.md,
      paddingVertical: spacings.x_sm,
      borderRadius: vs(80),
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      margin: vs(2),
      gap: spacings.x_sm,
    },
    text: {
      color: colors.shades[0],
    },
  });

  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={["#5F9EF8", "#B993F7"]}
        start={{ x: 0.01, y: 0 }}
        end={{ x: 0.99, y: 0 }}
        angle={89.42}
        style={styles.gradientBorder}
      >
        <View style={styles.textContainer}>
          <RDText variant="XSmall" weight="Medium" style={styles.text}>
            {text}
          </RDText>
        </View>
      </LinearGradient>
    </View>
  );
};
