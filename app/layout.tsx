import type { Metadata } from 'next'
import './globals.css'

// フォント読み込みを一時的に無効化（エラー回避のため）
// const inter = Inter({
//   subsets: ['latin'],
//   variable: '--font-inter',
//   display: 'swap',
// })

// const rajdhani = Rajdhani({
//   subsets: ['latin'],
//   weight: ['500', '700'],
//   variable: '--font-rajdhani',
//   display: 'swap',
// })

// const shareTechMono = Share_Tech_Mono({
//   subsets: ['latin'],
//   weight: ['400'],
//   variable: '--font-share-tech-mono',
//   display: 'swap',
// })

export const metadata: Metadata = {
  title: 'QuestDo - ゲーミフィケーションToDoアプリ',
  description: 'クエストを管理し、レベルアップしながら冒険しよう',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}

