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
 * Get the week-of date for a given day name and game time
 * Returns the date of the current or upcoming occurrence of that day/time
 */
export const getWeekOf = (dayName, gameTime = null) => {
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

  // If it's the same day, check if the game time has passed
  if (daysUntil === 0 && gameTime) {
    const [hours, minutes] = gameTime.split(':').map(Number);
    const gameDateTime = new Date(now);
    gameDateTime.setHours(hours, minutes, 0, 0);

    // If game time + 6 hours has passed (expired), use next week
    const sixHoursAfterGame = new Date(gameDateTime.getTime() + 6 * 60 * 60 * 1000);
    if (now > sixHoursAfterGame) {
      daysUntil = 7;
    }
  } else if (daysUntil < 0) {
    // If target day is in the past this week, move to next week
    daysUntil += 7;
  }

  const weekDate = new Date(now);
  weekDate.setDate(now.getDate() + daysUntil);

  // Use local date parts instead of UTC to avoid timezone issues
  const year = weekDate.getFullYear();
  const month = String(weekDate.getMonth() + 1).padStart(2, '0');
  const day = String(weekDate.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Calculate expiration time for a game confirmation
 * Game expires 6 hours after game start time
 */
export const getExpirationTime = (day, gameTime) => {
  const weekOf = getWeekOf(day, gameTime);

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
 * Format time ago string with relative labels
 * Returns: "confirmed today", "confirmed yesterday", "confirmed this week",
 *          "confirmed last week", "confirmed this month", or fallback to date
 */
export const getTimeAgo = (timestamp) => {
  const now = new Date();
  const then = new Date(timestamp);

  // Reset hours for day comparison
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thenDate = new Date(then.getFullYear(), then.getMonth(), then.getDate());

  const diffMs = nowDate - thenDate;
  const diffDays = Math.floor(diffMs / 86400000);

  // Today
  if (diffDays === 0) {
    return 'confirmed today';
  }

  // Yesterday
  if (diffDays === 1) {
    return 'confirmed yesterday';
  }

  // This week (within last 7 days, but not today/yesterday)
  if (diffDays <= 6) {
    return 'confirmed this week';
  }

  // Last week (7-13 days ago)
  if (diffDays <= 13) {
    return 'confirmed last week';
  }

  // This month (same month and year)
  if (now.getMonth() === then.getMonth() && now.getFullYear() === then.getFullYear()) {
    return 'confirmed this month';
  }

  // Last month (previous month)
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
  if (then.getMonth() === lastMonth.getMonth() && then.getFullYear() === lastMonth.getFullYear()) {
    return 'confirmed last month';
  }

  // Fallback: show date for older confirmations
  const month = String(then.getMonth() + 1).padStart(2, '0');
  const day = String(then.getDate()).padStart(2, '0');
  const year = then.getFullYear();
  return `confirmed ${month}/${day}/${year}`;
};

/**
 * Check if user has already confirmed this game this week
 */
export const hasUserConfirmed = (confirmations, userId) => {
  if (!confirmations || !Array.isArray(confirmations)) return false;
  return confirmations.some(c => c.userId === userId);
};
