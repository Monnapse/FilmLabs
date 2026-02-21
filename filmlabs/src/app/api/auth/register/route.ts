import { NextResponse } from "next/dist/server/web/spec-extension/response";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 });
    }

    // Ensure the pepper exists in the environment
    const pepper = process.env.PASSWORD_PEPPER;
    if (!pepper) {
      console.error("PASSWORD_PEPPER is missing from environment variables.");
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    // Check if user already exists
    const existingUser = await prisma.account.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json({ message: "Username already taken" }, { status: 409 });
    }

    // Combine password with the dedicated pepper
    const pepperedPassword = password + pepper;

    // Hash the peppered password (bcrypt generates its own salt automatically)
    const hashedPassword = await bcrypt.hash(pepperedPassword, 10);

    // Save the new user
    const newUser = await prisma.account.create({
      data: {
        username,
        password: hashedPassword,
      }
    });

    return NextResponse.json({ message: "User created successfully" }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ message: "An error occurred during registration" }, { status: 500 });
  }
}