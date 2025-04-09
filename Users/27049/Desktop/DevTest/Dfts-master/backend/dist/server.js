"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// --- Start Minimal server.ts ---
const express_1 = __importDefault(require("express"));
// import dotenv from 'dotenv'; // Removed
// import cors from 'cors'; // Removed
// import authRoutes from './routes/AuthRoutes'; // 导入认证路由
// import userRoutes from './routes/UserRoutes'; // 导入用户路由
// import { postRouter, commentRouter } from './routes/PostRoutes'; // 导入帖子路由和评论路由
// import feedRoutes from './routes/FeedRoutes'; // 导入 Feed 路由
// --- Import Controller and Middleware directly for testing ---
// import { UserController } from './controllers/UserController'; 
// import { AuthMiddleware } from './middleware/AuthMiddleware';
// --- End Import ---
console.log("--- RUNNING ABSOLUTE MINIMAL SERVER.TS ---");
// dotenv.config(); // Removed
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Removed all middleware (cors, json, urlencoded, logger)
// The *only* route defined
app.get('/api/users/me/posts', (req, res) => {
    console.log("--- MINIMAL SERVER: Matched /api/users/me/posts ---");
    // Directly send success, no controller/service needed for this test
    res.status(200).json({ message: "Minimal server test successful!" });
});
// Removed base route and all other app.use/app.get/app.put
// Catch-all for any other route (optional, helps confirm if *any* request reaches)
app.use((req, res) => {
    console.log(`--- MINIMAL SERVER: Unmatched route: ${req.method} ${req.originalUrl} ---`);
    res.status(404).send('Minimal Server: Route Not Found');
});
app.listen(port, () => {
    console.log(`[minimal server]: Server is running at http://localhost:${port}`);
});
exports.default = app;
// --- End Minimal server.ts --- 
//# sourceMappingURL=server.js.map