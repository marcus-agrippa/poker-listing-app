// Achievement definitions and logic
export const ACHIEVEMENTS = {
  // Game Count Milestones
  FIRST_GAME: {
    id: 'first_game',
    name: 'First Steps',
    description: 'Log your first poker session',
    emoji: '🎲',
    category: 'games',
    requirement: 1,
    rarity: 'common'
  },
  TEN_GAMES: {
    id: 'ten_games',
    name: 'Getting Started',
    description: 'Complete 10 poker sessions',
    emoji: '🎯',
    category: 'games',
    requirement: 10,
    rarity: 'common'
  },
  TWENTY_FIVE_GAMES: {
    id: 'twenty_five_games',
    name: 'Regular Player',
    description: 'Play 25 poker sessions',
    emoji: '🎪',
    category: 'games',
    requirement: 25,
    rarity: 'common'
  },
  FIFTY_GAMES: {
    id: 'fifty_games',
    name: 'Quarter Century',
    description: 'Complete 50 poker sessions',
    emoji: '⭐',
    category: 'games',
    requirement: 50,
    rarity: 'uncommon'
  },
  HUNDRED_GAMES: {
    id: 'hundred_games',
    name: 'Half Century',
    description: 'Play 100 poker sessions',
    emoji: '🌟',
    category: 'games',
    requirement: 100,
    rarity: 'uncommon'
  },
  TWO_FIFTY_GAMES: {
    id: 'two_fifty_games',
    name: 'Centurion',
    description: 'Play 250 poker sessions',
    emoji: '💯',
    category: 'games',
    requirement: 250,
    rarity: 'rare'
  },
  FIVE_HUNDRED_GAMES: {
    id: 'five_hundred_games',
    name: 'Grinder',
    description: 'Complete 500 poker sessions',
    emoji: '🔥',
    category: 'games',
    requirement: 500,
    rarity: 'epic'
  },
  THOUSAND_GAMES: {
    id: 'thousand_games',
    name: 'Poker Legend',
    description: 'Play 1000 poker sessions',
    emoji: '👑',
    category: 'games',
    requirement: 1000,
    rarity: 'legendary'
  },

  // Win Rate Achievements
  FIRST_WIN: {
    id: 'first_win',
    name: 'First Victory',
    description: 'Win your first poker session',
    emoji: '🎉',
    category: 'wins',
    requirement: 1,
    rarity: 'common'
  },
  TEN_WINS: {
    id: 'ten_wins',
    name: 'Winner',
    description: 'Win 10 poker sessions',
    emoji: '🏆',
    category: 'wins',
    requirement: 10,
    rarity: 'common'
  },
  TWENTY_FIVE_WINS: {
    id: 'twenty_five_wins',
    name: 'Consistent Winner',
    description: 'Win 25 poker sessions',
    emoji: '🥇',
    category: 'wins',
    requirement: 25,
    rarity: 'uncommon'
  },
  FIFTY_PERCENT_WIN_RATE: {
    id: 'fifty_percent_win_rate',
    name: 'Profitable Player',
    description: 'Maintain 50%+ win rate over 25+ games',
    emoji: '📈',
    category: 'winrate',
    requirement: 50,
    rarity: 'uncommon'
  },
  SIXTY_PERCENT_WIN_RATE: {
    id: 'sixty_percent_win_rate',
    name: 'Shark',
    description: 'Maintain 60%+ win rate over 50+ games',
    emoji: '🦈',
    category: 'winrate',
    requirement: 60,
    rarity: 'rare'
  },
  SEVENTY_PERCENT_WIN_RATE: {
    id: 'seventy_percent_win_rate',
    name: 'Crusher',
    description: 'Maintain 70%+ win rate over 100+ games',
    emoji: '🔥',
    category: 'winrate',
    requirement: 70,
    rarity: 'epic'
  },

  // Profit Achievements
  FIRST_PROFIT: {
    id: 'first_profit',
    name: 'In the Black',
    description: 'Reach positive total profit',
    emoji: '💚',
    category: 'profit',
    requirement: 0.01,
    rarity: 'common'
  },
  FIVE_HUNDRED_PROFIT: {
    id: 'five_hundred_profit',
    name: 'First Five Hundred',
    description: 'Earn $500+ total profit',
    emoji: '💵',
    category: 'profit',
    requirement: 500,
    rarity: 'uncommon'
  },
  THOUSAND_PROFIT: {
    id: 'thousand_profit',
    name: 'Big Earner',
    description: 'Earn $1,000+ total profit',
    emoji: '💰',
    category: 'profit',
    requirement: 1000,
    rarity: 'rare'
  },
  FIVE_THOUSAND_PROFIT: {
    id: 'five_thousand_profit',
    name: 'Four Figures',
    description: 'Earn $5,000+ total profit',
    emoji: '💎',
    category: 'profit',
    requirement: 5000,
    rarity: 'epic'
  },
  TEN_THOUSAND_PROFIT: {
    id: 'ten_thousand_profit',
    name: 'High Roller',
    description: 'Earn $10,000+ total profit',
    emoji: '🏆',
    category: 'profit',
    requirement: 10000,
    rarity: 'legendary'
  },

  // Single Session Achievements
  BIG_WIN_TWO_FIFTY: {
    id: 'big_win_two_fifty',
    name: 'Big Session',
    description: 'Win $250+ in a single session',
    emoji: '🎆',
    category: 'session',
    requirement: 250,
    rarity: 'uncommon'
  },
  BIG_WIN_FIVE_HUNDRED: {
    id: 'big_win_five_hundred',
    name: 'Huge Session',
    description: 'Win $500+ in a single session',
    emoji: '🎊',
    category: 'session',
    requirement: 500,
    rarity: 'rare'
  },
  BIG_WIN_THOUSAND: {
    id: 'big_win_thousand',
    name: 'Monster Session',
    description: 'Win $1,000+ in a single session',
    emoji: '🚀',
    category: 'session',
    requirement: 1000,
    rarity: 'epic'
  },
  BIG_WIN_TWO_THOUSAND: {
    id: 'big_win_two_thousand',
    name: 'Legendary Session',
    description: 'Win $2,000+ in a single session',
    emoji: '⭐',
    category: 'session',
    requirement: 2000,
    rarity: 'legendary'
  },

  // Tournament Achievements
  FIRST_PLACE: {
    id: 'first_place',
    name: 'Champion',
    description: 'Finish 1st place in a tournament',
    emoji: '🥇',
    category: 'tournament',
    requirement: 1,
    rarity: 'uncommon'
  },
  FIVE_FIRST_PLACES: {
    id: 'five_first_places',
    name: 'Serial Winner',
    description: 'Win 5 tournaments',
    emoji: '👑',
    category: 'tournament',
    requirement: 5,
    rarity: 'rare'
  },
  FINAL_TABLE: {
    id: 'final_table',
    name: 'Final Table',
    description: 'Finish in top 3 positions',
    emoji: '🏅',
    category: 'tournament',
    requirement: 3,
    rarity: 'uncommon'
  },

  // Streak Achievements
  WIN_STREAK_THREE: {
    id: 'win_streak_three',
    name: 'Hot Streak',
    description: 'Win 3 sessions in a row',
    emoji: '🔥',
    category: 'streak',
    requirement: 3,
    rarity: 'uncommon'
  },
  WIN_STREAK_FIVE: {
    id: 'win_streak_five',
    name: 'On Fire',
    description: 'Win 5 sessions in a row',
    emoji: '🌶️',
    category: 'streak',
    requirement: 5,
    rarity: 'rare'
  },
  WIN_STREAK_TEN: {
    id: 'win_streak_ten',
    name: 'Unstoppable',
    description: 'Win 10 sessions in a row',
    emoji: '⚡',
    category: 'streak',
    requirement: 10,
    rarity: 'legendary'
  },

  // Special Achievements
  POKERDEX_FIRST_NOTE: {
    id: 'pokerdex_first_note',
    name: 'Intelligence Gathering',
    description: 'Add your first Pokerdex note',
    emoji: '🕵️',
    category: 'pokerdex',
    requirement: 1,
    rarity: 'common'
  },
  POKERDEX_TEN_NOTES: {
    id: 'pokerdex_ten_notes',
    name: 'Private Investigator',
    description: 'Add 10 Pokerdex notes',
    emoji: '🔍',
    category: 'pokerdex',
    requirement: 10,
    rarity: 'uncommon'
  },
  VENUE_REGULAR: {
    id: 'venue_regular',
    name: 'Regular',
    description: 'Play 10+ sessions at the same venue',
    emoji: '🏠',
    category: 'venue',
    requirement: 10,
    rarity: 'uncommon'
  },
  MULTI_VENUE: {
    id: 'multi_venue',
    name: 'Explorer',
    description: 'Play at 5+ different venues',
    emoji: '🗺️',
    category: 'venue',
    requirement: 5,
    rarity: 'uncommon'
  }
};

// Achievement checking functions
export const checkAchievements = (userStats, userResults, userNotes = []) => {
  const earnedAchievements = [];

  // Game count achievements
  const totalGames = userStats.totalGames || 0;
  if (totalGames >= 1) earnedAchievements.push(ACHIEVEMENTS.FIRST_GAME);
  if (totalGames >= 10) earnedAchievements.push(ACHIEVEMENTS.TEN_GAMES);
  if (totalGames >= 25) earnedAchievements.push(ACHIEVEMENTS.TWENTY_FIVE_GAMES);
  if (totalGames >= 50) earnedAchievements.push(ACHIEVEMENTS.FIFTY_GAMES);
  if (totalGames >= 100) earnedAchievements.push(ACHIEVEMENTS.HUNDRED_GAMES);
  if (totalGames >= 250) earnedAchievements.push(ACHIEVEMENTS.TWO_FIFTY_GAMES);
  if (totalGames >= 500) earnedAchievements.push(ACHIEVEMENTS.FIVE_HUNDRED_GAMES);
  if (totalGames >= 1000) earnedAchievements.push(ACHIEVEMENTS.THOUSAND_GAMES);

  // Win achievements
  const winCount = userResults.filter(r => (r.winnings || 0) - (r.buyIn || 0) > 0).length;
  if (winCount >= 1) earnedAchievements.push(ACHIEVEMENTS.FIRST_WIN);
  if (winCount >= 10) earnedAchievements.push(ACHIEVEMENTS.TEN_WINS);
  if (winCount >= 25) earnedAchievements.push(ACHIEVEMENTS.TWENTY_FIVE_WINS);

  // Win rate achievements
  const winRate = userStats.winRate || 0;
  if (winRate >= 50 && totalGames >= 25) earnedAchievements.push(ACHIEVEMENTS.FIFTY_PERCENT_WIN_RATE);
  if (winRate >= 60 && totalGames >= 50) earnedAchievements.push(ACHIEVEMENTS.SIXTY_PERCENT_WIN_RATE);
  if (winRate >= 70 && totalGames >= 100) earnedAchievements.push(ACHIEVEMENTS.SEVENTY_PERCENT_WIN_RATE);

  // Profit achievements
  const totalProfit = userStats.totalProfit || 0;
  if (totalProfit > 0) earnedAchievements.push(ACHIEVEMENTS.FIRST_PROFIT);
  if (totalProfit >= 500) earnedAchievements.push(ACHIEVEMENTS.FIVE_HUNDRED_PROFIT);
  if (totalProfit >= 1000) earnedAchievements.push(ACHIEVEMENTS.THOUSAND_PROFIT);
  if (totalProfit >= 5000) earnedAchievements.push(ACHIEVEMENTS.FIVE_THOUSAND_PROFIT);
  if (totalProfit >= 10000) earnedAchievements.push(ACHIEVEMENTS.TEN_THOUSAND_PROFIT);

  // Big session achievements
  const biggestWin = userStats.biggestWin || 0;
  if (biggestWin >= 250) earnedAchievements.push(ACHIEVEMENTS.BIG_WIN_TWO_FIFTY);
  if (biggestWin >= 500) earnedAchievements.push(ACHIEVEMENTS.BIG_WIN_FIVE_HUNDRED);
  if (biggestWin >= 1000) earnedAchievements.push(ACHIEVEMENTS.BIG_WIN_THOUSAND);
  if (biggestWin >= 2000) earnedAchievements.push(ACHIEVEMENTS.BIG_WIN_TWO_THOUSAND);

  // Tournament achievements
  const firstPlaces = userResults.filter(r => r.position === 1).length;
  const topThreeFinishes = userResults.filter(r => r.position && r.position <= 3).length;
  if (firstPlaces >= 1) earnedAchievements.push(ACHIEVEMENTS.FIRST_PLACE);
  if (firstPlaces >= 5) earnedAchievements.push(ACHIEVEMENTS.FIVE_FIRST_PLACES);
  if (topThreeFinishes >= 1) earnedAchievements.push(ACHIEVEMENTS.FINAL_TABLE);

  // Streak achievements
  const currentStreak = calculateWinStreak(userResults);
  if (currentStreak >= 3) earnedAchievements.push(ACHIEVEMENTS.WIN_STREAK_THREE);
  if (currentStreak >= 5) earnedAchievements.push(ACHIEVEMENTS.WIN_STREAK_FIVE);
  if (currentStreak >= 10) earnedAchievements.push(ACHIEVEMENTS.WIN_STREAK_TEN);

  // Pokerdex achievements
  const noteCount = userNotes.length || 0;
  if (noteCount >= 1) earnedAchievements.push(ACHIEVEMENTS.POKERDEX_FIRST_NOTE);
  if (noteCount >= 10) earnedAchievements.push(ACHIEVEMENTS.POKERDEX_TEN_NOTES);

  // Venue achievements
  const venueMap = new Map();
  userResults.forEach(result => {
    if (result.venue) {
      venueMap.set(result.venue, (venueMap.get(result.venue) || 0) + 1);
    }
  });

  const uniqueVenues = venueMap.size;
  const maxVenueGames = Math.max(...venueMap.values(), 0);

  if (uniqueVenues >= 5) earnedAchievements.push(ACHIEVEMENTS.MULTI_VENUE);
  if (maxVenueGames >= 10) earnedAchievements.push(ACHIEVEMENTS.VENUE_REGULAR);

  return earnedAchievements;
};

const calculateWinStreak = (results) => {
  if (!results || results.length === 0) return 0;

  // Sort by date, most recent first
  const sortedResults = [...results].sort((a, b) => new Date(b.date) - new Date(a.date));

  let streak = 0;
  for (const result of sortedResults) {
    const profit = (result.winnings || 0) - (result.buyIn || 0);
    if (profit > 0) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

export const getRarityColor = (rarity) => {
  const colors = {
    'common': 'text-gray-400 border-gray-400',
    'uncommon': 'text-green-400 border-green-400',
    'rare': 'text-blue-400 border-blue-400',
    'epic': 'text-purple-400 border-purple-400',
    'legendary': 'text-yellow-400 border-yellow-400'
  };
  return colors[rarity] || colors.common;
};

export const getProgressToNextAchievement = (currentValue, category, currentAchievements) => {
  const achievementList = Object.values(ACHIEVEMENTS).filter(a => a.category === category);
  const unlockedRequirements = currentAchievements.map(a => a.requirement);

  const nextAchievement = achievementList
    .filter(a => !unlockedRequirements.includes(a.requirement))
    .sort((a, b) => a.requirement - b.requirement)[0];

  if (!nextAchievement) return null;

  return {
    achievement: nextAchievement,
    progress: currentValue,
    target: nextAchievement.requirement,
    percentage: Math.min((currentValue / nextAchievement.requirement) * 100, 100)
  };
};