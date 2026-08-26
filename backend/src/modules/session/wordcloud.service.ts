import { Answer } from "./answer.model.js";
import {
  displayAnswerValue,
  normalizeAnswerValue,
} from "./answer.normalize.js";
import type { WordCloudTerm, WordResult } from "./session.types.js";

const wordClouds = new Map<string, Map<string, WordCloudTerm>>();

function cloudKey(sessionId: string, questionIndex: number) {
  return `${sessionId}:${questionIndex}`;
}

function sortTerms(terms: WordCloudTerm[]): WordCloudTerm[] {
  return [...terms].sort((left, right) => {
    if (right.count !== left.count) {
      return right.count - left.count;
    }

    return left.label.localeCompare(right.label);
  });
}

export function clearWordCloud(sessionId: string, questionIndex: number) {
  wordClouds.delete(cloudKey(sessionId, questionIndex));
}

export function clearSessionWordClouds(sessionId: string) {
  for (const key of wordClouds.keys()) {
    if (key.startsWith(`${sessionId}:`)) {
      wordClouds.delete(key);
    }
  }
}

export function recordWordCloudAnswer(
  sessionId: string,
  questionIndex: number,
  rawValue: string,
): { term: WordCloudTerm; isNew: boolean } {
  const key = normalizeAnswerValue(rawValue);
  const label = displayAnswerValue(rawValue);
  const bucketKey = cloudKey(sessionId, questionIndex);
  const bucket = wordClouds.get(bucketKey) ?? new Map<string, WordCloudTerm>();

  const existing = bucket.get(key);
  if (existing) {
    existing.count += 1;
    bucket.set(key, existing);
    wordClouds.set(bucketKey, bucket);
    return { term: existing, isNew: false };
  }

  const term: WordCloudTerm = { key, label, count: 1 };
  bucket.set(key, term);
  wordClouds.set(bucketKey, bucket);
  return { term, isNew: true };
}

export function getWordCloudSnapshot(
  sessionId: string,
  questionIndex: number,
): WordCloudTerm[] {
  const bucket = wordClouds.get(cloudKey(sessionId, questionIndex));
  if (!bucket) {
    return [];
  }

  return sortTerms([...bucket.values()]);
}

export function toWordResults(terms: WordCloudTerm[]): WordResult[] {
  return sortTerms(terms).map((term) => ({
    key: term.key,
    label: term.label,
    count: term.count,
  }));
}

export async function aggregateOpenTextResultsFromDb(
  sessionId: string,
  questionIndex: number,
): Promise<WordResult[]> {
  const answers = await Answer.find({ sessionId, questionIndex })
    .select("value")
    .exec();
  const bucket = new Map<string, WordCloudTerm>();

  for (const answer of answers) {
    const key = answer.value;
    const existing = bucket.get(key);
    if (existing) {
      existing.count += 1;
      continue;
    }

    bucket.set(key, { key, label: key, count: 1 });
  }

  return toWordResults([...bucket.values()]);
}
