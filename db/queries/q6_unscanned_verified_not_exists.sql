-- ============================================================================
-- Q6: NOT EXISTS Clause (Verified Identities Never Scanned)
-- Advanced Concept: Correlated Subquery with NOT EXISTS Condition
-- ============================================================================

-- Identifies verified identities that have zero execution records in scan_requests
SELECT
  i.identity_id,
  i.identity_type,
  i.verified_at,
  i.created_at
FROM identities i
WHERE i.verified = true
  AND NOT EXISTS (
    SELECT 1
    FROM scan_requests sr
    WHERE sr.identity_id = i.identity_id
  )
ORDER BY i.created_at ASC;
