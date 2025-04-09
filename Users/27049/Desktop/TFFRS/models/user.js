const { query } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
    static async findByUsername(username) {
        const users = await query('SELECT * FROM users WHERE username = ?', [username]);
        return users.length ? users[0] : null;
    }

    static async findById(id) {
        const users = await query('SELECT * FROM users WHERE id = ?', [id]);
        return users.length ? users[0] : null;
    }

    static async create(userData) {
        // 密码加密
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

        const result = await query(
            'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
            [userData.username, hashedPassword, userData.email]
        );

        return result.insertId;
    }

    static async update(id, userData) {
        // 注意：这里不更新密码，密码更新应该单独处理
        const result = await query(
            'UPDATE users SET username = ?, email = ?, avatar = ? WHERE id = ?',
            [userData.username, userData.email, userData.avatar, id]
        );

        return result.affectedRows > 0;
    }

    static async updatePassword(id, newPassword) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        const result = await query(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, id]
        );

        return result.affectedRows > 0;
    }

    static async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User; 