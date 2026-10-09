import React from "react";

export default function RewardModal({ reward, onClose }) {
  if (!reward) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border-2 border-emerald-500 relative transform transition-all scale-100">
        {/* Header Tag */}
        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Challenge Complete! 🎉
        </span>

        {/* Animated Badge Icon */}
        <div className="my-6 relative flex justify-center">
          <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-5xl shadow-inner border border-emerald-200 animate-bounce">
            {reward.badgeIcon || "🚲"}
          </div>
        </div>

        <h3 className="text-xl font-extrabold text-slate-800">{reward.title}</h3>
        <p className="text-xs text-slate-500 mt-1">Goal Reached Successfully!</p>

        {/* Badge Name Tag */}
        {reward.badgeName && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold py-1 px-3 rounded-lg my-3 inline-block">
            🏅 UNLOCKED: {reward.badgeName}
          </div>
        )}

        {/* Rewards Breakdown */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <span className="text-xs text-amber-700 font-semibold block">Eco Points</span>
            <span className="text-lg font-black text-amber-600">🪙 +{reward.rewardPoints}</span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <span className="text-xs text-blue-700 font-semibold block">Level XP</span>
            <span className="text-lg font-black text-blue-600">✨ +{reward.rewardXP}</span>
          </div>
        </div>

        {/* Claim Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
        >
          CLAIM REWARDS 🚀
        </button>
      </div>
    </div>
  );
}