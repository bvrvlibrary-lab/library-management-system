const REMINDER_TYPES = {
  DUE_TODAY: "dueToday",
  OVERDUE: "overdue",
};

function getReminderType(daysRemaining, daysOverdue) {

  // Due today
  if (daysRemaining === 0) {
    return {
      studentReminder: REMINDER_TYPES.DUE_TODAY,
      notifyAdmin: false,
    };
  }

  // Overdue
  if (daysOverdue > 0) {
    return {
      studentReminder: REMINDER_TYPES.OVERDUE,
      notifyAdmin: daysOverdue % 5 === 0,
    };
  }

  // Nothing to do
  return null;
}

module.exports = {
  REMINDER_TYPES,
  getReminderType,
};
