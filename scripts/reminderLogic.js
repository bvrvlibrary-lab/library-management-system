const REMINDER_TYPES = {
  DUE_TODAY: "dueToday",
  OVERDUE: "overdue",
};

function getReminderType(daysRemaining, daysOverdue) {

  if (daysRemaining === 0) {
    return {
      studentReminder: REMINDER_TYPES.DUE_TODAY,
      notifyAdmin: false,
    };
  }

  if (daysOverdue > 0) {
    return {
      studentReminder: REMINDER_TYPES.OVERDUE,

      // Notify admin only on every 5th overdue day
      notifyAdmin:
        daysOverdue > 0 &&
        daysOverdue % 5 === 0,
    };
  }

  return null;
}

module.exports = {
  REMINDER_TYPES,
  getReminderType,
};
