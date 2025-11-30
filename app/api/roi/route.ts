import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import type { ROIFormData } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const where: any = {};
    if (projectId) {
      where.projectId = projectId;
    }

    const roiCalculations = await prisma.rOICalculation.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        calculationDate: 'desc',
      },
    });

    // Add computed fields
    const transformedCalculations = roiCalculations.map(calc => {
      const totalCost = (calc.implementationCost || 0) + (calc.operationalCost || 0) + (calc.maintenanceCost || 0);
      const totalBenefits = (calc.costSavings || 0) + (calc.revenueIncrease || 0) + (calc.productivityGainsValue || 0);
      const roiPercentage = totalCost > 0 ? ((totalBenefits - totalCost) / totalCost) * 100 : 0;

      return {
        ...calc,
        totalCost,
        totalBenefits,
        roiPercentage,
      };
    });

    return NextResponse.json(transformedCalculations);
  } catch (error) {
    console.error('ROI fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ROI calculations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ROIFormData = await request.json();

    const roiCalculation = await prisma.rOICalculation.create({
      data: {
        projectId: body.projectId,
        calculationDate: new Date(body.calculationDate),
        implementationCost: body.implementationCost,
        operationalCost: body.operationalCost,
        maintenanceCost: body.maintenanceCost,
        costSavings: body.costSavings,
        revenueIncrease: body.revenueIncrease,
        productivityGainsValue: body.productivityGainsValue,
        notes: body.notes,
      },
      include: {
        project: true,
      },
    });

    return NextResponse.json(roiCalculation, { status: 201 });
  } catch (error) {
    console.error('ROI creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create ROI calculation' },
      { status: 500 }
    );
  }
}

