-- 创建数据库
CREATE DATABASE
IF
  NOT EXISTS tffrs_db CHARACTER
  SET utf8mb4 COLLATE utf8mb4_unicode_ci;
  USE tffrs_db;

  -- 用户表
  CREATE TABLE
  IF
    NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY
      , username VARCHAR(50) NOT NULL UNIQUE
      , password VARCHAR(255) NOT NULL
      , email VARCHAR(100) NOT NULL UNIQUE
      , avatar VARCHAR(255) DEFAULT '/images/default-avatar.png'
      , role ENUM('user', 'admin') DEFAULT 'user'
      , preferences TEXT
      , created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      , updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ON
      UPDATE
        CURRENT_TIMESTAMP
    );

    -- 美食分类表
    CREATE TABLE
    IF
      NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY
        , name VARCHAR(50) NOT NULL UNIQUE
        , description TEXT
        , image VARCHAR(255)
        , created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 美食表
      CREATE TABLE
      IF
        NOT EXISTS foods (
          id INT AUTO_INCREMENT PRIMARY KEY
          , name VARCHAR(100) NOT NULL
          , description TEXT
          , category_id INT NOT NULL
          , image VARCHAR(255)
          , ingredients TEXT
          , cooking_method TEXT
          , calories INT
          , prep_time INT
          , -- 准备时间（分钟）
            difficulty ENUM('简单', '中等', '困难') DEFAULT '中等'
          , tags TEXT
          , -- 标签，以逗号分隔
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          , updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ON
          UPDATE
            CURRENT_TIMESTAMP
            , FOREIGN KEY (category_id) REFERENCES categories(id)
          ON DELETE CASCADE
        );

        -- 收藏表
        CREATE TABLE
        IF
          NOT EXISTS favorites (
            id INT AUTO_INCREMENT PRIMARY KEY
            , user_id INT NOT NULL
            , food_id INT NOT NULL
            , created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            , FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE CASCADE
            , FOREIGN KEY (food_id) REFERENCES foods(id)
            ON DELETE CASCADE
            , UNIQUE KEY unique_favorite (user_id, food_id)
          );

          -- 评分表
          CREATE TABLE
          IF
            NOT EXISTS ratings (
              id INT AUTO_INCREMENT PRIMARY KEY
              , user_id INT NOT NULL
              , food_id INT NOT NULL
              , rating TINYINT NOT NULL CHECK (
                rating BETWEEN 1 AND 5
              )
              , comment TEXT
              , created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              , updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              ON
              UPDATE
                CURRENT_TIMESTAMP
                , FOREIGN KEY (user_id) REFERENCES users(id)
              ON DELETE CASCADE
              , FOREIGN KEY (food_id) REFERENCES foods(id)
              ON DELETE CASCADE
              , UNIQUE KEY unique_rating (user_id, food_id)
            );

            -- 浏览历史表
            CREATE TABLE
            IF
              NOT EXISTS view_history (
                id INT AUTO_INCREMENT PRIMARY KEY
                , user_id INT NOT NULL
                , food_id INT NOT NULL
                , view_count INT DEFAULT 1
                , last_viewed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                , created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                , FOREIGN KEY (user_id) REFERENCES users(id)
                ON DELETE CASCADE
                , FOREIGN KEY (food_id) REFERENCES foods(id)
                ON DELETE CASCADE
                , UNIQUE KEY unique_view (user_id, food_id)
              );

              -- 插入测试数据：管理员账号
              INSERT INTO
                users (username, password, email, role)
              VALUES
                (
                  'admin'
                  , '$2b$10$rR1v9.mOlVMNOQ8J2Jp1L.rzyEt6jcVFY0uQm8Kg.CcH0L5ZrzGFS'
                  , 'admin@example.com'
                  , 'admin'
                );
              -- 密码是 'admin123'，已通过bcrypt加密

              -- 插入测试用户
              INSERT INTO
                users (username, password, email)
              VALUES
                (
                  'user1'
                  , '$2b$10$rR1v9.mOlVMNOQ8J2Jp1L.rzyEt6jcVFY0uQm8Kg.CcH0L5ZrzGFS'
                  , 'user1@example.com'
                )
                , (
                  'user2'
                  , '$2b$10$rR1v9.mOlVMNOQ8J2Jp1L.rzyEt6jcVFY0uQm8Kg.CcH0L5ZrzGFS'
                  , 'user2@example.com'
                )
                , (
                  'user3'
                  , '$2b$10$rR1v9.mOlVMNOQ8J2Jp1L.rzyEt6jcVFY0uQm8Kg.CcH0L5ZrzGFS'
                  , 'user3@example.com'
                );
              -- 测试用户密码也是 'admin123'

              -- 插入美食分类
              INSERT INTO
                categories (name, description, image)
              VALUES
                ('中式菜肴', '中国传统美食，包括各大菜系', '/images/白切鸡.jpg')
                , ('西式料理', '西餐美食，包括意大利面、牛排等', '/images/意大利卷面.jpg')
                , ('日式料理', '日本料理，包括寿司、刺身等', '/images/经典寿司.jpg')
                , ('泰式美食', '泰国风味美食，以酸辣为特色', '/images/多拼沙拉.jpg')
                , ('创意料理', '融合各国风味的创新美食', '/images/法式火鸡.jpg')
                , ('家常菜', '家庭常见的简单美味料理', '/images/蛋炒饭.jpg')
                , ('小吃点心', '各式小食和甜点', '/images/柠檬土司.jpg')
                , ('烧烤类', '烤制的肉类和海鲜', '/images/羊肉串.jpg');

              -- 插入美食数据（基于实际图片文件）
              INSERT INTO
                foods (
                  name
                  , description
                  , category_id
                  , image
                  , ingredients
                  , cooking_method
                  , calories
                  , prep_time
                  , difficulty
                  , tags
                )
              VALUES
                -- 中式菜肴
                (
                  '宫保鸡丁'
                  , '经典川菜，鲜香麻辣'
                  , 1
                  , '/images/宫保鸡丁.jpg'
                  , '鸡胸肉,花生,干辣椒,葱姜蒜'
                  , '先炒香料，放入鸡肉翻炒至熟，最后加入花生'
                  , 450
                  , 30
                  , '中等'
                  , '川菜,辣,家常菜'
                )
                , (
                  '水煮肉片'
                  , '川菜代表，麻辣鲜香'
                  , 1
                  , '/images/水煮肉片.jpg'
                  , '猪肉片,豆芽,辣椒,花椒'
                  , '肉片过水，底料爆香，加入配菜和肉片煮熟'
                  , 520
                  , 25
                  , '中等'
                  , '川菜,辣,肉类'
                )
                , (
                  '辣子鸡'
                  , '香辣可口的传统川菜'
                  , 1
                  , '/images/辣子鸡.jpg'
                  , '鸡块,干辣椒,花椒,葱姜蒜'
                  , '鸡块炸至金黄，与香料一同爆炒'
                  , 480
                  , 40
                  , '中等'
                  , '川菜,辣,鸡肉'
                )
                , (
                  '白切鸡'
                  , '经典粤菜，鲜嫩多汁'
                  , 1
                  , '/images/白切鸡.jpg'
                  , '整鸡,葱姜,盐'
                  , '鸡放入冷水中，煮沸后转小火慢炖'
                  , 350
                  , 60
                  , '简单'
                  , '粤菜,鸡肉,清淡'
                )
                , (
                  '蛋炒饭'
                  , '简单美味的家常炒饭'
                  , 6
                  , '/images/蛋炒饭.jpg'
                  , '米饭,鸡蛋,葱花,火腿'
                  , '先炒蛋，加入米饭翻炒均匀'
                  , 400
                  , 15
                  , '简单'
                  , '家常菜,主食,快手菜'
                )
                , (
                  '口味虾'
                  , '麻辣鲜香，回味无穷'
                  , 1
                  , '/images/口味虾.jpg'
                  , '小龙虾,葱姜蒜,辣椒,花椒'
                  , '虾洗净后与调料一同翻炒'
                  , 410
                  , 45
                  , '困难'
                  , '湘菜,辣,海鲜'
                )
                , (
                  '经典扣肉'
                  , '肥而不腻，入口即化'
                  , 1
                  , '/images/经典扣肉.jpg'
                  , '五花肉,酱油,糖,八角'
                  , '肉煮熟后切片，与调料一同炖煮'
                  , 580
                  , 90
                  , '困难'
                  , '徽菜,肉类,红烧'
                )
                , (
                  '东坡肉'
                  , '入口即化的经典名菜'
                  , 1
                  , '/images/东坡肉.jpg'
                  , '五花肉,酱油,糖,葱姜'
                  , '肉块煎至金黄，加入调料慢炖'
                  , 650
                  , 120
                  , '困难'
                  , '川菜,红烧,肉类'
                )
                , (
                  '辣椒牛肉'
                  , '麻辣鲜香的下饭神器'
                  , 1
                  , '/images/辣椒牛肉.jpg'
                  , '牛肉片,青椒,辣椒,蒜'
                  , '牛肉快炒，加入青椒和调料翻炒'
                  , 420
                  , 25
                  , '中等'
                  , '川菜,辣,牛肉'
                )
                , (
                  '春卷'
                  , '香脆可口的传统小吃'
                  , 7
                  , '/images/春卷.jpg'
                  , '春卷皮,肉馅,胡萝卜,豆芽'
                  , '馅料炒熟后包入春卷皮，油炸至金黄'
                  , 300
                  , 40
                  , '中等'
                  , '点心,油炸,小吃'
                )
                , (
                  '油泼面'
                  , '陕西特色面食，香辣过瘾'
                  , 6
                  , '/images/油泼面.jpg'
                  , '面条,辣椒面,花椒,香菜'
                  , '煮面，制作辣椒油泼在面上'
                  , 480
                  , 20
                  , '简单'
                  , '陕西,面食,辣'
                )
                , (
                  '雪里红炒肉'
                  , '酸香开胃的家常菜'
                  , 6
                  , '/images/雪里红炒肉.jpg'
                  , '猪肉片,雪里红,蒜,姜'
                  , '雪里红与肉片一同翻炒'
                  , 380
                  , 20
                  , '简单'
                  , '家常菜,酸辣,炒菜'
                )
                , (
                  '小酥肉'
                  , '外酥里嫩的传统小吃'
                  , 7
                  , '/images/小酥肉.jpg'
                  , '猪肉,淀粉,料酒,葱姜'
                  , '肉切小块裹粉炸至金黄'
                  , 450
                  , 30
                  , '中等'
                  , '小吃,油炸,肉类'
                )
                , (
                  '姑姑肉'
                  , '经典川菜，麻辣开胃'
                  , 1
                  , '/images/姑姑肉.jpg'
                  , '猪肉,辣椒,花椒,葱姜蒜'
                  , '肉片汆烫后与调料拌匀'
                  , 420
                  , 25
                  , '中等'
                  , '川菜,凉菜,肉类'
                )
                , (
                  '叫花鸡'
                  , '外焦里嫩的传统名菜'
                  , 1
                  , '/images/叫花鸡.jpg'
                  , '整鸡,荷叶,香料,黄泥'
                  , '鸡与香料包裹在荷叶中，黄泥封住后烘烤'
                  , 500
                  , 120
                  , '困难'
                  , '徽菜,鸡肉,烤制'
                )
                , (
                  '简单面'
                  , '家常快手的面食'
                  , 6
                  , '/images/简单面.jpg'
                  , '面条,青菜,鸡蛋,葱花'
                  , '煮面，炒菜，组合在一起'
                  , 380
                  , 15
                  , '简单'
                  , '家常菜,面食,快手菜'
                )
                , (
                  '浓汤鸡杂'
                  , '鲜美浓郁的滋补汤品'
                  , 6
                  , '/images/浓汤鸡杂.jpg'
                  , '鸡杂,胡椒,姜,香菜'
                  , '鸡杂焯水后与香料一同炖煮'
                  , 320
                  , 60
                  , '中等'
                  , '汤品,鸡肉,滋补'
                )
                , -- 西式料理
                  (
                  '意大利卷面'
                  , '美味可口的意式面食'
                  , 2
                  , '/images/意大利卷面.jpg'
                  , '意面,番茄酱,牛肉末,洋葱'
                  , '煮面，制作酱料，拌匀'
                  , 520
                  , 35
                  , '中等'
                  , '意餐,面食,番茄'
                )
                , (
                  '西冷牛排'
                  , '鲜嫩多汁的经典西餐'
                  , 2
                  , '/images/西冷牛排.jpg'
                  , '牛排,黑胡椒,盐,迷迭香'
                  , '牛排煎至两面金黄，中间保持粉红'
                  , 650
                  , 20
                  , '中等'
                  , '西餐,牛肉,烤制'
                )
                , (
                  '法式早餐'
                  , '简约精致的法式早点'
                  , 2
                  , '/images/法式早餐.jpg'
                  , '牛角包,果酱,咖啡,水果'
                  , '烤制牛角包，搭配咖啡和水果'
                  , 450
                  , 20
                  , '简单'
                  , '早餐,法餐,面包'
                )
                , (
                  '安格斯汉堡'
                  , '肉质鲜嫩的高端汉堡'
                  , 2
                  , '/images/安格斯汉堡.jpg'
                  , '安格斯牛肉,面包,生菜,番茄酱'
                  , '牛肉饼煎熟，与蔬菜一同夹在面包中'
                  , 680
                  , 25
                  , '中等'
                  , '美食,快餐,牛肉'
                )
                , (
                  '肉酱意面'
                  , '经典的意大利传统面食'
                  , 2
                  , '/images/肉酱意面.jpg'
                  , '意面,牛肉末,番茄酱,洋葱'
                  , '制作肉酱，煮面，拌匀'
                  , 550
                  , 30
                  , '中等'
                  , '意餐,面食,番茄'
                )
                , (
                  '经典意大利面'
                  , '正宗地道的意式面食'
                  , 2
                  , '/images/经典意大利面.jpg'
                  , '意面,橄榄油,大蒜,番茄'
                  , '煮面，制作酱料，拌匀'
                  , 480
                  , 25
                  , '简单'
                  , '意餐,面食,经典'
                )
                , (
                  '西冷焗汤'
                  , '香浓可口的西式汤品'
                  , 2
                  , '/images/西冷焗汤.jpg'
                  , '牛肉,马铃薯,胡萝卜,洋葱'
                  , '牛肉与蔬菜一同炖煮'
                  , 320
                  , 90
                  , '中等'
                  , '西餐,汤品,牛肉'
                )
                , (
                  '法式火鸡'
                  , '节日餐桌上的经典美食'
                  , 2
                  , '/images/法式火鸡.jpg'
                  , '火鸡,香料,黄油,红酒'
                  , '火鸡涂抹调料后烤制'
                  , 750
                  , 180
                  , '困难'
                  , '法餐,禽肉,烤制'
                )
                , (
                  '乌克兰土豆'
                  , '口感独特的东欧风味'
                  , 2
                  , '/images/乌克兰土豆.jpg'
                  , '土豆,洋葱,培根,奶油'
                  , '土豆焖煮后与其他材料混合烤制'
                  , 380
                  , 45
                  , '中等'
                  , '欧餐,土豆,烤制'
                )
                , (
                  '柠檬土司'
                  , '清新可口的简易甜点'
                  , 7
                  , '/images/柠檬土司.jpg'
                  , '土司,柠檬汁,糖,黄油'
                  , '土司涂抹调料后烤制'
                  , 280
                  , 15
                  , '简单'
                  , '甜点,面包,水果'
                )
                , (
                  '焦香蛋卷'
                  , '香甜酥脆的经典甜点'
                  , 7
                  , '/images/焦香蛋卷.jpg'
                  , '鸡蛋,面粉,糖,牛奶'
                  , '面糊烘烤成薄饼后卷起'
                  , 320
                  , 30
                  , '中等'
                  , '甜点,烘焙,蛋类'
                )
                , (
                  '腊肠蛋挞'
                  , '咸甜结合的创意美食'
                  , 7
                  , '/images/腊肠蛋挞.jpg'
                  , '蛋挞皮,蛋液,腊肠,奶油'
                  , '腊肠切丁与蛋液混合，倒入蛋挞皮中烘烤'
                  , 350
                  , 25
                  , '中等'
                  , '创意,烘焙,点心'
                )
                , (
                  '腊肠披萨'
                  , '中西合璧的创意美食'
                  , 5
                  , '/images/腊肠披萨.jpg'
                  , '披萨饼底,腊肠,芝士,番茄酱'
                  , '饼底铺上酱料和配料，烤制至芝士融化'
                  , 680
                  , 35
                  , '中等'
                  , '创意,披萨,腊肠'
                )
                , (
                  '紫罗兰冰激凌'
                  , '色彩斑斓的创意甜点'
                  , 7
                  , '/images/紫罗兰冰激凌.jpg'
                  , '奶油,紫薯,糖,牛奶'
                  , '将材料混合冷冻，定期搅拌'
                  , 280
                  , 240
                  , '中等'
                  , '甜点,冰品,创意'
                )
                , -- 日式料理
                  (
                  '经典寿司'
                  , '正宗的日式寿司拼盘'
                  , 3
                  , '/images/经典寿司.jpg'
                  , '米饭,醋,海苔,三文鱼'
                  , '煮米饭，制作醋饭，包裹食材'
                  , 320
                  , 45
                  , '中等'
                  , '日料,寿司,海鲜'
                )
                , (
                  '海味寿司'
                  , '鲜美海鲜搭配的日式寿司'
                  , 3
                  , '/images/海味寿司.jpg'
                  , '米饭,醋,虾,鱿鱼'
                  , '虾煮熟去壳，与醋饭一起包卷'
                  , 350
                  , 50
                  , '中等'
                  , '日料,寿司,海鲜'
                )
                , (
                  '全家福寿司'
                  , '多种食材组合的豪华寿司'
                  , 3
                  , '/images/全家福寿司.jpg'
                  , '米饭,醋,三文鱼,金枪鱼,牛油果'
                  , '多种食材与醋饭一起卷制'
                  , 380
                  , 60
                  , '困难'
                  , '日料,寿司,豪华'
                )
                , (
                  '鱼柳寿司'
                  , '新鲜鱼肉制作的精致寿司'
                  , 3
                  , '/images/鱼柳寿司.jpg'
                  , '米饭,醋,鱼柳,黄瓜'
                  , '鱼柳切片，与醋饭一起捏制'
                  , 330
                  , 40
                  , '中等'
                  , '日料,寿司,鱼类'
                )
                , (
                  '军舰寿司'
                  , '独特造型的日式寿司'
                  , 3
                  , '/images/军舰寿司.jpg'
                  , '米饭,醋,海苔,鱼子酱'
                  , '醋饭包裹在海苔外，顶部放上鱼子酱'
                  , 290
                  , 35
                  , '中等'
                  , '日料,寿司,高级'
                )
                , (
                  '鹅肝寿司'
                  , '奢华食材制作的高级寿司'
                  , 3
                  , '/images/鹅肝寿司.jpg'
                  , '米饭,醋,鹅肝,金箔'
                  , '鹅肝煎制后放在醋饭上，点缀金箔'
                  , 400
                  , 40
                  , '困难'
                  , '日料,寿司,奢华'
                )
                , -- 其他美食
                  (
                  '烤鸡柳'
                  , '外酥里嫩的美味小吃'
                  , 8
                  , '/images/烤鸡柳.jpg'
                  , '鸡胸肉,孜然,辣椒粉,盐'
                  , '鸡肉切条，裹上调料烤制'
                  , 320
                  , 25
                  , '简单'
                  , '烧烤,鸡肉,香辣'
                )
                , (
                  '羊肉串'
                  , '鲜嫩多汁的经典烧烤'
                  , 8
                  , '/images/羊肉串.jpg'
                  , '羊肉,孜然,辣椒粉,盐'
                  , '羊肉切块，串在竹签上烤制'
                  , 450
                  , 30
                  , '简单'
                  , '烧烤,羊肉,香辣'
                )
                , (
                  '多拼沙拉'
                  , '健康美味的泰式沙拉'
                  , 4
                  , '/images/多拼沙拉.jpg'
                  , '生菜,番茄,黄瓜,柠檬汁'
                  , '将蔬菜切块，拌入酱料'
                  , 180
                  , 15
                  , '简单'
                  , '泰餐,沙拉,健康'
                )
                , (
                  '旦旦面'
                  , '鲜香滑嫩的特色面食'
                  , 6
                  , '/images/旦旦面.jpg'
                  , '面条,肉末,芝麻酱,花生'
                  , '煮面，制作酱料，拌匀'
                  , 520
                  , 25
                  , '中等'
                  , '创意,面食,芝麻'
                )
                , (
                  '玉米纳豆'
                  , '营养健康的创意料理'
                  , 5
                  , '/images/玉米纳豆.jpg'
                  , '玉米粒,纳豆,葱花,酱油'
                  , '将材料混合拌匀'
                  , 250
                  , 10
                  , '简单'
                  , '创意,健康,素食'
                )
                , (
                  '板板肉'
                  , '香辣鲜嫩的地方特色'
                  , 1
                  , '/images/板板肉.jpg'
                  , '牛肉,辣椒,花椒,葱姜蒜'
                  , '牛肉煎熟后切片，淋上热油和调料'
                  , 480
                  , 30
                  , '中等'
                  , '川菜,辣,牛肉'
                )
                , (
                  '腊味拼盘'
                  , '多种腊味组合的经典粤菜'
                  , 1
                  , '/images/腊味拼盘.jpg'
                  , '腊肠,腊肉,腊鸭,青菜'
                  , '腊味蒸熟后切片摆盘'
                  , 520
                  , 40
                  , '简单'
                  , '粤菜,腊味,拼盘'
                )
                , (
                  '牛肉拼盘'
                  , '多种牛肉部位的豪华拼盘'
                  , 2
                  , '/images/牛肉拼盘.jpg'
                  , '牛排,牛舌,牛肚,芥末'
                  , '各部位分别烹饪后切片摆盘'
                  , 580
                  , 60
                  , '困难'
                  , '西餐,牛肉,拼盘'
                )
                , (
                  '留一手龙虾'
                  , '鲜美可口的海鲜料理'
                  , 5
                  , '/images/留一手龙虾.jpg'
                  , '龙虾,葱姜蒜,黄油,香草'
                  , '龙虾煮熟后，与调料一同翻炒'
                  , 420
                  , 45
                  , '困难'
                  , '海鲜,龙虾,创意'
                )
                , (
                  '蚕蛹炒肉'
                  , '独特风味的地方特色'
                  , 5
                  , '/images/蚕蛹炒肉.jpg'
                  , '蚕蛹,猪肉,青椒,葱姜蒜'
                  , '蚕蛹与肉一同翻炒'
                  , 380
                  , 20
                  , '中等'
                  , '创意,特色,炒菜'
                )
                , (
                  '原切三文鱼'
                  , '新鲜鲜嫩的高级刺身'
                  , 3
                  , '/images/原切三文鱼.jpg'
                  , '三文鱼,酱油,山葵,姜丝'
                  , '三文鱼切片，搭配调料食用'
                  , 280
                  , 15
                  , '简单'
                  , '日料,刺身,海鲜'
                )
                , (
                  '杂烩海味'
                  , '多种海鲜混合的鲜美料理'
                  , 4
                  , '/images/杂烩海味.jpg'
                  , '虾,贝类,鱿鱼,柠檬草'
                  , '海鲜与香料一同炖煮'
                  , 360
                  , 40
                  , '中等'
                  , '泰餐,海鲜,汤品'
                )
                , (
                  '香辣虾球'
                  , '鲜辣可口的海鲜佳肴'
                  , 1
                  , '/images/香辣虾球.jpg'
                  , '虾仁,辣椒,蒜,香菜'
                  , '虾仁裹粉炸熟，与调料一同翻炒'
                  , 380
                  , 30
                  , '中等'
                  , '川菜,海鲜,辣'
                );

              -- 插入一些收藏数据
              INSERT INTO
                favorites (user_id, food_id)
              VALUES
                (2, 1)
                , (2, 5)
                , (2, 10)
                , (3, 2)
                , (3, 7)
                , (3, 12)
                , (4, 3)
                , (4, 8)
                , (4, 15);

              -- 插入一些评分数据
              INSERT INTO
                ratings (user_id, food_id, rating, comment)
              VALUES
                (2, 1, 5, '太好吃了，尤其是宫保鸡丁的麻辣味道，非常正宗！')
                , (2, 5, 4, '简单易做，味道很好，适合忙碌时光的快手菜')
                , (2, 10, 5, '外皮酥脆，馅料丰富，很好的开胃小吃')
                , (3, 2, 4, '麻辣鲜香，肉片嫩滑，非常美味')
                , (3, 7, 5, '入口即化，肥而不腻，是我吃过的最好的扣肉')
                , (3, 12, 3, '味道还可以，但是有点太咸了')
                , (4, 3, 5, '非常香辣，很有层次感，是我的最爱')
                , (4, 8, 4, '肉质鲜嫩多汁，很有特色')
                , (4, 15, 5, '非常正宗的家乡味道，让我回忆起小时候');

              -- 添加索引以优化查询
              CREATE INDEX idx_foods_category
              ON foods(category_id);
              CREATE INDEX idx_ratings_food_id
              ON ratings(food_id);
              CREATE INDEX idx_favorites_user_id
              ON favorites(user_id);
              CREATE INDEX idx_view_history_user_id
              ON view_history(user_id);