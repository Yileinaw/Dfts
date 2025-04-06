/**
 * 格式化日期为相对时间字符串
 * @param date - 日期对象或可解析的日期字符串
 * @returns 相对时间字符串 (e.g., '5分钟前', '2小时前', '昨天', '3天前', '2023-10-27')
 */
export function formatRelativeTime(date: string | Date): string {
    const inputDate = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(inputDate.getTime())) {
        return '无效日期';
    }

    const now = new Date();
    const diffSeconds = Math.round((now.getTime() - inputDate.getTime()) / 1000);
    const diffMinutes = Math.round(diffSeconds / 60);
    const diffHours = Math.round(diffMinutes / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSeconds < 60) {
        return '刚刚';
    } else if (diffMinutes < 60) {
        return `${diffMinutes}分钟前`;
    } else if (diffHours < 24) {
        return `${diffHours}小时前`;
    } else if (diffDays === 1) {
        return '昨天';
    } else if (diffDays < 7) {
        return `${diffDays}天前`;
    } else {
        // 超过一周，直接显示日期
        const year = inputDate.getFullYear();
        const month = (inputDate.getMonth() + 1).toString().padStart(2, '0');
        const day = inputDate.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
} 