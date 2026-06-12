-- MySQL MCPサーバー用のデータベースセットアップ

-- データベースが存在しない場合は作成
CREATE DATABASE IF NOT EXISTS my_test_db;

-- データベースを使用
USE my_test_db;

-- サンプルテーブル: ユーザー
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active'
);

-- サンプルテーブル: 商品
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- サンプルテーブル: 注文
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- サンプルテーブル: 注文詳細
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- ダミーデータの挿入: ユーザー
INSERT INTO users (username, email, status) VALUES
('john_doe', 'john@example.com', 'active'),
('jane_smith', 'jane@example.com', 'active'),
('robert_johnson', 'robert@example.com', 'inactive'),
('sarah_williams', 'sarah@example.com', 'active'),
('michael_brown', 'michael@example.com', 'suspended')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- ダミーデータの挿入: 商品
INSERT INTO products (name, description, price, stock, category) VALUES
('ノートパソコン', '15インチ高性能ノートパソコン', 89800.00, 25, 'electronics'),
('ワイヤレスヘッドフォン', 'ノイズキャンセリング機能付きヘッドフォン', 24500.00, 40, 'electronics'),
('コーヒーメーカー', '自動タイマー付きコーヒーメーカー', 8500.00, 15, 'kitchen'),
('スマートウォッチ', '健康モニタリング機能付き', 32000.00, 30, 'wearables'),
('ゲーミングマウス', '高精度センサー搭載', 6800.00, 50, 'gaming')
ON DUPLICATE KEY UPDATE price = VALUES(price), stock = VALUES(stock);

-- サンプルの注文を作成（もし注文テーブルが空の場合）
INSERT INTO orders (user_id, status, total_amount)
SELECT 1, 'delivered', 89800.00
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM orders LIMIT 1);

-- 注文の詳細を追加（もし注文アイテムテーブルが空の場合）
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT 1, 1, 1, 89800.00
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM order_items LIMIT 1);

-- さらに注文を追加
INSERT INTO orders (user_id, status, total_amount)
SELECT 2, 'processing', 24500.00
FROM dual
WHERE (SELECT COUNT(*) FROM orders) < 2;

-- 注文の詳細を追加
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT 2, 2, 1, 24500.00
FROM dual
WHERE (SELECT COUNT(*) FROM order_items) < 2;

-- インデックスの作成（パフォーマンス向上のため）
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- MCPサーバーのアクセス権限を持つユーザーの作成
-- 注意: 本番環境では適切な権限管理が必要です
-- CREATE USER IF NOT EXISTS 'mcp_user'@'%' IDENTIFIED BY 'your_secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON my_test_db.* TO 'mcp_user'@'%';
-- FLUSH PRIVILEGES;

-- 設定情報の表示
SELECT 'セットアップが完了しました：サンプルデータベースが準備されました' as Message;
SELECT DATABASE() as CurrentDatabase;
SELECT COUNT(*) as UserCount FROM users;
SELECT COUNT(*) as ProductCount FROM products;
SELECT COUNT(*) as OrderCount FROM orders;
