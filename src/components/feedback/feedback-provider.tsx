"use client";

import { FeedbackPopup } from "./feedback-popup";

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FeedbackPopup />
    </>
  );
}
