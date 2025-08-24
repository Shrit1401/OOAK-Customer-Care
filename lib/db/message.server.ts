"use server";

import prisma from "./prisma";

export const addMessage = async (
  content: string,
  role: "USER" | "ASSISTANT",
  phoneNumber: string
) => {
  await prisma.message.create({
    data: {
      content,
      role,
      phoneNumber,
    },
  });
};

export const markImportant = async (
  content: string,
  phoneNumber: string,
  metadata?: Record<string, unknown>,
) => {
  await prisma.important.create({
    data: {
      content,
      phoneNumber,
      metadata: metadata ? (metadata as unknown as any) : undefined,
    },
  });
};

export const getContextUser = async (phoneNumber: string) => {
  const [users, posts, importants, categories, comments] = await Promise.all([
    prisma.user.findMany({
      where: {
        phoneNumber: phoneNumber
      }
    }),
    prisma.post.findMany({
      where: {
        phoneNumber: phoneNumber
      }
    }),
    prisma.important.findMany({
      where: {
        phoneNumber: phoneNumber
      }
    }),
    prisma.category.findMany({
      where: {
        phoneNumber: phoneNumber
      }
    }),
    prisma.comment.findMany({
      where: {
        phoneNumber: phoneNumber
      }
    }),
  ]);

  return {
    users,
    posts,
    importants,
    categories,
    comments,
  };
};