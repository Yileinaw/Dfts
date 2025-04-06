// src/utils/validators.ts
// 表单校验或其他验证函数

// 示例：邮箱校验
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// 示例：密码强度校验 (至少6位，包含字母和数字)
export function isStrongPassword(password: string): boolean {
    // Note: Escaped backslash for \d in the regex string
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordRegex.test(password);
}