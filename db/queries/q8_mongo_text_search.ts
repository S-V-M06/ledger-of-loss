import { Db } from 'mongodb';

/**
 * Q8: MongoDB Full-Text Search on Guidance Playbooks
 * Utilizes the weighted text index on title (10), summary (5), tags (5), steps.text (1)
 * and ranks results by $meta: "textScore"
 */
export async function searchGuidancePlaybooks(db: Db, queryText: string, limit = 20) {
  const collection = db.collection('guidance_playbooks');

  if (!queryText || !queryText.trim()) {
    return await collection
      .find({})
      .sort({ priority: -1, updated_at: -1 })
      .limit(limit)
      .toArray();
  }

  return await collection
    .find(
      { $text: { $search: queryText.trim() } },
      { projection: { score: { $meta: 'textScore' } } }
    )
    .sort({ score: { $meta: 'textScore' }, priority: -1 })
    .limit(limit)
    .toArray();
}
