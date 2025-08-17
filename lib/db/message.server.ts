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
