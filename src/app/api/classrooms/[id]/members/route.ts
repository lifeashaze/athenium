import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const classroomId = parseInt(params.id);
    const members = await prisma.membership.findMany({
      where: { classroomId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            rollNo: true,
            srn: true,
            prn: true,
          },
        },
      },
    });

    const formattedMembers = members.map(({ user }) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      rollNo: user.rollNo,
      srn: user.srn,
      prn: user.prn,
    }));

    return NextResponse.json(formattedMembers);
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}
