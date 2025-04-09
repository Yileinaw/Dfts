const { query } = require('../config/database');

class ViewHistory {
    // 记录用户浏览食物的历史
    static async recordView(userId, foodId) {
        const sql = `
            INSERT INTO view_history (user_id, food_id, view_count)
            VALUES (?, ?, 1)
            ON DUPLICATE KEY UPDATE 
                view_count = view_count + 1,
                last_viewed = CURRENT_TIMESTAMP
        `;

        const result = await query(sql, [userId, foodId]);
        return result.affectedRows > 0;
    }

    // 获取用户的浏览历史
    static async getUserViewHistory(userId, limit = 20) {
        const sql = `
            SELECT vh.*, f.name, f.image, f.description, c.name as category_name
            FROM view_history vh
            JOIN foods f ON vh.food_id = f.id
            JOIN categories c ON f.category_id = c.id
            WHERE vh.user_id = ?
            ORDER BY vh.last_viewed DESC
            LIMIT ?
        `;

        return await query(sql, [userId, limit]);
    }

    // 获取人气食物（被浏览最多的）
    static async getMostViewedFoods(limit = 10) {
        const sql = `
            SELECT f.*, c.name as category_name, 
                   SUM(vh.view_count) as total_views
            FROM foods f
            JOIN categories c ON f.category_id = c.id
            LEFT JOIN view_history vh ON f.id = vh.food_id
            GROUP BY f.id
            ORDER BY total_views DESC
            LIMIT ?
        `;

        return await query(sql, [limit]);
    }

    // 删除用户的浏览历史
    static async deleteUserViewHistory(userId) {
        const sql = 'DELETE FROM view_history WHERE user_id = ?';
        const result = await query(sql, [userId]);
        return result.affectedRows > 0;
    }
}

module.exports = ViewHistory; 