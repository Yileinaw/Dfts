const { query } = require('../config/database');

class Rating {
    static async findByFood(foodId) {
        const sql = `
      SELECT r.*, u.username, u.avatar
      FROM ratings r
      JOIN users u ON r.user_id = u.id
      WHERE r.food_id = ?
      ORDER BY r.created_at DESC
    `;

        return await query(sql, [foodId]);
    }

    static async findByUser(userId) {
        const sql = `
      SELECT r.*, f.name as food_name, f.image as food_image
      FROM ratings r
      JOIN foods f ON r.food_id = f.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `;

        return await query(sql, [userId]);
    }

    static async findUserRating(userId, foodId) {
        const result = await query(
            'SELECT * FROM ratings WHERE user_id = ? AND food_id = ?',
            [userId, foodId]
        );

        return result.length ? result[0] : null;
    }

    static async getAverageRating(foodId) {
        const result = await query(
            'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM ratings WHERE food_id = ?',
            [foodId]
        );

        return {
            average: result[0].avg_rating || 0,
            count: result[0].count || 0
        };
    }

    static async create(ratingData) {
        try {
            const result = await query(
                'INSERT INTO ratings (user_id, food_id, rating, comment) VALUES (?, ?, ?, ?)',
                [
                    ratingData.user_id,
                    ratingData.food_id,
                    ratingData.rating,
                    ratingData.comment || ''
                ]
            );

            return result.insertId;
        } catch (error) {
            // 可能会因为唯一键约束导致错误（用户已经评价过该美食）
            if (error.code === 'ER_DUP_ENTRY') {
                return null;
            }
            throw error;
        }
    }

    static async update(userId, foodId, ratingData) {
        const result = await query(
            'UPDATE ratings SET rating = ?, comment = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ? AND food_id = ?',
            [
                ratingData.rating,
                ratingData.comment || '',
                userId,
                foodId
            ]
        );

        return result.affectedRows > 0;
    }

    static async delete(userId, foodId) {
        const result = await query(
            'DELETE FROM ratings WHERE user_id = ? AND food_id = ?',
            [userId, foodId]
        );

        return result.affectedRows > 0;
    }

    // 获取评分最高的美食
    static async getTopRated(limit = 10) {
        const sql = `
      SELECT f.*, AVG(r.rating) as avg_rating, COUNT(r.id) as rating_count
      FROM foods f
      JOIN ratings r ON f.id = r.food_id
      GROUP BY f.id
      HAVING rating_count >= 1
      ORDER BY avg_rating DESC, rating_count DESC
      LIMIT ?
    `;

        return await query(sql, [limit]);
    }
}

module.exports = Rating; 