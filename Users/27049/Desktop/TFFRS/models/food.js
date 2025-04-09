const { query } = require('../config/database');

class Food {
    static async findAll(options = {}) {
        let sql = `
            SELECT f.*, c.name as category_name 
            FROM foods f
            JOIN categories c ON f.category_id = c.id
        `;
        const params = [];

        // 条件子句数组
        const whereConditions = [];

        // 添加分类过滤
        if (options.category_id) {
            whereConditions.push('f.category_id = ?');
            params.push(options.category_id);
        }

        // 添加难度过滤
        if (options.difficulty) {
            whereConditions.push('f.difficulty = ?');
            params.push(options.difficulty);
        }

        // 添加标签过滤
        if (options.tag) {
            whereConditions.push('f.tags LIKE ?');
            params.push(`%${options.tag}%`);
        }

        // 组合WHERE子句
        if (whereConditions.length > 0) {
            sql += ' WHERE ' + whereConditions.join(' AND ');
        }

        // 添加排序
        if (options.sort) {
            const sortField =
                options.sort === 'name' ? 'f.name' :
                    options.sort === 'calories' ? 'f.calories' :
                        options.sort === 'prep_time' ? 'f.prep_time' :
                            options.sort === 'rating' ? 'avg_rating' : 'f.id';
            const sortOrder = options.order === 'desc' ? 'DESC' : 'ASC';
            sql += ` ORDER BY ${sortField} ${sortOrder}`;
        } else {
            sql += ' ORDER BY f.id DESC';  // 默认按ID倒序排列（最新添加的排在前面）
        }

        // 添加分页
        if (options.limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(options.limit));

            if (options.offset) {
                sql += ' OFFSET ?';
                params.push(parseInt(options.offset));
            }
        }

        return await query(sql, params);
    }

    static async findById(id) {
        const sql = `
            SELECT f.*, c.name as category_name 
            FROM foods f
            JOIN categories c ON f.category_id = c.id
            WHERE f.id = ?
        `;
        const foods = await query(sql, [id]);
        return foods.length ? foods[0] : null;
    }

    static async search(keyword) {
        const sql = `
            SELECT f.*, c.name as category_name 
            FROM foods f
            JOIN categories c ON f.category_id = c.id
            WHERE f.name LIKE ? 
            OR f.description LIKE ? 
            OR f.tags LIKE ? 
            OR c.name LIKE ?
        `;
        const searchTerm = `%${keyword}%`;
        return await query(sql, [searchTerm, searchTerm, searchTerm, searchTerm]);
    }

    static async getCategories() {
        return await query('SELECT * FROM categories ORDER BY name');
    }

    static async create(foodData) {
        const result = await query(
            `INSERT INTO foods (
                name, description, category_id, image, 
                ingredients, cooking_method, calories, 
                prep_time, difficulty, tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                foodData.name,
                foodData.description,
                foodData.category_id,
                foodData.image,
                foodData.ingredients,
                foodData.cooking_method,
                foodData.calories,
                foodData.prep_time,
                foodData.difficulty || '中等',
                foodData.tags
            ]
        );

        return result.insertId;
    }

    static async update(id, foodData) {
        const result = await query(
            `UPDATE foods SET 
                name = ?, 
                description = ?, 
                category_id = ?, 
                image = ?, 
                ingredients = ?, 
                cooking_method = ?, 
                calories = ?, 
                prep_time = ?,
                difficulty = ?,
                tags = ?
            WHERE id = ?`,
            [
                foodData.name,
                foodData.description,
                foodData.category_id,
                foodData.image,
                foodData.ingredients,
                foodData.cooking_method,
                foodData.calories,
                foodData.prep_time,
                foodData.difficulty || '中等',
                foodData.tags,
                id
            ]
        );

        return result.affectedRows > 0;
    }

    static async delete(id) {
        const result = await query('DELETE FROM foods WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // 获取带有评分信息的美食列表（用于推荐系统）
    static async getFoodsWithRatings() {
        const sql = `
            SELECT f.*, 
                c.name as category_name,
                IFNULL(AVG(r.rating), 0) as avg_rating, 
                COUNT(r.id) as rating_count 
            FROM foods f
            JOIN categories c ON f.category_id = c.id
            LEFT JOIN ratings r ON f.id = r.food_id
            GROUP BY f.id
            ORDER BY avg_rating DESC, rating_count DESC
        `;

        return await query(sql);
    }

    // 根据用户历史行为推荐美食
    static async getRecommendedFoods(userId, limit = 10) {
        // 基于用户评分、收藏和浏览历史的综合推荐
        const sql = `
            SELECT f.*, 
                c.name as category_name,
                IFNULL(AVG(r.rating), 0) as avg_rating,
                COUNT(DISTINCT r.id) as rating_count,
                COUNT(DISTINCT fav.id) as favorite_count,
                MAX(CASE WHEN r2.user_id = ? THEN r2.rating ELSE 0 END) as user_rating,
                MAX(CASE WHEN fav2.user_id = ? THEN 1 ELSE 0 END) as user_favorite,
                MAX(CASE WHEN vh.user_id = ? THEN vh.view_count ELSE 0 END) as user_views
            FROM foods f
            JOIN categories c ON f.category_id = c.id
            LEFT JOIN ratings r ON f.id = r.food_id
            LEFT JOIN favorites fav ON f.id = fav.food_id
            LEFT JOIN ratings r2 ON f.id = r2.food_id AND r2.user_id = ?
            LEFT JOIN favorites fav2 ON f.id = fav2.food_id AND fav2.user_id = ?
            LEFT JOIN view_history vh ON f.id = vh.food_id AND vh.user_id = ?
            WHERE f.id NOT IN (
                SELECT DISTINCT food_id FROM ratings WHERE user_id = ? AND rating < 3
            )
            GROUP BY f.id
            ORDER BY (
                IFNULL(AVG(r.rating), 0) * 2 + 
                (CASE WHEN user_rating > 0 THEN user_rating ELSE 0 END) * 3 + 
                favorite_count * 0.5 + 
                (CASE WHEN user_favorite = 1 THEN 3 ELSE 0 END) +
                user_views * 0.2
            ) DESC
            LIMIT ?
        `;

        return await query(sql, [userId, userId, userId, userId, userId, userId, userId, limit]);
    }
}

module.exports = Food; 