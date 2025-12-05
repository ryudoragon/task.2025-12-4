# QuestDo - 詳細設計書

## 1. プロジェクト概要

### 1.1 プロジェクト名
**QuestDo** - ゲーミフィケーションされたソーシャルタスク管理アプリケーション

### 1.2 コンセプト
QuestDoは、日常のタスクを「クエスト」として管理し、タスク完了時にXP、コイン、ボスへのダメージを獲得できるゲーミフィケーション型タスク管理アプリです。

### 1.3 コア機能
- **タスク管理**: クエストとしてタスクを作成・管理
- **実績システム**: 日次・週次・生涯実績の達成システム
- **週次レイドボス**: 全ユーザーが協力して倒す週次ボス
- **統計管理**: 日次・週次の統計データ集計
- **報酬システム**: XP、コイン、ボスダメージの計算と付与

### 1.4 技術スタック
- **フロントエンド**: Next.js 14 (App Router), React 18, TypeScript
- **スタイリング**: TailwindCSS
- **UIライブラリ**: shadcn/ui, Lucide React
- **アニメーション**: Framer Motion
- **バックエンド**: Supabase (PostgreSQL, Auth, Realtime)
- **ORM**: Prisma
- **状態管理**: React Hooks (将来はZustandを検討)

---

## 2. データベース設計

### 2.1 ER図の概要

```
User
├── Task (1:N)
├── UserAchievement (1:N)
├── BossHit (1:N)
├── StatsDaily (1:N)
├── StatsWeekly (1:N)
└── World (N:1)

Achievement
└── UserAchievement (1:N)

BossWeek
└── BossHit (1:N)

World
└── Tile (1:N)
```

### 2.2 主要テーブル設計

#### 2.2.1 User（ユーザー）
| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | String (UUID) | ユーザーID | PK |
| email | String | メールアドレス | UNIQUE, NOT NULL |
| name | String? | ユーザー名 | NULL可 |
| image | String? | プロフィール画像URL | NULL可 |
| coins | Int | 所持コイン数 | DEFAULT 0 |
| xp | Int | 経験値 | DEFAULT 0 |
| level | Int | レベル | DEFAULT 1 |
| currentWorldId | String? | 現在のワールドID | NULL可（将来拡張用） |
| currentTileIndex | Int? | 現在のタイル位置 | NULL可（将来拡張用） |
| createdAt | DateTime | 作成日時 | NOT NULL |
| updatedAt | DateTime | 更新日時 | NOT NULL |

**インデックス**: `id` (PK), `email` (UNIQUE)

#### 2.2.2 Task（タスク/クエスト）
| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | String (UUID) | タスクID | PK |
| userId | String | ユーザーID | FK → User.id |
| title | String | タスクタイトル | NOT NULL |
| description | String? | 説明 | NULL可 |
| difficulty | TaskDifficulty | 難易度 | DEFAULT NORMAL |
| tag | String? | タグ | NULL可 |
| estimateMinutes | Int? | 見積もり時間（分） | NULL可 |
| dueAt | DateTime? | 期限 | NULL可 |
| status | TaskStatus | ステータス | DEFAULT TODO |
| isCompleted | Boolean | 完了フラグ | DEFAULT false |
| completedAt | DateTime? | 完了日時 | NULL可 |
| xpReward | Int? | XP報酬 | NULL可（完了時に計算） |
| coinReward | Int? | コイン報酬 | NULL可（完了時に計算） |
| bossDamage | Int? | ボスダメージ | NULL可（完了時に計算） |
| createdAt | DateTime | 作成日時 | NOT NULL |
| updatedAt | DateTime | 更新日時 | NOT NULL |

**Enum型**:
- `TaskDifficulty`: `EASY`, `NORMAL`, `HARD`
- `TaskStatus`: `TODO`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

**インデックス**: 
- `userId` (FK)
- `status`
- `dueAt`

#### 2.2.3 Achievement（実績マスタ）
| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | String (UUID) | 実績ID | PK |
| name | String | 実績名 | NOT NULL |
| description | String? | 説明 | NULL可 |
| scope | AchievementScope | スコープ | NOT NULL |
| tier | Int | ティア | DEFAULT 1 |
| condition | Json | 達成条件（JSON） | NOT NULL |
| xpReward | Int | XP報酬 | DEFAULT 0 |
| coinReward | Int | コイン報酬 | DEFAULT 0 |
| bossDamage | Int | ボスダメージ | DEFAULT 0 |
| buffs | Json? | バフ効果（JSON） | NULL可 |
| createdAt | DateTime | 作成日時 | NOT NULL |
| updatedAt | DateTime | 更新日時 | NOT NULL |

**Enum型**:
- `AchievementScope`: `DAILY`, `WEEKLY`, `LIFETIME`

**インデックス**: `scope`

#### 2.2.4 UserAchievement（ユーザー実績）
| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | String (UUID) | ID | PK |
| userId | String | ユーザーID | FK → User.id |
| achievementId | String | 実績ID | FK → Achievement.id |
| unlockedAt | DateTime | 解除日時 | NOT NULL |

**制約**: `(userId, achievementId)` のユニーク制約

**インデックス**: 
- `userId` (FK)
- `achievementId` (FK)

#### 2.2.5 BossWeek（週次ボス）
| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | String (UUID) | ボスID | PK |
| weekKey | String | 週キー（YYYY-MM-DD形式、月曜日の日付） | UNIQUE |
| name | String | ボス名 | NOT NULL |
| maxHp | Int | 最大HP | NOT NULL |
| currentHp | Int | 現在のHP | NOT NULL |
| isActive | Boolean | アクティブフラグ | DEFAULT true |
| affix | String? | 特殊効果の説明 | NULL可 |
| startDate | DateTime | 開始日時 | NOT NULL |
| endDate | DateTime? | 終了日時 | NULL可 |
| createdAt | DateTime | 作成日時 | NOT NULL |
| updatedAt | DateTime | 更新日時 | NOT NULL |

**インデックス**: 
- `weekKey` (UNIQUE)
- `isActive`

#### 2.2.6 BossHit（ボスへのダメージログ）
| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | String (UUID) | ダメージID | PK |
| userId | String | ユーザーID | FK → User.id |
| bossWeekId | String | ボス週ID | FK → BossWeek.id |
| damage | Int | ダメージ量 | NOT NULL |
| source | String? | ダメージ源（"task" or "achievement"） | NULL可 |
| sourceId | String? | ソースID（Task ID or Achievement ID） | NULL可 |
| createdAt | DateTime | 作成日時 | NOT NULL |

**インデックス**: 
- `userId` (FK)
- `bossWeekId` (FK)
- `createdAt`

#### 2.2.7 StatsDaily（日次統計）
| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | String (UUID) | 統計ID | PK |
| userId | String | ユーザーID | FK → User.id |
| date | Date | 日付 | NOT NULL |
| completedTasks | Int | 完了タスク数 | DEFAULT 0 |
| focusMinutes | Int | 集中時間（分） | DEFAULT 0 |
| streak | Int | 連続日数 | DEFAULT 0 |
| totalXp | Int | 合計XP | DEFAULT 0 |
| totalCoins | Int | 合計コイン | DEFAULT 0 |
| totalBossDamage | Int | 合計ボスダメージ | DEFAULT 0 |
| createdAt | DateTime | 作成日時 | NOT NULL |
| updatedAt | DateTime | 更新日時 | NOT NULL |

**制約**: `(userId, date)` のユニーク制約

**インデックス**: 
- `userId` (FK)
- `date`

#### 2.2.8 StatsWeekly（週次統計）
| カラム名 | 型 | 説明 | 制約 |
|---------|-----|------|------|
| id | String (UUID) | 統計ID | PK |
| userId | String | ユーザーID | FK → User.id |
| weekKey | String | 週キー（YYYY-MM-DD形式） | NOT NULL |
| completedTasks | Int | 完了タスク数 | DEFAULT 0 |
| focusMinutes | Int | 集中時間（分） | DEFAULT 0 |
| streak | Int | 連続週数 | DEFAULT 0 |
| totalXp | Int | 合計XP | DEFAULT 0 |
| totalCoins | Int | 合計コイン | DEFAULT 0 |
| totalBossDamage | Int | 合計ボスダメージ | DEFAULT 0 |
| createdAt | DateTime | 作成日時 | NOT NULL |
| updatedAt | DateTime | 更新日時 | NOT NULL |

**制約**: `(userId, weekKey)` のユニーク制約

**インデックス**: 
- `userId` (FK)
- `weekKey`

---

## 3. 機能設計

### 3.1 タスク管理機能

#### 3.1.1 タスク作成
- **入力項目**:
  - タイトル（必須）
  - 説明（任意）
  - 難易度（EASY / NORMAL / HARD）
  - 期限日時（任意）
  - 見積もり時間（分、任意）
  - タグ（任意）
- **デフォルト値**:
  - `status`: `TODO`
  - `difficulty`: `NORMAL`
  - `isCompleted`: `false`

#### 3.1.2 タスク編集
- 作成時と同じ入力項目を編集可能
- 完了済みタスクも編集可能（ただし、報酬は再計算しない）

#### 3.1.3 タスク削除
- 論理削除ではなく物理削除
- 削除前に確認ダイアログを表示

#### 3.1.4 タスク完了
- タスクを完了にすると以下を計算・付与:
  - XP報酬
  - コイン報酬
  - ボスダメージ
- 計算式は後述の「ゲームロジック」を参照

#### 3.1.5 タスクステータス管理
- `TODO`: 未着手
- `IN_PROGRESS`: 進行中
- `COMPLETED`: 完了
- `CANCELLED`: キャンセル

### 3.2 実績システム

#### 3.2.1 実績の種類
- **DAILY（日次）**: 毎日04:00 JSTにリセット
- **WEEKLY（週次）**: 毎週月曜日04:00 JSTにリセット
- **LIFETIME（生涯）**: リセットなし

#### 3.2.2 実績達成条件
- 条件はJSON形式で保存
- 例: `{ "completedTasksToday": { "$gte": 3 } }`
- 統計データ（StatsDaily/StatsWeekly）と照合して判定

#### 3.2.3 実績報酬
- XP、コイン、ボスダメージを付与
- オプションでバフ効果（JSON形式）

### 3.3 週次レイドボス

#### 3.3.1 ボスの生成
- 毎週月曜日00:00 JSTに新しいボスを生成
- 前週のボスは自動的に非アクティブ化

#### 3.3.2 ボスへのダメージ
- タスク完了時に自動的にダメージを付与
- 実績達成時にもダメージを付与
- 全ユーザーのダメージが累積される

#### 3.3.3 ボス撃破
- `currentHp`が0以下になると撃破
- 全アクティブユーザーに報酬を配布
- 報酬内容はボスの設定による

#### 3.3.4 リアルタイム更新
- Supabase Realtimeを使用して`currentHp`をリアルタイム更新
- 全ユーザーが同じHPを共有

### 3.4 統計管理

#### 3.4.1 日次統計の更新
- タスク完了時に自動更新
- 集計項目:
  - 完了タスク数
  - 集中時間（見積もり時間の合計）
  - 連続日数（ストリーク）
  - 合計XP、コイン、ボスダメージ

#### 3.4.2 週次統計の更新
- 日次統計を週次に集計
- 週次実績の判定に使用

#### 3.4.3 ストリーク（連続日数）
- 1日1回以上タスクを完了するとストリーク継続
- 1週間に1回の「グレース」（スキップ可能）を許可
- ストリークが切れると0にリセット

---

## 4. ゲームロジック

### 4.1 ダメージ計算式

#### 4.1.1 タスクからの基本ダメージ
```
D_task = 5 × difficultyFactor × f(estimateMinutes) × (1 + 0.05 × streakStage)
```

- `difficultyFactor`:
  - EASY: 1
  - NORMAL: 2
  - HARD: 3
- `f(estimateMinutes)`: 見積もり時間による補正
  - 30分未満: 0.8
  - 30-60分: 1.0
  - 60-120分: 1.2
  - 120分以上: 1.5
- `streakStage`: ストリーク段階（7日ごとに+1、最大+5）

#### 4.1.2 実績からのボーナスダメージ
- 日次実績: `20 × tier`
- 週次実績: `80 × tier`
- 生涯実績: `100 × tier`

### 4.2 XP・コイン計算式

#### 4.2.1 タスク完了時の報酬
```
XP = 10 × difficultyFactor × f(estimateMinutes)
Coins = 5 × difficultyFactor × f(estimateMinutes)
```

#### 4.2.2 レベルアップ
```
Level = floor(sqrt(XP / 100)) + 1
```

### 4.3 ボスサイクル

#### 4.3.1 週次リセット
- 毎週月曜日00:00 JSTに新しいボスを生成
- 前週のボスは自動的に非アクティブ化
- 週キーは月曜日の日付（YYYY-MM-DD形式）

#### 4.3.2 ボス撃破時の報酬
- 全アクティブユーザーに報酬を配布
- 報酬内容:
  - 固定コイン: 100
  - 固定XP: 50
  - ボスダメージに応じた追加報酬（上位ユーザー）

---

## 5. UI/UX設計

### 5.1 デザインコンセプト
- **未来型ホログラムUI**: ガラスモーフィズムとネオンエフェクト
- **シネマティック**: 深度とレイヤー感のあるデザイン
- **高コントラスト**: 視認性を重視したタイポグラフィ

### 5.2 カラーパレット
- **背景**: `#020617` / `#050816`（ダークブルー）
- **ネオンシアン**: `#22d3ee`
- **ネオンパープル**: `#a855f7`
- **アクセントマゼンタ**: `#ec4899`
- **ガラス**: `rgba(15,23,42,0.8)` + `backdrop-blur-xl`

### 5.3 主要画面

#### 5.3.1 ダッシュボード（`app/page.tsx`）
- **左パネル**: プレイヤーステータス
  - レベル、XP、コイン、ストリーク
  - クラス表示
  - XPプログレスバー
- **中央パネル**: 今日のクエスト
  - タスク一覧
  - タスク追加ボタン
  - タスク編集・削除機能
- **右パネル**: 週次レイドボス
  - ボス名、HPバー
  - フェーズ/アフィックス表示
  - ダメージログ

#### 5.3.2 アドベンチャーページ（`app/adventure/page.tsx`）
- 将来拡張用（すごろくマップなど）

### 5.4 コンポーネント設計

#### 5.4.1 UIコンポーネント（`components/ui/`）
- **HoloPanel**: ガラスパネルコンポーネント
  - プロップス: `glowColor`, `className`, `children`
  - アニメーション: ホバー時の浮遊効果
- **HoloCard**: ホログラムカード（既存）
- **CyberButton**: サイバーボタン（既存）
- **CyberInput**: サイバー入力フィールド（既存）

#### 5.4.2 タスクコンポーネント（`components/tasks/`）
- **TaskModal**: タスク追加/編集モーダル
  - フォーム入力
  - バリデーション
  - アニメーション

#### 5.4.3 ゲームコンポーネント（`components/game/`）
- **QuestNotification**: クエスト通知（既存）

---

## 6. API設計（将来実装）

### 6.1 Server Actions（推奨）

#### 6.1.1 タスク関連
```typescript
// app/actions/tasks.ts
export async function createTask(data: CreateTaskInput) { ... }
export async function updateTask(id: string, data: UpdateTaskInput) { ... }
export async function deleteTask(id: string) { ... }
export async function completeTask(id: string) { ... }
```

#### 6.1.2 実績関連
```typescript
// app/actions/achievements.ts
export async function checkAchievements(userId: string) { ... }
export async function getAchievements(userId: string) { ... }
```

#### 6.1.3 ボス関連
```typescript
// app/actions/boss.ts
export async function getCurrentBoss() { ... }
export async function dealBossDamage(userId: string, damage: number) { ... }
```

### 6.2 Route Handlers（必要に応じて）

```typescript
// app/api/tasks/route.ts
export async function GET(request: Request) { ... }
export async function POST(request: Request) { ... }
```

---

## 7. リアルタイム機能

### 7.1 Supabase Realtime
- **ボスHP更新**: `BossWeek`テーブルの`currentHp`を監視
- **ユーザー統計**: `StatsDaily`の更新を監視（オプション）

### 7.2 実装例
```typescript
const subscription = supabase
  .channel('boss-hp')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'boss_weeks',
    filter: 'isActive=eq.true'
  }, (payload) => {
    // HP更新を処理
  })
  .subscribe()
```

---

## 8. セキュリティ

### 8.1 認証
- Supabase Authを使用
- Row Level Security (RLS) を有効化

### 8.2 データアクセス制御
- ユーザーは自分のタスクのみアクセス可能
- ボス情報は全ユーザーが閲覧可能
- 統計データは自分のみアクセス可能

### 8.3 バリデーション
- サーバーサイドでの入力検証
- Prismaスキーマによる型安全性

---

## 9. パフォーマンス最適化

### 9.1 データフェッチング
- Next.js Server Componentsを活用
- 必要に応じてReact Server Componentsを使用

### 9.2 キャッシング
- Supabaseのキャッシュ機能を活用
- Next.jsのキャッシュ戦略を適用

### 9.3 最適化UI
- オプティミスティックUI更新
- スケルトンローディング
- 仮想スクロール（長いリストの場合）

---

## 10. デプロイメント

### 10.1 環境変数
```
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

### 10.2 ビルドプロセス
1. Prismaスキーマからクライアント生成
2. Next.jsビルド
3. 静的アセットの最適化

### 10.3 デプロイ先
- **フロントエンド**: Vercel
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth

---

## 11. 今後の拡張予定

### 11.1 パーティ機能
- 小規模グループでの協力プレイ
- パーティ専用のボスや実績

### 11.2 すごろくマップ（将来）
- タスク完了でマスを進む
- イベント、敵、宝箱などのマス
- 現在はMVPでは実装しない

### 11.3 ソーシャル機能
- フレンドシステム
- リーダーボード
- 実績の共有

---

## 12. 開発ガイドライン

### 12.1 コーディング規約
- **命名規則**:
  - 変数・関数: `camelCase`
  - コンポーネント・型: `PascalCase`
  - 定数: `UPPER_SNAKE_CASE`
- **ファイル構成**:
  - `app/`: Next.js App Router
  - `components/`: Reactコンポーネント
  - `lib/`: ユーティリティ関数
  - `prisma/`: データベーススキーマ

### 12.2 型安全性
- TypeScriptを厳密に使用
- Prismaスキーマから型を自動生成
- 型ガードを適切に使用

### 12.3 エラーハンドリング
- サーバーアクションでのエラーハンドリング
- ユーザーフレンドリーなエラーメッセージ
- ログ記録（本番環境）

---

## 13. テスト戦略（将来実装）

### 13.1 単体テスト
- ゲームロジック関数のテスト
- ユーティリティ関数のテスト

### 13.2 統合テスト
- APIエンドポイントのテスト
- データベース操作のテスト

### 13.3 E2Eテスト
- 主要なユーザーフローのテスト
- PlaywrightまたはCypressを使用

---

## 14. 参考資料

### 14.1 技術ドキュメント
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

### 14.2 デザイン参考
- Aura Task（UIデザインの参考）
- その他のゲーミフィケーションアプリ

---

## 15. 変更履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|-----------|---------|--------|
| 2024-XX-XX | 0.1.0 | 初期設計書作成 | - |

---

**最終更新日**: 2024年XX月XX日
**バージョン**: 1.0.0

