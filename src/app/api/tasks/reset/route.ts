import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

function startOfUtcDay(date: Date) {
  const utc = new Date(date)
  utc.setUTCHours(0, 0, 0, 0)
  return utc
}

export async function POST(req: Request) {
  // 1. ตรวจสอบว่าเป็น Vercel Cron Job หรือไม่ (ใช้ CRON_SECRET เพื่อความปลอดภัย)
  const authHeader = req.headers.get('authorization')
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`

  // 2. ถ้าไม่ใช่ Cron ต้องเป็นการเรียกจาก User ที่ Login แล้ว
  const session = !isCron ? await auth() : null

  if (!isCron && !session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const { gameId } = body
    const currentDate = startOfUtcDay(new Date())

    const gameFilter = gameId
      ? { id: gameId }
      : isCron
      ? undefined
      : { userId: session!.user!.id }

    const games = await prisma.game.findMany({
      where: gameFilter,
      include: { tasks: true },
    })

    await Promise.all(
      games.map(async (game) => {
        const totalTasks = game.tasks.length
        const completedTasks = game.tasks.filter((task) => task.isCompleted).length
        const isPerfect = totalTasks > 0 && completedTasks === totalTasks
        const missingTasks = game.tasks.filter((task) => !task.isCompleted).map((task) => task.title)

        await prisma.gameHistory.upsert({
          where: {
            gameId_date: {
              gameId: game.id,
              date: currentDate,
            },
          },
          update: {
            completedTasks,
            totalTasks,
            isPerfect,
            missingTasks,
          },
          create: {
            gameId: game.id,
            date: currentDate,
            completedTasks,
            totalTasks,
            isPerfect,
            missingTasks,
          },
        })
      })
    )

    if (isCron) {
      // ถ้ารันจาก Cron: รีเซ็ต Task ทั้งหมดในระบบ (ทุก User)
      await prisma.task.updateMany({
        data: { isCompleted: false },
      })
      console.log("Automated Daily Reset Completed")
      return NextResponse.json({ message: "Global reset success" })
    }

    if (gameId) {
      await prisma.task.updateMany({
        where: { gameId },
        data: { isCompleted: false },
      })
    } else {
      await prisma.task.updateMany({
        where: {
          game: { userId: session!.user!.id },
        },
        data: { isCompleted: false },
      })
    }

    return new NextResponse("Success", { status: 200 })
  } catch (error) {
    console.error("[TASKS_RESET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

// เพิ่ม GET method เพื่อให้ Vercel Cron เรียกได้ง่ายขึ้น
export async function GET(req: Request) {
  return POST(req)
}
