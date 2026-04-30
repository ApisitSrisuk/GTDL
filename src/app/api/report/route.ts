import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { category, title, details } = body as {
    category?: string
    title?: string
    details?: string
  }

  if (!category || !title || !details) {
    return new NextResponse("Missing required fields", { status: 400 })
  }

  const report = await prisma.report.create({
    data: {
      category,
      title,
      details,
      userId: session.user.id,
    },
  })

  return NextResponse.json({ success: true, reportId: report.id })
}

export async function GET() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      respondedBy: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  })

  return NextResponse.json(reports)
}

export async function PATCH(req: Request) {
  const session = await auth()

  if (!session?.user?.id || session.user.role !== "admin") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { id, response, status } = body as {
    id?: string
    response?: string
    status?: string
  }

  if (!id || !response || !status) {
    return new NextResponse("Missing required fields", { status: 400 })
  }

  const existingReport = await prisma.report.findUnique({
    where: { id },
    select: { respondedById: true },
  })

  if (!existingReport) {
    return new NextResponse("Report not found", { status: 404 })
  }

  if (existingReport.respondedById && existingReport.respondedById !== session.user.id) {
    return new NextResponse("This report is already handled by another admin", { status: 403 })
  }

  await prisma.report.update({
    where: { id },
    data: {
      response,
      status,
      respondedById: session.user.id,
    },
  })

  return NextResponse.json({ success: true })
}
