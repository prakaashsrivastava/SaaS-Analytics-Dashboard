export interface PlanLimits {
  maxProjects: number;
  maxMembers: number;
  dataWindowDays: number;
}

export function getPlanLimits(plan: string): PlanLimits {
  const normalizedPlan = plan.toLowerCase();

  if (normalizedPlan === "pro") {
    return {
      maxProjects: Infinity,
      maxMembers: Infinity,
      dataWindowDays: 90,
    };
  }

  // Default to FREE plan
  return {
    maxProjects: 1,
    maxMembers: 3,
    dataWindowDays: 7,
  };
}
