const mongoose = require("mongoose");
const Challenge = require("./models/Challenge");

const SEED_CHALLENGES = [
  // --- LEVEL 1 ---
  { challengeId: "ch_1_1", title: "Plastic Free Week", tag: "Waste Reduction", description: "Avoid single-use plastics for 7 times.", rewardPoints: 100, rewardXP: 100, targetGoal: 7, unit: "Times", badgeName: "Plastic Buster", iconName: "Recycle", levelRequired: 1 },
  { challengeId: "ch_1_2", title: "Bike to Work / School", tag: "Transport", description: "Commute using a bicycle or walk for 5 trips.", rewardPoints: 150, rewardXP: 100, targetGoal: 5, unit: "Trips", badgeName: "Cycle Champion", iconName: "Bike", levelRequired: 1 },
  { challengeId: "ch_1_3", title: "Turn Off Idle Lights", tag: "Energy Saving", description: "Switch off idle lights 3 times.", rewardPoints: 80, rewardXP: 100, targetGoal: 3, unit: "Times", badgeName: "Light Saver", iconName: "Zap", levelRequired: 1 },
  { challengeId: "ch_1_4", title: "Water Tap Awareness", tag: "Water", description: "Close taps while brushing teeth 7 times.", rewardPoints: 100, rewardXP: 100, targetGoal: 7, unit: "Times", badgeName: "Aqua Saver", iconName: "TreePine", levelRequired: 1 },

  // --- LEVEL 2 ---
  { challengeId: "ch_2_1", title: "Unplug Chargers", tag: "Energy Saving", description: "Unplug chargers when devices are full 5 times.", rewardPoints: 120, rewardXP: 150, targetGoal: 5, unit: "Times", badgeName: "Unplug Master", iconName: "Zap", levelRequired: 2 },
  { challengeId: "ch_2_2", title: "Plant a Pot Plant", tag: "Water", description: "Plant an indoor or balcony herb plant.", rewardPoints: 200, rewardXP: 150, targetGoal: 1, unit: "Plant", badgeName: "Green Thumb", iconName: "TreePine", levelRequired: 2 },
  { challengeId: "ch_2_3", title: "Cloth Shopping Bags", tag: "Waste Reduction", description: "Use cloth bags for shopping 4 times.", rewardPoints: 150, rewardXP: 150, targetGoal: 4, unit: "Trips", badgeName: "Eco Shopper", iconName: "Recycle", levelRequired: 2 },
  { challengeId: "ch_2_4", title: "Stairs Over Elevator", tag: "Energy Saving", description: "Take the stairs instead of lift 10 times.", rewardPoints: 180, rewardXP: 150, targetGoal: 10, unit: "Times", badgeName: "Stair Climber", iconName: "Bike", levelRequired: 2 },

  // --- LEVEL 3 ---
  { challengeId: "ch_3_1", title: "Zero Food Waste", tag: "Food", description: "Log 0 food waste for 7 meals.", rewardPoints: 220, rewardXP: 200, targetGoal: 7, unit: "Meals", badgeName: "Zero Waste Hero", iconName: "Recycle", levelRequired: 3 },
  { challengeId: "ch_3_2", title: "Bus or Train Commute", tag: "Transport", description: "Use public transport for 6 trips.", rewardPoints: 250, rewardXP: 200, targetGoal: 6, unit: "Trips", badgeName: "Transit Rider", iconName: "Bike", levelRequired: 3 },
  { challengeId: "ch_3_3", title: "Cold Water Wash", tag: "Energy Saving", description: "Do laundry in cold water 4 times.", rewardPoints: 200, rewardXP: 200, targetGoal: 4, unit: "Loads", badgeName: "Cold Wash Pioneer", iconName: "Zap", levelRequired: 3 },
  { challengeId: "ch_3_4", title: "Compost Organic Waste", tag: "Waste Reduction", description: "Compost kitchen scraps 5 times.", rewardPoints: 240, rewardXP: 200, targetGoal: 5, unit: "Times", badgeName: "Compost King", iconName: "TreePine", levelRequired: 3 },

  // --- LEVEL 4 ---
  { challengeId: "ch_4_1", title: "Meatless Mondays", tag: "Food", description: "Eat plant-based meals 4 times.", rewardPoints: 280, rewardXP: 250, targetGoal: 4, unit: "Meals", badgeName: "Plant-Based Chef", iconName: "Recycle", levelRequired: 4 },
  { challengeId: "ch_4_2", title: "E-Waste Recycling", tag: "Waste Reduction", description: "Dispose of old electronics at a certified e-waste bin.", rewardPoints: 300, rewardXP: 250, targetGoal: 1, unit: "Action", badgeName: "E-Waste Guardian", iconName: "Zap", levelRequired: 4 },
  { challengeId: "ch_4_3", title: "LED Bulb Upgrade", tag: "Energy Saving", description: "Replace 3 traditional bulbs with LED bulbs.", rewardPoints: 320, rewardXP: 250, targetGoal: 3, unit: "Bulbs", badgeName: "LED Innovator", iconName: "Zap", levelRequired: 4 },
  { challengeId: "ch_4_4", title: "Refillable Bottle Habit", tag: "Waste Reduction", description: "Carry personal water bottle 10 times.", rewardPoints: 250, rewardXP: 250, targetGoal: 10, unit: "Times", badgeName: "Hydration Hero", iconName: "TreePine", levelRequired: 4 },

  // --- LEVEL 5 ---
  { challengeId: "ch_5_1", title: "Solar Light Usage", tag: "Energy Saving", description: "Use outdoor solar lights 14 times.", rewardPoints: 350, rewardXP: 300, targetGoal: 14, unit: "Times", badgeName: "Solar Champion", iconName: "Zap", levelRequired: 5 },
  { challengeId: "ch_5_2", title: "Carpooling Drive", tag: "Transport", description: "Carpool with colleagues or friends 5 times.", rewardPoints: 380, rewardXP: 300, targetGoal: 5, unit: "Trips", badgeName: "Carpool Leader", iconName: "Bike", levelRequired: 5 },
  { challengeId: "ch_5_3", title: "Community Clean Drive", tag: "Waste Reduction", description: "Participate in local area cleanup drive.", rewardPoints: 400, rewardXP: 300, targetGoal: 1, unit: "Event", badgeName: "Community Cleaner", iconName: "Recycle", levelRequired: 5 },
  { challengeId: "ch_5_4", title: "Rainwater Harvest Check", tag: "Water", description: "Set up or inspect rainwater collector bucket.", rewardPoints: 360, rewardXP: 300, targetGoal: 1, unit: "Setup", badgeName: "Rain Harvester", iconName: "TreePine", levelRequired: 5 },

  // --- LEVEL 6 ---
  { challengeId: "ch_6_1", title: "Paperless Actions", tag: "Waste Reduction", description: "Opt for digital bills and e-statements 10 times.", rewardPoints: 420, rewardXP: 350, targetGoal: 10, unit: "Times", badgeName: "Paperless Pro", iconName: "Recycle", levelRequired: 6 },
  { challengeId: "ch_6_2", title: "Tree Plantation Drive", tag: "Water", description: "Plant 2 native tree saplings in your locality.", rewardPoints: 500, rewardXP: 350, targetGoal: 2, unit: "Trees", badgeName: "Forest Creator", iconName: "TreePine", levelRequired: 6 },
  { challengeId: "ch_6_3", title: "Eco-Appliance Shift", tag: "Energy Saving", description: "Use energy star rated mode on appliances 15 times.", rewardPoints: 450, rewardXP: 350, targetGoal: 15, unit: "Times", badgeName: "Energy Star", iconName: "Zap", levelRequired: 6 },
  { challengeId: "ch_6_4", title: "Zero Single-Use Cup", tag: "Waste Reduction", description: "Use reusable flask for drinks 10 times.", rewardPoints: 430, rewardXP: 350, targetGoal: 10, unit: "Times", badgeName: "Flask Warrior", iconName: "Recycle", levelRequired: 6 },

  // --- LEVEL 7 ---
  { challengeId: "ch_7_1", title: "Local Organic Produce", tag: "Food", description: "Buy 100% locally grown organic produce 5 times.", rewardPoints: 520, rewardXP: 400, targetGoal: 5, unit: "Purchases", badgeName: "Organic Buyer", iconName: "TreePine", levelRequired: 7 },
  { challengeId: "ch_7_2", title: "EV/Hybrid Trip", tag: "Transport", description: "Use EV or zero-emission vehicles for 12 trips.", rewardPoints: 580, rewardXP: 400, targetGoal: 12, unit: "Trips", badgeName: "EV Pioneer", iconName: "Bike", levelRequired: 7 },
  { challengeId: "ch_7_3", title: "A/C Temp Optimization", tag: "Energy Saving", description: "Keep A/C set to 24°C or above 15 times.", rewardPoints: 500, rewardXP: 400, targetGoal: 15, unit: "Times", badgeName: "Cooling Optimizer", iconName: "Zap", levelRequired: 7 },
  { challengeId: "ch_7_4", title: "Upcycling Craft Project", tag: "Waste Reduction", description: "Turn waste items into functional furniture or decor.", rewardPoints: 550, rewardXP: 400, targetGoal: 1, unit: "Project", badgeName: "Upcycling Artist", iconName: "Recycle", levelRequired: 7 },

  // --- LEVEL 8 ---
  { challengeId: "ch_8_1", title: "Shower Water Conservation", tag: "Water", description: "Limit shower time under 5 mins 20 times.", rewardPoints: 620, rewardXP: 450, targetGoal: 20, unit: "Times", badgeName: "Shower Saver", iconName: "TreePine", levelRequired: 8 },
  { challengeId: "ch_8_2", title: "Eco-Workshop Host", tag: "Waste Reduction", description: "Conduct a 15-min eco awareness session.", rewardPoints: 700, rewardXP: 450, targetGoal: 1, unit: "Session", badgeName: "Eco Mentor", iconName: "Recycle", levelRequired: 8 },
  { challengeId: "ch_8_3", title: "Smart Power Strip Use", tag: "Energy Saving", description: "Plug home workstation to smart auto-off strip 15 times.", rewardPoints: 650, rewardXP: 450, targetGoal: 15, unit: "Times", badgeName: "Smart Strip Tech", iconName: "Zap", levelRequired: 8 },
  { challengeId: "ch_8_4", title: "Zero Fast-Fashion", tag: "Waste Reduction", description: "Avoid synthetic fashion purchases 10 times.", rewardPoints: 680, rewardXP: 450, targetGoal: 10, unit: "Times", badgeName: "Slow Fashion Icon", iconName: "Recycle", levelRequired: 8 },

  // --- LEVEL 9 ---
  { challengeId: "ch_9_1", title: "Urban Garden Expansion", tag: "Water", description: "Cultivate 5 vegetables/herbs at home garden.", rewardPoints: 800, rewardXP: 500, targetGoal: 5, unit: "Plants", badgeName: "Urban Farmer", iconName: "TreePine", levelRequired: 9 },
  { challengeId: "ch_9_2", title: "Carbon Offset Logging", tag: "Energy Saving", description: "Log eco-verified offset actions 25 times.", rewardPoints: 850, rewardXP: 500, targetGoal: 25, unit: "Logs", badgeName: "Offset Legend", iconName: "Zap", levelRequired: 9 },
  { challengeId: "ch_9_3", title: "Zero Plastic Shopping", tag: "Waste Reduction", description: "Shop zero-packaged groceries 15 times.", rewardPoints: 900, rewardXP: 500, targetGoal: 15, unit: "Trips", badgeName: "Package-Free Master", iconName: "Recycle", levelRequired: 9 },
  { challengeId: "ch_9_4", title: "Sub-50 Carbon Score", tag: "Transport", description: "Log daily carbon footprint score under 50 for 20 logs.", rewardPoints: 950, rewardXP: 500, targetGoal: 20, unit: "Logs", badgeName: "Low Carbon Titan", iconName: "Bike", levelRequired: 9 },

  // --- LEVEL 10 ---
  { challengeId: "ch_10_1", title: "Zero Waste Master", tag: "Waste Reduction", description: "Achieve complete zero waste lifestyle 30 times.", rewardPoints: 1200, rewardXP: 1000, targetGoal: 30, unit: "Times", badgeName: "Zero Waste Grandmaster", iconName: "Recycle", levelRequired: 10 },
  { challengeId: "ch_10_2", title: "Community Solar Drive", tag: "Energy Saving", description: "Promote solar adoption to 3 households.", rewardPoints: 1500, rewardXP: 1000, targetGoal: 3, unit: "Homes", badgeName: "Solar Ambassador", iconName: "Zap", levelRequired: 10 },
  { challengeId: "ch_10_3", title: "10-Tree Forest Builder", tag: "Water", description: "Sponsor or plant 10 trees in a urban forest initiative.", rewardPoints: 1800, rewardXP: 1000, targetGoal: 10, unit: "Trees", badgeName: "Urban Forest Builder", iconName: "TreePine", levelRequired: 10 },
  { challengeId: "ch_10_4", title: "Planet Savior Pinnacle", tag: "Transport", description: "Log 100 eco-actions across transport, energy & waste.", rewardPoints: 2500, rewardXP: 1000, targetGoal: 100, unit: "Actions", badgeName: "Planet Savior Pinnacle", iconName: "Bike", levelRequired: 10 },
];

async function seedChallenges() {
  try {
    for (const c of SEED_CHALLENGES) {
      await Challenge.updateOne(
        { challengeId: c.challengeId },
        { $set: c },
        { upsert: true }
      );
    }
    console.log("✅ 40 Standardized Seed Challenges with Unique Badge Names Seeded Successfully!");
  } catch (err) {
    console.error("❌ Seeding Error:", err.message);
  }
}

module.exports = seedChallenges;