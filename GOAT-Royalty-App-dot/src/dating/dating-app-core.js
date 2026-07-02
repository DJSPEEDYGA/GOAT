/**
 * DJ SPEEDY'S DATING APP - CORE SYSTEM
 * AI-Powered Dating & Connection Platform
 * Created by SuperNinja - NinjaTech AI
 */

const { EventEmitter } = require('events');

class DatingAppCore extends EventEmitter {
  constructor() {
    super();
    this.users = new Map();
    this.matches = new Map();
    this.conversations = new Map();
    this.events = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize Dating App
   */
  async initialize() {
    console.log('💖 DJ Speedy Dating App initializing...');
    
    // Load user preferences database
    await this.loadPreferencesDatabase();
    
    // Load interest categories
    await this.loadInterestCategories();
    
    this.isInitialized = true;
    console.log('✅ Dating App ready for connections!');
  }

  /**
   * Create user profile
   */
  async createProfile(userData) {
    const profile = {
      id: this.generateUserId(),
      createdAt: Date.now(),
      status: 'active',
      ...userData,
      preferences: {
        ageRange: { min: 18, max: 99 },
        distance: 50, // miles
        interests: [],
        dealbreakers: [],
        ...userData.preferences
      },
      stats: {
        profileViews: 0,
        likesReceived: 0,
        likesSent: 0,
        matches: 0,
        conversations: 0
      },
      verification: {
        emailVerified: false,
        phoneVerified: false,
        photoVerified: false,
        identityVerified: false
      },
      settings: {
        visibility: 'public',
        showDistance: true,
        showAge: true,
        notifications: true,
        onlineStatus: true
      }
    };
    
    this.users.set(profile.id, profile);
    this.emit('profile-created', profile);
    
    console.log(`💖 Profile created: ${profile.username}`);
    
    return profile;
  }

  /**
   * AI Matchmaking Algorithm
   */
  async findMatches(userId, limit = 10) {
    const user = this.users.get(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const potentialMatches = [];
    
    for (const [otherUserId, otherUser] of this.users) {
      if (otherUserId === userId) continue;
      if (otherUser.status !== 'active') continue;
      
      const compatibility = await this.calculateCompatibility(user, otherUser);
      
      if (compatibility.score > 50) {
        potentialMatches.push({
          user: otherUser,
          compatibility: compatibility
        });
      }
    }
    
    // Sort by compatibility score
    potentialMatches.sort((a, b) => b.compatibility.score - a.compatibility.score);
    
    // Return top matches
    return potentialMatches.slice(0, limit);
  }

  /**
   * Calculate compatibility score
   */
  async calculateCompatibility(user1, user2) {
    let score = 0;
    const factors = [];
    
    // Interest compatibility (40%)
    const interestMatch = this.calculateInterestMatch(user1, user2);
    score += interestMatch.score * 40;
    factors.push({ name: 'Interests', score: interestMatch.score, details: interestMatch.details });
    
    // Age preference (20%)
    const ageMatch = this.calculateAgeMatch(user1, user2);
    score += ageMatch.score * 20;
    factors.push({ name: 'Age', score: ageMatch.score });
    
    // Location proximity (15%)
    const locationMatch = this.calculateLocationMatch(user1, user2);
    score += locationMatch.score * 15;
    factors.push({ name: 'Location', score: locationMatch.score, distance: locationMatch.distance });
    
    // Lifestyle compatibility (15%)
    const lifestyleMatch = this.calculateLifestyleMatch(user1, user2);
    score += lifestyleMatch.score * 15;
    factors.push({ name: 'Lifestyle', score: lifestyleMatch.score });
    
    // Values alignment (10%)
    const valuesMatch = this.calculateValuesMatch(user1, user2);
    score += valuesMatch.score * 10;
    factors.push({ name: 'Values', score: valuesMatch.score });
    
    return {
      score: Math.min(100, Math.round(score)),
      factors: factors,
      recommendation: this.getRecommendation(score)
    };
  }

  /**
   * Calculate interest match
   */
  calculateInterestMatch(user1, user2) {
    const interests1 = new Set(user1.interests || []);
    const interests2 = new Set(user2.interests || []);
    
    const common = [...interests1].filter(i => interests2.has(i));
    const total = new Set([...interests1, ...interests2]);
    
    const score = total.size > 0 ? (common.length / total.size) * 100 : 0;
    
    return {
      score: score / 100,
      details: {
        commonInterests: common,
        commonCount: common.length,
        uniqueCount: total.size - common.length
      }
    };
  }

  /**
   * Calculate age match
   */
  calculateAgeMatch(user1, user2) {
    const age1 = user1.age || 25;
    const age2 = user2.age || 25;
    const ageDiff = Math.abs(age1 - age2);
    
    // Perfect match within 3 years
    if (ageDiff <= 3) return { score: 1 };
    // Good match within 5 years
    if (ageDiff <= 5) return { score: 0.8 };
    // Acceptable within 10 years
    if (ageDiff <= 10) return { score: 0.6 };
    // Still possible
    if (ageDiff <= 15) return { score: 0.4 };
    // Less likely
    return { score: 0.2 };
  }

  /**
   * Calculate location match
   */
  calculateLocationMatch(user1, user2) {
    if (!user1.location || !user2.location) {
      return { score: 0.5, distance: 'Unknown' };
    }
    
    // Simplified distance calculation (in production, use proper geospatial library)
    const lat1 = user1.location.latitude || 0;
    const lon1 = user1.location.longitude || 0;
    const lat2 = user2.location.latitude || 0;
    const lon2 = user2.location.longitude || 0;
    
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
    
    // Score based on distance preferences
    const maxDistance = Math.max(
      user1.preferences.distance || 50,
      user2.preferences.distance || 50
    );
    
    let score = 0;
    if (distance <= 10) score = 1;
    else if (distance <= 25) score = 0.8;
    else if (distance <= 50) score = 0.6;
    else if (distance <= maxDistance) score = 0.4;
    else score = 0.2;
    
    return {
      score,
      distance: `${distance.toFixed(1)} miles`
    };
  }

  /**
   * Calculate distance between two coordinates
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate lifestyle match
   */
  calculateLifestyleMatch(user1, user2) {
    const lifestyle1 = user1.lifestyle || {};
    const lifestyle2 = user2.lifestyle || {};
    
    let matches = 0;
    let total = 0;
    
    const factors = ['smoking', 'drinking', 'diet', 'exercise', 'sleep'];
    
    for (const factor of factors) {
      total++;
      if (lifestyle1[factor] === lifestyle2[factor]) {
        matches++;
      }
    }
    
    return {
      score: total > 0 ? matches / total : 0.5
    };
  }

  /**
   * Calculate values match
   */
  calculateValuesMatch(user1, user2) {
    const values1 = new Set(user1.values || []);
    const values2 = new Set(user2.values || []);
    
    const common = [...values1].filter(v => values2.has(v));
    const total = new Set([...values1, ...values2]);
    
    return {
      score: total.size > 0 ? common.length / total.size : 0.5
    };
  }

  /**
   * Get compatibility recommendation
   */
  getRecommendation(score) {
    if (score >= 90) return 'Excellent Match - Highly Compatible';
    if (score >= 80) return 'Great Match - Strong Potential';
    if (score >= 70) return 'Good Match - Worth Exploring';
    if (score >= 60) return 'Fair Match - Some Compatibility';
    if (score >= 50) return 'Possible Match - Could Work';
    return 'Low Match - Not Recommended';
  }

  /**
   * Send like
   */
  async sendLike(fromUserId, toUserId) {
    const fromUser = this.users.get(fromUserId);
    const toUser = this.users.get(toUserId);
    
    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }
    
    // Check if already liked
    if (fromUser.likesSent && fromUser.likesSent.includes(toUserId)) {
      throw new Error('Already liked this user');
    }
    
    // Record like
    if (!fromUser.likesSent) fromUser.likesSent = [];
    fromUser.likesSent.push(toUserId);
    fromUser.stats.likesSent++;
    
    if (!toUser.likesReceived) toUser.likesReceived = [];
    toUser.likesReceived.push(fromUserId);
    toUser.stats.likesReceived++;
    toUser.stats.profileViews++;
    
    this.emit('like-sent', { from: fromUserId, to: toUserId });
    
    // Check for mutual like (match)
    if (toUser.likesSent && toUser.likesSent.includes(fromUserId)) {
      return await this.createMatch(fromUserId, toUserId);
    }
    
    return { status: 'liked', mutual: false };
  }

  /**
   * Create match
   */
  async createMatch(userId1, userId2) {
    const matchId = this.generateMatchId();
    
    const match = {
      id: matchId,
      userId1: userId1,
      userId2: userId2,
      createdAt: Date.now(),
      status: 'active',
      compatibility: await this.calculateCompatibility(
        this.users.get(userId1),
        this.users.get(userId2)
      )
    };
    
    this.matches.set(matchId, match);
    
    // Update user stats
    const user1 = this.users.get(userId1);
    const user2 = this.users.get(userId2);
    user1.stats.matches++;
    user2.stats.matches++;
    
    this.emit('match-created', match);
    
    console.log(`💕 New match: ${user1.username} + ${user2.username}`);
    
    return match;
  }

  /**
   * Start conversation
   */
  async startConversation(matchId, initialMessage) {
    const match = this.matches.get(matchId);
    
    if (!match) {
      throw new Error('Match not found');
    }
    
    const conversationId = this.generateConversationId();
    
    const conversation = {
      id: conversationId,
      matchId: matchId,
      participants: [match.userId1, match.userId2],
      createdAt: Date.now(),
      lastActivity: Date.now(),
      status: 'active',
      messages: []
    };
    
    if (initialMessage) {
      await this.sendMessage(conversationId, initialMessage.from, initialMessage.content);
    }
    
    this.conversations.set(conversationId, conversation);
    
    // Update user stats
    const user1 = this.users.get(match.userId1);
    const user2 = this.users.get(match.userId2);
    user1.stats.conversations++;
    user2.stats.conversations++;
    
    this.emit('conversation-started', conversation);
    
    return conversation;
  }

  /**
   * Send message
   */
  async sendMessage(conversationId, fromUserId, content) {
    const conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      throw new Error('Conversation not found');
    }
    
    const message = {
      id: this.generateMessageId(),
      conversationId: conversationId,
      fromUserId: fromUserId,
      content: content,
      timestamp: Date.now(),
      read: false
    };
    
    conversation.messages.push(message);
    conversation.lastActivity = Date.now();
    
    this.emit('message-sent', message);
    
    return message;
  }

  /**
   * Create event
   */
  async createEvent(organizerId, eventData) {
    const event = {
      id: this.generateEventId(),
      organizerId: organizerId,
      title: eventData.title,
      description: eventData.description,
      location: eventData.location,
      dateTime: eventData.dateTime,
      capacity: eventData.capacity || 50,
      attendees: [organizerId],
      interests: eventData.interests || [],
      createdAt: Date.now(),
      status: 'upcoming'
    };
    
    this.events.set(event.id, event);
    this.emit('event-created', event);
    
    console.log(`🎉 Event created: ${event.title}`);
    
    return event;
  }

  /**
   * Join event
   */
  async joinEvent(eventId, userId) {
    const event = this.events.get(eventId);
    
    if (!event) {
      throw new Error('Event not found');
    }
    
    if (event.attendees.includes(userId)) {
      throw new Error('Already attending this event');
    }
    
    if (event.attendees.length >= event.capacity) {
      throw new Error('Event is full');
    }
    
    event.attendees.push(userId);
    this.emit('event-joined', { eventId, userId });
    
    return event;
  }

  /**
   * Get nearby events
   */
  async getNearbyEvents(userId, radius = 25) {
    const user = this.users.get(userId);
    if (!user || !user.location) {
      return [];
    }
    
    const nearbyEvents = [];
    
    for (const [eventId, event] of this.events) {
      if (event.status !== 'upcoming') continue;
      
      const distance = this.calculateDistance(
        user.location.latitude,
        user.location.longitude,
        event.location.latitude,
        event.location.longitude
      );
      
      if (distance <= radius) {
        nearbyEvents.push({
          ...event,
          distance: `${distance.toFixed(1)} miles`
        });
      }
    }
    
    return nearbyEvents.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  /**
   * Load preferences database
   */
  async loadPreferencesDatabase() {
    // Simulated database load
    console.log('📊 Loading preferences database...');
  }

  /**
   * Load interest categories
   */
  async loadInterestCategories() {
    // Simulated interest categories
    this.interestCategories = [
      'Music', 'Movies', 'Travel', 'Food', 'Fitness',
      'Art', 'Reading', 'Gaming', 'Sports', 'Technology',
      'Photography', 'Dancing', 'Cooking', 'Hiking', 'Yoga'
    ];
  }

  /**
   * Get user profile
   */
  getProfile(userId) {
    return this.users.get(userId);
  }

  /**
   * Update profile
   */
  async updateProfile(userId, updates) {
    const user = this.users.get(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    Object.assign(user, updates);
    this.emit('profile-updated', user);
    
    return user;
  }

  /**
   * Get matches
   */
  getMatches(userId) {
    const matches = [];
    
    for (const [matchId, match] of this.matches) {
      if (match.userId1 === userId || match.userId2 === userId) {
        matches.push(match);
      }
    }
    
    return matches;
  }

  /**
   * Get conversations
   */
  getConversations(userId) {
    const conversations = [];
    
    for (const [conversationId, conversation] of this.conversations) {
      if (conversation.participants.includes(userId)) {
        conversations.push(conversation);
      }
    }
    
    return conversations.sort((a, b) => b.lastActivity - a.lastActivity);
  }

  /**
   * Generate unique IDs
   */
  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMatchId() {
    return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export for use in app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DatingAppCore;
}