/**
 * 项目启动脚本
 */

const app = require('./app');
const path = require('path');
const fs = require('fs');

// 确保必要的目录存在
const publicSubDirs = ['css', 'js', 'img'];
publicSubDirs.forEach(dir => {
    const dirPath = path.join(__dirname, 'public', dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// 创建默认图片目录
const defaultImgPath = path.join(__dirname, 'public', 'img', 'default-food.jpg');
if (!fs.existsSync(defaultImgPath)) {
    // 这里可以添加创建默认图片的逻辑，或者提示用户需要添加图片
    console.log('提示: 请确保 public/img 目录中存在 default-food.jpg 作为默认图片');
}

// 检查数据库配置文件
const dbConfigPath = path.join(__dirname, 'config', 'database.js');
if (fs.existsSync(dbConfigPath)) {
    console.log('数据库配置文件已存在，请确保配置正确');
} else {
    console.log('警告: 未找到数据库配置文件');
}

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
  ====================================================
     TFFRS 美食推荐系统已启动
  ----------------------------------------------------
     本地访问: http://localhost:${PORT}
     服务运行在端口: ${PORT}
  ====================================================
  `);
}); 