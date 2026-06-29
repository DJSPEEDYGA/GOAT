/**
 * GOAT Royalty - Real-time Data Hooks
 * WebSocket and real-time data synchronization
 * Compatible with Supabase Realtime, Socket.io, or native WebSockets
 */

const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');

// ==================== REAL-TIME MANAGER ====================

class GoatRealtime {
    constructor(httpServer, supabaseConfig) {
        this.io = new Server(httpServer, {
            cors: {
                origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
                methods: ['GET', 'POST'],
                credentials: true
            }
        });

        this.supabase = createClient(
            supabaseConfig.url,
            supabaseConfig.serviceKey // Use service key for server-side
        );

        this.userSockets = new Map(); // userId -> Set of socketIds
        this.channelSubscriptions = new Map(); // channelName -> Set of userIds
        
        this.setupMiddleware();
        this.setupEventHandlers();
        this.setupSupabaseChannels();
    }

    // ==================== AUTHENTICATION MIDDLEWARE ====================

    setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || 
                              socket.handshake.headers.authorization?.replace('Bearer ', '');
                
                if (!token) {
                    return next(new Error('Authentication required'));
                }

                // Verify with Supabase
                const { data: { user }, error } = await this.supabase.auth.getUser(token);
                
                if (error || !user) {
                    return next(new Error('Invalid token'));
                }

                // Attach user to socket
                socket.userId = user.id;
                socket.user = user;
                
                next();
            } catch (error) {
                next(new Error('Authentication failed'));
            }
        });
    }

    // ==================== EVENT HANDLERS ====================

    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`User ${socket.userId} connected: ${socket.id}`);
            
            // Track user sockets
            if (!this.userSockets.has(socket.userId)) {
                this.userSockets.set(socket.userId, new Set());
            }
            this.userSockets.get(socket.userId).add(socket.id);

            // Join user's personal room
            socket.join(`user:${socket.userId}`);

            // ==================== SOCIAL MEDIA EVENTS ====================
            
            socket.on('social:sync', async (data) => {
                try {
                    const { platform } = data;
                    socket.emit('social:sync:start', { platform });
                    
                    // Trigger sync (would call sync service)
                    // const result = await this.syncSocialAccount(socket.userId, platform);
                    
                    socket.emit('social:sync:complete', { 
                        platform,
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    socket.emit('social:sync:error', { error: error.message });
                }
            });

            socket.on('social:analytics', async (data) => {
                try {
                    const { platform, dateRange } = data;
                    
                    // Fetch analytics from database
                    const { data: analytics, error } = await this.supabase
                        .from('analytics_snapshots')
                        .select('*')
                        .eq('user_id', socket.userId)
                        .eq('platform', platform)
                        .order('snapshot_date', { ascending: false })
                        .limit(30);
                    
                    socket.emit('social:analytics:data', { platform, analytics });
                } catch (error) {
                    socket.emit('social:analytics:error', { error: error.message });
                }
            });

            // ==================== POST SCHEDULING ====================

            socket.on('post:create', async (data) => {
                try {
                    const { content, platforms, scheduledFor, mediaUrls } = data;
                    
                    const { data: post, error } = await this.supabase
                        .from('scheduled_posts')
                        .insert({
                            user_id: socket.userId,
                            content,
                            platforms,
                            scheduled_for: scheduledFor,
                            media_urls: mediaUrls,
                            status: 'scheduled'
                        })
                        .select()
                        .single();
                    
                    if (error) throw error;
                    
                    socket.emit('post:created', post);
                    this.notifyUser(socket.userId, 'post:scheduled', {
                        message: `Post scheduled for ${new Date(scheduledFor).toLocaleString()}`,
                        postId: post.id
                    });
                } catch (error) {
                    socket.emit('post:error', { error: error.message });
                }
            });

            socket.on('post:update', async (data) => {
                try {
                    const { postId, updates } = data;
                    
                    const { data: post, error } = await this.supabase
                        .from('scheduled_posts')
                        .update(updates)
                        .eq('id', postId)
                        .eq('user_id', socket.userId)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    
                    socket.emit('post:updated', post);
                } catch (error) {
                    socket.emit('post:error', { error: error.message });
                }
            });

            // ==================== BRAND DEALS ====================

            socket.on('deal:update', async (data) => {
                try {
                    const { dealId, updates } = data;
                    
                    const { data: deal, error } = await this.supabase
                        .from('brand_deals')
                        .update(updates)
                        .eq('id', dealId)
                        .eq('user_id', socket.userId)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    
                    socket.emit('deal:updated', deal);
                    
                    // Notify of status changes
                    if (updates.status) {
                        this.notifyUser(socket.userId, 'deal:status', {
                            dealId,
                            status: updates.status,
                            message: `Deal "${deal.deal_title}" moved to ${updates.status}`
                        });
                    }
                } catch (error) {
                    socket.emit('deal:error', { error: error.message });
                }
            });

            // ==================== TOUR/EVENTS ====================

            socket.on('event:create', async (data) => {
                try {
                    const { data: event, error } = await this.supabase
                        .from('tour_events')
                        .insert({
                            user_id: socket.userId,
                            ...data
                        })
                        .select()
                        .single();
                    
                    if (error) throw error;
                    
                    socket.emit('event:created', event);
                } catch (error) {
                    socket.emit('event:error', { error: error.message });
                }
            });

            socket.on('event:reminder', async (data) => {
                const { eventId, reminderMinutes } = data;
                
                // Store reminder preference
                const { error } = await this.supabase
                    .from('tour_events')
                    .update({ 
                        reminder_minutes: reminderMinutes,
                        reminder_set: true
                    })
                    .eq('id', eventId)
                    .eq('user_id', socket.userId);
                
                socket.emit('event:reminder:set', { eventId, reminderMinutes });
            });

            // ==================== MERCH STORE ====================

            socket.on('order:update', async (data) => {
                try {
                    const { orderId, status, trackingNumber, trackingUrl } = data;
                    
                    const { data: order, error } = await this.supabase
                        .from('orders')
                        .update({
                            fulfillment_status: status,
                            tracking_number: trackingNumber,
                            tracking_url: trackingUrl,
                            ...(status === 'shipped' && { shipped_at: new Date().toISOString() }),
                            ...(status === 'delivered' && { delivered_at: new Date().toISOString() })
                        })
                        .eq('id', orderId)
                        .eq('user_id', socket.userId)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    
                    socket.emit('order:updated', order);
                } catch (error) {
                    socket.emit('order:error', { error: error.message });
                }
            });

            // ==================== ANALYTICS ====================

            socket.on('analytics:subscribe', async (data) => {
                const { platforms } = data;
                
                // Subscribe to real-time analytics updates
                for (const platform of platforms) {
                    socket.join(`analytics:${socket.userId}:${platform}`);
                }
                
                socket.emit('analytics:subscribed', { platforms });
            });

            socket.on('analytics:unsubscribe', (data) => {
                const { platforms } = data;
                
                for (const platform of platforms) {
                    socket.leave(`analytics:${socket.userId}:${platform}`);
                }
            });

            // ==================== COLLABORATION ====================

            socket.on('room:join', (data) => {
                const { roomId } = data;
                socket.join(`room:${roomId}`);
                socket.emit('room:joined', { roomId });
                socket.to(`room:${roomId}`).emit('user:joined', { 
                    userId: socket.userId,
                    timestamp: new Date().toISOString()
                });
            });

            socket.on('room:leave', (data) => {
                const { roomId } = data;
                socket.leave(`room:${roomId}`);
                socket.to(`room:${roomId}`).emit('user:left', { userId: socket.userId });
            });

            socket.on('room:broadcast', (data) => {
                const { roomId, event, payload } = data;
                socket.to(`room:${roomId}`).emit(event, {
                    from: socket.userId,
                    ...payload
                });
            });

            // ==================== PRESENCE ====================

            socket.on('presence:update', async (data) => {
                const { status, currentTask } = data;
                
                await this.supabase
                    .from('users')
                    .update({
                        presence_status: status,
                        presence_task: currentTask,
                        last_active_at: new Date().toISOString()
                    })
                    .eq('id', socket.userId);
                
                // Broadcast to relevant rooms
                socket.broadcast.emit('presence:changed', {
                    userId: socket.userId,
                    status,
                    currentTask
                });
            });

            // ==================== NOTIFICATIONS ====================

            socket.on('notification:mark_read', async (data) => {
                const { notificationIds } = data;
                
                await this.supabase
                    .from('notifications')
                    .update({ 
                        is_read: true, 
                        read_at: new Date().toISOString() 
                    })
                    .in('id', notificationIds)
                    .eq('user_id', socket.userId);
                
                socket.emit('notification:updated', { notificationIds });
            });

            // ==================== DISCONNECT ====================

            socket.on('disconnect', () => {
                console.log(`User ${socket.userId} disconnected: ${socket.id}`);
                
                // Remove from userSockets
                const userSocketSet = this.userSockets.get(socket.userId);
                if (userSocketSet) {
                    userSocketSet.delete(socket.id);
                    if (userSocketSet.size === 0) {
                        this.userSockets.delete(socket.userId);
                    }
                }
            });
        });
    }

    // ==================== SUPABASE REALTIME CHANNELS ====================

    setupSupabaseChannels() {
        // Listen for database changes and broadcast to users
        
        // User changes
        this.supabase
            .channel('users-changes')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'users'
            }, (payload) => {
                const { new: newUser } = payload;
                this.io.to(`user:${newUser.id}`).emit('user:updated', newUser);
            })
            .subscribe();

        // Scheduled posts changes
        this.supabase
            .channel('posts-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'scheduled_posts'
            }, (payload) => {
                const { eventType, new: newRecord, old: oldRecord } = payload;
                const record = newRecord || oldRecord;
                this.io.to(`user:${record.user_id}`).emit(`post:${eventType.toLowerCase()}`, record);
            })
            .subscribe();

        // Brand deals changes
        this.supabase
            .channel('deals-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'brand_deals'
            }, (payload) => {
                const { eventType, new: newRecord, old: oldRecord } = payload;
                const record = newRecord || oldRecord;
                this.io.to(`user:${record.user_id}`).emit(`deal:${eventType.toLowerCase()}`, record);
            })
            .subscribe();

        // Orders changes
        this.supabase
            .channel('orders-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders'
            }, (payload) => {
                const { eventType, new: newRecord, old: oldRecord } = payload;
                const record = newRecord || oldRecord;
                if (record.user_id) {
                    this.io.to(`user:${record.user_id}`).emit(`order:${eventType.toLowerCase()}`, record);
                }
            })
            .subscribe();

        // Notifications changes
        this.supabase
            .channel('notifications-changes')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications'
            }, (payload) => {
                const { new: notification } = payload;
                this.io.to(`user:${notification.user_id}`).emit('notification:new', notification);
            })
            .subscribe();
    }

    // ==================== UTILITY METHODS ====================

    notifyUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
    }

    notifyUsers(userIds, event, data) {
        for (const userId of userIds) {
            this.notifyUser(userId, event, data);
        }
    }

    broadcastToRoom(roomId, event, data) {
        this.io.to(`room:${roomId}`).emit(event, data);
    }

    isUserOnline(userId) {
        return this.userSockets.has(userId) && this.userSockets.get(userId).size > 0;
    }

    getUserSocketCount(userId) {
        return this.userSockets.get(userId)?.size || 0;
    }

    getOnlineUserCount() {
        return this.userSockets.size;
    }

    // ==================== ANALYTICS BROADCAST ====================

    async broadcastAnalyticsUpdate(userId, platform, data) {
        this.io.to(`analytics:${userId}:${platform}`).emit('analytics:update', {
            platform,
            data,
            timestamp: new Date().toISOString()
        });
    }

    // ==================== EXTERNAL INTEGRATIONS ====================

    // For webhook handlers to send notifications
    async handleStripeWebhook(event) {
        const customerId = event.data.object.customer;
        
        // Find user by Stripe customer ID
        const { data: user } = await this.supabase
            .from('users')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single();
        
        if (user) {
            switch (event.type) {
                case 'customer.subscription.created':
                    this.notifyUser(user.id, 'subscription:created', {
                        message: 'Your GOAT Royalty subscription is now active!'
                    });
                    break;
                case 'invoice.payment_failed':
                    this.notifyUser(user.id, 'subscription:payment_failed', {
                        message: 'Payment failed. Please update your payment method.'
                    });
                    break;
            }
        }
    }

    async handleSocialWebhook(platform, data) {
        // Handle real-time updates from social platforms
        // e.g., new comment, mention, follower milestone
        console.log(`Received ${platform} webhook:`, data);
    }
}

// ==================== EXPRESS INTEGRATION ====================

function setupRealtime(app, httpServer, supabaseConfig) {
    const realtime = new GoatRealtime(httpServer, supabaseConfig);
    
    // Make accessible via app
    app.locals.realtime = realtime;
    
    // Health check endpoint
    app.get('/api/realtime/health', (req, res) => {
        res.json({
            status: 'ok',
            connectedUsers: realtime.getOnlineUserCount()
        });
    });

    return realtime;
}

// ==================== CLIENT-SIDE HOOK (REACT) ====================

const useGoatRealtime = `
import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export function useGoatRealtime(token) {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        if (!token) return;

        const newSocket = io(process.env.NEXT_PUBLIC_WS_URL || '', {
            auth: { token },
            transports: ['websocket']
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to GOAT Realtime');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from GOAT Realtime');
        });

        newSocket.onAny((event, ...args) => {
            setEvents(prev => [...prev.slice(-99), { event, args, timestamp: Date.now() }]);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, [token]);

    const subscribe = useCallback((event, callback) => {
        if (!socket) return () => {};
        socket.on(event, callback);
        return () => socket.off(event, callback);
    }, [socket]);

    const emit = useCallback((event, data) => {
        if (socket) socket.emit(event, data);
    }, [socket]);

    return { socket, isConnected, events, subscribe, emit };
}

// Hook for specific features
export function usePostScheduler(token) {
    const { emit, subscribe } = useGoatRealtime(token);
    const [posts, setPosts] = useState([]);

    const createPost = useCallback((postData) => {
        emit('post:create', postData);
    }, [emit]);

    const updatePost = useCallback((postId, updates) => {
        emit('post:update', { postId, updates });
    }, [emit]);

    useEffect(() => {
        const unsubCreated = subscribe('post:created', (post) => {
            setPosts(prev => [...prev, post]);
        });

        const unsubUpdated = subscribe('post:updated', (post) => {
            setPosts(prev => prev.map(p => p.id === post.id ? post : p));
        });

        return () => {
            unsubCreated();
            unsubUpdated();
        };
    }, [subscribe]);

    return { posts, createPost, updatePost };
}

export function useNotifications(token) {
    const { subscribe } = useGoatRealtime(token);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const unsub = subscribe('notification:new', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            if (!notification.is_read) {
                setUnreadCount(prev => prev + 1);
            }
        });

        return unsub;
    }, [subscribe]);

    const markRead = useCallback((ids) => {
        emit('notification:mark_read', { notificationIds: ids });
        setNotifications(prev => 
            prev.map(n => ids.includes(n.id) ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - ids.length));
    }, [emit]);

    return { notifications, unreadCount, markRead };
}
`;

// ==================== EXPORTS ====================

module.exports = {
    GoatRealtime,
    setupRealtime,
    useGoatRealtime
};