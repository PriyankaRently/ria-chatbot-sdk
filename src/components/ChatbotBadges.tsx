import React, { JSX } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { useRiaChatSDK } from "../context/RiaChatSDKContext";

interface TChatbotBadgeProps {
  timeExceeded: boolean;
}

export const LiveAgentHandoffBadge = ({ timeExceeded }: TChatbotBadgeProps): JSX.Element => {
  const { components, theme } = useRiaChatSDK();
  const { RDText, RDHeroIcon } = components;
  const { colors, spacings } = theme;

  const message = timeExceeded
    ? "Due to higher than usual wait times, the next available representative will contact you directly from the following number: 1 (888) 340-6340"
    : "Hang tight! We're connecting you to someone now—this may take up to 5 minutes.";

  const styles = StyleSheet.create<{ badge: ViewStyle; iconStyle: ViewStyle }>({
    badge: {
      backgroundColor: colors["background-overlays"]?.[600] ?? "#00000099",
      borderRadius: spacings.sm,
      padding: spacings.sm,
      marginVertical: spacings.x_sm,
    },
    iconStyle: {
      marginBottom: spacings.xx_sm,
    },
  });

  return (
    <View style={styles.badge}>
      <RDHeroIcon
        iconName={timeExceeded ? "DeviceMobileIcon" : "SwitchHorizontalIcon"}
        size={24}
        style={styles.iconStyle}
      />
      <RDText>{message}</RDText>
    </View>
  );
};

export const NoNetworkBadge = (): JSX.Element => {
  const { components, theme } = useRiaChatSDK();
  const { RDText, RDHeroIcon } = components;
  const { colors, spacings } = theme;

  const styles = StyleSheet.create<{ badge: ViewStyle; iconStyle: ViewStyle }>({
    badge: {
      backgroundColor: colors["background-overlays"]?.[600] ?? "#00000099",
      borderRadius: spacings.sm,
      padding: spacings.sm,
      marginVertical: spacings.x_sm,
    },
    iconStyle: {
      marginBottom: spacings.xx_sm,
    },
  });

  return (
    <View style={styles.badge}>
      <RDHeroIcon iconName="StatusOfflineIcon" size={24} style={styles.iconStyle} />
      <RDText>No network connection available.</RDText>
    </View>
  );
};
