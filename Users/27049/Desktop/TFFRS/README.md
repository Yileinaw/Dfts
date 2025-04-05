# TFFRS 美食推荐系统

一个简单实用的美食推荐系统，帮助用户发现、收藏和评价美味佳肴。使用原生JavaScript实现，无需框架依赖。

## 技术栈

- **前端**: 原生JavaScript (无框架依赖)
- **后端**: Node.js + Express
- **数据库**: MySQL 8.0

## 主要功能

1. **用户系统**
   - 注册/登录/修改密码
   - 基于Session的用户认证
   - 个人主页管理

2. **美食浏览**
   - 分类查看/搜索
   - 排序和筛选
   - 美食详情展示

3. **收藏系统**
   - 添加/取消收藏
   - 收藏列表管理

4. **评分系统**
   - 五星评分机制
   - 评论功能
   - 防重复提交

5. **推荐系统**
   - 基于用户行为的个性化推荐
   - 基于内容的相似美食推荐

6. **管理后台**
   - 美食管理 (增删改查)
   - 用户管理

## 快速开始

### 前提条件

- Node.js (v12+)
- MySQL 8.0
- Navicat (用于数据库可视化操作，可选)

### 安装步骤

1. 克隆项目

```bash
git clone https://your-repo-url/TFFRS.git
cd TFFRS
```

2. 安装依赖

```bash
npm install
```

3. 配置数据库

编辑 `config/database.js` 文件，更新数据库连接信息：

```javascript
host: 'localhost',
user: '你的数据库用户名',
password: '你的数据库密码',
database: 'tffrs_db'
```

4. 创建数据库和表

可以使用提供的SQL脚本初始化数据库：

```bash
# 使用MySQL命令行客户端
mysql -u 用户名 -p < config/db_init.sql
```

或者通过Navicat导入`config/db_init.sql`文件执行。

5. 启动应用

```bash
node start.js
```

6. 访问应用

打开浏览器，访问 `http://localhost:3000`

## 项目结构

```
TFFRS/
│
├── config/             # 配置文件
│   ├── database.js     # 数据库配置
│   └── db_init.sql     # 数据库初始化脚本
│
├── controllers/        # 控制器
│   ├── authController.js
│   ├── foodController.js
│   ├── favoriteController.js
│   └── ratingController.js
│
├── models/             # 数据模型
│   ├── user.js
│   ├── food.js
│   ├── favorite.js
│   └── rating.js
│
├── public/             # 静态资源
│   ├── css/            # 样式文件
│   ├── js/             # 客户端脚本
│   └── img/            # 图片资源
│
├── routes/             # 路由
│   ├── auth.js
│   ├── foods.js
│   ├── favorites.js
│   └── ratings.js
│
├── utils/              # 工具函数
│   ├── middlewares.js  # 中间件
│   └── recommender.js  # 推荐算法
│
├── views/              # 视图文件 (如有需要)
│
├── app.js              # 应用入口
├── start.js            # 启动脚本
├── package.json        # 依赖配置
└── README.md           # 项目说明
```

## 管理员账号

系统初始化时会创建一个管理员账号：

- 用户名: admin
- 密码: admin123

## 开发说明

### 前端开发

前端采用原生JavaScript开发，所有JS文件位于`public/js/`目录下：

- `app.js`: 应用主文件
- `api.js`: API调用封装
- `auth.js`: 认证相关功能
- `router.js`: 前端路由器
- `ui.js`: UI操作辅助工具

### 后端开发

后端使用Node.js和Express框架，RESTful API设计：

- 所有API路由以`/api/`开头
- 返回JSON格式响应
- 使用HTTP状态码表示请求状态

## 部署说明

### 生产环境配置

1. 设置环境变量

```bash
export NODE_ENV=production
export PORT=80
```

2. 使用PM2进行进程管理

```bash
npm install -g pm2
pm2 start start.js --name tffrs
```

## 贡献指南

欢迎提交问题和功能请求。对于大的变更，请先开issue讨论。

## 许可证

[MIT License](LICENSE) 