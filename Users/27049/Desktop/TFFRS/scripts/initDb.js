const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');

// 数据库配置
const dbConfig = {
    host: 'localhost',
    user: 'root',          // 数据库用户名
    password: '123456',    // 数据库密码，请修改为您的实际密码
    multipleStatements: true  // 允许执行多条SQL语句
};

console.log('正在连接到MySQL数据库...');

// 创建数据库连接
const connection = mysql.createConnection(dbConfig);

// 读取SQL初始化文件
const sqlFilePath = path.join(__dirname, '../config/db_init.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

console.log('读取SQL初始化文件成功，准备执行...');

// 执行SQL文件内容
connection.query(sqlContent, (err, results) => {
    if (err) {
        console.error('数据库初始化失败:', err);
        process.exit(1);
    }

    console.log('数据库初始化成功!');
    console.log('已创建以下内容:');
    console.log(' - 数据库: tffrs_db');
    console.log(' - 表: users, categories, foods, favorites, ratings, view_history');
    console.log(' - 示例数据: 管理员账户、测试用户、食物分类、美食数据');

    // 关闭连接
    connection.end((endErr) => {
        if (endErr) {
            console.error('关闭数据库连接失败:', endErr);
            process.exit(1);
        }

        console.log('数据库连接已关闭');
        process.exit(0);
    });
});

process.on('uncaughtException', (err) => {
    console.error('发生未捕获的异常:', err);
    connection.end();
    process.exit(1);
}); 