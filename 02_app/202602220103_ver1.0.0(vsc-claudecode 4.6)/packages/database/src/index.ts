import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export type { User, Community, Post, Comment, Message, Event } from '@prisma/client';
