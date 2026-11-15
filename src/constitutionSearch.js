const MIN_QUERY_LENGTH = 2;

// Finds laws and currency entries that mention the search text (case-insensitive).
// Returns the matching articles (with only their matching rules), matching currency rows, and a total count.
export function searchConstitution(constitution, query) {
  const needle = query.trim().toLocaleLowerCase();
  if (needle.length < MIN_QUERY_LENGTH) return { laws: [], currency: [], count: 0 };

  const includesNeedle = text => String(text).toLocaleLowerCase().includes(needle);

  const laws = constitution.laws
    .map((law, index) => ({
      id: law.id,
      title: law.title,
      article: index + 1,
      titleMatches: includesNeedle(law.title),
      rules: law.rules.filter(rule => includesNeedle(rule)),
    }))
    .filter(law => law.titleMatches || law.rules.length > 0);

  const currency = constitution.currency.filter(({ item, value }) => includesNeedle(item) || includesNeedle(value));

  const count = laws.reduce((sum, law) => sum + law.rules.length + (law.titleMatches ? 1 : 0), 0) + currency.length;

  return { laws, currency, count };
}
