import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create Departments
  const engineeringDept = await prisma.department.create({
    data: {
      name: 'Engineering',
      description: 'Product Engineering Department',
    },
  });

  const operationsDept = await prisma.department.create({
    data: {
      name: 'Operations',
      description: 'Business Operations Department',
    },
  });

  const dataScienceDept = await prisma.department.create({
    data: {
      name: 'Data Science',
      description: 'AI and Data Science Team',
    },
  });

  console.log('Created departments');

  // Create Users
  const johnDoe = await prisma.user.create({
    data: {
      email: 'john.doe@company.com',
      name: 'John Doe',
      role: 'ADMIN', // Admin role
      departmentId: dataScienceDept.id,
    },
  });

  const janeSmith = await prisma.user.create({
    data: {
      email: 'jane.smith@company.com',
      name: 'Jane Smith',
      role: 'MEMBER', // Member role
      departmentId: engineeringDept.id,
    },
  });

  const bobJohnson = await prisma.user.create({
    data: {
      email: 'bob.johnson@company.com',
      name: 'Bob Johnson',
      role: 'MEMBER', // Member role
      departmentId: operationsDept.id,
    },
  });

  console.log('Created users');

  // Create AI Projects
  const chatbotProject = await prisma.aIProject.create({
    data: {
      name: 'Customer Service AI Chatbot',
      description: 'AI-powered chatbot to handle customer inquiries and support tickets',
      category: 'AI_AGENT',
      status: 'PRODUCTION',
      departmentId: engineeringDept.id,
      ownerId: janeSmith.id,
      startDate: new Date('2024-01-15'),
      targetCompletionDate: new Date('2024-06-30'),
      actualCompletionDate: new Date('2024-06-15'),
      budgetAllocated: 150000,
      budgetSpent: 142000,
      expectedRoiPercentage: 250,
      strategicPriority: 5,
    },
  });

  const promptLibraryProject = await prisma.aIProject.create({
    data: {
      name: 'Enterprise Prompt Library',
      description: 'Centralized repository for AI prompts used across the organization',
      category: 'PROMPT_LIBRARY',
      status: 'SCALING',
      departmentId: dataScienceDept.id,
      ownerId: johnDoe.id,
      startDate: new Date('2024-03-01'),
      targetCompletionDate: new Date('2024-09-30'),
      budgetAllocated: 50000,
      budgetSpent: 32000,
      expectedRoiPercentage: 180,
      strategicPriority: 4,
    },
  });

  const productionFloorAI = await prisma.aIProject.create({
    data: {
      name: 'Manufacturing Floor AI Assistant',
      description: 'Gen AI assistant for production floor workers to access documentation and procedures',
      category: 'GEN_AI_PRODUCTION',
      status: 'PILOT',
      departmentId: operationsDept.id,
      ownerId: bobJohnson.id,
      startDate: new Date('2024-05-01'),
      targetCompletionDate: new Date('2024-12-31'),
      budgetAllocated: 200000,
      budgetSpent: 85000,
      expectedRoiPercentage: 320,
      strategicPriority: 5,
    },
  });

  const dataGovernance = await prisma.aIProject.create({
    data: {
      name: 'AI Data Governance Initiative',
      description: 'Implement data governance and risk management framework for AI systems',
      category: 'RISK_MANAGEMENT',
      status: 'PLANNING',
      departmentId: dataScienceDept.id,
      ownerId: johnDoe.id,
      startDate: new Date('2024-07-01'),
      targetCompletionDate: new Date('2025-03-31'),
      budgetAllocated: 100000,
      budgetSpent: 15000,
      expectedRoiPercentage: 150,
      strategicPriority: 3,
    },
  });

  console.log('Created projects');

  // Create Baseline Metrics
  await prisma.baselineMetric.createMany({
    data: [
      {
        projectId: chatbotProject.id,
        metricName: 'Average Response Time',
        metricValue: 45,
        metricUnit: 'seconds',
        measurementDate: new Date('2024-01-10'),
        notes: 'Measured before AI chatbot implementation',
      },
      {
        projectId: chatbotProject.id,
        metricName: 'Customer Satisfaction Score',
        metricValue: 3.2,
        metricUnit: 'out of 5',
        measurementDate: new Date('2024-01-10'),
      },
      {
        projectId: productionFloorAI.id,
        metricName: 'Documentation Access Time',
        metricValue: 15,
        metricUnit: 'minutes',
        measurementDate: new Date('2024-04-25'),
      },
    ],
  });

  console.log('Created baseline metrics');

  // Create KPI Definitions
  const chatbotResponseTimeKPI = await prisma.kPIDefinition.create({
    data: {
      projectId: chatbotProject.id,
      kpiName: 'Average Response Time',
      metricType: 'OPERATIONAL_EFFICIENCY',
      description: 'Average time to respond to customer inquiries',
      targetValue: 10,
      unit: 'seconds',
      collectionFrequency: 'daily',
      isActive: true,
    },
  });

  const customerSatisfactionKPI = await prisma.kPIDefinition.create({
    data: {
      projectId: chatbotProject.id,
      kpiName: 'Customer Satisfaction Score',
      metricType: 'CUSTOMER_SATISFACTION',
      description: 'Customer satisfaction rating',
      targetValue: 4.5,
      unit: 'out of 5',
      collectionFrequency: 'weekly',
      isActive: true,
    },
  });

  const costSavingsKPI = await prisma.kPIDefinition.create({
    data: {
      projectId: chatbotProject.id,
      kpiName: 'Monthly Cost Savings',
      metricType: 'FINANCIAL_PERFORMANCE',
      description: 'Cost savings from reduced support staff hours',
      targetValue: 25000,
      unit: 'USD',
      collectionFrequency: 'monthly',
      isActive: true,
    },
  });

  const promptUsageKPI = await prisma.kPIDefinition.create({
    data: {
      projectId: promptLibraryProject.id,
      kpiName: 'Prompt Library Usage',
      metricType: 'ADOPTION_ENGAGEMENT',
      description: 'Number of prompts used per week',
      targetValue: 500,
      unit: 'uses',
      collectionFrequency: 'weekly',
      isActive: true,
    },
  });

  console.log('Created KPI definitions');

  // Create Time-series Metrics (last 30 days)
  const now = new Date();
  const metricsData = [];

  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Response time improving over time
    metricsData.push({
      time: date,
      projectId: chatbotProject.id,
      kpiId: chatbotResponseTimeKPI.id,
      metricValue: 45 - (i * 1.2) + (Math.random() * 3),
    });

    // Customer satisfaction improving
    metricsData.push({
      time: date,
      projectId: chatbotProject.id,
      kpiId: customerSatisfactionKPI.id,
      metricValue: 3.2 + (i * 0.04) + (Math.random() * 0.2),
    });

    // Cost savings increasing
    if (i % 7 === 0) {
      metricsData.push({
        time: date,
        projectId: chatbotProject.id,
        kpiId: costSavingsKPI.id,
        metricValue: 15000 + (i * 300) + (Math.random() * 2000),
      });
    }

    // Prompt usage growing
    if (i % 7 === 0) {
      metricsData.push({
        time: date,
        projectId: promptLibraryProject.id,
        kpiId: promptUsageKPI.id,
        metricValue: 200 + (i * 10) + (Math.random() * 50),
      });
    }
  }

  await prisma.metricTimeseries.createMany({
    data: metricsData,
  });

  console.log('Created time-series metrics');

  // Create User Feedback
  await prisma.userFeedback.createMany({
    data: [
      {
        projectId: chatbotProject.id,
        userId: janeSmith.id,
        rating: 5,
        sentiment: 'POSITIVE',
        feedbackText: 'The chatbot has significantly reduced our support ticket backlog!',
        category: 'performance',
        submittedAt: new Date('2024-07-15'),
      },
      {
        projectId: chatbotProject.id,
        userId: bobJohnson.id,
        rating: 4,
        sentiment: 'POSITIVE',
        feedbackText: 'Great improvement in response times. Some edge cases still need work.',
        category: 'functionality',
        submittedAt: new Date('2024-08-01'),
      },
      {
        projectId: promptLibraryProject.id,
        userId: johnDoe.id,
        rating: 5,
        sentiment: 'POSITIVE',
        feedbackText: 'The prompt library has saved our team hours of work every week!',
        category: 'productivity',
        submittedAt: new Date('2024-09-10'),
      },
    ],
  });

  console.log('Created user feedback');

  // Create ROI Calculations
  await prisma.rOICalculation.createMany({
    data: [
      {
        projectId: chatbotProject.id,
        calculationDate: new Date('2024-06-30'),
        implementationCost: 100000,
        operationalCost: 25000,
        maintenanceCost: 17000,
        costSavings: 180000,
        revenueIncrease: 50000,
        productivityGainsValue: 125000,
        notes: 'Q2 2024 ROI calculation - project completed',
      },
      {
        projectId: chatbotProject.id,
        calculationDate: new Date('2024-09-30'),
        implementationCost: 100000,
        operationalCost: 42000,
        maintenanceCost: 20000,
        costSavings: 280000,
        revenueIncrease: 75000,
        productivityGainsValue: 195000,
        notes: 'Q3 2024 ROI calculation - full quarter in production',
      },
      {
        projectId: promptLibraryProject.id,
        calculationDate: new Date('2024-09-30'),
        implementationCost: 30000,
        operationalCost: 2000,
        maintenanceCost: 1000,
        costSavings: 45000,
        revenueIncrease: 0,
        productivityGainsValue: 60000,
        notes: 'Q3 2024 ROI calculation - scaling phase',
      },
    ],
  });

  console.log('Created ROI calculations');

  // Create Agent Performance data
  for (let i = 15; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    await prisma.agentPerformance.create({
      data: {
        projectId: chatbotProject.id,
        agentName: 'Customer Support Bot',
        measurementTimestamp: date,
        tasksAssigned: 100 + Math.floor(Math.random() * 50),
        tasksCompleted: 85 + Math.floor(Math.random() * 15),
        tasksFailed: Math.floor(Math.random() * 5),
        successRate: 85 + Math.random() * 10,
        averageCompletionTime: '2m 15s',
        errorRate: 2 + Math.random() * 3,
        autonomyScore: 75 + Math.random() * 15,
        accuracyScore: 88 + Math.random() * 8,
        userSatisfactionScore: 4.2 + Math.random() * 0.6,
      },
    });
  }

  console.log('Created agent performance data');

  // Create Prompt Library entries
  const prompts = await prisma.promptLibrary.createMany({
    data: [
      {
        projectId: promptLibraryProject.id,
        promptTitle: 'Customer Inquiry Response Template',
        promptText: 'You are a helpful customer service assistant. Respond to the following inquiry with empathy and professionalism: {inquiry}. Provide a clear, concise answer and offer additional help if needed.',
        category: 'Customer Service',
        tags: 'customer-service,support,inquiry',
        authorId: janeSmith.id,
        useCase: 'Responding to customer inquiries',
        usageCount: 245,
        averageRating: 4.7,
        lastUsedAt: new Date(),
      },
      {
        projectId: promptLibraryProject.id,
        promptTitle: 'Code Review Assistant',
        promptText: 'Review the following code for best practices, potential bugs, and security issues: {code}. Provide specific, actionable feedback.',
        category: 'Engineering',
        tags: 'code-review,engineering,quality',
        authorId: janeSmith.id,
        useCase: 'Automated code review assistance',
        usageCount: 189,
        averageRating: 4.5,
        lastUsedAt: new Date(),
      },
      {
        projectId: promptLibraryProject.id,
        promptTitle: 'Data Analysis Summary',
        promptText: 'Analyze the following dataset and provide: 1) Key trends, 2) Anomalies, 3) Actionable insights. Dataset: {data}',
        category: 'Data Science',
        tags: 'analytics,data,insights',
        authorId: johnDoe.id,
        useCase: 'Quick data analysis and reporting',
        usageCount: 156,
        averageRating: 4.8,
        lastUsedAt: new Date(),
      },
      {
        projectId: promptLibraryProject.id,
        promptTitle: 'Meeting Notes Summarizer',
        promptText: 'Summarize the following meeting notes into: 1) Key decisions, 2) Action items with owners, 3) Follow-up topics. Notes: {notes}',
        category: 'Productivity',
        tags: 'meetings,summary,productivity',
        authorId: bobJohnson.id,
        useCase: 'Converting meeting notes to actionable summaries',
        usageCount: 312,
        averageRating: 4.9,
        lastUsedAt: new Date(),
      },
    ],
  });

  console.log('Created prompt library entries');

  // Create Risk Assessments
  await prisma.riskAssessment.createMany({
    data: [
      {
        projectId: chatbotProject.id,
        riskTitle: 'Data Privacy Compliance',
        riskDescription: 'Customer data must be handled in compliance with GDPR and CCPA',
        category: 'compliance',
        severity: 'HIGH',
        likelihood: 3,
        status: 'MITIGATED',
        mitigationPlan: 'Implemented data encryption and access controls. Regular audits scheduled.',
        ownerId: janeSmith.id,
        identifiedDate: new Date('2024-02-01'),
        reviewDate: new Date('2024-08-01'),
      },
      {
        projectId: productionFloorAI.id,
        riskTitle: 'Misinformation Risk',
        riskDescription: 'AI might provide incorrect procedure information leading to safety issues',
        category: 'operational',
        severity: 'CRITICAL',
        likelihood: 2,
        status: 'OPEN',
        mitigationPlan: 'Implementing human-in-the-loop verification for critical procedures',
        ownerId: bobJohnson.id,
        identifiedDate: new Date('2024-06-15'),
        reviewDate: new Date('2024-12-15'),
      },
      {
        projectId: dataGovernance.id,
        riskTitle: 'Insufficient Governance Framework',
        riskDescription: 'Lack of clear policies for AI system deployment and monitoring',
        category: 'compliance',
        severity: 'MEDIUM',
        likelihood: 4,
        status: 'OPEN',
        mitigationPlan: 'Developing comprehensive AI governance framework with legal team',
        ownerId: johnDoe.id,
        identifiedDate: new Date('2024-07-15'),
      },
    ],
  });

  console.log('Created risk assessments');

  // Create Compliance Checks
  await prisma.complianceCheck.createMany({
    data: [
      {
        projectId: chatbotProject.id,
        complianceFramework: 'GDPR',
        requirementName: 'Data Encryption at Rest',
        isCompliant: true,
        lastCheckedAt: new Date('2024-10-15'),
        evidenceUrl: 'https://docs.company.com/gdpr-encryption',
        notes: 'All customer data encrypted using AES-256',
      },
      {
        projectId: chatbotProject.id,
        complianceFramework: 'SOC2',
        requirementName: 'Access Control and Audit Logging',
        isCompliant: true,
        lastCheckedAt: new Date('2024-10-20'),
        evidenceUrl: 'https://docs.company.com/soc2-access',
      },
      {
        projectId: dataGovernance.id,
        complianceFramework: 'ISO27001',
        requirementName: 'Information Security Management System',
        isCompliant: false,
        lastCheckedAt: new Date('2024-11-01'),
        notes: 'Framework under development, expected completion Q1 2025',
      },
    ],
  });

  console.log('Created compliance checks');

  // Create Alerts
  await prisma.alert.createMany({
    data: [
      {
        projectId: chatbotProject.id,
        alertTitle: 'KPI Target Exceeded',
        alertMessage: 'Customer Satisfaction Score exceeded target: 4.7 vs 4.5 target',
        severity: 'INFO',
        status: 'RESOLVED',
        triggeredAt: new Date('2024-11-15'),
        resolvedAt: new Date('2024-11-15'),
      },
      {
        projectId: productionFloorAI.id,
        alertTitle: 'Budget Warning',
        alertMessage: 'Project spending at 85% of allocated budget with 3 months remaining',
        severity: 'WARNING',
        status: 'ACTIVE',
        triggeredAt: new Date('2024-11-20'),
      },
      {
        projectId: dataGovernance.id,
        alertTitle: 'Critical Risk Open',
        alertMessage: 'Critical risk "Misinformation Risk" requires immediate attention',
        severity: 'CRITICAL',
        status: 'ACKNOWLEDGED',
        triggeredAt: new Date('2024-11-25'),
        acknowledgedAt: new Date('2024-11-26'),
        acknowledgedBy: bobJohnson.id,
      },
    ],
  });

  console.log('Created alerts');

  // Create Roadmap Phases
  const planningPhase = await prisma.phase.create({
    data: {
      projectId: productionFloorAI.id,
      phaseName: 'Planning & Requirements',
      description: 'Define requirements, gather stakeholder input, and create project plan',
      phaseOrder: 1,
      status: 'COMPLETED',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-05-31'),
      targetEndDate: new Date('2024-05-31'),
      progressPercentage: 100,
    },
  });

  const pilotPhase = await prisma.phase.create({
    data: {
      projectId: productionFloorAI.id,
      phaseName: 'Pilot Implementation',
      description: 'Deploy to 2 production lines for testing and feedback',
      phaseOrder: 2,
      status: 'IN_PROGRESS',
      startDate: new Date('2024-06-01'),
      targetEndDate: new Date('2024-09-30'),
      progressPercentage: 65,
    },
  });

  const scalingPhase = await prisma.phase.create({
    data: {
      projectId: productionFloorAI.id,
      phaseName: 'Scaling to All Lines',
      description: 'Roll out to all 10 production lines',
      phaseOrder: 3,
      status: 'NOT_STARTED',
      targetEndDate: new Date('2024-12-31'),
      progressPercentage: 0,
    },
  });

  console.log('Created phases');

  // Create Milestones
  await prisma.milestone.createMany({
    data: [
      {
        phaseId: planningPhase.id,
        milestoneName: 'Requirements Document Approved',
        description: 'Complete requirements gathering and get stakeholder approval',
        targetDate: new Date('2024-05-15'),
        completedDate: new Date('2024-05-14'),
        isCompleted: true,
        deliverables: 'Requirements document, stakeholder sign-offs',
      },
      {
        phaseId: planningPhase.id,
        milestoneName: 'Technology Stack Selected',
        description: 'Evaluate and select AI technology and infrastructure',
        targetDate: new Date('2024-05-30'),
        completedDate: new Date('2024-05-28'),
        isCompleted: true,
        deliverables: 'Technology selection document, vendor agreements',
      },
      {
        phaseId: pilotPhase.id,
        milestoneName: 'Initial Deployment Complete',
        description: 'Deploy AI assistant to first production line',
        targetDate: new Date('2024-07-15'),
        completedDate: new Date('2024-07-18'),
        isCompleted: true,
        deliverables: 'Working AI system on Line A',
      },
      {
        phaseId: pilotPhase.id,
        milestoneName: 'Pilot Evaluation Complete',
        description: 'Gather feedback and measure pilot success metrics',
        targetDate: new Date('2024-09-30'),
        isCompleted: false,
        deliverables: 'Pilot evaluation report, lessons learned',
      },
      {
        phaseId: scalingPhase.id,
        milestoneName: 'Training Materials Complete',
        description: 'Create training materials for all production workers',
        targetDate: new Date('2024-10-31'),
        isCompleted: false,
        deliverables: 'Training videos, documentation, quick reference guides',
      },
    ],
  });

  console.log('Created milestones');

  // Create Phase Dependencies
  await prisma.phaseDependency.createMany({
    data: [
      {
        dependentPhaseId: pilotPhase.id,
        requiredPhaseId: planningPhase.id,
        dependencyType: 'finish-to-start',
      },
      {
        dependentPhaseId: scalingPhase.id,
        requiredPhaseId: pilotPhase.id,
        dependencyType: 'finish-to-start',
      },
    ],
  });

  console.log('Created phase dependencies');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

