# Vercel + Supabase 連携確認用プロジェクト

このプロジェクトは、VercelとSupabaseの連携が正常に動作するか確認するための軽量なテストプロジェクトです。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseの設定

1. [Supabase](https://supabase.com/)でプロジェクトを作成
2. プロジェクトのSettings > APIから以下を取得：
   - Project URL
   - anon/public key

### 3. 環境変数の設定

`.env.local.example`を`.env.local`にコピーして、実際の値を設定してください：

```bash
cp .env.local.example .env.local
```

`.env.local`ファイルを編集：
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. ローカル開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認してください。

## Vercelへのデプロイ

### 1. Vercelにプロジェクトをインポート

1. [Vercel](https://vercel.com/)にログイン
2. 「New Project」をクリック
3. GitHubリポジトリを選択（または手動でアップロード）

### 2. 環境変数の設定

Vercelのプロジェクト設定で、以下の環境変数を追加：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. デプロイ

設定後、自動的にデプロイが開始されます。

## 確認事項

- ✅ Supabaseへの接続が成功するか
- ✅ Vercelでのビルドが成功するか
- ✅ 環境変数が正しく読み込まれているか

## 注意事項

このプロジェクトは確認用のため、後で大幅に変更する予定です。

