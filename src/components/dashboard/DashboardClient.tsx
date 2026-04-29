"use client"

import { useEffect, useState } from "react"
import { Plus, LayoutGrid, Loader2 } from "lucide-react"
import GameCard from "./GameCard"

export default function DashboardClient() {
  const [games, setGames] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newGameName, setNewGameName] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const fetchGames = async () => {
    const res = await fetch("/api/games")
    if (res.ok) {
      const data = await res.json()
      setGames(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchGames()
  }, [])

  const addGame = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGameName.trim()) return

    const res = await fetch("/api/games", {
      method: "POST",
      body: JSON.stringify({ name: newGameName }),
    })

    if (res.ok) {
      setNewGameName("")
      setIsAdding(false)
      fetchGames()
    }
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black flex items-center gap-3 italic tracking-tighter">
            <LayoutGrid className="text-primary" />
            MY GAMES
          </h2>
          <p className="text-muted-foreground text-sm">Manage your gaming routines and never miss a quest.</p>
        </div>

        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="gaming-button flex items-center gap-2 justify-center"
        >
          <Plus className="w-5 h-5" />
          Add New Game
        </button>
      </div>

      {isAdding && (
        <form onSubmit={addGame} className="gaming-card p-6 border-primary/20 bg-primary/5 animate-in slide-in-from-top-2">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              autoFocus
              type="text"
              value={newGameName}
              onChange={(e) => setNewGameName(e.target.value)}
              placeholder="Enter game name (e.g. Genshin Impact, Elden Ring)"
              className="bg-background border border-white/10 rounded-lg px-4 py-2 flex-1 focus:outline-none focus:border-primary"
            />
            <div className="flex gap-2">
              <button type="submit" className="gaming-button flex-1 sm:flex-none">Create</button>
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="bg-secondary px-4 py-2 rounded-lg text-sm hover:bg-secondary/80 flex-1 sm:flex-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} onUpdate={fetchGames} />
        ))}

        {games.length === 0 && !isAdding && (
          <div className="col-span-full border-2 border-dashed border-white/5 rounded-2xl p-12 text-center space-y-4">
            <p className="text-muted-foreground">Your library is empty. Add your first game to start tracking.</p>
          </div>
        )}
      </div>
    </div>
  )
}
