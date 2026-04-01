import Notification from "../models/Notification.js";

const TYPE_MAP = {
  EVENT_JOIN_APPROVED: "JOIN_APPROVED",
  NEW_EVENT_MATCH: "NEW_MATCH",
  HOURS_APPROVED: "CERTIFICATE_READY",
};

export const sendNotification = async (userId, type, message, meta = {}) => {
  if (!userId) return null;
  const normalizedType = TYPE_MAP[type] || type;
  return Notification.create({
    user: userId,
    type: normalizedType,
    message,
    meta,
  });
};
