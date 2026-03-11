/**
 * Constants used by the RIA Chat SDK.
 * Extracted from the host app's constants for SDK independence.
 */

export const CHATBOT_USER_ENUM = {
  PROSPECT: 0,
  AI: 1,
  LIVE_AGENT: 2,
} as const;

export const TYPING_CONSTANT = 30000;

export const CHATBOT_MODALITY = {
  TEXT: "TEXT",
  AUDIO: "AUDIO",
} as const;

export const VR_PLAN_TYPES = ["vr_plan_1", "vr_plan_2"] as const;

export const INDEFINITE_PRICE: number = 300;

export const COMMUNITY_TAB_MAPPING = ["all", "studio", "1b", "2b", "3b+"];

export const COMMUNITY_TYPE_TO_PROPERTY_TYPE: Record<string, number> = {
  apartments: 1,
  btr: 2,
  all: 0,
};
