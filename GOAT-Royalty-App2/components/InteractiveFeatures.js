/**
 * GOAT Royalty App - Interactive Features Component
 * Advanced interactive elements and gamification
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, 
  Star, 
  Zap, 
  Target, 
  Gift, 
  Crown, 
  Shield, 
  Sword,
  TrendingUp,
  Award,
  Flame,
  Gem,
  Rocket,
  Users
} from 'lucide-react';

const InteractiveFeatures = () => {
  const [userLevel, setUserLevel] = useState(15);
  const [experience, setExperience] = useState(3420);
  const [achievements, setAchievements] = useState([
    { id: 1, name: 'First Track', icon: Star, unlocked: true, description: 'Added your first track' },
    { id: 2, name: 'Royalty Master', icon: Crown, unlocked: true, description: 'Earned $1000 in royalties' },
    { id: 3, name: 'Catalog Hero', icon: Trophy, unlocked: true, description: 'Built a 50+ track catalog' },
    { id: 4, name: 'Streaming Star', icon: Target, unlocked: false, description: 'Reached 1M streams' },
    { id: 5, name: 'GOAT Status', icon: Flame, unlocked: false, description: 'Reach level 20' }
  ]);

  const [dailyChallenges, setDailyChallenges] = useState([
    { id: 1, title: 'Upload 3 New Tracks', progress: 2, total: 3, reward: 50, icon: Rocket },
    { id: 2, title: 'Review 5 Contracts', progress: 3, total: 5, reward: 30, icon: Shield },
    { id: 3, title: 'Check Analytics 10 Times', progress: 7, total: 10, reward: 25, icon: TrendingUp }
  ]);

  const [leaderboard] = useState([
    { rank: 1, name: 'The Gangsta Nerds', level: 50, earnings: '$5.2M', avatar: '🦸‍♂️' },
    { rank: 2, name: 'Waka Flocka Flame', level: 48, earnings: '$4.8M', avatar: '🔥' },
    { rank: 3, name: 'DJ Speedy', level: 42, earnings: '$2.3M', avatar: '👑' },
    { rank: 4, name: 'Harvey Miller', level: 35, earnings: '$1.2M', avatar: '💎' },
    { rank: 5, name: 'Kevin Hallingquest', level: 28, earnings: '$850K', avatar: '⚡' }
  ]);

  const [collectibles, setCollectibles] = useState([
    { id: 1, name: 'Golden GOAT', rarity: 'Legendary', owned: true, icon: Crown },
    { id: 2, name: 'Platinum Vinyl', rarity: 'Epic', owned: true, icon: Gem },
    { id: 3, name: 'Diamond Mic', rarity: 'Rare', owned: false, icon: Award },
    { id: 4, name: 'Silver Speaker', rarity: 'Common', owned: true, icon: Star }
  ]);

  const experienceToNextLevel = (userLevel + 1) * 250;
  const progressPercentage = (experience / experienceToNextLevel) * 100;

  const completeChallenge = (challengeId) => {
    setDailyChallenges(prev => prev.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, progress: challenge.total }
        : challenge
    ));
  };

  const collectReward = (challengeId) => {
    setExperience(prev => prev + dailyChallenges.find(c => c.id === challengeId).reward);
    completeChallenge(challengeId);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4">
          <span className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-400 to-pink-400 bg-clip-text text-transparent">
            GOAT Universe
          </span>
        </h2>
        <p className="text-white/70">Level up, unlock achievements, and dominate the music industry</p>
      </div>

      {/* User Profile Card */}
      <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-2xl p-6 backdrop-blur-md border border-white/20 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-600 to-pink-600 rounded-full flex items-center justify-center">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">GOAT Artist</h3>
              <p className="text-white/70">Level {userLevel} • {experience} XP</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-yellow-400">#{leaderboard[4].rank}</div>
            <p className="text-white/60 text-sm">Global Rank</p>
          </div>
        </div>

        {/* Experience Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-white/60 mb-1">
            <span>Level {userLevel}</span>
            <span>Level {userLevel + 1}</span>
          </div>
          <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-500 to-pink-500 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${progressPercentage}%` }}
            >
              {progressPercentage > 10 && (
                <span className="text-xs text-white font-medium">
                  {Math.round(progressPercentage)}%
                </span>
              )}
            </div>
          </div>
          <p className="text-center text-white/60 text-sm mt-1">
            {experienceToNextLevel - experience} XP to next level
          </p>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">23</div>
            <p className="text-white/60 text-sm">Tracks</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">$342K</div>
            <p className="text-white/60 text-sm">Earned</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">1.2M</div>
            <p className="text-white/60 text-sm">Streams</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{achievements.filter(a => a.unlocked).length}</div>
            <p className="text-white/60 text-sm">Achievements</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Daily Challenges */}
        <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Daily Challenges</h3>
            <div className="text-sm text-purple-400">
              <Zap className="w-4 h-4 inline mr-1" />
              Reset in 14h 23m
            </div>
          </div>
          <div className="p-4">
            {dailyChallenges.map((challenge) => {
              const IconComponent = challenge.icon;
              const isCompleted = challenge.progress === challenge.total;
              
              return (
                <div key={challenge.id} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm">{challenge.title}</span>
                    </div>
                    <span className="text-yellow-400 text-sm font-medium">
                      +{challenge.reward} XP
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 bg-black/30 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-500 to-pink-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${(challenge.progress / challenge.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-white/60 text-xs">
                      {challenge.progress}/{challenge.total}
                    </span>
                    {!isCompleted && challenge.progress > 0 && (
                      <button
                        onClick={() => completeChallenge(challenge.id)}
                        className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-700 transition-colors"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Achievements */}
        <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 backdrop-blur-md rounded-xl border border-white/20">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-lg font-semibold text-white">Achievements</h3>
          </div>
          <div className="p-4">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              
              return (
                <div 
                  key={achievement.id} 
                  className={`flex items-center space-x-3 mb-4 last:mb-0 p-3 rounded-lg ${
                    achievement.unlocked ? 'bg-white/10' : 'bg-black/20 opacity-60'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    achievement.unlocked ? 'bg-gradient-to-r from-red-600 via-yellow-500 to-red-600-600 to-pink-600' : 'bg-gray-600'
                  }`}>
                    <IconComponent className={`w-5 h-5 ${
                      achievement.unlocked ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white text-sm font-medium">{achievement.name}</h4>
                    <p className="text-white/60 text-xs">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <div className="text-yellow-400 text-xs">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 backdrop-blur-md rounded-xl border border-white/20 mb-8">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Global Leaderboard</h3>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-white/60 text-sm">Top Artists</span>
          </div>
        </div>
        <div className="p-4">
          {leaderboard.map((user) => (
            <div 
              key={user.rank} 
              className={`flex items-center space-x-4 mb-3 last:mb-0 p-3 rounded-lg ${
                user.rank === 5 ? 'bg-purple-600/20 border border-purple-500/30' : 'hover:bg-white/5'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                user.rank === 1 ? 'bg-yellow-500 text-black' :
                user.rank === 2 ? 'bg-gray-400 text-black' :
                user.rank === 3 ? 'bg-orange-600 text-black' :
                'bg-white/20 text-white'
              }`}>
                {user.rank}
              </div>
              <div className="text-2xl">{user.avatar}</div>
              <div className="flex-1">
                <h4 className="text-white font-medium">{user.name}</h4>
                <p className="text-white/60 text-sm">Level {user.level} • {user.earnings}</p>
              </div>
              {user.rank <= 3 && (
                <div className="text-yellow-400">
                  <Trophy className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Collectibles Gallery */}
      <div className="goat-gradient-card goat-gradient-card goat-card-hover/10 backdrop-blur-md rounded-xl border border-white/20">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Collectibles</h3>
          <span className="text-purple-400 text-sm">
            {collectibles.filter(c => c.owned).length}/{collectibles.length} Owned
          </span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {collectibles.map((item) => {
              const IconComponent = item.icon;
              
              return (
                <div 
                  key={item.id}
                  className={`relative rounded-lg p-4 text-center border ${
                    item.owned 
                      ? 'bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30' 
                      : 'bg-black/20 border-gray-600/30 opacity-60'
                  }`}
                >
                  <div className="flex justify-center mb-2">
                    <IconComponent className={`w-8 h-8 ${
                      item.rarity === 'Legendary' ? 'text-yellow-400' :
                      item.rarity === 'Epic' ? 'text-purple-400' :
                      item.rarity === 'Rare' ? 'text-blue-400' :
                      'text-gray-400'
                    }`} />
                  </div>
                  <h4 className="text-white text-sm font-medium mb-1">{item.name}</h4>
                  <p className="text-xs text-white/60">{item.rarity}</p>
                  {item.owned && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveFeatures;