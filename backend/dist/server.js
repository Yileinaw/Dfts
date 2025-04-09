"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Restore original server.ts structure
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors = __importStar(require("cors"));
const path_1 = __importDefault(require("path"));
const AuthRoutes_1 = __importDefault(require("./routes/AuthRoutes"));
const UserRoutes_1 = require("./routes/UserRoutes");
const PostRoutes_1 = require("./routes/PostRoutes");
const FeedRoutes_1 = __importDefault(require("./routes/FeedRoutes"));
const NotificationRoutes_1 = __importDefault(require("./routes/NotificationRoutes"));
// --- Remove direct imports, rely on userRoutes ---
// import { UserController } from './controllers/UserController'; 
// import { AuthMiddleware } from './middleware/AuthMiddleware';
// --- End Remove ---
console.log("--- RUNNING FULL SERVER.TS ---");
// --- Remove Log Database URL --- 
// console.log('[server.ts] DATABASE_URL used by this process:', process.env.DATABASE_URL);
// --- End Remove Log Database URL ---
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// --- Middlewares ---
// app.use((req, res, next) => {
//   console.log(`[Request Logger]: ${req.method} ${req.originalUrl}`);
//   next(); 
// });
// Explicitly configure CORS
const allowedOrigins = ['http://localhost:5173']; // Add other origins if needed
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
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
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// --- Static Files Middleware (Moved Before API Routes) ---
// console.log('[server.ts] Mounting static file server for public directory...');
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// --- End Static Files Middleware ---
// --- Base Route (Keep) ---
app.get('/', (req, res) => {
    res.send('TDFRS Backend API is running!');
});
// --- API Routes ---
// console.log('[server.ts] Mounting /api/auth routes...');
app.use('/api/auth', AuthRoutes_1.default);
// console.log('[server.ts] Mounting /api/users routes...');
app.use('/api/users', (req, res, next) => {
    // console.log(`[server.ts] Request to /api/users path: ${req.originalUrl}`);
    next();
}, UserRoutes_1.userRouter); // Restore mounting userRoutes
// console.log('[server.ts] Mounting /api/posts routes...'); 
app.use('/api/posts', PostRoutes_1.postRouter);
// console.log('[server.ts] Mounting /api/comments routes...');
app.use('/api/comments', PostRoutes_1.commentRouter);
// console.log('[server.ts] Mounting /api/feed routes...');
app.use('/api/feed', FeedRoutes_1.default);
// console.log('[server.ts] Mounting /api/notifications routes...');
app.use('/api/notifications', NotificationRoutes_1.default);
// --- End API Routes ---
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
exports.default = app;
//# sourceMappingURL=server.js.map