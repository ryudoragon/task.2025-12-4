'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [message, setMessage] = useState('')

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase.from('_test').select('count').limit(1)
      
      if (error) {
        // テーブルが存在しない場合でも、接続自体は成功している
        if (error.code === 'PGRST116') {
          setStatus('connected')
          setMessage('Supabase接続成功（テストテーブルは存在しませんが、接続は正常です）')
        } else {
          setStatus('error')
          setMessage(`エラー: ${error.message}`)
        }
      } else {
        setStatus('connected')
        setMessage('Supabase接続成功！')
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

