// src/types/global.d.ts
// 全局类型定义, 例如 window 对象的扩展

declare global {
    interface Window {
        // myGlobalVar?: string;
    }
}

// 为了使此文件成为模块，需要添加至少一个 export 语句
export { }; 