import type { LunchCritiqueRole } from "@/lib/types";

export const LUNCH_CRITIQUE_ROLES = [
  "food_1",
  "food_2",
  "wine_1",
  "wine_2",
] as const satisfies readonly LunchCritiqueRole[];

const ROLE_SET = new Set<string>(LUNCH_CRITIQUE_ROLES);

export function isLunchCritiqueRole(value: string): value is LunchCritiqueRole {
  return ROLE_SET.has(value);
}

export function critiqueRoleLabel(role: LunchCritiqueRole): string {
  switch (role) {
    case "food_1":
      return "Food 1";
    case "food_2":
      return "Food 2";
    case "wine_1":
      return "Wine 1";
    case "wine_2":
      return "Wine 2";
  }
}

/** Short duty line for in-app banners and email. */
export function critiqueRoleDuty(role: LunchCritiqueRole): string {
  switch (role) {
    case "food_1":
      return "You present and comment during the first half of the food service.";
    case "food_2":
      return "You present and comment on the second half of the food service.";
    case "wine_1":
      return "You present and comment on the wines of the first half.";
    case "wine_2":
      return "You present and comment on the wines of the second half.";
  }
}

export function critiqueRoleBrief(role: LunchCritiqueRole): string {
  switch (role) {
    case "food_1":
      return "First half of the food service";
    case "food_2":
      return "Second half of the food service";
    case "wine_1":
      return "Wines of the first half";
    case "wine_2":
      return "Wines of the second half";
  }
}
