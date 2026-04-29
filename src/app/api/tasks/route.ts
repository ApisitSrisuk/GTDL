import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { title, gameId } = await req.json()
    if (!title || !gameId) {
      return new NextResponse("Missing fields", { status: 400 })
    }

    const task = await prisma.task.create({
      data: {
        title,
        gameId,
      },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("[TASKS_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { id, isCompleted } = await req.json()
    const task = await prisma.task.update({
      where: { id },
      data: { isCompleted },
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error("[TASKS_PATCH]", error)
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

    if (!id) {
      return new NextResponse("Task ID is required", { status: 400 })
    }

    await prisma.task.delete({
      where: { id },
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("[TASKS_DELETE]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
