const Category = require('../models/category');
const Food = require('../models/food');
const { handleSuccess, handleError } = require('../utils/helpers');

// 获取所有分类
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.getAll();
        handleSuccess(res, categories);
    } catch (error) {
        handleError(res, '获取分类列表失败', 500, error);
    }
};

// 根据ID获取单个分类信息
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.getById(req.params.id);
        if (!category) {
            return handleError(res, '未找到指定分类', 404);
        }
        handleSuccess(res, category);
    } catch (error) {
        handleError(res, '获取分类信息失败', 500, error);
    }
};

// 获取指定分类下的所有美食
exports.getFoodsByCategory = async (req, res) => {
    const categoryId = req.params.id;
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    try {
        // 验证分类是否存在
        const category = await Category.getById(categoryId);
        if (!category) {
            return handleError(res, '未找到指定分类', 404);
        }

        // 使用 Category 模型中的方法获取食物
        const foods = await Category.getFoodsByCategory(categoryId, parseInt(limit), parseInt(offset));

        // 可以进一步获取总数用于分页
        // const totalFoods = await Food.countByCategory(categoryId); // 假设 Food 模型有此方法

        handleSuccess(res, { foods /*, totalFoods, currentPage: page, totalPages: Math.ceil(totalFoods / limit) */ });
    } catch (error) {
        handleError(res, '获取分类下的美食失败', 500, error);
    }
};

// --- 后台管理功能 (可选) ---

// 创建新分类 (需要管理员权限)
exports.createCategory = async (req, res) => {
    // 实现创建逻辑, 别忘了权限检查
    // ...
};

// 更新分类 (需要管理员权限)
exports.updateCategory = async (req, res) => {
    // 实现更新逻辑, 别忘了权限检查
    // ...
};

// 删除分类 (需要管理员权限)
exports.deleteCategory = async (req, res) => {
    // 实现删除逻辑, 别忘了权限检查
    // ...
}; 