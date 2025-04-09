import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { AuthenticatedRequest } from '../middleware/AuthMiddleware'; // Import for userId type

// 确保存储目录存在
const uploadDir = path.join(__dirname, '../../public/uploads/avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置存储引擎
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // 文件存储路径
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名：userId-timestamp.extension
        const userId = (req as AuthenticatedRequest).userId || 'unknown'; // Get userId from AuthenticatedRequest
        const uniqueSuffix = userId + '-' + Date.now();
        const extension = path.extname(file.originalname);
        // 使用 fieldname (应该是 'avatar') 加上唯一标识符
        cb(null, 'avatar-' + uniqueSuffix + extension);
    }
});

// 文件过滤器，只接受图片
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        // Pass an error to Multer
        cb(new Error('只允许上传图片文件!')); 
    }
};

// 创建 multer 实例
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 限制文件大小为 5MB
    } 
});

export default upload; 