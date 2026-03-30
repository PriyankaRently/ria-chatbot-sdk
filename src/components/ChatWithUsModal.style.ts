import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import { RiaChatBotSDKTheme, RiaChatBotSDKScaling } from "../context/types";

export const createChatWithUsModalStyles = (
  theme: RiaChatBotSDKTheme,
  scaling: RiaChatBotSDKScaling
) => {
  const { colors, spacings } = theme;
  const { hs, vs } = scaling;

  interface TChatWithUsModalStyles {
    modalContainer: ViewStyle;
    backgroundContainer: ViewStyle;
    headingContainer: ViewStyle;
    contentContainer: ViewStyle;
    messageArea: ViewStyle;
    indicatorStyle: ViewStyle;
    footerContainer: ViewStyle;
    footerButtonContainer: ViewStyle;
    sideHeader: ViewStyle;
    scrollViewContent: ViewStyle;
    endChatButton: ViewStyle;
    textInput: TextStyle;
    typingText: TextStyle;
    accuracyText: TextStyle;
  }

  return StyleSheet.create<TChatWithUsModalStyles>({
    modalContainer: {
      flex: 1,
      height: "100%",
    },
    backgroundContainer: {
      backgroundColor: colors["chat-bot"]?.[200] ?? "#F1F8FFE6",
      borderTopLeftRadius: 0,
      borderTopRightRadius: 0,
    },
    headingContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: spacings.x_sm,
    },
    contentContainer: {
      flex: 1,
      padding: spacings.big,
      position: "relative",
    },
    messageArea: {
      flex: 1,
    },
    indicatorStyle: {
      backgroundColor: colors.neutral[400],
      marginTop: spacings.xx_sm,
      width: hs(56),
    },
    footerContainer: {
      alignItems: "center",
      marginTop: spacings.sm,
    },
    footerButtonContainer: {
      backgroundColor: colors.shades?.transparent ?? "transparent",
      paddingHorizontal: spacings.xx_sm,
    },
    sideHeader: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: spacings.sm,
    },
    endChatButton: {
      position: "absolute",
      top: 70,
      right: 60,
      zIndex: 1000,
      borderWidth: 1,
      padding: spacings.xx_sm,
      borderColor: colors.neutral[50],
      borderRadius: vs(14),
      backgroundColor: colors.shades[0],
    },
    scrollViewContent: {
      paddingBottom: spacings.md,
    },
    textInput: {
      flex: 1,
      fontSize: vs(14),
      marginRight: spacings.lg,
      marginLeft: spacings.xx_sm,
      color: colors.neutral[800],
      justifyContent: "center",
      alignItems: "center",
      maxHeight: vs(72),
      minHeight: vs(30),
    },
    typingText: {
      marginTop: spacings.sm,
    },
    accuracyText: {
      marginHorizontal: spacings.x_sm,
      marginTop: spacings.sm,
    },
  });
};
