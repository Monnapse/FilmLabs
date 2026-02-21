"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function updateUsername(newUsername: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };
  
  const existing = await prisma.account.findUnique({ where: { username: newUsername } });
  if (existing) return { error: "Username already taken" };

  await prisma.account.update({
    where: { userId: parseInt(session.user.id) },
    data: { username: newUsername }
  });

  return { success: true };
}

export async function updatePassword(currentPass: string, newPass: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };
  
  const user = await prisma.account.findUnique({ where: { userId: parseInt(session.user.id) } });
  if (!user) return { error: "User not found" };

  const isValid = await bcrypt.compare(currentPass, user.password);
  if (!isValid) return { error: "Incorrect current password" };

  const hashed = await bcrypt.hash(newPass, 10);
  await prisma.account.update({
    where: { userId: user.userId },
    data: { password: hashed }
  });

  return { success: true };
}

export async function updateAvatar(posterUrl: string | null) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "Not authenticated" };

  await prisma.account.update({
    where: { userId: parseInt(session.user.id) },
    data: { avatar: posterUrl }
  });

  return { success: true };
}