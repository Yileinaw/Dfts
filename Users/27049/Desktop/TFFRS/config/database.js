const mysql = require('mysql2');

// 数据库配置
const dbConfig = {
    host: 'localhost',
    user: 'root',          // 数据库用户名
    password: '123456',    // 数据库密码，请修改为您的实际密码
    database: 'tffrs_db',  // 数据库名
    connectionLimit: 10,   // 连接池大小
    waitForConnections: true
};

// 创建数据库连接池
const pool = mysql.createPool(dbConfig);

// 测试连接
pool.getConnection((err, connection) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('数据库连接成功!');
    connection.release();
});

// 封装查询方法
function query(sql, params) {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

module.exports = { query, pool, dbConfig }; 