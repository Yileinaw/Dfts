import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/AuthRoutes'; // 导入认证路由
import userRoutes from './routes/UserRoutes'; // 导入用户路由
import { postRouter, commentRouter } from './routes/PostRoutes'; // 导入帖子路由和评论路由
import feedRoutes from './routes/FeedRoutes'; // 导入 Feed 路由

dotenv.config(); // 加载 .env 文件中的环境变量

const app: Express = express();
const port = process.env.PORT || 3001; // 从环境变量或默认使用 3001 端口

// 中间件
app.use(cors()); // 启用 CORS
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码的请求体

// 基础路由
app.get('/', (req: Request, res: Response) => {
    res.send('TDFRS Backend API is running!');
});

// 挂载认证路由
app.use('/api/auth', authRoutes); // 所有认证相关的路由都在 /api/auth 下
app.use('/api/users', userRoutes); // 所有用户相关的路由都在 /api/users 下
app.use('/api/posts', postRouter);       // Mount post-related routes (includes creating/getting comments)
app.use('/api/comments', commentRouter); // Mount comment deletion route
app.use('/api/feed', feedRoutes); // 所有 Feed 相关的路由都在 /api/feed 下

// 启动服务器
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app; // 导出 app 实例，方便测试 