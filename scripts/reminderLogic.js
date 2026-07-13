export const REMINDER_TYPES = {
  DUE_TODAY: "dueToday",
  OVERDUE: "overdue",
};

export function getReminderType(daysRemaining, daysOverdue) {

  // Book is due today
  if (daysRemaining === 0) {
    return {
      studentReminder: REMINDER_TYPES.DUE_TODAY,
      notifyAdmin: false,
    };
  }

  // Book is overdue
  if (daysOverdue > 0) {
    return {
      studentReminder: REMINDER_TYPES.OVERDUE,
      notifyAdmin: daysOverdue % 5 === 0,
    };
  }

  // No reminder required
  return null;
}
