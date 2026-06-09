# Everforth GitHub MCP Server

- この MCP server は github に graphql アクセスを投げるシンプルなもの
- Motivation
  - アクセストークンをセキュアに扱う（Cursor Agent に与えない）
  - 実は[公式 MCP](https://github.com/modelcontextprotocol/servers/tree/main/src/github)がまともに使えなかった & ProjectV2（カンバン）を使うならいずれにせよ graphql が必要
- パブリックイメージを置いておいたので Cursor に設定するだけで使える
  - Dockerfile も置いてあるので、好きにカスタマイズしてビルドして使って OK

## How to use

- Cursor の mcp.json に下記の `github-cli` セクションを追加してください
- `env` の `<PERSONAL_ACCESS_TOKEN>` に自分の GitHub アクセストークンを貼ってください
- Cursor を restart してください
- 必要に応じて、Rules にインストラクションを追加してください
  - [参考用: <>で囲われている Owner 名と Repository 名をご自身の環境に合わせて変えてください](/samples/github.mdc)

```
{
  "mcpServers": {
    "github-cli": {
      "command": "docker",
      "args": [
        "run",
        "-i",
        "--rm",
        "-e",
        "GITHUB_PERSONAL_ACCESS_TOKEN",
        "ikutani41/github-cli-mcp-server"
      ],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "<PERSONAL ACCESS TOKEN HERE>"
      }
    }
  }
}
```

## 自分でビルドして使いたい場合

- `npm install`
- `docker build -t {hoge}/github-cli-mcp-server -f Dockerfile .`
