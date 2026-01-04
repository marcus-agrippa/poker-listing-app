/**
 * Utility functions for game confirmations
 */

/**
 * Generate a unique game ID from game data
 */
export const generateGameId = (game) => {
  return `${game.venue}-${game.competition}-${game.day}-${game.game_time}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-'); // Remove duplicate hyphens
};

/**
 * Get the week-of date for a given day name
 * Returns the date of the most recent occurrence of that day (Monday of this week, etc.)
 */
export const getWeekOf = (dayName) => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

  const daysMap = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const targetDay = daysMap[dayName];

  // Calculate days until target day
  let daysUntil = targetDay - currentDay;

  // If target day is in the future this week, go back to last week's occurrence
  if (daysUntil > 0) {
    daysUntil -= 7;
  }

  const weekDate = new Date(now);
  weekDate.setDate(now.getDate() + daysUntil);
  weekDate.setHours(0, 0, 0, 0);

  return weekDate.toISOString().split('T')[0];
};

/**
 * Calculate expiration time for a game confirmation
 * Game expires 6 hours after game start time
 */
export const getExpirationTime = (day, gameTime) => {
  const now = new Date();
  const weekOf = getWeekOf(day);

  // Parse game time
  const [hours, minutes] = gameTime.split(':').map(Number);

  // Create game date/time
  const gameDateTime = new Date(weekOf);
  gameDateTime.setHours(hours, minutes, 0, 0);

  // Add 6 hours for expiration
  const expirationTime = new Date(gameDateTime.getTime() + 6 * 60 * 60 * 1000);

  return expirationTime.toISOString();
};

/**
 * Check if a confirmation has expired
 */
export const isConfirmationExpired = (expiresAt) => {
  return new Date() > new Date(expiresAt);
};

/**
 * Format time ago string
 */
export const getTimeAgo = (timestamp) => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
};

/**
 * Check if user has already confirmed this game this week
 */
export const hasUserConfirmed = (confirmations, userId) => {
  if (!confirmations || !Array.isArray(confirmations)) return false;
  return confirmations.some(c => c.userId === userId);
};
