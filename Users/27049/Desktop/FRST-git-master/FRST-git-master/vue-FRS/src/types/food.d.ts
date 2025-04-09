/**
 * 假设的美食信息接口
 */
export interface FoodInfo {
    id: number;
    name: string; // 美食名称
    description?: string; // 描述或特色
    coverImage: string; // 封面图片 URL
    rating?: number; // 评分 (0-5)
    price?: number | string; // 参考价格
    category?: string; // 所属分类
    tags?: string[]; // 标签，如 "辣", "新品"
    restaurantName?: string; // 来源餐厅名称 (可选)
    restaurantId?: number; // 来源餐厅 ID (可选, 用于跳转)
}

/**
 * 假设的美食分类接口
 */
export interface FoodCategory {
    id: number | string; // 分类 ID (可以是数字或字符串标识，如 'hotpot')
    name: string; // 分类名称
    icon?: string; // 图标 (可选)
} 