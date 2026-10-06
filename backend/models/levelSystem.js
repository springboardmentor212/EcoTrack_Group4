const LEVEL_CONFIG = [
  { level: 1, title: "Eco Starter", icon: "🌱", minXP: 0, maxXP: 500 },
  { level: 2, title: "Eco Learner", icon: "🌿", minXP: 500, maxXP: 1200 },
  { level: 3, title: "Green Explorer", icon: "🍃", minXP: 1200, maxXP: 2000 },
  { level: 4, title: "Eco Warrior", icon: "🌳", minXP: 2000, maxXP: 3000 },
  { level: 5, title: "Climate Protector", icon: "🌎", minXP: 3000, maxXP: 4500 },
  { level: 6, title: "Sustainability Hero", icon: "♻️", minXP: 4500, maxXP: 6500 },
  { level: 7, title: "Eco Champion", icon: "🏆", minXP: 6500, maxXP: 9000 },
  { level: 8, title: "Planet Guardian", icon: "👑", minXP: 9000, maxXP: 12000 },
  { level: 9, title: "Green Legend", icon: "💚", minXP: 12000, maxXP: 16000 },
  { level: 10, title: "Earth Guardian", icon: "🌍", minXP: 16000, maxXP: Infinity },
];

/**
 * Calculates current level details based on current total XP
 */
const calculateLevelFromXP = (currentXP) => {
  const userXP = currentXP || 0;
  let currentLevelInfo = LEVEL_CONFIG[0];

  for (let i = 0; i < LEVEL_CONFIG.length; i++) {
    if (userXP >= LEVEL_CONFIG[i].minXP) {
      currentLevelInfo = LEVEL_CONFIG[i];
    } else {
      break;
    }
  }

  const nextLevelInfo = LEVEL_CONFIG.find((l) => l.level === currentLevelInfo.level + 1) || currentLevelInfo;
  
  const xpInCurrentLevel = userXP - currentLevelInfo.minXP;
  const xpRequiredForNextLevel = currentLevelInfo.maxXP - currentLevelInfo.minXP;
  const progressPercent = currentLevelInfo.maxXP === Infinity 
    ? 100 
    : Math.min(100, Math.round((xpInCurrentLevel / xpRequiredForNextLevel) * 100));

  return {
    level: currentLevelInfo.level,
    title: currentLevelInfo.title,
    icon: currentLevelInfo.icon,
    currentXP: userXP,
    levelMinXP: currentLevelInfo.minXP,
    levelMaxXP: currentLevelInfo.maxXP,
    xpProgress: xpInCurrentLevel,
    xpNeeded: xpRequiredForNextLevel,
    progressPercent,
    nextLevelTitle: nextLevelInfo.title,
  };
};

module.exports = { LEVEL_CONFIG, calculateLevelFromXP };