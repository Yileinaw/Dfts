// Restore original server.ts structure
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/AuthRoutes'; 
import userRoutes from './routes/UserRoutes'; 
import { postRouter, commentRouter } from './routes/PostRoutes'; 
import feedRoutes from './routes/FeedRoutes'; 
import notificationRoutes from './routes/NotificationRoutes'; // 导入通知路由
// --- Remove direct imports, rely on userRoutes ---
// import { UserController } from './controllers/UserController'; 
// import { AuthMiddleware } from './middleware/AuthMiddleware';
// --- End Remove ---

console.log("--- RUNNING FULL SERVER.TS ---"); // Update log message

dotenv.config(); 

const app: Express = express();
const port = process.env.PORT || 3001; 

// --- Restore Middlewares ---
app.use((req, res, next) => {
  console.log(`[Request Logger]: ${req.method} ${req.originalUrl}`);
  next(); 
});
// Explicitly configure CORS
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your frontend origin
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Allow necessary methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow necessary headers
  credentials: true // Allow cookies if needed later
}));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
// --- End Restore Middlewares ---

// --- Remove direct route definitions --- 
// app.get('/api/users/me/posts', ...); 
// app.get('/api/users/me', ...); 
// app.put('/api/users/profile', ...); 
// --- End Remove ---

// 基础路由 (Keep)
app.get('/', (req: Request, res: Response) => {
    res.send('TDFRS Backend API is running!');
});

// --- Restore Route Mounts ---
console.log('[server.ts] Mounting /api/auth routes...');
app.use('/api/auth', authRoutes);

console.log('[server.ts] Mounting /api/users routes...');
app.use('/api/users', (req, res, next) => { // Keep the logger middleware for /api/users
    console.log(`[server.ts] Request to /api/users path: ${req.originalUrl}`);
    next(); 
}, userRoutes); // Restore mounting userRoutes

console.log('[server.ts] Mounting /api/posts routes...'); 
app.use('/api/posts', postRouter);

console.log('[server.ts] Mounting /api/comments routes...');
app.use('/api/comments', commentRouter);

console.log('[server.ts] Mounting /api/feed routes...');
app.use('/api/feed', feedRoutes);

console.log('[server.ts] Mounting /api/notifications routes...'); // 添加日志
app.use('/api/notifications', notificationRoutes); // 挂载通知路由
// --- End Restore Route Mounts ---

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app; 