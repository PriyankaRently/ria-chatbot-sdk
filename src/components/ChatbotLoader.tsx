import React, { JSX } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  ViewStyle,
  ImageStyle,
  TextStyle,
} from "react-native";
import { useSelector } from "react-redux";
import { useRiaChatSDK } from "../context/RiaChatSDKContext";

interface TChatbotLoaderProps {
  style?: ViewStyle;
}

export const ChatbotLoader = ({ style }: TChatbotLoaderProps): JSX.Element => {
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const { showChatbotLoadingMessage } = useSelector(
    (state: any) => state.riaChatBot
  );
  const { components, theme, assets } = useRiaChatSDK();
  const { RDText } = components;
  const { spacings } = theme;

  React.useEffect(() => {
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    scaleAnimation.start();
    return () => scaleAnimation.stop();
  }, []);

  const styles = StyleSheet.create<{
    container: ViewStyle;
    textContainer: ViewStyle;
    loaderMessage: TextStyle;
    logo: ImageStyle;
  }>({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: spacings.lg,
    },
    textContainer: {
      marginTop: spacings.md,
      marginHorizontal: spacings.lg,
    },
    loaderMessage: {
      textAlign: "center",
    },
    logo: {
      width: 32,
      height: 48,
      resizeMode: "contain",
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.Image
        source={assets?.rentlyIcon}
        style={[styles.logo, { transform: [{ scale: scaleValue }] }]}
      />
      {showChatbotLoadingMessage && (
        <View style={styles.textContainer}>
          <RDText variant="Small" weight="Regular" style={styles.loaderMessage}>
            We're having issues connecting to our servers. Try closing the app and
            starting a new conversation.
          </RDText>
        </View>
      )}
    </View>
  );
};
