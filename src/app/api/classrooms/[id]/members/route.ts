import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const classroomId = params.id;

    const members = await prisma.membership.findMany({
      where: { 
        classroomId,
        user: {
          role: 'STUDENT'
        }
      },
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
            year: true,
            division: true,
          },
        },
      },
      orderBy: {
        user: {
          rollNo: 'asc'
        }
      }
    });

    const formattedMembers = members.map(({ user }) => ({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      rollNo: user.rollNo,
      srn: user.srn,
      prn: user.prn,
      year: user.year,
      division: user.division,
    }));

    return NextResponse.json({
      members: formattedMembers
    });
  } catch (error) {
    console.error('Failed to fetch members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}