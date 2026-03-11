import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

type CreateArticleBody = {
  title: string;
  content: string;
  summary: string;
};

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 },
      );
    }

    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json(
        { error: "Clerk user not found" },
        { status: 404 },
      );
    }

    const body: CreateArticleBody = await req.json();

    if (!body.title || !body.content || !body.summary) {
      return NextResponse.json(
        { error: "Missing required fields: title, content, or summary" },
        { status: 400 },
      );
    }

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email:
            clerkUser.emailAddresses[0]?.emailAddress ||
            `${userId}@example.com`,
          name:
            `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() ||
            "User",
        },
      });
    }

    const article = await prisma.article.create({
      data: {
        title: body.title,
        content: body.content,
        summary: body.summary,
        userId: dbUser.id,
      },
    });

    return NextResponse.json(
      { success: true, message: "Article created", article },
      { status: 201 },
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));

    console.error("Article creation error:", err);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 },
      );
    }

    const articles = await prisma.article.findMany({
      where: {
        user: {
          clerkId: userId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, articles }, { status: 200 });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));

    console.error("Article fetch error:", err);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
