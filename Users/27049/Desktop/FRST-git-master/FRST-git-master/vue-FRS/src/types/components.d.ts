// src/types/components.d.ts
// 组件相关类型定义, 例如 props 或 emits

// 示例：一个按钮组件的 Props 类型
export interface MyButtonProps {
    type?: 'primary' | 'default' | 'danger';
    disabled?: boolean;
} 