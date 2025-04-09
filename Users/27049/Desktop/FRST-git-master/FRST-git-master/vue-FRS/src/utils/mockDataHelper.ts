import type { FoodInfo, FoodCategory } from '@/types/food';
import type { PostInfo, CommentInfo, PostAuthorInfo, PaginatedList } from '@/types/api';

// --- Import all TestImages --- 
// (Duplicate imports needed here until data source is centralized)
// ... (Keep all image imports as before) ...
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

// --- LocalStorage Keys ---
const POSTS_KEY = 'frs_posts';
const COMMENTS_KEY = 'frs_comments';

// --- Mock Food Data --- 
let mockFoodsData: FoodInfo[] = [];
const initializeMockFoods = () => {
    if (mockFoodsData.length > 0) return; // Avoid re-initialization
    mockFoodsData = [
        // --- Paste the exact same food data mapping as before --- 
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
}
// Call initialization once
initializeMockFoods();

export const getAllFoods = async (): Promise<FoodInfo[]> => {
    // Simulate async
    await new Promise(resolve => setTimeout(resolve, 50));
    return mockFoodsData;
}

export const findFoodById = async (id: number): Promise<FoodInfo | null> => {
    await new Promise(resolve => setTimeout(resolve, 30));
    return mockFoodsData.find(food => food.id === id) || null;
};

// --- Mock Post Data ---
let mockPostsData: PostInfo[] = [];
let mockCommentsData = new Map<number | string, CommentInfo[]>();
let nextPostId = 301; // Default start ID if no data loaded
let nextCommentId = 1001; // Default start ID if no data loaded

// --- Authors (Keep as is) ---
const authors: PostAuthorInfo[] = [
    { id: 1, username: '美食家小李', avatar: '' },
    { id: 2, username: '爱探索的张三', avatar: '' },
    { id: 3, username: '厨房新手王五', avatar: '' },
    { id: 4, username: '甜品控赵六', avatar: '' },
    { id: 5, username: '深夜食堂常客', avatar: '' },
    { id: 6, username: '健康饮食达人', avatar: '' },
];

// --- Helper Functions for LocalStorage ---
const savePostsToLocalStorage = () => {
    try {
        localStorage.setItem(POSTS_KEY, JSON.stringify(mockPostsData));
    } catch (error) {
        console.error('Error saving posts to LocalStorage:', error);
    }
};

const saveCommentsToLocalStorage = () => {
    try {
        // Convert Map to Array for serialization
        const serializableComments = Array.from(mockCommentsData.entries());
        localStorage.setItem(COMMENTS_KEY, JSON.stringify(serializableComments));
    } catch (error) {
        console.error('Error saving comments to LocalStorage:', error);
    }
};

// Modified: Generate comments and store them in the map (Doesn't save to LS directly)
const generateAndStoreMockComments = (postId: number | string, count: number): void => {
    const comments: CommentInfo[] = [];
    const commentAuthors = authors.slice(0, 3);
    const commentContents = [
        '看起来真不错！学习了！', '感谢分享，周末就去试试。', '这个做法正宗吗？',
        '口水流下来了🤤', '正好想吃这个，太及时了。', '收藏了，谢谢楼主！'
    ];
    for (let i = 0; i < count; i++) {
        const author = commentAuthors[Math.floor(Math.random() * commentAuthors.length)];
        const replyToAuthor = Math.random() > 0.7 && comments.length > 0
            ? comments[Math.floor(Math.random() * comments.length)].author
            : undefined;
        comments.push({
            id: nextCommentId++,
            postId: postId,
            author: author,
            content: commentContents[Math.floor(Math.random() * commentContents.length)],
            createdAt: new Date(Date.now() - Math.random() * 1000 * 3600 * (12 + i * 2)).toISOString(),
            replyTo: replyToAuthor,
        });
    }
    comments.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    mockCommentsData.set(postId, comments); // Add to the map
}

// Modified: Generate mock posts (Doesn't save to LS directly)
const generateMockPosts = (): void => {
    // Base data for generating posts
    const foodBasedPostBases: Omit<PostInfo, 'id' | 'createdAt' | 'likes' | 'isLiked' | 'commentsCount' | 'images' | 'location' | 'tags'>[] = [
        { author: authors[0], content: '【家常菜】红烧东坡肉，入口即化，肥而不腻！附秘诀\n东坡肉是江南地区的传统名菜，色泽红亮，味醇汁浓，酥烂而形不碎，香糯而不腻口。今天分享一个家庭版的做法，保证新手也能成功！\n\n主要食材：五花肉、冰糖、酱油、黄酒...\n步骤：\n1. 五花肉焯水去腥...\n2. 炒糖色是关键...\n3. 小火慢炖至少1小时...\n\n小贴士：选用带皮的五花肉口感最好！炖煮时水量要足。' },
        { author: authors[1], content: '探店：号称基辅最好吃的乌克兰土豆？味道有点特别\n最近去了一家很有名的乌克兰餐厅，点了他们的招牌菜——乌克兰土豆。做法和我们常见的很不一样，是用酸奶油和香草调味的，口感绵密，带点微酸。\n\n第一口感觉有点奇怪，但越吃越上头！配上他们的黑面包简直一绝。有没有小伙伴也吃过类似的？来交流一下感受！' },
        { author: authors[3], content: '寿司爱好者集合！晒晒我最爱的全家福寿司拼盘🍣\n作为一个寿司控，最幸福的时刻莫过于点一份全家福寿司拼盘了！三文鱼、金枪鱼、鳗鱼、甜虾...一次满足所有愿望！\n\n这家店的食材很新鲜，米饭捏得也恰到好处。最爱他们的炙烤系列，入口带着焦香。你们最喜欢哪种寿司呢？' },
        { author: authors[2], content: '求助！宫保鸡丁怎么做才好吃？总是炒不好鸡肉\n厨房新手求助！很喜欢吃宫保鸡丁，但是自己做总是不成功。鸡肉要么炒老了，要么不入味。花生米也炸不脆。\n\n有没有大厨能分享一下关键步骤和技巧？比如鸡肉怎么腌制？火候怎么掌握？调味汁的比例是多少？万分感谢！🙏' },
        { author: authors[4], content: '夜宵推荐：麻辣鲜香的口味虾，越吃越过瘾！\n长沙的夜生活怎么能少了口味虾！这家店是我最近的新宠，虾肉Q弹入味，麻辣度刚刚好，吃得满头大汗但就是停不下来。\n\n汤汁拌面也是一绝！唯一缺点就是有点小贵，但是偶尔放纵一下还是值得的。还有其他好吃的口味虾店推荐吗？' },
        { author: authors[5], content: '【健康轻食】在家也能做餐厅级别的多拼沙拉\n天气热了，分享一个我常做的多拼沙拉，营养又美味！\n\n基础：生菜、紫甘蓝、小番茄、黄瓜\n蛋白质：鸡胸肉/虾仁/鸡蛋/鹰嘴豆 (选1-2种)\n碳水：藜麦/玉米粒/烤面包丁 (可选)\n增加风味：牛油果、坚果、蔓越莓干\n酱汁：油醋汁/酸奶酱/芝麻酱 (推荐自制更健康！)\n\n大家可以根据自己的喜好自由搭配，好吃又好看！' },
        { author: authors[0], content: '挑战复刻经典：水煮肉片，麻辣过瘾！\n水煮肉片是川菜的代表之一，看起来复杂，其实掌握几个要点在家也能做！\n\n关键：\n1. 肉片腌制要到位，用蛋清和淀粉抓匀保证滑嫩。\n2. 炒香底料是灵魂，郫县豆瓣酱、干辣椒、花椒不能少。\n3. 最后的热油一定要浇到位，激发出麻辣香味！\n\n配菜可以选豆芽、青笋、木耳等。自己做的料足味美，比外面吃得放心！' },
        { author: authors[4], content: '谁发明的安格斯牛肉汉堡？太好吃了！\n汉堡爱好者报道！最近迷上了安格斯牛肉汉堡，肉饼厚实多汁，牛肉味十足，比普通的快餐汉堡好吃太多了！\n\n搭配芝士、培根、酸黄瓜和各种酱料，一口下去超级满足。虽然热量爆炸，但快乐也是加倍的！你们喜欢加什么配料？' },
    ];

    // Reset data before generating
    mockPostsData = [];
    mockCommentsData = new Map();
    nextPostId = 301;
    nextCommentId = 1001;

    // Generate posts based on food
    foodBasedPostBases.forEach((postBase) => {
        const postId = nextPostId++;
        const commentCount = Math.floor(Math.random() * 15) + 3;
        const newPost: PostInfo = {
            ...postBase,
            id: postId,
            createdAt: new Date(Date.now() - Math.random() * 1000 * 3600 * 24 * 14).toISOString(),
            commentsCount: commentCount,
            likes: Math.floor(Math.random() * 150) + 10,
            isLiked: Math.random() > 0.8,
            images: Math.random() > 0.7 ? ['https://via.placeholder.com/400x300.png?text=Sample+Image'] : undefined, // Randomly add a placeholder image
        };
        mockPostsData.push(newPost);
        generateAndStoreMockComments(postId, commentCount);
    });

    // Generate generic posts
    for (let i = 0; i < 10; i++) {
        const author = authors[Math.floor(Math.random() * authors.length)];
        const postId = nextPostId++;
        const commentCount = Math.floor(Math.random() * 10);
        mockPostsData.push({
            id: postId,
            content: `美食探店心得分享 ${i + 1}\n今天去了一家新开的店，环境不错，菜品味道也还可以，推荐大家去试试。地址在XXX路XXX号。点了几个招牌菜，比如XXX和XXX，个人感觉...`,
            author: author,
            createdAt: new Date(Date.now() - Math.random() * 1000 * 3600 * 24 * 5).toISOString(),
            commentsCount: commentCount,
            likes: Math.floor(Math.random() * 50),
            isLiked: Math.random() > 0.7,
            // No images for generic posts initially
        });
        generateAndStoreMockComments(postId, commentCount);
    }

    console.log('Mock data generated. Posts:', mockPostsData.length, 'Comments Map Size:', mockCommentsData.size);
};

// --- Initialize Data (Load from LS or Generate) ---
const initializeData = () => {
    let loadedPosts = false;
    let loadedComments = false;

    // Try loading posts
    try {
        const storedPosts = localStorage.getItem(POSTS_KEY);
        if (storedPosts) {
            const parsedPosts: PostInfo[] = JSON.parse(storedPosts);
            // Basic validation
            if (Array.isArray(parsedPosts) && parsedPosts.length > 0) {
                mockPostsData = parsedPosts;
                // Update nextPostId based on loaded data
                nextPostId = Math.max(...parsedPosts.map(p => typeof p.id === 'number' ? p.id : 0), 0) + 1;
                loadedPosts = true;
                console.log('Posts loaded from LocalStorage:', mockPostsData.length);
            }
        }
    } catch (error) {
        console.error('Error loading posts from LocalStorage:', error);
        localStorage.removeItem(POSTS_KEY); // Clear corrupted data
    }

    // Try loading comments
    try {
        const storedComments = localStorage.getItem(COMMENTS_KEY);
        if (storedComments) {
            const parsedCommentsArray: [number | string, CommentInfo[]][] = JSON.parse(storedComments);
            // Basic validation
            if (Array.isArray(parsedCommentsArray)) {
                mockCommentsData = new Map(parsedCommentsArray);
                // Update nextCommentId based on loaded data
                let maxCommentId = 0;
                mockCommentsData.forEach(commentsList => {
                    maxCommentId = Math.max(...commentsList.map(c => typeof c.id === 'number' ? c.id : 0), maxCommentId);
                });
                nextCommentId = maxCommentId + 1;
                loadedComments = true;
                console.log('Comments loaded from LocalStorage. Map size:', mockCommentsData.size);
            }
        }
    } catch (error) {
        console.error('Error loading comments from LocalStorage:', error);
        localStorage.removeItem(COMMENTS_KEY); // Clear corrupted data
    }

    // If data wasn't fully loaded, generate and save
    if (!loadedPosts || !loadedComments) {
        console.log('Generating new mock data because LocalStorage was empty or incomplete.');
        generateMockPosts();
        savePostsToLocalStorage();
        saveCommentsToLocalStorage();
    }
};

// --- Call Initialization ---
initializeData();

// --- Post Data Access Functions (Modified to Save) ---
export const getAllPosts = async (): Promise<PostInfo[]> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const sortedPosts = [...mockPostsData].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return sortedPosts;
}

export const findPostById = async (id: number | string): Promise<PostInfo | null> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const postIdNum = typeof id === 'string' ? parseInt(id, 10) : id;
    const post = mockPostsData.find(p => p.id === postIdNum);
    return post ? JSON.parse(JSON.stringify(post)) : null;
}

export const getCommentsByPostId = async (
    postId: number | string,
    page: number = 1,
    pageSize: number = 10
): Promise<PaginatedList<CommentInfo>> => {
    await new Promise(resolve => setTimeout(resolve, 80));
    const postIdNum = typeof postId === 'string' ? parseInt(postId, 10) : postId;
    const allComments = mockCommentsData.get(postIdNum) || [];
    const sortedComments = [...allComments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = sortedComments.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedComments = sortedComments.slice(start, end);
    return {
        list: JSON.parse(JSON.stringify(paginatedComments)),
        total: total,
        page: page,
        pageSize: pageSize,
    };
}

// Updated addPost: Accepts images, saves to LS
export const addPost = async (postData: { content: string; author: PostAuthorInfo; images?: string[] }): Promise<PostInfo> => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newPost: PostInfo = {
        ...postData,
        id: nextPostId++,
        createdAt: new Date().toISOString(),
        commentsCount: 0,
        likes: 0,
        isLiked: false,
        images: postData.images || [], // Store images if provided
    };
    mockPostsData.unshift(newPost);
    mockCommentsData.set(newPost.id, []); // Initialize empty comments for the new post
    savePostsToLocalStorage(); // Save updated posts
    saveCommentsToLocalStorage(); // Save updated comments map (with new empty entry)
    console.log('Post added and saved to LS:', newPost);
    return JSON.parse(JSON.stringify(newPost));
}

// Updated addCommentToPost: Saves to LS
export const addCommentToPost = async (postId: number | string, commentData: { author: PostAuthorInfo; content: string; replyTo?: PostAuthorInfo }): Promise<CommentInfo | null> => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const postIdNum = typeof postId === 'string' ? parseInt(postId, 10) : postId;
    const post = mockPostsData.find(p => p.id === postIdNum);
    const postComments = mockCommentsData.get(postIdNum);

    if (post && postComments !== undefined) {
        const newComment: CommentInfo = {
            id: nextCommentId++,
            postId: postIdNum,
            author: commentData.author,
            content: commentData.content,
            createdAt: new Date().toISOString(),
            replyTo: commentData.replyTo,
        };
        postComments.unshift(newComment);
        mockCommentsData.set(postIdNum, postComments);
        post.commentsCount = (post.commentsCount || 0) + 1;

        saveCommentsToLocalStorage(); // Save updated comments
        savePostsToLocalStorage(); // Save updated post (for commentsCount)
        console.log('Comment added and saved to LS', postId, newComment);
        return JSON.parse(JSON.stringify(newComment));
    } else {
        console.error('Post or comments array not found for adding comment:', postId);
        return null;
    }
}

// Updated togglePostLike: Saves to LS
export const togglePostLike = async (postId: number | string, currentLikeState: boolean): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const postIdNum = typeof postId === 'string' ? parseInt(postId, 10) : postId;
    const post = mockPostsData.find(p => p.id === postIdNum);
    if (post) {
        const newState = !currentLikeState;
        if (newState) {
            post.likes = (post.likes || 0) + 1;
        } else {
            post.likes = Math.max(0, (post.likes || 0) - 1);
        }
        post.isLiked = newState;
        savePostsToLocalStorage(); // Save updated post data
        console.log(`Post ${postId} like updated and saved. New state: ${post.likes} likes, isLiked: ${post.isLiked}`);
        return newState;
    } else {
        console.error('Post not found for toggling like:', postId);
        return currentLikeState;
    }
}

// --- Food Data Access Functions (Keep as before) ---
// The functions getAllFoods and findFoodById are already exported when defined
// Remove the redundant export statement below:
// export { getAllFoods, findFoodById }; // Ensure they are exported 