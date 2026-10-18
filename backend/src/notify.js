const STATUS_LABEL = {
  submitted: 'Submitted', under_review: 'Under Review', in_progress: 'In Progress', resolved: 'Resolved', rejected: 'Rejected',
};
exports.STATUS_LABEL = STATUS_LABEL;
exports.STATUSES = Object.keys(STATUS_LABEL);

exports.notifyUser = (db, userId, complaintId, title, message) =>
  db.query('INSERT INTO notifications(user_id,complaint_id,title,message) VALUES ($1,$2,$3,$4)', [userId, complaintId, title, message]);

// Notifies every administrator
exports.notifyAdmins = (db, complaintId, title, message) =>
  db.query(
    `INSERT INTO notifications(user_id,complaint_id,title,message) SELECT id,$1,$2,$3 FROM users WHERE role='admin'`,
    [complaintId, title, message]
  );
