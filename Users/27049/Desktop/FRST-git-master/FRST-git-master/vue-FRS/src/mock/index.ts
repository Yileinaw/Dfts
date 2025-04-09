// Ensure Mock.js and potentially @types/mockjs are installed: npm install mockjs --save-dev
// npm install @types/mockjs --save-dev (if available)
import Mock from 'mockjs';
import collectionHandlers from './handlers/collection';
import userHandlers from './handlers/user';

// Combine all handlers
const handlers = [
    ...collectionHandlers,
    ...userHandlers,
    // Add other handlers here (e.g., food, post handlers) when created
];

// Helper type for handler structure (optional but good practice)
interface MockHandler {
    url: string | RegExp;
    type?: 'get' | 'post' | 'put' | 'delete';
    response: (options: any) => any; // Mock.js types can be complex, using 'any' for simplicity here
}

// Setup Mock.js interceptors
(handlers as MockHandler[]).forEach(({ url, type, response }) => {
    Mock.mock(url, type || 'get', response);
});

console.log('Mock.js setup complete.');

// Conditionally enable mock based on environment variable
// Example: Ensure VITE_USE_MOCK=true in your .env file
// if (import.meta.env.VITE_USE_MOCK !== 'true') {
//   console.log('Mocking is disabled.');
// } else {
//   // Setup Mock.js interceptors inside the condition
//   (handlers as MockHandler[]).forEach(({ url, type, response }) => {
//     Mock.mock(url, type || 'get', response);
//   });
//   console.log('Mock.js setup complete.');
// } 