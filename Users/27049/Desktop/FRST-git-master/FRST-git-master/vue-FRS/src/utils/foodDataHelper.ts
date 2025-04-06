import type { FoodInfo } from '@/types/food';

// --- WARNING: Temporary Data Duplication --- 
// This approach duplicates the data initialization logic from DiscoverView.vue.
// In a real application, use Pinia store or API fetching for data access.

// --- Import all TestImages --- 
// (Duplicate imports needed here until data source is centralized)
import dongPoRou from '@/assets/images/TestImages/东坡肉.jpg';
import wuKeLanTuDou from '@/assets/images/TestImages/乌克兰土豆.jpg';
import quanJiaFuShouSi from '@/assets/images/TestImages/全家福寿司.jpg';
import junJianShouSi from '@/assets/images/TestImages/军舰寿司.jpg';
import yuanQieSanWenYu from '@/assets/images/TestImages/原切三文鱼.jpg';
import kouWeiXia from '@/assets/images/TestImages/口味虾.jpg';
import jiaoHuaJi from '@/assets/images/TestImages/叫花鸡.jpg';
import duoPinShaLa from '@/assets/images/TestImages/多拼沙拉.jpg';
import guGuRou from '@/assets/images/TestImages/姑姑肉.jpg';
import angGeSiHanBao from '@/assets/images/TestImages/安格斯汉堡.jpg';
import gongBaoJiDing from '@/assets/images/TestImages/宫保鸡丁.jpg';
import xiaoSuRou from '@/assets/images/TestImages/小酥肉.jpg';
import yiDaLiJuanMian from '@/assets/images/TestImages/意大利卷面.jpg';
import danDanMian from '@/assets/images/TestImages/旦旦面.jpg';
import chunJuan from '@/assets/images/TestImages/春卷.jpg';
import zaHuiHaiWei from '@/assets/images/TestImages/杂烩海味.jpg';
import banBanRou from '@/assets/images/TestImages/板板肉.jpg';
import ningMengTuSi from '@/assets/images/TestImages/柠檬土司.jpg';
import shuiZhuRouPian from '@/assets/images/TestImages/水煮肉片.jpg';
import youPoMian from '@/assets/images/TestImages/油泼面.jpg';
import faShiZaoCan from '@/assets/images/TestImages/法式早餐.jpg';
import faShiHuoJi from '@/assets/images/TestImages/法式火鸡.jpg';
import nongTangJiZa from '@/assets/images/TestImages/浓汤鸡杂.jpg';
import haiWeiShouSi from '@/assets/images/TestImages/海味寿司.jpg';
import kaoJiLiu from '@/assets/images/TestImages/烤鸡柳.jpg';
import jiaoXiangDanJuan from '@/assets/images/TestImages/焦香蛋卷.jpg';
import niuRouPinPan from '@/assets/images/TestImages/牛肉拼盘.jpg';
import yuMiNaDou from '@/assets/images/TestImages/玉米纳豆.jpg';
import liuYiShouLongXia from '@/assets/images/TestImages/留一手龙虾.jpg';
import baiQieJi from '@/assets/images/TestImages/白切鸡.jpg';
import jianDanMian from '@/assets/images/TestImages/简单面.jpg';
import ziLuoLanBingJiLing from '@/assets/images/TestImages/紫罗兰冰激凌.jpg';
import jingDianShouSi from '@/assets/images/TestImages/经典寿司.jpg';
import jingDianYiDaLiMian from '@/assets/images/TestImages/经典意大利面.jpg';
import jingDianKouRou from '@/assets/images/TestImages/经典扣肉.jpg';
import yangRouChuan from '@/assets/images/TestImages/羊肉串.jpg';
import rouJiangYiMian from '@/assets/images/TestImages/肉酱意面.jpg';
import laWeiPinPan from '@/assets/images/TestImages/腊味拼盘.jpg';
import laChangPiSa from '@/assets/images/TestImages/腊肠披萨.jpg';
import laChangDanTa from '@/assets/images/TestImages/腊肠蛋挞.jpg';
import canYongChaoRou from '@/assets/images/TestImages/蚕蛹炒肉.jpg';
import danChaoFan from '@/assets/images/TestImages/蛋炒饭.jpg';
import xiLengJuTang from '@/assets/images/TestImages/西冷焗汤.jpg';
import xiLengNiuPai from '@/assets/images/TestImages/西冷牛排.jpg';
import laZiJi from '@/assets/images/TestImages/辣子鸡.jpg';
import laJiaoNiuRou from '@/assets/images/TestImages/辣椒牛肉.jpg';
import xueLiHongChaoRou from '@/assets/images/TestImages/雪里红炒肉.jpg';
import xiangLaXiaQiu from '@/assets/images/TestImages/香辣虾球.jpg';
import yuLiuShouSi from '@/assets/images/TestImages/鱼柳寿司.jpg';
import eGanShouSi from '@/assets/images/TestImages/鹅肝寿司.jpg';
// --- Image import end ---

// Temporary function to get all food data (duplicates logic from DiscoverView)
const getAllFoods = (): FoodInfo[] => {
    const foods: FoodInfo[] = [
        // --- Paste the exact same data mapping as in DiscoverView's initializeFoodData --- 
        { id: 1, name: '东坡肉', coverImage: dongPoRou, category: 'chinese', rating: 4.8, price: 68, tags: ['经典', '本帮菜'] },
        { id: 2, name: '乌克兰土豆', coverImage: wuKeLanTuDou, category: 'other', rating: 4.2, price: 35, tags: ['特色'] },
        { id: 3, name: '全家福寿司', coverImage: quanJiaFuShouSi, category: 'japanese', rating: 4.7, price: 98, tags: ['拼盘', '聚餐'] },
        { id: 4, name: '军舰寿司', coverImage: junJianShouSi, category: 'japanese', rating: 4.5, price: 15, tags: ['经典', '海苔'] },
        { id: 5, name: '原切三文鱼', coverImage: yuanQieSanWenYu, category: 'japanese', rating: 4.9, price: 78, tags: ['刺身', '新鲜'] },
        { id: 6, name: '口味虾', coverImage: kouWeiXia, category: 'snack', rating: 4.8, price: 128, tags: ['招牌', '辣', '夜宵优选'] },
        { id: 7, name: '叫花鸡', coverImage: jiaoHuaJi, category: 'chinese', rating: 4.6, price: 88, tags: ['传统', '特色'] },
        { id: 8, name: '多拼沙拉', coverImage: duoPinShaLa, category: 'western', rating: 4.4, price: 45, tags: ['健康', '轻食'] },
        { id: 9, name: '姑姑肉', coverImage: guGuRou, category: 'other', rating: 4.0, price: 50 },
        { id: 10, name: '安格斯汉堡', coverImage: angGeSiHanBao, category: 'western', rating: 4.7, price: 65, tags: ['牛肉', '快餐'] },
        { id: 11, name: '宫保鸡丁', coverImage: gongBaoJiDing, category: 'sichuan', rating: 4.6, price: 45, tags: ['家常菜', '下饭'] },
        { id: 12, name: '小酥肉', coverImage: xiaoSuRou, category: 'snack', rating: 4.5, price: 30, tags: ['炸物', '香脆'] },
        { id: 13, name: '意大利卷面', coverImage: yiDaLiJuanMian, category: 'western', rating: 4.3, price: 55, tags: ['意面'] },
        { id: 14, name: '旦旦面', coverImage: danDanMian, category: 'noodle', rating: 4.5, price: 28, tags: ['四川', '面食'] },
        { id: 15, name: '春卷', coverImage: chunJuan, category: 'snack', rating: 4.2, price: 15, tags: ['炸物', '点心'] },
        { id: 16, name: '杂烩海味', coverImage: zaHuiHaiWei, category: 'chinese', rating: 4.6, price: 75, tags: ['海鲜'] },
        { id: 17, name: '板板肉', coverImage: banBanRou, category: 'other', rating: 4.1, price: 60 },
        { id: 18, name: '柠檬土司', coverImage: ningMengTuSi, category: 'dessert', rating: 4.3, price: 22, tags: ['早餐', '面包'] },
        { id: 19, name: '水煮肉片', coverImage: shuiZhuRouPian, category: 'sichuan', rating: 4.9, price: 55, tags: ['麻辣', '经典川菜'] },
        { id: 20, name: '油泼面', coverImage: youPoMian, category: 'noodle', rating: 4.7, price: 26, tags: ['陕西', '面食', '香辣'] },
        { id: 21, name: '法式早餐', coverImage: faShiZaoCan, category: 'western', rating: 4.5, price: 58, tags: ['早餐', '套餐'] },
        { id: 22, name: '法式火鸡', coverImage: faShiHuoJi, category: 'western', rating: 4.8, price: 188, tags: ['节日', '烤'] },
        { id: 23, name: '浓汤鸡杂', coverImage: nongTangJiZa, category: 'chinese', rating: 4.3, price: 38, tags: ['汤', '家常'] },
        { id: 24, name: '海味寿司', coverImage: haiWeiShouSi, category: 'japanese', rating: 4.6, price: 20, tags: ['海鲜'] },
        { id: 25, name: '烤鸡柳', coverImage: kaoJiLiu, category: 'snack', rating: 4.4, price: 25, tags: ['小吃', '快餐'] },
        { id: 26, name: '焦香蛋卷', coverImage: jiaoXiangDanJuan, category: 'dessert', rating: 4.5, price: 18, tags: ['点心', '下午茶'] },
        { id: 27, name: '牛肉拼盘', coverImage: niuRouPinPan, category: 'chinese', rating: 4.7, price: 85, tags: ['凉菜', '下酒'] },
        { id: 28, name: '玉米纳豆', coverImage: yuMiNaDou, category: 'japanese', rating: 4.1, price: 25, tags: ['健康', '特色'] },
        { id: 29, name: '留一手龙虾', coverImage: liuYiShouLongXia, category: 'snack', rating: 4.7, price: 158, tags: ['小龙虾', '辣'] },
        { id: 30, name: '白切鸡', coverImage: baiQieJi, category: 'chinese', rating: 4.8, price: 58, tags: ['粤菜', '经典'] },
        { id: 31, name: '简单面', coverImage: jianDanMian, category: 'noodle', rating: 4.0, price: 15 },
        { id: 32, name: '紫罗兰冰激凌', coverImage: ziLuoLanBingJiLing, category: 'dessert', rating: 4.6, price: 28, tags: ['冰品', '夏季'] },
        { id: 33, name: '经典寿司', coverImage: jingDianShouSi, category: 'japanese', rating: 4.4, price: 12, tags: ['基础款'] },
        { id: 34, name: '经典意大利面', coverImage: jingDianYiDaLiMian, category: 'western', rating: 4.5, price: 52, tags: ['意面', '番茄'] },
        { id: 35, name: '经典扣肉', coverImage: jingDianKouRou, category: 'chinese', rating: 4.7, price: 72, tags: ['硬菜', '宴请'] },
        { id: 36, name: '羊肉串', coverImage: yangRouChuan, category: 'bbq', rating: 4.7, price: 5, tags: ['夜宵', '肉食'] },
        { id: 37, name: '肉酱意面', coverImage: rouJiangYiMian, category: 'western', rating: 4.6, price: 58, tags: ['经典', '意面'] },
        { id: 38, name: '腊味拼盘', coverImage: laWeiPinPan, category: 'chinese', rating: 4.5, price: 65, tags: ['凉菜', '年味'] },
        { id: 39, name: '腊肠披萨', coverImage: laChangPiSa, category: 'western', rating: 4.6, price: 78, tags: ['披萨', '特色'] },
        { id: 40, name: '腊肠蛋挞', coverImage: laChangDanTa, category: 'dessert', rating: 4.2, price: 10, tags: ['点心', '创意'] },
        { id: 41, name: '蚕蛹炒肉', coverImage: canYongChaoRou, category: 'other', rating: 4.0, price: 55, tags: ['特色', '蛋白质'] },
        { id: 42, name: '蛋炒饭', coverImage: danChaoFan, category: 'chinese', rating: 4.3, price: 20, tags: ['主食', '快手'] },
        { id: 43, name: '西冷焗汤', coverImage: xiLengJuTang, category: 'western', rating: 4.5, price: 48, tags: ['汤品', '浓郁'] },
        { id: 44, name: '西冷牛排', coverImage: xiLengNiuPai, category: 'western', rating: 4.8, price: 128, tags: ['牛排', '品质'] },
        { id: 45, name: '辣子鸡', coverImage: laZiJi, category: 'sichuan', rating: 4.7, price: 65, tags: ['干煸', '麻辣'] },
        { id: 46, name: '辣椒牛肉', coverImage: laJiaoNiuRou, category: 'sichuan', rating: 4.6, price: 70, tags: ['小炒', '下饭'] },
        { id: 47, name: '雪里红炒肉', coverImage: xueLiHongChaoRou, category: 'chinese', rating: 4.2, price: 32, tags: ['家常'] },
        { id: 48, name: '香辣虾球', coverImage: xiangLaXiaQiu, category: 'snack', rating: 4.6, price: 68, tags: ['海鲜', '辣'] },
        { id: 49, name: '鱼柳寿司', coverImage: yuLiuShouSi, category: 'japanese', rating: 4.3, price: 18 },
        { id: 50, name: '鹅肝寿司', coverImage: eGanShouSi, category: 'japanese', rating: 4.9, price: 35, tags: ['高端', '入口即化'] },
    ];
    return foods;
}

// Helper function to find food by ID
export const findFoodById = async (id: number): Promise<FoodInfo | null> => {
    // Simulate async operation if needed
    // await new Promise(resolve => setTimeout(resolve, 50)); 
    const foods = getAllFoods();
    return foods.find(food => food.id === id) || null;
}; 