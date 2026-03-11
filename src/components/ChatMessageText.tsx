 import React, { JSX } from "react";
import { ImageStyle, StyleSheet, View, ViewStyle, Image } from "react-native";
import { useDispatch } from "react-redux";
import { TChatMessageType } from "../store/reducer";
import { toggleMessageLikeAction, updateMessageLikeAction } from "../store/actions";
import { CHATBOT_USER_ENUM } from "../constants";
import { HEAP_RIA_CHATBOT_EVENTS } from "../constants/heapEvents";
import { useRiaChatSDK } from "../context/RiaChatSDKContext";

 
interface LikeButtonProps {
  onPress: () => void;
  status: number;
  currentStatus: number;
  iconName: string;
  style?: ViewStyle;
}
  
const LikeButton = ({
  onPress,
  status,
  currentStatus,
  iconName,
  style,
}: LikeButtonProps): JSX.Element => {
  const { components, theme, scaling } = useRiaChatSDK();
  const { RDPressableOpacity, RDHeroIcon } = components;
  const { colors, spacings } = theme;
  const { hs } = scaling;

  const isSelected = status === currentStatus;
  const backgroundColor = isSelected ? colors.tertiary[200] : undefined;

  return (
    <RDPressableOpacity
      style={[
        {
          transform: [{ scaleX: -1 }],
          borderRadius: hs(40),
          padding: spacings.x_sm,
        },
        { backgroundColor },
        style,
      ]}
      onPress={onPress}
    >
      <RDHeroIcon
        iconName={iconName}
        size={24}
        fontWeight={"Regular"}
        isSolid={isSelected}
      />
    </RDPressableOpacity>
  );
};

export const LiveAgentMessageText = ({
  message,
}: {
  message: TChatMessageType;
}): JSX.Element => {
  const { components, theme, assets } = useRiaChatSDK();
  const { RDText } = components;
  const TextStyleFromMarkup = components.TextStyleFromMarkup;
  const { colors, spacings } = theme;
  const { timestamp = "", content = "", senderName = "Live Agent" } = message;

  const styles = getStyles(theme, assets);

  return (
    <View style={styles.aiMessageContainer}>
      <View style={styles.headingContainer}>
        <View style={styles.subHeadingContainer}>
          <Image source={assets?.rentlyChatIcon} style={styles.chatWidget} />
          <View>
            <RDText variant="Small" weight="Medium">
              {senderName}
            </RDText>
            <RDText variant="XSmall" color={colors.neutral[600]}>
              {timestamp}
            </RDText>
          </View>
        </View>
      </View>
      <View>
        <TextStyleFromMarkup text={content} variant="Small" />
      </View>
    </View>
  );
};

export const AIChatMessageText = ({
  message,
}: {
  message: TChatMessageType;
}): JSX.Element => {
  const { components, theme, assets, trackEvent } = useRiaChatSDK();
  const { RDText } = components;
  const TextStyleFromMarkup = components.TextStyleFromMarkup;
  const { colors, spacings } = theme;
  const { timestamp = "", content = "", id = "", likeStatus } = message || {};
  const dispatch = useDispatch();

  const styles = getStyles(theme, assets);

  const handleLikePress = (newStatus: number) => {
    const newLikeStatus = likeStatus === newStatus ? 0 : newStatus;
    if (id) {
      dispatch(updateMessageLikeAction({ messageId: id, likeStatus: newLikeStatus }));
      dispatch(toggleMessageLikeAction({ messageId: id, likeStatus: newLikeStatus }));
      trackEvent?.(HEAP_RIA_CHATBOT_EVENTS.MESSAGE_LIKES_AND_DISLIKES, {
        message_id: id,
        like_status: newLikeStatus,
      });
    }
  };

  return (
    <View style={styles.aiMessageContainer}>
      <View style={styles.headingContainer}>
        <View style={styles.subHeadingContainer}>
          <Image source={assets?.chatWidgetIcon} style={styles.chatWidget} />
          <View>
            <RDText variant="Small" weight="Medium">
              RIA
            </RDText>
            <RDText variant="XSmall" color={colors.neutral[600]}>
              {timestamp}
            </RDText>
          </View>
        </View>
        <View style={styles.iconContainer}>
          <LikeButton
            onPress={() => handleLikePress(-1)}
            status={-1}
            currentStatus={likeStatus ?? 0}
            iconName="ThumbDownIcon"
            style={styles.likeButtonGap}
          />
          <LikeButton
            onPress={() => handleLikePress(1)}
            status={1}
            currentStatus={likeStatus ?? 0}
            iconName="ThumbUpIcon"
          />
        </View>
      </View>
      <View>
        <TextStyleFromMarkup text={content} variant="Small" />
      </View>
    </View>
  );
};

export const UserChatMessageText = ({
  message,
}: {
  message: TChatMessageType;
}): JSX.Element => {
  const { components, theme } = useRiaChatSDK();
  const { RDBadge } = components;
  const { colors, spacings } = theme;

  return (
    <View style={{ marginTop: spacings.sm, marginBottom: spacings.big, flexDirection: "row" }}>
      <RDBadge
        text={message.content}
        backgroundColor={colors.shades[0]}
        borderRadius={20}
        textVariant="Small"
        textWeight="Regular"
        paddingVertical={spacings.sm}
        paddingHorizontal={spacings.sm}
        textColor={colors.shades[200]}
      />
    </View>
  );
};

export const ChatMessageText = ({
  message,
}: {
  message: TChatMessageType;
}): JSX.Element => {
  switch (message.user) {
    case CHATBOT_USER_ENUM.AI:
      return <AIChatMessageText message={message} />;
    case CHATBOT_USER_ENUM.PROSPECT:
      return <UserChatMessageText message={message} />;
    case CHATBOT_USER_ENUM.LIVE_AGENT:
      return <LiveAgentMessageText message={message} />;
    default:
      return <UserChatMessageText message={message} />;
  }
};

const getStyles = (theme: any, assets: any) => {
  const { colors, spacings } = theme;
  return StyleSheet.create<{
    headingContainer: ViewStyle;
    subHeadingContainer: ViewStyle;
    iconContainer: ViewStyle;
    aiMessageContainer: ViewStyle;
    chatWidget: ImageStyle;
    likeButtonGap: ViewStyle;
  }>({
    headingContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacings.sm,
      flex: 1,
    },
    subHeadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacings.x_sm,
      flex: 1,
    },
    iconContainer: {
      flexDirection: "row",
      gap: spacings.xx_sm,
    },
    aiMessageContainer: {
      marginTop: spacings.sm,
      marginBottom: spacings.big,
    },
    chatWidget: {
      width: 40,
      height: 40,
    },
    likeButtonGap: {
      marginRight: spacings.sm,
    },
  });
};
