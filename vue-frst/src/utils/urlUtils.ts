import http from '@/http'; // 导入 http 实例以获取 baseURL
// import defaultAvatarPlaceholder from '@/assets/images/default-avatar.png'; // <-- 移除导入

/**
 * Resolves a potentially relative backend asset URL (like avatar or image uploads)
 * into a full URL, handling the base URL and removing '/api' if present.
 * If the input url is invalid, returns an empty string.
 * 
 * @param url The relative URL path from the backend (e.g., /uploads/avatars/...) or an absolute URL.
 * @returns The fully resolved URL or an empty string.
 */
// export const resolveStaticAssetUrl = (url: string | null | undefined, defaultPath: string = '/avatars/default/default.png'): string => {
export const resolveStaticAssetUrl = (url: string | null | undefined): string => { // <-- 移除 defaultPath 参数
    // Use default avatar placeholder if url is null or undefined or an empty string
    if (!url) {
        // return defaultAvatarPlaceholder; // <-- 不再返回导入的占位符
        return ''; // <-- 返回空字符串，让 el-avatar 显示默认占位符
    }
    const urlToProcess = url; // url is guaranteed to be truthy here

    // If it's already an absolute URL, return it directly
    if (urlToProcess.startsWith('http://') || urlToProcess.startsWith('https://')) {
        return urlToProcess;
    }
    
    // Construct the base URL for static files (remove /api if present)
    const apiBaseUrl = http.defaults.baseURL || '';
    const staticBaseUrl = apiBaseUrl.replace(/\/api\/?$/, ''); // Remove trailing /api or /api/
    
    // Ensure the relative URL starts with a slash
    const relativeUrl = urlToProcess.startsWith('/') ? urlToProcess : '/' + urlToProcess;
    
    const finalUrl = `${staticBaseUrl}${relativeUrl}`;
    // console.log(`[resolveStaticAssetUrl] Resolved ${url} to ${finalUrl}`); // Optional debug log
    return finalUrl;
}; 