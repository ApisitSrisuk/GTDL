import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { gameId } = await req.json()

    if (gameId) {
      await prisma.task.updateMany({
        where: { gameId },
        data: { isCompleted: false },
      })
    } else {
      // Reset all tasks for user
      await prisma.task.updateMany({
        where: {
          game: {
            userId: session.user.id,
          },
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
