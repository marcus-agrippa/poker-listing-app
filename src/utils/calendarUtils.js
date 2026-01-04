/**
 * Utility functions for adding events to calendars
 */

/**
 * Get the next occurrence of a specific day of the week
 * @param {string} dayName - Name of the day (e.g., "Monday", "Tuesday")
 * @param {string} timeString - Time in HH:MM format (e.g., "19:00")
 * @returns {Date} - The next occurrence of that day/time
 */
export const getNextOccurrence = (dayName, timeString) => {
  const daysMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const now = new Date();
  const currentDay = now.getDay();
  const targetDay = daysMap[dayName];

  // Calculate days until target day
  let daysUntil = targetDay - currentDay;
  if (daysUntil <= 0) {
    daysUntil += 7; // Next week
  }

  const nextDate = new Date(now);
  nextDate.setDate(now.getDate() + daysUntil);

  // Set the time
  const [hours, minutes] = timeString.split(':').map(Number);
  nextDate.setHours(hours, minutes, 0, 0);

  return nextDate;
};

/**
 * Format date for calendar URLs (YYYYMMDDTHHMMSS)
 */
const formatDateForCalendar = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = '00';

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
};

/**
 * Generate Google Calendar URL
 */
export const getGoogleCalendarUrl = (game) => {
  const startDate = getNextOccurrence(game.day, game.game_time);
  const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // Assume 4 hour duration

  const title = `${game.competition} - ${game.venue}`;
  const details = [
    `Buy-in: ${game.buy_in || 'TBD'}`,
    game.blind_levels ? `Blinds: ${game.blind_levels}` : '',
    game.notes ? `Notes: ${game.notes}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const location = game.venue;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}`,
    details: details,
    location: location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

/**
 * Generate Apple Calendar (.ics) data URL
 */
export const getAppleCalendarUrl = (game) => {
  const startDate = getNextOccurrence(game.day, game.game_time);
  const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // Assume 4 hour duration

  const title = `${game.competition} - ${game.venue}`;
  const description = [
    `Buy-in: ${game.buy_in || 'TBD'}`,
    game.blind_levels ? `Blinds: ${game.blind_levels}` : '',
    game.notes ? `Notes: ${game.notes}` : '',
  ]
    .filter(Boolean)
    .join('\\n');

  const location = game.venue;

  // Create ICS file content
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Poker Games//Calendar//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDateForCalendar(startDate)}`,
    `DTEND:${formatDateForCalendar(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n');

  // Create data URL
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
};
