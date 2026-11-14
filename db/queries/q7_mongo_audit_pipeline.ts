import { Db } from 'mongodb';

/**
 * Q7 Part A: Aggregate audit events per event_type per day
 * Pipeline stages: $group by day and event_type, then $sort
 */
export async function getEventsPerTypePerDay(db: Db) {
  return await db
    .collection('audit_logs')
    .aggregate([
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$ts' } },
            event_type: '$event_type',
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.day': -1,
          count: -1,
        },
      },
      {
        $project: {
          _id: 0,
          day: '$_id.day',
          event_type: '$_id.event_type',
          count: 1,
        },
      },
    ])
    .toArray();
}

/**
 * Q7 Part B: Most recommended playbooks
 * Pipeline stages: $match recommendations_issued -> $unwind playbook_ids
 * -> $group and count -> $lookup to guidance_playbooks -> $sort -> $limit
 */
export async function getMostRecommendedPlaybooks(db: Db, limit = 5) {
  return await db
    .collection('audit_logs')
    .aggregate([
      {
        $match: {
          event_type: 'recommendations_issued',
          'details.playbook_ids': { $exists: true, $ne: [] },
        },
      },
      {
        $unwind: '$details.playbook_ids',
      },
      {
        $group: {
          _id: '$details.playbook_ids',
          times_recommended: { $sum: 1 },
        },
      },
      {
        $sort: { times_recommended: -1 },
      },
      {
        $limit: limit,
      },
      {
        // Lookup playbook metadata from guidance_playbooks
        $lookup: {
          from: 'guidance_playbooks',
          let: { pbIdStr: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: '$_id' }, '$$pbIdStr'],
                },
              },
            },
            {
              $project: {
                title: 1,
                priority: 1,
                tags: 1,
              },
            },
          ],
          as: 'playbook_details',
        },
      },
      {
        $unwind: {
          path: '$playbook_details',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          playbook_id: '$_id',
          title: { $ifNull: ['$playbook_details.title', 'Unknown Playbook'] },
          priority: '$playbook_details.priority',
          times_recommended: 1,
        },
      },
    ])
    .toArray();
}
