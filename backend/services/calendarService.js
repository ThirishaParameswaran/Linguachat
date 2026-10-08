import { generateICSString } from '../utils/icsGenerator.js';
import { createGoogleCalendarEvent } from '../integrations/googleCalendar.js';
import { translateText } from '../integrations/googleTranslate.js';

export const buildCalendarEvent = async (eventPayload) => {
  const targetLang = eventPayload.targetLanguage || 'en';

  const translatedTitleRes = await translateText(eventPayload.title, targetLang);
  const translatedDescRes = eventPayload.description ? await translateText(eventPayload.description, targetLang) : { translatedText: '' };

  const eventData = {
    eventId: eventPayload.eventId || 'evt_' + Date.now(),
    userId: eventPayload.userId,
    title: eventPayload.title,
    description: eventPayload.description || '',
    translatedTitle: translatedTitleRes.translatedText,
    translatedDescription: translatedDescRes.translatedText,
    targetLanguage: targetLang,
    startTime: eventPayload.startTime,
    endTime: eventPayload.endTime,
    timezone: eventPayload.timezone || 'UTC',
    attendees: eventPayload.attendees || [],
    videoCallLink: eventPayload.videoCallLink || `https://linguachat.ai/call/call_${Date.now()}`,
    status: 'scheduled',
  };

  const gcalRes = await createGoogleCalendarEvent(eventData);
  eventData.googleEventId = gcalRes.googleEventId;

  return eventData;
};

export const getICSFileForEvent = (event) => {
  return generateICSString(event);
};
