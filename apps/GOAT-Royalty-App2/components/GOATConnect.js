/**
 * GOAT Royalty App — GOAT Connect
 * Social networking & dating platform for music industry professionals
 * 
 * Features: Profile creation, music-based matching, messaging,
 * collaboration finder, event discovery, industry networking
 */

import React, { useState, useEffect } from 'react';
import {
  Heart, MessageCircle, Music, Star, MapPin, Users,
  Search, Filter, Sparkles, X, Check, ChevronLeft,
  ChevronRight, Send, Image, Mic, Video, Phone,
  Shield, Eye, EyeOff, Settings, Bell, Zap, Crown,
  Guitar, Headphones, Radio, Award, Globe, Calendar,
  UserPlus, Share2, Flag, MoreHorizontal, Camera
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════
// MOCK PROFILES
// ═══════════════════════════════════════════════════════════════════

const PROFILES = [
  {
    id: 1, name: 'Aaliyah Rivers', age: 28, location: 'Atlanta, GA',
    role: 'R&B Vocalist / Songwriter', genre: ['R&B', 'Neo-Soul', 'Pop'],
    bio: 'Grammy-nominated vocalist looking for producers and songwriters who understand soul music. Let\'s create something timeless together.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
    verified: true, premium: true, online: true,
    instruments: ['Vocals', 'Piano'], daw: 'Logic Pro',
    lookingFor: ['Collaboration', 'Networking'], matchScore: 95,
    tracks: 47, followers: '12.4K', streams: '2.1M',
  },
  {
    id: 2, name: 'Marcus Cole', age: 32, location: 'Los Angeles, CA',
    role: 'Hip-Hop Producer / Beat Maker', genre: ['Hip-Hop', 'Trap', 'Boom Bap'],
    bio: 'Produced for 3 platinum artists. Looking for hungry artists and fellow producers to build with. Studio in LA open for sessions.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    verified: true, premium: false, online: true,
    instruments: ['MPC', 'Keyboard', 'Guitar'], daw: 'FL Studio',
    lookingFor: ['Collaboration', 'Dating'], matchScore: 88,
    tracks: 234, followers: '45.2K', streams: '8.7M',
  },
  {
    id: 3, name: 'Jade Kim', age: 25, location: 'New York, NY',
    role: 'Electronic Music Producer / DJ', genre: ['House', 'Techno', 'EDM'],
    bio: 'Resident DJ at Brooklyn clubs. Looking for vocalists and fellow producers to push electronic boundaries. Also into visual art.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    verified: true, premium: true, online: false,
    instruments: ['Synths', 'CDJ', 'Ableton Push'], daw: 'Ableton Live',
    lookingFor: ['Collaboration', 'Dating', 'Networking'], matchScore: 82,
    tracks: 89, followers: '28.1K', streams: '4.3M',
  },
  {
    id: 4, name: 'Devon James', age: 30, location: 'Nashville, TN',
    role: 'Session Guitarist / Music Director', genre: ['Country', 'Rock', 'Blues'],
    bio: 'Touring musician turned music director. Looking for creative partnerships and meaningful connections in the industry.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    verified: false, premium: false, online: true,
    instruments: ['Guitar', 'Bass', 'Pedal Steel'], daw: 'Pro Tools',
    lookingFor: ['Collaboration', 'Dating'], matchScore: 76,
    tracks: 156, followers: '8.9K', streams: '1.5M',
  },
  {
    id: 5, name: 'Zara Thompson', age: 27, location: 'London, UK',
    role: 'Singer-Songwriter / A&R', genre: ['Pop', 'Indie', 'Alternative'],
    bio: 'A&R by day, songwriter by night. Looking for undiscovered talent and creative soulmates. Love discovering new sounds.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    verified: true, premium: true, online: true,
    instruments: ['Vocals', 'Ukulele', 'Piano'], daw: 'Logic Pro',
    lookingFor: ['Networking', 'Dating'], matchScore: 91,
    tracks: 32, followers: '67.3K', streams: '12.8M',
  },
  {
    id: 6, name: 'Isaiah Wright', age: 35, location: 'Miami, FL',
    role: 'Music Publisher / Manager', genre: ['Latin', 'Reggaeton', 'Hip-Hop'],
    bio: 'Managing 5 artists, always looking for the next big sound. Industry connections in Latin and urban markets. Let\'s build empires.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    verified: true, premium: true, online: false,
    instruments: ['Business', 'Strategy'], daw: 'N/A',
    lookingFor: ['Networking', 'Business'], matchScore: 73,
    tracks: 0, followers: '15.7K', streams: 'N/A',
  },
];

const CONVERSATIONS = [
  { id: 1, name: 'Aaliyah Rivers', avatar: '🎤', lastMessage: 'That beat you sent is 🔥 can we book studio time?', time: '2m ago', unread: 3, online: true },
  { id: 2, name: 'Marcus Cole', avatar: '🎹', lastMessage: 'Yo check this sample pack I made', time: '1h ago', unread: 0, online: true },
  { id: 3, name: 'Jade Kim', avatar: '🎧', lastMessage: 'Would love to feature you on my next EP', time: '3h ago', unread: 1, online: false },
  { id: 4, name: 'Devon James', avatar: '🎸', lastMessage: 'Nashville session next week?', time: '1d ago', unread: 0, online: false },
];

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function GOATConnect() {
  const [activeView, setActiveView] = useState('discover');
  const [currentProfileIdx, setCurrentProfileIdx] = useState(0);
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [matchedProfiles, setMatchedProfiles] = useState([]);
  const [showMatch, setShowMatch] = useState(false);
  const [filterGenre, setFilterGenre] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [messageInput, setMessageInput] = useState('');
  const [activeConvo, setActiveConvo] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'other', text: 'Hey! Loved your latest track on Spotify 🔥', time: '2:30 PM' },
    { id: 2, sender: 'me', text: 'Thanks! I actually used some of your sample techniques', time: '2:32 PM' },
    { id: 3, sender: 'other', text: 'That beat you sent is 🔥 can we book studio time?', time: '2:35 PM' },
  ]);

  const currentProfile = PROFILES[currentProfileIdx];

  // Swipe handlers
  const handleLike = () => {
    setLikedProfiles(prev => [...prev, currentProfile.id]);
    // 40% match chance for demo
    if (Math.random() > 0.6) {
      setMatchedProfiles(prev => [...prev, currentProfile]);
      setShowMatch(true);
      setTimeout(() => setShowMatch(false), 3000);
    }
    nextProfile();
  };

  const handlePass = () => {
    nextProfile();
  };

  const nextProfile = () => {
    setCurrentProfileIdx(prev => (prev + 1) % PROFILES.length);
  };

  const prevProfile = () => {
    setCurrentProfileIdx(prev => (prev - 1 + PROFILES.length) % PROFILES.length);
  };

  const sendMessage = () => {
    if (!messageInput.trim()) return;
    setChatMessages(prev => [...prev, {
      id: Date.now(), sender: 'me', text: messageInput.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
    setMessageInput('');
  };

  // ═══════════════════════════════════════════════════════════════
  // PROFILE CARD (Discover View)
  // ═══════════════════════════════════════════════════════════════
  const ProfileCard = ({ profile }) => (
    <div className="relative max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
      {/* Profile Image */}
      <div className="relative h-96">
        <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {profile.verified && (
            <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
              <Check size={12} /> Verified
            </span>
          )}
          {profile.premium && (
            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
              <Crown size={12} /> Premium
            </span>
          )}
          {profile.online && (
            <span className="flex items-center gap-1 px-2 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm">
              Online
            </span>
          )}
        </div>

        {/* Match Score */}
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1 px-3 py-1.5 bg-pink-500/90 text-white text-sm font-bold rounded-full backdrop-blur-sm">
            <Sparkles size={14} /> {profile.matchScore}% Match
          </div>
        </div>

        {/* Profile Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <h2 className="text-3xl font-black">{profile.name}, {profile.age}</h2>
          <p className="text-sm text-gray-200 mt-1 flex items-center gap-1">
            <MapPin size={14} /> {profile.location}
          </p>
          <p className="text-sm font-semibold text-pink-300 mt-1">{profile.role}</p>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">{profile.bio}</p>

        {/* Genres */}
        <div className="flex flex-wrap gap-2">
          {profile.genre.map((g, i) => (
            <span key={i} className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
              🎵 {g}
            </span>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-lg font-black">{profile.tracks}</p>
            <p className="text-xs text-gray-500">Tracks</p>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-lg font-black">{profile.followers}</p>
            <p className="text-xs text-gray-500">Followers</p>
          </div>
          <div className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <p className="text-lg font-black">{profile.streams}</p>
            <p className="text-xs text-gray-500">Streams</p>
          </div>
        </div>

        {/* Instruments & DAW */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Headphones size={14} /> {profile.instruments.join(', ')} • {profile.daw}
        </div>

        {/* Looking For */}
        <div className="flex flex-wrap gap-2">
          {profile.lookingFor.map((item, i) => (
            <span key={i} className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300">
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 pt-0 flex items-center justify-center gap-4">
        <button
          onClick={handlePass}
          className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
        >
          <X size={28} className="text-gray-400 group-hover:text-red-500 transition-colors" />
        </button>
        <button
          onClick={() => prevProfile()}
          className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-400" />
        </button>
        <button
          onClick={handleLike}
          className="p-5 bg-gradient-to-br from-pink-500 to-red-500 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <Heart size={32} className="text-white" fill="white" />
        </button>
        <button
          onClick={nextProfile}
          className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <ChevronRight size={20} className="text-gray-400" />
        </button>
        <button
          className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors group"
        >
          <Star size={28} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
        </button>
      </div>
    </div>
  );

  // ═══════════════════════════════════════════════════════════════
  // MATCH NOTIFICATION
  // ═══════════════════════════════════════════════════════════════
  const MatchNotification = () => (
    showMatch && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
        <div className="text-center p-8 animate-bounce">
          <div className="text-8xl mb-4">🎉</div>
          <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
            IT'S A MATCH!
          </h2>
          <p className="text-white text-lg">You and {currentProfile?.name} both liked each other</p>
          <div className="flex gap-4 mt-6 justify-center">
            <button className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full font-bold hover:scale-105 transition-transform">
              Send Message
            </button>
            <button onClick={() => setShowMatch(false)} className="px-6 py-3 bg-white/20 text-white rounded-full font-bold hover:bg-white/30 transition-colors">
              Keep Swiping
            </button>
          </div>
        </div>
      </div>
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <MatchNotification />

      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-700 text-white">
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Heart size={32} fill="white" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight">GOAT Connect</h1>
              <p className="text-pink-200 mt-1">Music industry networking, collaboration & dating</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{PROFILES.length}</p>
              <p className="text-xs text-pink-200">Profiles Near You</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{matchedProfiles.length}</p>
              <p className="text-xs text-pink-200">Matches</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{likedProfiles.length}</p>
              <p className="text-xs text-pink-200">Likes Sent</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-3xl font-black">{CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0)}</p>
              <p className="text-xs text-pink-200">Unread Messages</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-6 mt-6">
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'discover', label: 'Discover', icon: <Sparkles size={16} /> },
            { id: 'matches', label: 'Matches', icon: <Heart size={16} /> },
            { id: 'messages', label: 'Messages', icon: <MessageCircle size={16} /> },
            { id: 'network', label: 'Network', icon: <Users size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                activeView === tab.id
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Discover View */}
        {activeView === 'discover' && (
          <ProfileCard profile={currentProfile} />
        )}

        {/* Matches View */}
        {activeView === 'matches' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Your Matches ({matchedProfiles.length})</h2>
            {matchedProfiles.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">💝</div>
                <h3 className="text-xl font-bold mb-2">No matches yet</h3>
                <p className="text-gray-500">Keep swiping to find your music soulmate!</p>
                <button onClick={() => setActiveView('discover')} className="mt-4 px-6 py-3 bg-pink-500 text-white rounded-full font-bold">
                  Start Discovering
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {matchedProfiles.map(profile => (
                  <div key={profile.id} className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all">
                    <img src={profile.avatar} alt={profile.name} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="font-bold">{profile.name}</h3>
                      <p className="text-xs text-gray-500">{profile.role}</p>
                      <button className="mt-3 w-full py-2 bg-pink-500 text-white rounded-lg text-sm font-bold hover:bg-pink-600 transition-colors">
                        <MessageCircle size={14} className="inline mr-1" /> Message
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages View */}
        {activeView === 'messages' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Conversation List */}
            <div className="space-y-2">
              <h2 className="text-lg font-bold mb-4">Conversations</h2>
              {CONVERSATIONS.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => setActiveConvo(convo)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
                    activeConvo?.id === convo.id ? 'bg-pink-50 dark:bg-pink-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="relative">
                    <span className="text-2xl">{convo.avatar}</span>
                    {convo.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="font-semibold text-sm">{convo.name}</span>
                      <span className="text-xs text-gray-500">{convo.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{convo.lastMessage}</p>
                  </div>
                  {convo.unread > 0 && (
                    <span className="w-5 h-5 flex items-center justify-center bg-pink-500 text-white text-xs font-bold rounded-full">
                      {convo.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Chat Area */}
            <div className="md:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-col h-[500px]">
              {activeConvo ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{activeConvo.avatar}</span>
                      <div>
                        <h3 className="font-bold text-sm">{activeConvo.name}</h3>
                        <p className="text-xs text-green-500">{activeConvo.online ? 'Online' : 'Offline'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Phone size={16} /></button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Video size={16} /></button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                          msg.sender === 'me'
                            ? 'bg-pink-500 text-white rounded-br-sm'
                            : 'bg-gray-100 dark:bg-gray-800 rounded-bl-sm'
                        }`}>
                          <p>{msg.text}</p>
                          <p className={`text-xs mt-1 ${msg.sender === 'me' ? 'text-pink-200' : 'text-gray-400'}`}>{msg.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Image size={18} className="text-gray-400" /></button>
                      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><Mic size={18} className="text-gray-400" /></button>
                      <input
                        type="text"
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                      <button onClick={sendMessage} className="p-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors">
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MessageCircle size={48} className="mx-auto mb-3 opacity-30" />
                    <p>Select a conversation to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Network View */}
        {activeView === 'network' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Industry Network</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROFILES.map(profile => (
                <div key={profile.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-xl transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={profile.avatar} alt={profile.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="font-bold text-sm flex items-center gap-1">
                        {profile.name}
                        {profile.verified && <Check size={14} className="text-blue-500" />}
                      </h3>
                      <p className="text-xs text-gray-500">{profile.role}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {profile.genre.map((g, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">{g}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors">
                      <UserPlus size={12} className="inline mr-1" /> Connect
                    </button>
                    <button className="flex-1 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <MessageCircle size={12} className="inline mr-1" /> Message
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}