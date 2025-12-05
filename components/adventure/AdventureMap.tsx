'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Sword, Package, MapPin } from 'lucide-react'

interface Tile {
  index: number
  type: 'EMPTY' | 'ENEMY' | 'CHEST' | 'EVENT' | 'BOSS'
}

interface AdventureMapProps {
  tiles: Tile[]
  currentTileIndex: number
  onTileClick?: (index: number) => void
}

export function AdventureMap({ tiles, currentTileIndex, onTileClick }: AdventureMapProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const tileRefs = useRef<(HTMLDivElement | null)[]>([])

  // 現在位置に自動スクロール
  useEffect(() => {
    const currentTile = tileRefs.current[currentTileIndex]
    const container = scrollContainerRef.current
    
    if (currentTile && container) {
      const containerWidth = container.offsetWidth
      const tileLeft = currentTile.offsetLeft
      const tileWidth = currentTile.offsetWidth
      const scrollPosition = tileLeft - containerWidth / 2 + tileWidth / 2
      
      container.scrollTo({
        left: scrollPosition,
        behavior: 'smooth',
      })
    }
  }, [currentTileIndex])
  const getTileIcon = (tile: Tile) => {
    switch (tile.type) {
      case 'ENEMY':
        return <Sword className="w-6 h-6 text-system-red" />
      case 'CHEST':
        return <Package className="w-6 h-6 text-system-gold" />
      default:
        return null
    }
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex space-x-4 overflow-x-auto p-4 scrollbar-thin scrollbar-thumb-system-blue scrollbar-track-transparent"
    >
      {tiles.map((tile, index) => {
        const isCurrentTile = index === currentTileIndex
        const isEnemy = tile.type === 'ENEMY'
        const isChest = tile.type === 'CHEST'
        
        // タイルのスタイルを決定
        let tileClassName = `
          w-16 h-16 flex-shrink-0
          border rounded-md
          flex items-center justify-center
          font-mono text-lg
          cursor-pointer
          transition-all duration-200
        `
        
        if (isCurrentTile) {
          // 現在地ハイライト
          tileClassName += `
            bg-system-blue text-background
            shadow-system-blue-md border-system-blue
          `
        } else if (isEnemy) {
          // 敵タイル
          tileClassName += `
            text-system-red border-system-red
            shadow-system-red-md bg-system-blue/10
          `
        } else if (isChest) {
          // 宝箱タイル
          tileClassName += `
            text-system-gold border-system-gold
            shadow-system-gold-lg bg-system-blue/10
          `
        } else {
          // 通常タイル
          tileClassName += `
            border-system-blue/50 bg-system-blue/10
            text-system-blue shadow-system-blue-sm
          `
        }
        
        return (
          <motion.div
            key={tile.index}
            ref={(el) => {
              tileRefs.current[index] = el
            }}
            initial={false}
            animate={{
              scale: isCurrentTile ? 1.1 : 1,
            }}
            transition={{ duration: 0.3 }}
            className={tileClassName}
            onClick={() => onTileClick?.(index)}
          >
            {isCurrentTile ? (
              <MapPin className="w-6 h-6" />
            ) : (
              getTileIcon(tile) || <span>{index + 1}</span>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

