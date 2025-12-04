'use client'

import { useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export default function Home() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [message, setMessage] = useState('')

  useEffect(() => {
    // 環境変数が設定されている場合のみ接続チェックを実行
    if (isSupabaseConfigured()) {
      checkConnection()
    } else {
      setStatus('error')
      setMessage('環境変数が設定されていません。NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。')
    }
  }, [])

  const checkConnection = async () => {
    try {
      // 環境変数の再チェック
      if (!isSupabaseConfigured()) {
        setStatus('error')
        setMessage('環境変数が設定されていません。')
        return
      }

      // テーブルに依存しない接続テスト: Auth APIを使用
      // これなら、テーブルが存在しなくても接続をテストできます
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      // セッションエラーがなく、または「認証されていない」という正常な状態なら接続成功
      if (!sessionError) {
        setStatus('connected')
        setMessage('✓ Supabase接続成功！環境変数が正しく設定されています。')
      } else {
        // 認証エラーは接続エラーとは別物なので、接続自体は成功している可能性が高い
        // ただし、ネットワークエラーなどの場合は接続失敗とみなす
        const errorMessage = sessionError.message.toLowerCase()
        if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
          setStatus('error')
          setMessage(`接続エラー: ${sessionError.message}`)
        } else {
          // 認証関連のエラーは、接続自体は成功しているとみなす
          setStatus('connected')
          setMessage('✓ Supabase接続成功！（認証は未設定ですが、接続は正常です）')
        }
      }
    } catch (err: any) {
      setStatus('error')
      setMessage(`接続エラー: ${err.message}`)
    }
  }

  return (
    <main style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>Vercel + Supabase 連携確認</h1>
      
      <div style={{ 
        marginTop: '2rem',
        padding: '1rem',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>接続ステータス</h2>
        <p>
          <strong>状態:</strong>{' '}
          <span style={{
            color: status === 'connected' ? 'green' : status === 'error' ? 'red' : 'orange'
          }}>
            {status === 'checking' && '確認中...'}
            {status === 'connected' && '✓ 接続成功'}
            {status === 'error' && '✗ エラー'}
          </span>
        </p>
        <p><strong>メッセージ:</strong> {message}</p>
        
        <button 
          onClick={checkConnection}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          再接続テスト
        </button>
      </div>

      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
        <p>このページはVercelとSupabaseの連携確認用です。</p>
        <p>環境変数が正しく設定されているか確認してください。</p>
      </div>
    </main>
  )
}

