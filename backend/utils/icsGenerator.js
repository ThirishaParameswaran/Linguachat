/**
 * ICS Calendar File Generator
 * Generates standard iCalendar format (.ics) strings for calendar events.
 */
export const generateICSString = (event) => {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr || Date.now());
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const start = formatDate(event.startTime);
  const end = formatDate(event.endTime || new Date(Date.now() + 3600000).toISOString());
  const now = formatDate(new Date().toISOString());

  const attendeesICS = (event.attendees || [])
    .map(a => `ATTENDEE;CN=${a.name || a.email};RSVP=TRUE:mailto:${a.email}`)
    .join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//LinguaChat//Multilingual Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${event.eventId || event._id || 'evt_' + Date.now()}@linguachat.ai`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${event.translatedTitle || event.title}`,
    `DESCRIPTION:${(event.translatedDescription || event.description || '').replace(/\n/g, '\\n')}`,
    `URL:${event.videoCallLink || ''}`,
    attendeesICS,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].filter(Boolean).join('\r\n');
};
