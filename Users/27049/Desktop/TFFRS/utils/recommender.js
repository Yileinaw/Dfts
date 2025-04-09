/**
 * 简单的基于内容的推荐系统
 * 根据用户的喜好和评分历史，推荐相似的美食
 */

const Food = require('../models/food');
const Rating = require('../models/rating');
const Favorite = require('../models/favorite');

class Recommender {
    /**
     * 根据用户ID获取个性化推荐
     * @param {number} userId - 用户ID
     * @param {number} limit - 限制结果数量
     */
    static async getPersonalRecommendations(userId, limit = 10) {
        // 如果用户没有登录，返回评分最高的美食
        if (!userId) {
            return await Rating.getTopRated(limit);
        }

        // 获取用户已评分的美食
        const userRatings = await Rating.findByUser(userId);

        // 如果用户没有评分记录，返回最受欢迎的美食
        if (userRatings.length === 0) {
            return await Favorite.getMostFavorites(limit);
        }

        // 获取用户收藏的美食类别
        const userFavorites = await Favorite.findByUser(userId);

        // 提取用户喜欢的类别
        const userPreferredCategories = new Set();

        // 添加用户评分高的美食类别（评分>=4）
        userRatings.forEach(rating => {
            if (rating.rating >= 4) {
                if (rating.category) userPreferredCategories.add(rating.category);
            }
        });

        // 添加用户收藏的美食类别
        userFavorites.forEach(fav => {
            if (fav.category) userPreferredCategories.add(fav.category);
        });

        // 获取所有美食及其评分
        const allFoodsWithRatings = await Food.getFoodsWithRatings();

        // 已评分或收藏的美食ID集合（这些不再推荐）
        const userRatedFoodIds = new Set(userRatings.map(r => r.food_id));
        const userFavoriteFoodIds = new Set(userFavorites.map(f => f.id));

        // 计算推荐分数并排序
        const recommendations = allFoodsWithRatings
            .filter(food => {
                // 排除用户已评分或收藏的美食
                return !userRatedFoodIds.has(food.id) && !userFavoriteFoodIds.has(food.id);
            })
            .map(food => {
                let score = 0;

                // 基础分 = 平均评分 * 评分数量的对数(确保受欢迎的美食得分更高)
                score += food.avg_rating * Math.log10(food.rating_count + 1);

                // 如果美食类别是用户喜欢的，增加分数
                if (userPreferredCategories.has(food.category)) {
                    score += 2; // 类别匹配加分
                }

                return { ...food, score };
            })
            .sort((a, b) => b.score - a.score) // 按分数降序排序
            .slice(0, limit); // 只返回指定数量的结果

        return recommendations;
    }

    /**
     * 根据特定美食ID获取相似美食推荐
     * @param {number} foodId - 美食ID
     * @param {number} limit - 限制结果数量
     */
    static async getSimilarFoods(foodId, limit = 5) {
        // 获取当前美食信息
        const currentFood = await Food.findById(foodId);
        if (!currentFood) {
            return [];
        }

        // 获取所有美食
        const allFoods = await Food.findAll();

        // 计算相似度并排序
        const similarFoods = allFoods
            .filter(food => food.id !== parseInt(foodId)) // 排除当前美食
            .map(food => {
                let similarityScore = 0;

                // 如果类别相同，增加相似度
                if (food.category === currentFood.category) {
                    similarityScore += 3;
                }

                // 计算食材的相似度（简单实现：共同食材的数量）
                if (food.ingredients && currentFood.ingredients) {
                    const foodIngredients = food.ingredients.split(',').map(i => i.trim().toLowerCase());
                    const currentFoodIngredients = currentFood.ingredients.split(',').map(i => i.trim().toLowerCase());

                    // 计算交集的大小
                    const commonIngredients = foodIngredients.filter(ingredient =>
                        currentFoodIngredients.includes(ingredient)
                    ).length;

                    similarityScore += commonIngredients;
                }

                // 热量相似度（如果热量接近，增加相似度）
                if (food.calories && currentFood.calories) {
                    const caloriesDiff = Math.abs(food.calories - currentFood.calories);
                    if (caloriesDiff < 100) {
                        similarityScore += (100 - caloriesDiff) / 100;
                    }
                }

                return { ...food, similarityScore };
            })
            .sort((a, b) => b.similarityScore - a.similarityScore) // 按相似度降序排序
            .slice(0, limit); // 只返回指定数量的结果

        return similarFoods;
    }
}

module.exports = Recommender; 