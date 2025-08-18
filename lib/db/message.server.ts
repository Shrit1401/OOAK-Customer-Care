"use server";

import prisma from "./prisma";

export const addMessage = async (
  content: string,
  role: "USER" | "ASSISTANT"
) => {
  await prisma.message.create({
    data: {
      content,
      role,
    },
  });
};

export const markImportant = async (
  content: string,
  metadata?: Record<string, unknown>
) => {
  await prisma.important.create({
    data: {
      content,
      metadata: metadata ? (metadata as unknown as any) : undefined,
    },
  });
};
