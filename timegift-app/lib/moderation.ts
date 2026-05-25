import {
  RegExpMatcher,
  englishDataset,
  englishRecommendedTransformers,
} from 'obscenity';

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

export interface ModerationResult {
  flagged: boolean;
  reason?: string;
}

// Returns flagged=true if the text contains profanity per obscenity's
// recommended ruleset. Caller decides whether to soft-flag (admin review)
// or hard-reject.
export function moderateText(text: string | null | undefined): ModerationResult {
  if (!text) return { flagged: false };
  const matches = matcher.getAllMatches(text);
  if (matches.length === 0) return { flagged: false };
  // Return distinct term IDs for context (admin tooling can show them).
  const terms = Array.from(new Set(matches.map((m) => String(m.termId))));
  return { flagged: true, reason: 'profanity:' + terms.slice(0, 5).join(',') };
}
