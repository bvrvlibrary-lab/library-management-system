export const REMINDER_TYPES = {
  DUE_TODAY: "dueToday",
  OVERDUE_3: "overdue3",
  OVERDUE_7: "overdue7",
  OVERDUE_15: "overdue15",
  OVERDUE_30: "overdue30",
};

export function getReminderType(daysRemaining, daysOverdue) {
  if (daysRemaining === 0)
    return REMINDER_TYPES.DUE_TODAY;

  if (daysOverdue === 3)
    return REMINDER_TYPES.OVERDUE_3;

  if (daysOverdue === 7)
    return REMINDER_TYPES.OVERDUE_7;

  if (daysOverdue === 15)
    return REMINDER_TYPES.OVERDUE_15;

  if (daysOverdue === 30)
    return REMINDER_TYPES.OVERDUE_30;

  return null;
}
