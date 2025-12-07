'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { ProjectStatus } from '@prisma/client';

// Validation schemas
const projectSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['AI_AGENT', 'AI_INITIATIVE', 'PROMPT_LIBRARY', 'GEN_AI_PRODUCTION', 'RISK_MANAGEMENT', 'OTHER']),
  status: z.enum(['PLANNING', 'PILOT', 'SCALING', 'PRODUCTION', 'PAUSED', 'COMPLETED']),
  departmentId: z.string(),
  ownerId: z.string(),
  budgetAllocated: z.number().min(0).optional(),
  startDate: z.date().nullable().optional(),
  targetCompletionDate: z.date().nullable().optional(),
  // Key Highlight Remarks
  team: z.string().optional(),
  ownerContact: z.string().optional(),
  problemStatement: z.string().optional(),
  aiMlApproach: z.string().optional(),
  deploymentEnvironment: z.string().optional(),
  benefitRealized: z.string().optional(),
  validationMethod: z.string().optional(),
  currentBlockers: z.string().optional(),
  nextSteps: z.string().optional(),
});

const promptSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  category: z.string().min(2, 'Category is required'),
  tags: z.array(z.string()).optional(),
  promptText: z.string().min(10, 'Prompt text must be at least 10 characters'),
  projectId: z.string().optional(),
  createdById: z.string(),
});

const riskSchema = z.object({
  riskTitle: z.string().min(3, 'Title must be at least 3 characters'),
  riskDescription: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  likelihood: z.number().min(1).max(5),
  status: z.enum(['OPEN', 'MITIGATED', 'ACCEPTED', 'CLOSED']),
  projectId: z.string(),
  ownerId: z.string(),
  mitigationPlan: z.string().optional(),
});

// Project actions
export async function createProject(formData: FormData) {
  try {
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as any,
      status: (formData.get('status') as any) || 'PLANNING',
      departmentId: formData.get('departmentId') as string,
      ownerId: formData.get('ownerId') as string,
      budgetAllocated: formData.get('budgetAllocated') 
        ? parseFloat(formData.get('budgetAllocated') as string) 
        : undefined,
      // Key Highlight Remarks
      team: formData.get('team') as string || undefined,
      ownerContact: formData.get('ownerContact') as string || undefined,
      problemStatement: formData.get('problemStatement') as string || undefined,
      aiMlApproach: formData.get('aiMlApproach') as string || undefined,
      deploymentEnvironment: formData.get('deploymentEnvironment') as string || undefined,
      benefitRealized: formData.get('benefitRealized') as string || undefined,
      validationMethod: formData.get('validationMethod') as string || undefined,
      currentBlockers: formData.get('currentBlockers') as string || undefined,
      nextSteps: formData.get('nextSteps') as string || undefined,
    };

    const validated = projectSchema.parse(data);

    const project = await prisma.aIProject.create({
      data: {
        ...validated,
        budgetSpent: 0,
        startDate: validated.startDate || new Date(),
      },
    });

    revalidatePath('/projects');
    return { success: true, data: project, projectId: project.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to create project' };
  }
}

// Prompt actions
export async function createPrompt(formData: FormData) {
  try {
    const tagsString = formData.get('tags') as string;
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      category: formData.get('category') as string,
      tags,
      promptText: formData.get('promptText') as string,
      projectId: formData.get('projectId') as string || undefined,
      createdById: formData.get('createdById') as string,
    };

    const validated = promptSchema.parse(data);

    const prompt = await prisma.promptLibrary.create({
      data: {
        promptTitle: validated.title,
        promptText: validated.promptText,
        category: validated.category,
        tags: validated.tags ? validated.tags.join(', ') : null,
        useCase: validated.description || null,
        authorId: validated.createdById,
        projectId: validated.projectId || null,
        version: 1,
        isActive: true,
      },
    });

    revalidatePath('/prompts');
    return { success: true, data: prompt };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to create prompt' };
  }
}

// Risk actions
export async function createRisk(formData: FormData) {
  try {
    const likelihoodMap: Record<string, number> = {
      'RARE': 1,
      'UNLIKELY': 2,
      'POSSIBLE': 3,
      'LIKELY': 4,
      'CERTAIN': 5,
    };

    const data = {
      riskTitle: formData.get('title') as string,
      riskDescription: formData.get('description') as string,
      category: formData.get('category') as string || undefined,
      severity: formData.get('severity') as any,
      likelihood: likelihoodMap[formData.get('likelihood') as string] || 3,
      status: (formData.get('status') as any) || 'OPEN',
      projectId: formData.get('projectId') as string,
      ownerId: formData.get('identifiedById') as string,
      mitigationPlan: formData.get('mitigationPlan') as string || undefined,
    };

    const validated = riskSchema.parse(data);

    const risk = await prisma.riskAssessment.create({
      data: {
        ...validated,
        identifiedDate: new Date(),
      },
    });

    revalidatePath('/risks');
    return { success: true, data: risk };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to create risk assessment' };
  }
}

// Helper function to get departments and users for form dropdowns
export async function getDepartmentsAndUsers() {
  const [departments, users] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: 'asc' } }),
    prisma.user.findMany({ orderBy: { name: 'asc' } }),
  ]);

  return { departments, users };
}

// Helper function to get projects for dropdowns
export async function getProjectsForSelect() {
  return await prisma.aIProject.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

// ============================================================================
// UPDATE ACTIONS
// ============================================================================

export async function updateProject(id: string, formData: FormData) {
  try {
    const startDateValue = formData.get('startDate') as string;
    const targetCompletionDateValue = formData.get('targetCompletionDate') as string;

    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as any,
      status: formData.get('status') as any,
      departmentId: formData.get('departmentId') as string,
      ownerId: formData.get('ownerId') as string,
      budgetAllocated: formData.get('budgetAllocated') 
        ? parseFloat(formData.get('budgetAllocated') as string) 
        : undefined,
      startDate: startDateValue && startDateValue.trim() 
        ? new Date(startDateValue) 
        : null,
      targetCompletionDate: targetCompletionDateValue && targetCompletionDateValue.trim()
        ? new Date(targetCompletionDateValue)
        : null,
      // Key Highlight Remarks
      team: formData.get('team') as string || undefined,
      ownerContact: formData.get('ownerContact') as string || undefined,
      problemStatement: formData.get('problemStatement') as string || undefined,
      aiMlApproach: formData.get('aiMlApproach') as string || undefined,
      deploymentEnvironment: formData.get('deploymentEnvironment') as string || undefined,
      benefitRealized: formData.get('benefitRealized') as string || undefined,
      validationMethod: formData.get('validationMethod') as string || undefined,
      currentBlockers: formData.get('currentBlockers') as string || undefined,
      nextSteps: formData.get('nextSteps') as string || undefined,
    };

    const validated = projectSchema.parse(data);

    const project = await prisma.aIProject.update({
      where: { id },
      data: validated,
    });

    revalidatePath('/projects');
    revalidatePath(`/projects/${id}`);
    revalidatePath('/roadmap');
    return { success: true, data: project };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to update project' };
  }
}

export async function updateProjectStatus(projectId: string, status: ProjectStatus) {
  try {
    const project = await prisma.aIProject.update({
      where: { id: projectId },
      data: { status },
    });

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/roadmap');
    return { success: true, data: project };
  } catch (error) {
    console.error('Failed to update project status:', error);
    return { success: false, error: 'Failed to update project status' };
  }
}

export async function updatePrompt(id: string, formData: FormData) {
  try {
    const tagsString = formData.get('tags') as string;
    const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(Boolean) : [];

    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || undefined,
      category: formData.get('category') as string,
      tags,
      promptText: formData.get('promptText') as string,
      projectId: formData.get('projectId') as string || undefined,
      createdById: formData.get('createdById') as string,
    };

    const validated = promptSchema.parse(data);

    const prompt = await prisma.promptLibrary.update({
      where: { id },
      data: {
        promptTitle: validated.title,
        promptText: validated.promptText,
        category: validated.category,
        tags: validated.tags ? validated.tags.join(', ') : null,
        useCase: validated.description || null,
        authorId: validated.createdById,
        projectId: validated.projectId || null,
      },
    });

    revalidatePath('/prompts');
    return { success: true, data: prompt };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to update prompt' };
  }
}

export async function updateRisk(id: string, formData: FormData) {
  try {
    const likelihoodMap: Record<string, number> = {
      'RARE': 1,
      'UNLIKELY': 2,
      'POSSIBLE': 3,
      'LIKELY': 4,
      'CERTAIN': 5,
    };

    const data = {
      riskTitle: formData.get('title') as string,
      riskDescription: formData.get('description') as string,
      category: formData.get('category') as string || undefined,
      severity: formData.get('severity') as any,
      likelihood: likelihoodMap[formData.get('likelihood') as string] || 3,
      status: formData.get('status') as any,
      projectId: formData.get('projectId') as string,
      ownerId: formData.get('identifiedById') as string,
      mitigationPlan: formData.get('mitigationPlan') as string || undefined,
    };

    const validated = riskSchema.parse(data);

    const risk = await prisma.riskAssessment.update({
      where: { id },
      data: validated,
    });

    revalidatePath('/risks');
    return { success: true, data: risk };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Failed to update risk assessment' };
  }
}

// ============================================================================
// DELETE ACTIONS
// ============================================================================

export async function deleteProject(id: string) {
  try {
    await prisma.aIProject.delete({
      where: { id },
    });

    revalidatePath('/projects');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete project' };
  }
}

export async function deletePrompt(id: string) {
  try {
    await prisma.promptLibrary.delete({
      where: { id },
    });

    revalidatePath('/prompts');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete prompt' };
  }
}

export async function deleteRisk(id: string) {
  try {
    await prisma.riskAssessment.delete({
      where: { id },
    });

    revalidatePath('/risks');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete risk assessment' };
  }
}


