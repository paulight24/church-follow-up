import type { FoundationSchoolCohort } from '@/types/foundationSchool';

/**
 * Prefer the linked instructor user (a real person picked from the user
 * directory); fall back to the legacy free-text `instructor` string so
 * batches created before the picker existed keep displaying correctly.
 */
export function getInstructorLabel(
  cohort: Pick<FoundationSchoolCohort, 'instructor' | 'instructorUser'>,
): string | null {
  if (cohort.instructorUser) {
    return `${cohort.instructorUser.firstName} ${cohort.instructorUser.lastName}`;
  }
  return cohort.instructor ?? null;
}
