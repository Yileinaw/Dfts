"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// 确保存储目录存在
const uploadDir = path_1.default.join(__dirname, '../../public/uploads/avatars');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// 配置存储引擎
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // 文件存储路径
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名：userId-timestamp.extension
        const userId = req.userId || 'unknown'; // Get userId from AuthenticatedRequest
        const uniqueSuffix = userId + '-' + Date.now();
        const extension = path_1.default.extname(file.originalname);
        // 使用 fieldname (应该是 'avatar') 加上唯一标识符
        cb(null, 'avatar-' + uniqueSuffix + extension);
    }
});
// 文件过滤器，只接受图片
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        // Pass an error to Multer
        cb(new Error('只允许上传图片文件!'));
    }
};
// 创建 multer 实例
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 5 // 限制文件大小为 5MB
    }
});
exports.default = upload;
//# sourceMappingURL=multerConfig.js.map