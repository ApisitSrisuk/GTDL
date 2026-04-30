"use client"

import { useState } from "react"
import { Plus, Trash2, RotateCcw, CheckCircle2, Circle, AlertTriangle, Sparkles } from "lucide-react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface Task {
  id: string
  title: string
  isCompleted: boolean
}

interface HistoryEntry {
  id: string
  date: string
  isPerfect: boolean
  completedTasks: number
  totalTasks: number
  missingTasks?: string[]
}

interface Game {
  id: string
  name: string
  imageUrl?: string | null
  tasks: Task[]
  currentStreak: number
  recentHistory: HistoryEntry[]
}

export default function GameCard({
  game,
  deleteMode,
  selected,
  onToggleSelected,
  onDeleteGame,
  onUpdate,
}: {
  game: Game
  deleteMode: boolean
  selected: boolean
  onToggleSelected: () => void
  onDeleteGame: () => void
  onUpdate: () => void
}) {
  const [newTask, setNewTask] = useState("")
  const [loading, setLoading] = useState(false)
  
  // สร้าง State สำหรับเก็บสถานะ Task ชั่วคราวเพื่อให้ UI ตอบสนองไวขึ้น
  const [optimisticTasks, setOptimisticTasks] = useState<Task[] | null>(null)

  const currentTasks = optimisticTasks || game.tasks
  const historyEntries = game.recentHistory

  const getHistoryTooltip = (entry: HistoryEntry) => {
    if (entry.isPerfect) {
      return "Completed all tasks"
    }

    const missingTasks = entry.missingTasks || []
    const missingTasksText = missingTasks.length > 0
      ? missingTasks.join(", ")
      : "Some tasks were missing"

    return `Missing ${entry.totalTasks - entry.completedTasks} task${entry.totalTasks - entry.completedTasks === 1 ? "" : "s"}: ${missingTasksText}`
  }

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    setLoading(true)
    await fetch("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ title: newTask, gameId: game.id }),
    })
    setNewTask("")
    setLoading(false)
    setOptimisticTasks(null) // ล้างค่าชั่วคราวเพื่อให้ไปดึงค่าจริงจาก Server
    onUpdate()
  }

  const toggleTask = async (id: string, isCompleted: boolean) => {
    // 1. อัปเดต UI ทันที (Optimistic Update)
    const nextStatus = !isCompleted;
    const newTasks = currentTasks.map(t => 
      t.id === id ? { ...t, isCompleted: nextStatus } : t
    );
    setOptimisticTasks(newTasks);

    // 2. ส่งข้อมูลไปที่ Server ในพื้นหลัง
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        body: JSON.stringify({ id, isCompleted: nextStatus }),
      })
      if (!res.ok) throw new Error();
      onUpdate()
    } catch (error) {
      // ถ้า Error ให้คืนค่าเดิม
      setOptimisticTasks(null);
      alert("Failed to update task. Reverting...");
    }
  }

  const deleteTask = async (id: string) => {
    // อัปเดต UI ทันที
    setOptimisticTasks(currentTasks.filter(t => t.id !== id));
    
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" })
    onUpdate()
  }

  const resetTasks = async () => {
    // อัปเดต UI ทันที
    setOptimisticTasks(currentTasks.map(t => ({ ...t, isCompleted: false })));

    await fetch("/api/tasks/reset", {
      method: "POST",
      body: JSON.stringify({ gameId: game.id }),
    })
    onUpdate()
  }

  return (
    <div className="gaming-card overflow-visible! p-6 flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {deleteMode && (
              <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/30">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={onToggleSelected}
                  className="h-4 w-4 rounded border-white/10 bg-slate-900 text-primary accent-primary"
                />
                Select
              </label>
            )}
            <h3 className="text-2xl font-black text-white">
              {game.name}
            </h3>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 shadow-inner shadow-white/5">
              Streak: <strong className="text-white">{game.currentStreak}</strong> days
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 shadow-inner shadow-white/5">
              History: {historyEntries.length} day{historyEntries.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          {!deleteMode ? (
            <button 
              onClick={resetTasks}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-muted-foreground transition hover:bg-white/10 hover:text-white"
              title="Reset All Tasks"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          ) : null}
        </div>
      </div>

      <form onSubmit={addTask} className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add task (e.g. Daily Quest)"
          className="bg-secondary border border-white/5 rounded-lg px-3 py-2 text-sm flex-1 focus:outline-none focus:border-primary/50"
        />
        <button disabled={loading} className="gaming-button p-2">
          <Plus className="w-5 h-5" />
        </button>
      </form>

      <div className="space-y-4">
        <div className="space-y-2">
          {currentTasks.map((task) => (
            <div key={task.id} className="flex items-center group gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
              <button onClick={() => toggleTask(task.id, task.isCompleted)}>
                {task.isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              <span className={cn("flex-1 text-sm transition-all", task.isCompleted && "text-muted-foreground line-through")}>
                {task.title}
              </span>
              <button 
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-destructive hover:scale-110 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {currentTasks.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No tasks yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
          <h4 className="font-semibold text-white">History</h4>
          {historyEntries.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {historyEntries.map((entry) => (
                <div key={entry.id} className="group relative overflow-visible rounded-3xl border border-white/10 bg-background/50 p-4 shadow-lg shadow-black/10 transition hover:border-primary/30 hover:bg-white/5">
                  <div className="absolute left-1/2 bottom-full mb-4 hidden min-w-[20rem] -translate-x-1/2 rounded-4xl border border-white/10 bg-slate-950/95 p-4 text-left text-sm text-slate-100 shadow-[0_28px_80px_-34px_rgba(0,0,0,0.8)] ring-1 ring-white/10 backdrop-blur-xl opacity-0 transition-all duration-200 group-hover:block group-hover:opacity-100 group-hover:-translate-y-1 z-50 pointer-events-none">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-white">
                        {entry.isPerfect ? <Sparkles className="h-4 w-4 text-emerald-300" /> : <AlertTriangle className="h-4 w-4 text-amber-300" />}
                        {entry.isPerfect ? "Perfect day" : `Missing ${entry.totalTasks - entry.completedTasks} task${entry.totalTasks - entry.completedTasks === 1 ? "" : "s"}`}
                      </div>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold",
                        entry.isPerfect ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"
                      )}>
                        {entry.isPerfect ? "Done" : "Incomplete"}
                      </span>
                    </div>
                    <div className="mt-4 rounded-3xl bg-white/5 p-4 text-slate-300 ring-1 ring-white/5">
                      {entry.missingTasks && entry.missingTasks.length > 0 ? (
                        <ul className="space-y-2">
                          {entry.missingTasks.map((task) => (
                            <li key={task} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-3 py-2">
                              <span className="flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-300 text-[10px] font-bold text-slate-950">•</span>
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-300">Completed all tasks for this day.</p>
                      )}
                    </div>
                    <div className="absolute left-1/2 top-full h-4 w-4 -translate-x-1/2 rotate-45 bg-slate-950/95 border border-white/10" />
                  </div>
                  <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{entry.date.slice(0, 10)}</div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <span className={cn(
                      "rounded-2xl px-3 py-1 text-sm font-medium",
                      entry.isPerfect ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"
                    )}>
                      {entry.isPerfect ? "Perfect" : "Partial"}
                    </span>
                    <span className="text-sm text-slate-200">{entry.completedTasks}/{entry.totalTasks}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mt-2">No history yet. Complete all tasks and reset to build streaks.</p>
          )}
        </div>
      </div>
    </div>
  )
}
