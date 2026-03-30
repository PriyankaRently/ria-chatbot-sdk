import React, { JSX } from "react";
import { TextStyle, ViewStyle, Linking, View, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { useRiaChatBotSDK } from "../context/RiaChatBotSDKContext";

interface AiDisclaimerProps {
  showDisclaimer?: boolean;
}

export const AiDisclaimer = ({ showDisclaimer }: AiDisclaimerProps): JSX.Element | null => {
  const { components, theme } = useRiaChatBotSDK();
  const { RDText } = components;
  const { colors, spacings } = theme;
  const { previousChatSession, chatMessages } = useSelector(
    (state: any) => state.riaChatBot
  );

  if (previousChatSession?.id || !showDisclaimer || chatMessages.length > 2) {
    return null;
  }

  const styles = StyleSheet.create<{ container: ViewStyle; disclaimerText: TextStyle; linkText: TextStyle }>({
    container: {
      marginHorizontal: spacings.x_sm,
      marginTop: spacings.sm,
    },
    disclaimerText: {
      color: colors.neutral[500],
    },
    linkText: {
      color: colors.tertiary[600],
    },
  });

  return (
    <View style={styles.container}>
      <RDText variant="XSmall" weight="Regular" style={styles.disclaimerText}>
        When using RIA, you are agreeing to Rently's{" "}
        <RDText
          variant="XSmall"
          weight="Regular"
          style={styles.linkText}
          onPress={() => Linking.openURL("https://use.rently.com/terms-of-use")}
        >
          Terms of Use
        </RDText>
        {" "}and{" "}
        <RDText
          variant="XSmall"
          weight="Regular"
          style={styles.linkText}
          onPress={() => Linking.openURL("https://use.rently.com/privacy-policy")}
        >
          Privacy Policy
        </RDText>
        . All conversations are recorded, shared, reviewed, and retained to improve Rently's
        AI performance.
      </RDText>
    </View>
  );
};
