"use client"

import { useEffect, useState } from "react"
import ReportForm from "./ReportForm"

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
  respondedBy?: {
    name?: string | null
    email?: string | null
  }
}

type ReportCenterProps = {
  canSubmit: boolean
}

export default function ReportCenter({ canSubmit }: ReportCenterProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  const fetchReports = async () => {
    setLoading(true)
    const res = await fetch("/api/report")
    if (res.ok) {
      setReports(await res.json())
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchReports()
  }, [refreshKey])

  return (
    <div className="space-y-8">
      <div className="rounded-4xl border border-white/10 bg-card/80 p-8 shadow-2xl shadow-black/20">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-primary/70">Report center</p>
          <h1 className="text-4xl font-extrabold">Send feedback or report an issue</h1>
          <p className="text-muted-foreground max-w-2xl">
            Everyone can see submitted reports. Admins can respond to cases, but once a report is claimed by an admin, only that admin can update the response.
          </p>
        </div>
        <div className="mt-8">
          {canSubmit ? (
            <ReportForm onSuccess={() => setRefreshKey((value) => value + 1)} />
          ) : (
            <div className="rounded-4xl border border-white/10 bg-white/5 p-6 text-center text-muted-foreground">
              Please login to submit a report.
            </div>
          )}
        </div>
      </div>

      <div className="rounded-4xl border border-white/10 bg-card/80 p-6 shadow-2xl shadow-black/20">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary/70">Public reports</p>
            <h2 className="text-3xl font-bold text-white">All submitted cases</h2>
          </div>
          <button
            type="button"
            onClick={fetchReports}
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-muted-foreground">No reports yet.</div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="rounded-full bg-white/5 px-3 py-1">{report.category}</span>
                  <span className="rounded-full bg-white/5 px-3 py-1">{report.status}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-white/50">{new Date(report.createdAt).toLocaleString()}</span>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-white">{report.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{report.details}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-slate-300">
                  <span>Submitted by {report.user.name || report.user.email || "Anonymous"}</span>
                  <span>{report.respondedBy ? `Assigned admin: ${report.respondedBy.name || report.respondedBy.email || "Unknown"}` : "No admin assigned yet"}</span>
                </div>
                {report.response ? (
                  <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                    <p className="font-semibold text-white">Admin response</p>
                    <p className="mt-2 whitespace-pre-line">{report.response}</p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
