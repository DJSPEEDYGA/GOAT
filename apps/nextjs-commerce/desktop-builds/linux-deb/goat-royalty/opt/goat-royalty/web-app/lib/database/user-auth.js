/**
 * SUPER GOAT ROYALTIES - User Authentication Module
 * Local authentication with password hashing and session management
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { dbAsync } = require('./database');

// JWT Secret (should be in environment)
const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES_IN = '7d';
const SALT_ROUNDS = 12;

/**
 * Initialize user tables
 */
async function initializeUserTables() {
    // Users table
    await dbAsync.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            display_name TEXT,
            avatar TEXT,
            role TEXT DEFAULT 'user',
            email_verified INTEGER DEFAULT 0,
            verification_token TEXT,
            reset_token TEXT,
            reset_token_expires DATETIME,
            last_login DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Sessions table (for refresh tokens)
    await dbAsync.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token_hash TEXT NOT NULL,
            user_agent TEXT,
            ip_address TEXT,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // API Keys table
    await dbAsync.run(`
        CREATE TABLE IF NOT EXISTS api_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            key_hash TEXT NOT NULL,
            name TEXT,
            permissions TEXT,
            last_used DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    // Audit log table
    await dbAsync.run(`
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            details TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ User authentication tables initialized');
}

/**
 * User Authentication Class
 */
class UserAuth {
    /**
     * Register a new user
     */
    async register(email, username, password, displayName = null) {
        try {
            // Check if user exists
            const existing = await dbAsync.get(
                `SELECT id FROM users WHERE email = ? OR username = ?`,
                [email, username]
            );
            
            if (existing) {
                return { success: false, error: 'Email or username already exists' };
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

            // Generate verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');

            // Insert user
            const result = await dbAsync.run(
                `INSERT INTO users (email, username, password_hash, display_name, verification_token)
                 VALUES (?, ?, ?, ?, ?)`,
                [email, username, passwordHash, displayName || username, verificationToken]
            );

            return {
                success: true,
                userId: result.id,
                verificationToken // In production, send via email
            };
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Registration failed' };
        }
    }

    /**
     * Login user
     */
    async login(emailOrUsername, password, userAgent = '', ipAddress = '') {
        try {
            // Find user
            const user = await dbAsync.get(
                `SELECT * FROM users WHERE email = ? OR username = ?`,
                [emailOrUsername, emailOrUsername]
            );

            if (!user) {
                return { success: false, error: 'Invalid credentials' };
            }

            // Verify password
            const validPassword = await bcrypt.compare(password, user.password_hash);
            if (!validPassword) {
                return { success: false, error: 'Invalid credentials' };
            }

            // Generate JWT
            const token = jwt.sign(
                { userId: user.id, email: user.email, role: user.role },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            // Update last login
            await dbAsync.run(
                `UPDATE users SET last_login = ? WHERE id = ?`,
                [new Date().toISOString(), user.id]
            );

            // Log audit
            await this.auditLog(user.id, 'LOGIN', { ip: ipAddress, userAgent });

            return {
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    displayName: user.display_name,
                    avatar: user.avatar,
                    role: user.role
                }
            };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Login failed' };
        }
    }

    /**
     * Verify JWT token
     */
    verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    }

    /**
     * Get user by ID
     */
    async getUser(userId) {
        const user = await dbAsync.get(
            `SELECT id, email, username, display_name, avatar, role, created_at FROM users WHERE id = ?`,
            [userId]
        );
        return user;
    }

    /**
     * Update user profile
     */
    async updateProfile(userId, updates) {
        const allowedFields = ['display_name', 'avatar'];
        const fields = [];
        const values = [];

        for (const field of allowedFields) {
            if (updates[field] !== undefined) {
                fields.push(`${field} = ?`);
                values.push(updates[field]);
            }
        }

        if (fields.length === 0) {
            return { success: false, error: 'No valid fields to update' };
        }

        values.push(new Date().toISOString(), userId);
        await dbAsync.run(
            `UPDATE users SET ${fields.join(', ')}, updated_at = ? WHERE id = ?`,
            values
        );

        return { success: true };
    }

    /**
     * Change password
     */
    async changePassword(userId, currentPassword, newPassword) {
        const user = await dbAsync.get(
            `SELECT password_hash FROM users WHERE id = ?`,
            [userId]
        );

        if (!user) {
            return { success: false, error: 'User not found' };
        }

        const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!validPassword) {
            return { success: false, error: 'Current password is incorrect' };
        }

        const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await dbAsync.run(
            `UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`,
            [newPasswordHash, new Date().toISOString(), userId]
        );

        await this.auditLog(userId, 'PASSWORD_CHANGE', {});
        return { success: true };
    }

    /**
     * Request password reset
     */
    async requestPasswordReset(email) {
        const user = await dbAsync.get(`SELECT id FROM users WHERE email = ?`, [email]);
        
        if (!user) {
            // Don't reveal if email exists
            return { success: true };
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

        await dbAsync.run(
            `UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?`,
            [resetToken, resetExpires, user.id]
        );

        // In production, send email with reset link
        return { success: true, resetToken };
    }

    /**
     * Reset password with token
     */
    async resetPassword(token, newPassword) {
        const user = await dbAsync.get(
            `SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > ?`,
            [token, new Date().toISOString()]
        );

        if (!user) {
            return { success: false, error: 'Invalid or expired reset token' };
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await dbAsync.run(
            `UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?`,
            [passwordHash, user.id]
        );

        await this.auditLog(user.id, 'PASSWORD_RESET', {});
        return { success: true };
    }

    /**
     * Generate API key for user
     */
    async generateApiKey(userId, name = 'Default', permissions = ['read']) {
        const apiKey = `goat_${crypto.randomBytes(32).toString('hex')}`;
        const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

        await dbAsync.run(
            `INSERT INTO api_keys (user_id, key_hash, name, permissions) VALUES (?, ?, ?, ?)`,
            [userId, keyHash, name, JSON.stringify(permissions)]
        );

        return { success: true, apiKey }; // Return full key only once!
    }

    /**
     * Verify API key
     */
    async verifyApiKey(apiKey) {
        const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
        
        const keyRecord = await dbAsync.get(
            `SELECT k.*, u.email, u.username, u.role FROM api_keys k 
             JOIN users u ON k.user_id = u.id 
             WHERE k.key_hash = ?`,
            [keyHash]
        );

        if (!keyRecord) {
            return null;
        }

        // Update last used
        await dbAsync.run(
            `UPDATE api_keys SET last_used = ? WHERE id = ?`,
            [new Date().toISOString(), keyRecord.id]
        );

        return {
            userId: keyRecord.user_id,
            email: keyRecord.email,
            username: keyRecord.username,
            role: keyRecord.role,
            permissions: JSON.parse(keyRecord.permissions || '[]')
        };
    }

    /**
     * Log audit event
     */
    async auditLog(userId, action, details, ipAddress = '', userAgent = '') {
        await dbAsync.run(
            `INSERT INTO audit_log (user_id, action, details, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)`,
            [userId, action, JSON.stringify(details), ipAddress, userAgent]
        );
    }

    /**
     * Get user's audit log
     */
    async getAuditLog(userId, limit = 50) {
        return dbAsync.all(
            `SELECT * FROM audit_log WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
            [userId, limit]
        );
    }

    /**
     * Delete user (soft delete by setting role to 'deleted')
     */
    async deleteUser(userId) {
        await dbAsync.run(
            `UPDATE users SET role = 'deleted', updated_at = ? WHERE id = ?`,
            [new Date().toISOString(), userId]
        );
        await this.auditLog(userId, 'ACCOUNT_DELETED', {});
        return { success: true };
    }
}

// Initialize tables on load
initializeUserTables().catch(console.error);

module.exports = new UserAuth();