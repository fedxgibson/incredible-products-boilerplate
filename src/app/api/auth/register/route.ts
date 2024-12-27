import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
}