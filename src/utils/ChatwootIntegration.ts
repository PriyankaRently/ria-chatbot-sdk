import { CHATBOT_USER_ENUM } from "../constants";
import { HEAP_RIA_CHATBOT_EVENTS } from "../constants/heapEvents";
import { getSDKConfig } from "../store/sdkConfig";
import type { TChatMessageType } from "../store/reducer";

export interface ChatwootMessage {
  id: number;
  content: string;
  message_type: "incoming" | "outgoing";
  created_at: string;
  conversation_id: number;
  sender?: {
    name: string;
    email?: string;
  };
}

export interface ChatwootWebSocketMessage {
  event: string;
  data: {
    id: number;
    content: string;
    message_type: number;
    created_at: string;
    conversation_id: number;
    status?: string;
    sender?: {
      name: string;
      email?: string;
    };
  };
}

/**
 * Establishes a WebSocket connection to Chatwoot for live agent handoff.
 */
export const connectToChatwoot = (
  pubsubToken: string,
  onMessage: (message: TChatMessageType) => void,
  onConversationResolved: () => void
): WebSocket => {
  const config = getSDKConfig();
  const { serviceConfig, logger, trackEvent, dateUtils } = config;

  let ws = new WebSocket(serviceConfig.chatWootWSUrl, null, {
    headers: {
      "User-Agent": "renter-app",
    },
  } as any);

  ws.onopen = () => {
    const subscribeMsg = {
      command: "subscribe",
      identifier: JSON.stringify({
        channel: "RoomChannel",
        account_id: serviceConfig.chatwootAccountId,
        pubsub_token: pubsubToken,
      }),
    };
    ws.send(JSON.stringify(subscribeMsg));
  };

  ws.onmessage = async (event: any) => {
    const data = JSON.parse(event.data);
    if (data.type === "ping") return;

    if (data.type === "welcome") {
      trackEvent(HEAP_RIA_CHATBOT_EVENTS.CHATWOOT_STATUS, {
        status: "Welcome message received",
        pubsub_token: pubsubToken,
      });
      return;
    }

    if (data.type === "confirm_subscription") {
      trackEvent(HEAP_RIA_CHATBOT_EVENTS.CHATWOOT_STATUS, {
        status: "Subscription confirmed",
        pubsub_token: pubsubToken,
      });
      return;
    }

    if (data.message) {
      const messagePayload = data.message as ChatwootWebSocketMessage;

      if (messagePayload.event === "conversation.status_changed") {
        if (
          messagePayload.data.status === "resolved" &&
          onConversationResolved
        ) {
          onConversationResolved();
          return;
        }
      }

      if (messagePayload.event === "message.created") {
        try {
          if (messagePayload.data.message_type === 1) {
            const chatMessage: TChatMessageType = {
              user: CHATBOT_USER_ENUM.LIVE_AGENT,
              id: messagePayload.data.id.toString(),
              content: messagePayload.data.content?.replace(/\n+$/, ""),
              timestamp: dateUtils.formatISOToLocal(
                new Date(messagePayload.data.created_at).toISOString(),
                "MMM d, h:mm a"
              ),
              senderName: messagePayload.data.sender.name,
            };
            onMessage(chatMessage);
          }
        } catch (error) {
          logger.error("[Chatwoot WS] Error calling onMessage:", error);
        }
      }
    }
  };

  ws.onerror = (error: any) => {
    trackEvent(HEAP_RIA_CHATBOT_EVENTS.CHATWOOT_WEBSOCKET_ERROR, {
      error: error,
      pubsub_token: pubsubToken,
    });
  };

  ws.onclose = (event: any) => {
    trackEvent(HEAP_RIA_CHATBOT_EVENTS.LIVE_AGENT_HANDOFF_DISCONNECTED, {
      code: event.code,
      reason: event.reason,
    });

    const closeCodeDetails: Record<number, string> = {
      1000: "[Chatwoot WS] Normal closure",
      1001: "[Chatwoot WS] Going away",
      1002: "[Chatwoot WS] Protocol error",
      1003: "[Chatwoot WS] Unsupported data",
      1006: "[Chatwoot WS] Abnormal closure (network issue)",
      1011: "[Chatwoot WS] Server error",
    };
    trackEvent(HEAP_RIA_CHATBOT_EVENTS.CHATWOOT_WEBSOCKET_CLOSED, {
      code: event.code,
      closeType: closeCodeDetails[event.code],
      reason: event.reason,
    });
    if (event.code !== 1000) {
      ws = connectToChatwoot(pubsubToken, onMessage, onConversationResolved);
    }
  };

  return ws;
};
