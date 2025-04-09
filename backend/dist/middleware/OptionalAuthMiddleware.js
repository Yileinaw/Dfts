"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OptionalAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../db"));
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY';
const OptionalAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    // Only proceed if header exists and has Bearer format
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            // Verify user existence in DB as well
            const user = yield db_1.default.user.findUnique({ where: { id: decoded.userId } });
            if (user) {
                req.userId = decoded.userId; // Attach userId if token is valid and user exists
            }
        }
        catch (error) { // Add :any type
            // Invalid token? Ignore, treat as guest. Don't send 401.
            console.warn('Optional Auth: Invalid token provided, proceeding as guest.', error.message);
        }
    }
    // Always call next(), whether authenticated or not
    next();
});
exports.OptionalAuthMiddleware = OptionalAuthMiddleware;
//# sourceMappingURL=OptionalAuthMiddleware.js.map