import React from "react";
import { ChatWithUsModal } from "./ChatWithUsModal";

/**
 * RiaWidget component serves as the root entry point for chatbot-related features.
 *
 * @remarks
 * This component is designed with future scalability in mind, acting as the foundational wrapper for all chatbot functionalities.
 * It currently renders the ChatWithUsModal component, but is intended to be extended to support additional features.
 */
export const RiaWidget = (): React.ReactElement => {
  return <ChatWithUsModal />;
};
