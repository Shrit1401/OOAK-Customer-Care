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
    }),,
    prisma.important.findMany({
      where: {
        phoneNumber: phoneNumber
      }
    }),,
    prisma.category.findMany({
      where: {
        phoneNumber: phoneNumber
      }
    }),,
    prisma.comment.findMany({
      where: {
        phoneNumber: phoneNumber
      }
    }),,
  ]);

  return {
    users,
    posts,
    importants,
    categories,
    comments,
  };
};