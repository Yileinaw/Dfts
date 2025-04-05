const { query } = require('../config/database');

class Category {
    // 获取所有分类
    static async getAll() {
        return await query('SELECT * FROM categories ORDER BY name');
    }

    // 根据ID获取分类
    static async getById(id) {
        const categories = await query('SELECT * FROM categories WHERE id = ?', [id]);
        return categories.length ? categories[0] : null;
    }

    // 创建新分类
    static async create(categoryData) {
        const result = await query(
            'INSERT INTO categories (name, description, image) VALUES (?, ?, ?)',
            [categoryData.name, categoryData.description, categoryData.image]
        );
        return result.insertId;
    }

    // 更新分类信息
    static async update(id, categoryData) {
        const result = await query(
            'UPDATE categories SET name = ?, description = ?, image = ? WHERE id = ?',
            [categoryData.name, categoryData.description, categoryData.image, id]
        );
        return result.affectedRows > 0;
    }

    // 删除分类
    static async delete(id) {
        // 注意：由于外键约束，删除分类前需确保没有食物关联到此分类
        const result = await query('DELETE FROM categories WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    // 获取分类及其包含的食物数量
    static async getCategoriesWithFoodCount() {
        const sql = `
            SELECT c.*, COUNT(f.id) as food_count
            FROM categories c
            LEFT JOIN foods f ON c.id = f.category_id
            GROUP BY c.id
            ORDER BY c.name
        `;
        return await query(sql);
    }

    // 获取指定分类下的所有食物
    static async getFoodsByCategory(categoryId, limit = 50, offset = 0) {
        const sql = `
            SELECT f.*, c.name as category_name
            FROM foods f
            JOIN categories c ON f.category_id = c.id
            WHERE f.category_id = ?
            LIMIT ? OFFSET ?
        `;
        return await query(sql, [categoryId, limit, offset]);
    }
}

module.exports = Category; 