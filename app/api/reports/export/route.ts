import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { formatCurrency, formatPercentage, formatDate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'pdf';
    const projectId = searchParams.get('projectId');
    const reportType = searchParams.get('type') || 'executive';

    // Get report data
    const projects = await prisma.aIProject.findMany({
      where: projectId ? { id: projectId } : undefined,
      include: {
        department: true,
        owner: true,
        roiCalculations: {
          orderBy: { calculationDate: 'desc' },
        },
        kpiDefinitions: {
          where: { isActive: true },
          include: {
            metricsTimeseries: {
              orderBy: { time: 'desc' },
              take: 10,
            },
          },
        },
        riskAssessments: {
          include: { owner: true },
        },
        phases: {
          orderBy: { phaseOrder: 'asc' },
          include: {
            milestones: true,
          },
        },
      },
    });

    // Calculate summary metrics
    const totalProjects = projects.length;
    const projectsWithROI = projects.filter(p => p.roiCalculations.length > 0);
    
    const avgROI = projectsWithROI.length > 0
      ? projectsWithROI.reduce((sum, p) => {
          const roi = p.roiCalculations[0];
          const totalCost = (roi.implementationCost || 0) + (roi.operationalCost || 0) + (roi.maintenanceCost || 0);
          const totalBenefits = (roi.costSavings || 0) + (roi.revenueIncrease || 0) + (roi.productivityGainsValue || 0);
          const roiPercentage = totalCost > 0 ? ((totalBenefits - totalCost) / totalCost) * 100 : 0;
          return sum + roiPercentage;
        }, 0) / projectsWithROI.length
      : 0;

    const totalCostSavings = projects.reduce((sum, p) => {
      if (p.roiCalculations.length > 0) {
        return sum + (p.roiCalculations[0].costSavings || 0);
      }
      return sum;
    }, 0);

    const totalBudgetAllocated = projects.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0);
    const totalBudgetSpent = projects.reduce((sum, p) => sum + (p.budgetSpent || 0), 0);

    const reportData = {
      generatedAt: new Date().toISOString(),
      reportType,
      summary: {
        totalProjects,
        avgROI,
        totalCostSavings,
        totalBudgetAllocated,
        totalBudgetSpent,
      },
      projects: projects.map(p => {
        const latestROI = p.roiCalculations[0];
        const roiPercentage = latestROI ? (
          ((latestROI.costSavings || 0) + (latestROI.revenueIncrease || 0) + (latestROI.productivityGainsValue || 0) -
          ((latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0))) /
          Math.max(1, (latestROI.implementationCost || 0) + (latestROI.operationalCost || 0) + (latestROI.maintenanceCost || 0))
        ) * 100 : null;

        return {
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          category: p.category,
          department: p.department?.name,
          owner: p.owner?.name,
          startDate: p.startDate,
          targetCompletionDate: p.targetCompletionDate,
          budgetAllocated: p.budgetAllocated,
          budgetSpent: p.budgetSpent,
          roi: roiPercentage,
          activeKPIs: p.kpiDefinitions.length,
          openRisks: p.riskAssessments.filter(r => r.status === 'OPEN').length,
          kpiDefinitions: p.kpiDefinitions,
          roiCalculations: p.roiCalculations,
          riskAssessments: p.riskAssessments,
          phases: p.phases,
        };
      }),
    };

    if (format === 'json') {
      return NextResponse.json(reportData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="ai-benefits-report-${Date.now()}.json"`,
        },
      });
    }

    // For PDF/Excel, we'll return JSON and let the client handle conversion
    // In a production app, you'd use libraries like jsPDF, pdfkit, or exceljs
    return NextResponse.json(reportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ai-benefits-report-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Report export error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

