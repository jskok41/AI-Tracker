import { NextRequest, NextResponse } from 'next/server';
import { canEditProject } from '@/lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const canEdit = await canEditProject(projectId);
    
    return NextResponse.json({ canEdit });
  } catch (error) {
    console.error('Permission check error:', error);
    return NextResponse.json({ canEdit: false });
  }
}

