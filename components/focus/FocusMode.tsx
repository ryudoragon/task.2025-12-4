'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { usePomodoroStore } from '@/store/pomodoroStore'
import { useFocusStore } from '@/store/focusStore'
import { useExitFocusMode } from '@/hooks/useExitFocusMode'
import { useQuestsStore } from '@/store/questsStore'
import { motion, AnimatePresence } from 'framer-motion'

type FocusModeProps = {
  questId: string
  questTitle?: string
}

const formatTime = (seconds: number) => {
  const clamped = Math.max(0, seconds)
  const m = Math.floor(clamped / 60)
  const s = clamped % 60
  const pad = (v: number) => v.toString().padStart(2, '0')
  return `${pad(m)}:${pad(s)}`
}

export function FocusMode({ questId, questTitle }: FocusModeProps) {
  const completeQuest = useQuestsStore((s) => s.completeQuest)
  const quests = useQuestsStore((s) => s.quests)
  const hydrateQuests = useQuestsStore((s) => s.hydrate)
  const setFocusLocked = useFocusStore((s) => s.setFocusLocked)
  const isFocusLocked = useFocusStore((s) => s.isFocusLocked)
  const setFocusMode = useFocusStore((s) => s.setFocusMode)
  const setCurrentQuestId = useFocusStore((s) => s.setCurrentQuestId)
  const exitFocusMode = useExitFocusMode()

  const {
    mode,
    focusDuration,
    breakDuration,
    remainingTime,
    isRunning,
    start,
    pause,
    reset,
    switchMode,
    setDurations,
    tick,
  } = usePomodoroStore()

  const [isInverted, setIsInverted] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [inputFocusMinutes, setInputFocusMinutes] = useState(focusDuration / 60)
  const [inputBreakMinutes, setInputBreakMinutes] = useState(breakDuration / 60)
  const [isCompleting, startTransition] = useTransition()

  const resolvedQuestTitle = useMemo(() => {
    if (questTitle) return questTitle
    const found = quests.find((q) => q.id === questId)
    return found?.title ?? `Quest #${questId}`
  }, [questId, questTitle, quests])

  const totalSeconds = mode === 'focus' ? focusDuration : breakDuration
  const progressPercent = useMemo(() => {
    if (totalSeconds === 0) return 0
    const progressed = ((totalSeconds - remainingTime) / totalSeconds) * 100
    return Math.min(100, Math.max(0, progressed))
  }, [remainingTime, totalSeconds])

  // Timer Tick
  useEffect(() => {
    if (!isRunning) return
    const id = setInterval(() => tick(), 1000)
    return () => clearInterval(id)
  }, [isRunning, tick])

  // Sync inputs with store updates
  useEffect(() => {
    setInputFocusMinutes(focusDuration / 60)
    setInputBreakMinutes(breakDuration / 60)
  }, [focusDuration, breakDuration])

  // Hydrate & Lock
  useEffect(() => {
    hydrateQuests()
  }, [hydrateQuests])

  useEffect(() => {
    setFocusMode(true)
    setCurrentQuestId(questId)
    setFocusLocked(true)
    return () => {
      setFocusLocked(false)
      setFocusMode(false)
      setCurrentQuestId(null)
    }
  }, [setFocusLocked, setFocusMode, setCurrentQuestId, questId])

  // Prevent Navigation
  useEffect(() => {
    if (!isFocusLocked) return
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const handlePopState = () => {
      // In a real app one might show a custom modal, for now alert is minimal enough or just prevent
      history.pushState(null, '', window.location.href)
    }
    history.pushState(null, '', window.location.href)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isFocusLocked])

  const handleComplete = () => {
    startTransition(async () => {
      const current = quests.find((q) => q.id === questId)
      if (current?.isCompleted) {
        exitFocusMode()
        return
      }
      if (!confirm('Complete quest and exit focus mode?')) return
      try {
        await completeQuest(questId)
      } catch (e) {
        console.error(e)
      } finally {
        exitFocusMode()
      }
    })
  }

  const handleSaveDurations = () => {
    setDurations(inputFocusMinutes * 60, inputBreakMinutes * 60)
    setSettingsOpen(false)
  }

  // Theme Classes
  // Inverted: White Bg, Black Text
  // Normal: Black Bg, White Text
  // Since request says "Black and White ONLY", we stick to strictly that.
  const theme = isInverted
    ? {
        bg: 'bg-white',
        text: 'text-black',
        border: 'border-black',
        fill: 'bg-black',
        track: 'bg-gray-200', // A very light gray for track or just transparent border? 
                              // Request says "White background, black line". 
                              // So track can be thin black line or transparent.
        trackBorder: 'border-black',
        hover: 'hover:bg-black hover:text-white',
        inputBg: 'bg-white',
      }
    : {
        bg: 'bg-black',
        text: 'text-white',
        border: 'border-white',
        fill: 'bg-white',
        track: 'bg-gray-900',
        trackBorder: 'border-white',
        hover: 'hover:bg-white hover:text-black',
        inputBg: 'bg-black',
      }

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 font-light ${theme.bg} ${theme.text} overflow-hidden relative`}>
      
      {/* Top Controls */}
      <div className="absolute top-10 right-10 flex gap-6 text-xs tracking-widest uppercase">
          <button onClick={() => setSettingsOpen(!settingsOpen)} className="hover:opacity-50 transition-opacity">
            Config
          </button>
          <button onClick={() => setIsInverted(!isInverted)} className="hover:opacity-50 transition-opacity">
            Invert
          </button>
      </div>

      <div className="absolute top-10 left-10 text-xs tracking-widest uppercase opacity-50">
        Focus Mode
      </div>


      {/* Main Content */}
      <main className="flex flex-col items-center w-full max-w-2xl px-8">
        
        {/* Quest Title */}
        <h1 className="text-sm md:text-base tracking-[0.2em] mb-20 text-center uppercase opacity-80">
          {resolvedQuestTitle}
        </h1>

        {/* Timer Display */}
        <div className="mb-16">
          <div className="text-[120px] md:text-[180px] leading-none tabular-nums font-thin tracking-tighter">
            {formatTime(remainingTime)}
          </div>
          <div className="text-center text-xs tracking-[0.5em] uppercase opacity-60 mt-4">
             {mode === 'focus' ? 'Focus Session' : 'Break Session'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full relative h-[1px] mb-20 group">
            {/* Background Line */}
            <div className={`absolute top-0 left-0 right-0 h-full ${isInverted ? 'bg-black/10' : 'bg-white/10'}`}></div>
            
            {/* Active Line */}
            <motion.div 
                className={`absolute top-0 left-0 h-full ${theme.fill}`}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "linear" }}
            />

            {/* Hover indication of 100% */}
            <div className="absolute top-4 right-0 text-[10px] opacity-0 group-hover:opacity-30 transition-opacity">
                100%
            </div>
             <div className="absolute top-4 left-0 text-[10px] opacity-0 group-hover:opacity-30 transition-opacity">
                0%
            </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-12">
            {!isRunning ? (
                <button 
                  onClick={start} 
                  className={`border ${theme.border} px-12 py-3 text-sm tracking-[0.2em] uppercase transition-all duration-300 ${theme.hover}`}
                >
                  Start
                </button>
            ) : (
                <button 
                  onClick={pause} 
                  className={`border ${theme.border} px-12 py-3 text-sm tracking-[0.2em] uppercase transition-all duration-300 ${theme.hover}`}
                >
                  Pause
                </button>
            )}

            <button 
                onClick={reset}
                className="text-xs tracking-widest opacity-50 hover:opacity-100 uppercase"
            >
                Reset
            </button>
            
            {/* Optional Mode Switch for testing/manual override */}
            {/* <button onClick={switchMode} className="text-xs tracking-widest opacity-50 hover:opacity-100 uppercase">
                 Switch
            </button> */}
        </div>

         <div className="mt-24">
             <button 
                onClick={handleComplete}
                className="text-xs tracking-[0.2em] uppercase border-b border-transparent hover:border-current pb-1 opacity-50 hover:opacity-100 transition-all"
            >
                {isCompleting ? 'Finalizing...' : 'Complete Quest'}
             </button>
         </div>

      </main>

      {/* Settings Overlay */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`fixed inset-0 z-50 flex items-center justify-center ${isInverted ? 'bg-white/90' : 'bg-black/90'} backdrop-blur-sm`}
          >
            <div className={`w-[320px] p-8 border ${theme.border}`}>
                <h2 className="text-xs uppercase tracking-[0.3em] mb-8 text-center">Settings</h2>
                
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-light tracking-wider">FOCUS (MIN)</label>
                        <input 
                            type="number" 
                            min={1} 
                            value={inputFocusMinutes}
                            onChange={e => setInputFocusMinutes(Number(e.target.value))}
                            className={`w-16 text-right bg-transparent border-b ${theme.border} outline-none font-mono`}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-light tracking-wider">BREAK (MIN)</label>
                        <input 
                            type="number" 
                            min={1} 
                            value={inputBreakMinutes}
                            onChange={e => setInputBreakMinutes(Number(e.target.value))}
                            className={`w-16 text-right bg-transparent border-b ${theme.border} outline-none font-mono`}
                        />
                    </div>
                </div>

                <div className="mt-12 flex justify-center gap-8">
                    <button 
                        onClick={() => setSettingsOpen(false)}
                        className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100"
                    >
                        Close
                    </button>
                    <button 
                        onClick={handleSaveDurations}
                        className={`text-xs uppercase tracking-widest border ${theme.border} px-6 py-2 ${theme.hover} transition-all`}
                    >
                        Save
                    </button>
                </div>
            </div>
          </motion.div>
        )}
       </AnimatePresence>
    </div>
  )
}
