function normalizeAnswerValue(value: string) {
  return value.trim().toLowerCase();
}

function displayAnswerValue(value: string) {
  return value.trim();
}

export { normalizeAnswerValue, displayAnswerValue };
