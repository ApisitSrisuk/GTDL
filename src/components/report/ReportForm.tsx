"use client"

import { useState } from "react"

const categories = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "other", label: "Other Feedback" },
]

type ReportFormProps = {
  onSuccess?: () => void
}

export default function ReportForm({ onSuccess }: ReportFormProps) {
  const [category, setCategory] = useState("bug")
  const [title, setTitle] = useState("")
  const [details, setDetails] = useState("")
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!title.trim() || !details.trim()) {
      setStatus("error")
      setMessage("Please fill in both title and details.")
      return
    }

    setStatus("sending")
    setMessage("")

    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category, title, details }),
      })

      if (!res.ok) {
        throw new Error("Failed to send report")
      }

      setStatus("success")
      setMessage("Your report has been submitted. Thank you!")
      setTitle("")
      setDetails("")
      setCategory("bug")
      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      setStatus("error")
      setMessage("Unable to send the report. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-4xl border border-white/10 bg-card/80 p-6 shadow-2xl shadow-black/20">
        <div className="mb-4 space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-primary/80">Support</p>
          <h1 className="text-3xl font-bold text-white">Report a problem or request a feature</h1>
          <p className="text-muted-foreground">Share your feedback with the team so we can improve the app for everyone.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
            <label className="block text-sm text-white/80">
              Category
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-background px-4 py-3 text-white outline-none focus:border-primary"
              >
                {categories.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-sm text-white/80">
              Title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Short summary"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-background px-4 py-3 text-white outline-none focus:border-primary"
              />
            </label>
          </div>

          <label className="block text-sm text-white/80">
            Details
            <textarea
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              rows={8}
              placeholder="What happened? Include steps, expected behavior, or ideas for improvement."
              className="mt-2 w-full rounded-3xl border border-white/10 bg-background px-4 py-3 text-white outline-none focus:border-primary resize-none"
            />
          </label>

          {status !== "idle" && (
            <div className={`rounded-3xl px-4 py-3 text-sm ${status === "success" ? "bg-emerald-500/10 text-emerald-200 border border-emerald-500/20" : "bg-rose-500/10 text-rose-200 border border-rose-500/20"}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={status === "sending"}
            className="gaming-button w-full justify-center px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? "Sending..." : "Submit report"}
          </button>
        </form>
      </div>
    </div>
  )
}
