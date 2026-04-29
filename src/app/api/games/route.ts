import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const games = await prisma.game.findMany({
      where: { userId: session.user.id },
      include: { tasks: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(games)
  } catch (error) {
    console.error("[GAMES_GET]", error)
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
