"use client"

import { useEffect, useState } from "react"
import { Plus, LayoutGrid, Loader2 } from "lucide-react"
import GameCard from "./GameCard"

export default function DashboardClient() {
  const [games, setGames] = useState<any[]>([])
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([])
  const [isDeleteMode, setIsDeleteMode] = useState(false)
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

  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[] | null>(null)
  const [pendingDeleteLabel, setPendingDeleteLabel] = useState("")
  const [isProcessingDelete, setIsProcessingDelete] = useState(false)

  const toggleGameSelection = (gameId: string) => {
    if (!isDeleteMode) return
    setSelectedGameIds((prev) =>
      prev.includes(gameId) ? prev.filter((id) => id !== gameId) : [...prev, gameId]
    )
  }

  const allGameIds = games.map((game) => game.id)
  const isAllSelected = allGameIds.length > 0 && selectedGameIds.length === allGameIds.length

  const toggleSelectAll = () => {
    setSelectedGameIds(isAllSelected ? [] : allGameIds)
  }

  const requestDeleteSelectedGames = () => {
    if (selectedGameIds.length === 0) return
    setPendingDeleteIds(selectedGameIds)
    setPendingDeleteLabel(`Delete ${selectedGameIds.length} selected game${selectedGameIds.length === 1 ? "" : "s"}?`)
  }

  const requestDeleteGame = (gameId: string, gameName?: string) => {
    setPendingDeleteIds([gameId])
    setPendingDeleteLabel(`Delete ${gameName ? `"${gameName}"` : "this game"}?`)
  }

  const cancelPendingDelete = () => setPendingDeleteIds(null)

  const confirmPendingDelete = async () => {
    if (!pendingDeleteIds) return
    setIsProcessingDelete(true)

    const res = await fetch(`/api/games?ids=${pendingDeleteIds.join(",")}`, {
      method: "DELETE",
    })

    setIsProcessingDelete(false)

    if (res.ok) {
      setSelectedGameIds((prev) => prev.filter((id) => !pendingDeleteIds.includes(id)))
      setIsDeleteMode(false)
      setPendingDeleteIds(null)
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
    <div className="relative">
      {isDeleteMode && (
        <div className="pointer-events-none fixed inset-0 z-9999">
          <div className="absolute inset-4 rounded-4xl border-2 border-rose-500/85" />
          <div className="absolute left-1/2 top-6 -translate-x-1/2 z-10000 rounded-full border border-white/10 bg-rose-500/95 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-rose-50 shadow-xl shadow-rose-950/30">
            delete mode
          </div>
        </div>
      )}
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="rounded-4xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-sm text-muted-foreground ring-1 ring-white/10">
                <LayoutGrid className="text-primary" />
                <span className="font-semibold tracking-[0.16em]">MY GAMES</span>
              </div>
              <p className="max-w-2xl text-muted-foreground">Manage your gaming routines and never miss a quest.</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              {isDeleteMode ? (
                <>
                  <button
                    onClick={toggleSelectAll}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                  >
                    {isAllSelected ? "Deselect all" : "Select all"}
                  </button>
                  <button
                    onClick={requestDeleteSelectedGames}
                    disabled={selectedGameIds.length === 0}
                    className="gaming-button flex items-center gap-2 justify-center disabled:bg-white/10 disabled:text-slate-500"
                  >
                    Confirm delete
                    {selectedGameIds.length > 0 && ` (${selectedGameIds.length})`}
                  </button>
                  <button
                    onClick={() => {
                      setIsDeleteMode(false)
                      setSelectedGameIds([])
                    }}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsDeleteMode(true)
                    setSelectedGameIds([])
                  }}
                  className="gaming-button flex items-center gap-2 justify-center"
                >
                  Delete
                </button>
              )}
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className="gaming-button flex items-center gap-2 justify-center"
              >
                <Plus className="w-5 h-5" />
                Add New Game
              </button>
            </div>
          </div>

          {isDeleteMode && (
            <div className="mt-4 rounded-3xl border border-amber-500/10 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Select games to delete, then confirm to remove them permanently.
            </div>
          )}
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
            <GameCard
              key={game.id}
              game={game}
              deleteMode={isDeleteMode}
              selected={selectedGameIds.includes(game.id)}
              onToggleSelected={() => toggleGameSelection(game.id)}
              onDeleteGame={() => requestDeleteGame(game.id, game.name)}
              onUpdate={fetchGames}
            />
          ))}

          {games.length === 0 && !isAdding && (
            <div className="col-span-full border-2 border-dashed border-white/5 rounded-2xl p-12 text-center space-y-4">
              <p className="text-muted-foreground">Your library is empty. Add your first game to start tracking.</p>
            </div>
          )}
        </div>
      </div>

      {pendingDeleteIds && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
          <div className="w-full max-w-md rounded-4xl border border-white/10 bg-slate-950/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-amber-300">Confirm delete</p>
                <h3 className="mt-3 text-lg font-bold text-white">{pendingDeleteLabel}</h3>
              </div>
              <div className="rounded-full bg-amber-500/10 px-3 py-2 text-xs font-semibold uppercase text-amber-200 ring-1 ring-amber-500/20">
                {pendingDeleteIds.length} item{pendingDeleteIds.length === 1 ? "" : "s"}
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-300">This action cannot be undone. Deleted games will be removed along with their task history.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cancelPendingDelete}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPendingDelete}
                disabled={isProcessingDelete}
                className="gaming-button w-full sm:w-auto px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isProcessingDelete ? "Deleting..." : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
