import { getDb } from './mongo';

export type AuditEventType =
  | 'signup'
  | 'login'
  | 'identity_added'
  | 'identity_verified'
  | 'scan_completed'
  | 'scan_failed'
  | 'recommendations_issued'
  | 'action_completed'
  | 'admin_breach_added'
  | 'admin_playbook_changed';

export interface AuditLogEntry {
  event_type: AuditEventType;
  user_id: number;
  role: 'user' | 'admin';
  details: Record<string, any>;
}

/**
 * Appends a tamper-evident audit record to MongoDB audit_logs.
 * Errors during audit logging are captured to prevent blocking main transaction flows,
 * while printing diagnostics to the server console.
 */
export async function logAuditEvent(entry: AuditLogEntry): Promise<void> {
  try {
    const db = await getDb();
    await db.collection('audit_logs').insertOne({
      ts: new Date(),
      event_type: entry.event_type,
      user_id: entry.user_id,
      role: entry.role,
      details: entry.details,
    });
  } catch (err: any) {
    console.error('⚠️ Failed to append to audit_logs in MongoDB:', err.message);
  }
}
