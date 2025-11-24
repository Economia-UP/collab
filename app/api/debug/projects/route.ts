import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isDatabaseAvailable } from '@/lib/prisma';

/**
 * Debug endpoint to check all projects and their visibility
 * GET /api/debug/projects
 */
export async function GET() {
  try {
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return NextResponse.json({
        error: 'Database not available',
        projects: [],
      });
    }

    const allProjects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        visibility: true,
        status: true,
        owner: {
          select: {
            email: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    const publicProjects = allProjects.filter(p => p.visibility === 'PUBLIC');
    const privateProjects = allProjects.filter(p => p.visibility === 'PRIVATE');

    return NextResponse.json({
      total: allProjects.length,
      public: publicProjects.length,
      private: privateProjects.length,
      allProjects: allProjects.map(p => ({
        id: p.id,
        title: p.title,
        visibility: p.visibility,
        status: p.status,
        owner: p.owner.email,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      publicProjects: publicProjects.map(p => ({
        id: p.id,
        title: p.title,
        visibility: p.visibility,
        owner: p.owner.email,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message || 'Failed to fetch projects',
      projects: [],
    }, { status: 500 });
  }
}

