const { query } = require('../config/database');

class Favorite {
    static async findByUser(userId) {
        const sql = `
      SELECT f.*, fav.id as favorite_id, fav.created_at as favorite_date
      FROM favorites fav
      JOIN foods f ON fav.food_id = f.id
      WHERE fav.user_id = ?
      ORDER BY fav.created_at DESC
    `;

        return await query(sql, [userId]);
    }

    static async isFavorite(userId, foodId) {
        const result = await query(
            'SELECT * FROM favorites WHERE user_id = ? AND food_id = ?',
            [userId, foodId]
        );

        return result.length > 0;
    }

    static async add(userId, foodId) {
        try {
            const result = await query(
                'INSERT INTO favorites (user_id, food_id) VALUES (?, ?)',
                [userId, foodId]
            );

            return result.insertId;
        } catch (error) {
            // 可能会因为唯一键约束导致错误（用户已经收藏过该美食）
            if (error.code === 'ER_DUP_ENTRY') {
                return null;
            }
            throw error;
        }
    }

    static async remove(userId, foodId) {
        const result = await query(
            'DELETE FROM favorites WHERE user_id = ? AND food_id = ?',
            [userId, foodId]
        );

        return result.affectedRows > 0;
    }

    // 获取最受欢迎的美食（收藏数最多的）
    static async getMostFavorites(limit = 10) {
        const sql = `
      SELECT f.*, COUNT(fav.id) as favorite_count
      FROM foods f
      JOIN favorites fav ON f.id = fav.food_id
      GROUP BY f.id
      ORDER BY favorite_count DESC
      LIMIT ?
    `;

        return await query(sql, [limit]);
    }
}

module.exports = Favorite; 