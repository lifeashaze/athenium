// pages/api/classrooms/[id]/assignments.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getAuth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { id } = req.query;
  const { title, deadline } = req.body;

  try {
    const newAssignment = await prisma.assignment.create({
      data: {
        title,
        deadline: new Date(deadline),
        creator: { connect: { id: userId } },
        classroom: { connect: { id: Number(id) } },
      },
    });

    res.status(201).json(newAssignment);
  } catch (error) {
    console.error('Failed to create assignment:', error);
    res.status(500).json({ message: 'Failed to create assignment' });
  }
}