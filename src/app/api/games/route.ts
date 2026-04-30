import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

function startOfUtcDay(date: Date) {
  const utc = new Date(date)
  utc.setUTCHours(0, 0, 0, 0)
  return utc
}

function computeStreak(history: Array<{ date: Date }>) {
  if (history.length === 0) {
    return 0
  }

  let streak = 0
  let expectedDate = startOfUtcDay(new Date(history[0].date))

  for (const row of history) {
    const rowDate = startOfUtcDay(new Date(row.date))

    if (rowDate.getTime() !== expectedDate.getTime()) {
      break
    }

    streak += 1
    expectedDate = new Date(Date.UTC(expectedDate.getUTCFullYear(), expectedDate.getUTCMonth(), expectedDate.getUTCDate() - 1))
  }

  return streak
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const games = await prisma.game.findMany({
      where: { userId: session.user.id },
      include: {
        tasks: true,
        histories: {
          orderBy: { date: "desc" },
          take: 5,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const prepared = games.map((game) => ({
      ...game,
      currentStreak: computeStreak(game.histories),
      recentHistory: game.histories,
    }))

    return NextResponse.json(prepared)
  } catch (error) {
    console.error("[GAMES_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const idsParam = searchParams.get("ids")

    if (!id && !idsParam) {
      return new NextResponse("Game ID or ids parameter is required", { status: 400 })
    }

    if (id) {
      await prisma.game.delete({
        where: { id },
      })
      return new NextResponse(null, { status: 204 })
    }

    const ids = idsParam?.split(",").filter(Boolean) ?? []
    if (ids.length === 0) {
      return new NextResponse("No valid game IDs provided", { status: 400 })
    }

    await prisma.game.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[GAMES_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { name, imageUrl } = await req.json()
    if (!name) {
      return new NextResponse("Name is required", { status: 400 })
    }

    const game = await prisma.game.create({
      data: {
        name,
        imageUrl,
        userId: session.user.id,
      },
    })

    return NextResponse.json(game)
  } catch (error) {
    console.error("[GAMES_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
