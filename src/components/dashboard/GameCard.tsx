"use client"

import { useState } from "react"
import { Plus, Trash2, RotateCcw, CheckCircle2, Circle } from "lucide-react"
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

interface Game {
  id: string
  name: string
  imageUrl?: string | null
  tasks: Task[]
}

export default function GameCard({ game, onUpdate }: { game: Game, onUpdate: () => void }) {
  const [newTask, setNewTask] = useState("")
  const [loading, setLoading] = useState(false)

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
    onUpdate()
  }

  const toggleTask = async (id: string, isCompleted: boolean) => {
    await fetch("/api/tasks", {
      method: "PATCH",
      body: JSON.stringify({ id, isCompleted: !isCompleted }),
    })
    onUpdate()
  }

  const deleteTask = async (id: string) => {
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" })
    onUpdate()
  }

  const resetTasks = async () => {
    await fetch("/api/tasks/reset", {
      method: "POST",
      body: JSON.stringify({ gameId: game.id }),
    })
    onUpdate()
  }

  return (
    <div className="gaming-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-primary flex items-center gap-2">
          {game.name}
        </h3>
        <button 
          onClick={resetTasks}
          className="text-muted-foreground hover:text-white transition-colors p-1"
          title="Reset All Tasks"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
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

      <div className="space-y-2">
        {game.tasks.map((task) => (
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
        {game.tasks.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">No tasks yet.</p>
        )}
      </div>
    </div>
  )
}
