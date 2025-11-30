import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const roi = await prisma.rOICalculation.update({
      where: { id },
      data: {
        ...(body.calculationDate && {
          calculationDate: new Date(body.calculationDate),
        }),
        ...(body.implementationCost !== undefined && {
          implementationCost: body.implementationCost,
        }),
        ...(body.operationalCost !== undefined && {
          operationalCost: body.operationalCost,
        }),
        ...(body.maintenanceCost !== undefined && {
          maintenanceCost: body.maintenanceCost,
        }),
        ...(body.costSavings !== undefined && {
          costSavings: body.costSavings,
        }),
        ...(body.revenueIncrease !== undefined && {
          revenueIncrease: body.revenueIncrease,
        }),
        ...(body.productivityGainsValue !== undefined && {
          productivityGainsValue: body.productivityGainsValue,
        }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(roi);
  } catch (error) {
    console.error('ROI update error:', error);
    return NextResponse.json(
      { error: 'Failed to update ROI calculation' },
      { status: 500 }
    );
  }
}

