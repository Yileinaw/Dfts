// Restore original server.ts structure
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import * as cors from 'cors';
import path from 'path';
import authRoutes from './routes/AuthRoutes'; 
import { userRouter } from './routes/UserRoutes'; 
import { postRouter, commentRouter } from './routes/PostRoutes';
import feedRouter from './routes/FeedRoutes'; 
import notificationRouter from './routes/NotificationRoutes'; 
// --- Remove direct imports, rely on userRoutes ---
// import { UserController } from './controllers/UserController'; 
// import { AuthMiddleware } from './middleware/AuthMiddleware';
// --- End Remove ---

console.log("--- RUNNING FULL SERVER.TS ---");

// --- Remove Log Database URL --- 
// console.log('[server.ts] DATABASE_URL used by this process:', process.env.DATABASE_URL);
// --- End Remove Log Database URL ---

dotenv.config(); 

const app: Express = express();
const port = process.env.PORT || 3001; 

// --- Middlewares ---
// app.use((req, res, next) => {
//   console.log(`[Request Logger]: ${req.method} ${req.originalUrl}`);
//   next(); 
// });

// Explicitly configure CORS
const allowedOrigins = ['http://localhost:5173']; // Add other origins if needed

const corsOptions: cors.CorsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // If you need to handle cookies or authorization headers
};
app.use(cors.default(corsOptions));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// --- Static Files Middleware (Moved Before API Routes) ---
// console.log('[server.ts] Mounting static file server for public directory...');
app.use(express.static(path.join(__dirname, '../public'))); 
// --- End Static Files Middleware ---

// --- Base Route (Keep) ---
app.get('/', (req: Request, res: Response) => {
    res.send('TDFRS Backend API is running!');
});

// --- API Routes ---
// console.log('[server.ts] Mounting /api/auth routes...');
app.use('/api/auth', authRoutes);

// console.log('[server.ts] Mounting /api/users routes...');
app.use('/api/users', (req, res, next) => {
    // console.log(`[server.ts] Request to /api/users path: ${req.originalUrl}`);
    next();
}, userRouter); // Restore mounting userRoutes

// console.log('[server.ts] Mounting /api/posts routes...'); 
app.use('/api/posts', postRouter);

// console.log('[server.ts] Mounting /api/comments routes...');
app.use('/api/comments', commentRouter);

// console.log('[server.ts] Mounting /api/feed routes...');
app.use('/api/feed', feedRouter);

// console.log('[server.ts] Mounting /api/notifications routes...');
app.use('/api/notifications', notificationRouter);
// --- End API Routes ---

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

export default app; 