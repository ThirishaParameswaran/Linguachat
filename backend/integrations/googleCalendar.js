import logger from '../utils/logger.js';

/**
 * Google Calendar API Adapter
 */
export const createGoogleCalendarEvent = async (eventData) => {
  logger.info(`Creating Google Calendar event: ${eventData.title}`);
  return {
    googleEventId: 'gcal_evt_' + Date.now(),
    htmlLink: 'https://calendar.google.com/calendar/event?eid=mock_event_id',
    status: 'confirmed',
  };
};

export const updateGoogleCalendarEvent = async (googleEventId, eventData) => {
  logger.info(`Updating Google Calendar event: ${googleEventId}`);
  return { success: true };
};

export const deleteGoogleCalendarEvent = async (googleEventId) => {
  logger.info(`Deleting Google Calendar event: ${googleEventId}`);
  return { success: true };
};
