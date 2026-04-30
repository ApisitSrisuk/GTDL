"use client"

import { useEffect, useState } from "react"

type Report = {
  id: string
  category: string
  title: string
  details: string
  status: string
  response?: string | null
  createdAt: string
  updatedAt: string
  user: {
    name?: string | null
    email?: string | null
  }
}

export default function AdminReportsClient() {
  const [reports, setReports] = useState<Report[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [reply, setReply] = useState("")
  const [status, setStatus] = useState("open")
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  const fetchReports = async () => {
    setLoading(true)
    const res = await fetch("/api/report")
    if (res.ok) {
      const data = await res.json()
      setReports(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReports()
  }, [])

  const submitResponse = async (reportId: string) => {
    const res = await fetch("/api/report", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: reportId, response: reply, status }),
    })

    if (res.ok) {
      setMessage("Response saved.")
      setEditing(null)
      setReply("")
      fetchReports()
    } else {
      setMessage("Unable to save response.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-4xl border border-white/10 bg-card/80 p-6 shadow-2xl shadow-black/20">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary/70">Admin Reports</p>
            <h2 className="text-3xl font-bold text-white">Manage feedback cases</h2>
            <p className="text-muted-foreground">Review submitted reports and respond directly from the dashboard.</p>
          </div>
          <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">{reports.length} reports</span>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-muted-foreground">No reports yet.</div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <span className="rounded-full bg-white/5 px-3 py-1">{report.category}</span>
                      <span className="rounded-full bg-white/5 px-3 py-1">{report.status}</span>
                      <span className="text-xs uppercase tracking-[0.18em] text-white/50">{new Date(report.createdAt).toLocaleString()}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-white">{report.title}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{report.details}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                      <span>{report.user.name || report.user.email || "Anonymous"}</span>
                      {report.response && <span className="text-emerald-300">Response saved</span>}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(report.id)
                        setReply(report.response || "")
                        setStatus(report.status)
                        setMessage("")
                      }}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                    >
                      Reply
                    </button>
                  </div>
                </div>

                {editing === report.id && (
                  <div className="mt-5 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-4">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      rows={4}
                      className="w-full rounded-3xl border border-white/10 bg-background px-4 py-3 text-white outline-none focus:border-primary"
                      placeholder="Write your response here"
                    />
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="rounded-2xl border border-white/10 bg-background px-4 py-3 text-white outline-none focus:border-primary"
                      >
                        <option value="open">Open</option>
                        <option value="resolved">Resolved</option>
                      </select>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                        >
                          Close
                        </button>
                        <button
                          type="button"
                          onClick={() => submitResponse(report.id)}
                          className="gaming-button px-4 py-3"
                        >
                          Save response
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {message && <p className="mt-4 text-sm text-amber-200">{message}</p>}
      </div>
    </div>
  )
}
