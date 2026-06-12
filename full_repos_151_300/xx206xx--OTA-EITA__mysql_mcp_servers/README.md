# MySQL MCP Server

このプロジェクトは、MCP (Model Context Protocol) を使用してMySQLデータベースとやり取りするためのサーバーを提供します。WSL環境でMySQLデータベースにアクセスするためのインターフェースを提供します。

## 機能

- MySQLデータベース内のテーブル一覧の取得
- テーブルからのデータ読み取り（最大100行）
- SQLクエリの実行（SELECT、SHOW TABLES、INSERT、UPDATE、DELETEなど）

## プロジェクト構造

```
src/mysql_mcp_server/
├── __init__.py        # パッケージ初期化
├── config/           # 設定関連モジュール
│   ├── __init__.py  
│   └── settings.py   # データベース設定
├── database/         # データベース操作モジュール
│   ├── __init__.py  
│   ├── connection.py # DB接続処理
│   └── errors.py     # エラークラス
├── tools/            # ツールモジュール
│   ├── __init__.py  
│   └── sql_tools.py  # SQL実行ツール
└── server.py         # MCPサーバーメイン
```

## インストールと実行

### 前提条件

- Python 3.11以上
- MySQLサーバー（ローカルまたはリモート）
- 仮想環境（virtualenv）
- Docker（Dockerを使用する場合）

### セットアップ

1. リポジトリをクローン：
   ```
   git clone <repository-url>
   cd mysql_mcp_server
   ```

2. 仮想環境を作成し、アクティベート：
   ```
   python -m venv .venv
   source .venv/bin/activate  # Linuxの場合
   ```

3. 依存関係をインストール：
   ```
   pip install -r requirements.txt .
   ```


4. セットアップスクリプトを実行して、実行スクリプトに実行権限を付与：
   ```
   chmod +x setup.sh
   ./setup.sh
   ```

### 実行方法

以下のいずれかの方法でサーバーを実行できます：

#### 1. 直接実行

```bash
./run_direct.sh
```

#### 2. モジュールとして実行

```bash
./run_module.sh
```

#### 3. Dockerコンテナで実行

```bash
# Dockerイメージをビルド
docker build -t mysql-mcp-server:latest .

# コンテナを実行
./run_docker.sh
```

## 環境変数

サーバーは以下の環境変数を使用してMySQLに接続します：

- `MYSQL_HOST`: MySQLサーバーのホスト（デフォルト: `host.docker.internal`）
- `MYSQL_PORT`: MySQLサーバーのポート（デフォルト: `13306`）
- `MYSQL_USER`: MySQLユーザー名
- `MYSQL_PASSWORD`: MySQLパスワード
- `MYSQL_DATABASE`: 使用するデータベース名

## MCPプロトコル

このサーバーはMCP（Model Control Protocol）を実装しており、以下のエンドポイントを提供します：

- `list_resources`: データベース内のテーブル一覧を取得
- `read_resource`: 特定のテーブルからデータを読み取り
- `list_tools`: 利用可能なツール（SQLクエリの実行）を一覧表示
- `call_tool`: SQLクエリを実行

## WSL連携

WSL（Windows Subsystem for Linux）環境内のMySQLサーバーに接続する場合：

1. WSL内のMySQLサーバーが起動していることを確認
2. WSL内のMySQLがリモート接続を許可するように設定されていることを確認
   - `/etc/mysql/mysql.conf.d/mysqld.cnf`ファイルでbind-addressを`0.0.0.0`に変更
   - 使用するMySQLユーザーにリモートからのアクセス権限を付与
3. Windows側のファイアウォールがMySQLポート（デフォルト13306）への接続を許可していることを確認

## 開発

### Noxセッション

このプロジェクトは、テスト、フォーマット、リントのためのNoxセッションを提供しています。

1. Noxをインストール：
   ```
   pip install nox
   ```

2. 全てのテストを実行：
   ```
   nox -s test
   ```

3. コードをフォーマット：
   ```
   nox -s format
   ```

4. リントチェックを実行：
   ```
   nox -s lint
   ```

### 直接テストを実行

```bash
pytest tests/
```

### コードカバレッジを確認

```bash
pytest --cov=src.mysql_mcp_server tests/
```

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。
