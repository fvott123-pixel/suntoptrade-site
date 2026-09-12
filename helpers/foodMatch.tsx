/**
 * Pure food-name matching for meal integrity — NO database, NO @floot imports,
 * so it is fully unit-testable on its own.
 *
 * BUILD 24 split these helpers out of mayaTools (which imports the db client) so
 * the meal-integrity rules — is this a real food, is this the same food she
 * already told me about, is this just a meal-slot label — can be tested directly.
 * mayaTools re-exports every one of these, so existing importers are unchanged.
 */

/**
 * A meal name normalised for comparison: lower-cased, trimmed, stripped of
 * punctuation and collapsed whitespace. "Popcorn", "popcorn" and " popcorn."
 * are one food; treating them as different is what let the same item land twice.
 */
export function normaliseMealName(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Bare meal-slot / placeholder words that are never actually a food. */
export const PLACEHOLDER_MEAL_NAMES = new Set<string>([
  "breakfast", "lunch", "dinner", "snack", "brunch", "supper",
  "meal", "food", "nothing", "none", "n a", "na",
]);

/** A 0-calorie row whose name is just a meal slot is the model filing the SLOT
 * as a meal (empty "lunch"/"dinner" rows) — not a real food. */
export function isPlaceholderMeal(mealName: string, calories: number): boolean {
  return calories === 0 && PLACEHOLDER_MEAL_NAMES.has(normaliseMealName(mealName));
}

/**
 * BUILD 24 — is this name ONLY a meal-slot word ("Lunch", "Dinner", "Breakfast"),
 * regardless of calories? A bare slot is a clock/schedule label, never a food, so
 * it must never become a diary row OR a food routine — no matter what placeholder
 * calorie number a model attached to it. This is the guard that kills the phantom
 * "Lunch 600" / "Dinner 700" rows that a meal-TIMES answer produced in Build 23.
 */
export function isMealSlotName(name: string): boolean {
  return PLACEHOLDER_MEAL_NAMES.has(normaliseMealName(name));
}

/**
 * Descriptor / quantity / container words that do NOT change a food's identity.
 * "bowl of yoghurt" and "yoghurt", "lower-carb pizza" and "pizza" are the same
 * food; brand and preparation words are noise for the purpose of "is this the
 * same thing she already told me about in this session".
 */
const FOOD_STOPWORDS = new Set<string>([
  // grammar / quantity / container noise
  "a", "an", "the", "of", "and", "with", "some", "my", "your", "her", "his",
  "bowl", "bowls", "glass", "glasses", "cup", "cups", "can", "cans", "bag", "bags",
  "plate", "plates", "serving", "servings", "portion", "portions", "piece", "pieces",
  "slice", "slices", "litre", "litres", "liter", "liters", "ml", "gram", "grams", "g",
  "morning", "afternoon", "evening", "today", "daily", "every", "usual", "regular",
  "another", "more", "one", "two", "three", "four", "five", "couple",
  // preparation / dietary DESCRIPTORS that modify a food without changing WHICH
  // food it is — so "Lower-carb pizza", "Pizza (50% less carb base)" and "pizza"
  // all reduce to {pizza}, and "sugar-free coffee" / "coffee" both to {coffee}.
  "lower", "low", "less", "reduced", "light", "lite", "diet", "sugar", "free",
  "carb", "carbs", "base", "bases", "fat", "skim", "skimmed", "whole", "fresh",
  "homemade", "big", "small", "large", "half", "full", "percent", "zero", "hot",
  "cold", "iced", "black", "plain",
]);

/** The significant content words of a food name: lower-cased, singularised,
 *  descriptor/quantity noise removed, pure numbers dropped. "Pizza (50% less
 *  carb base)" and "Lower-carb pizza" and "pizza" all share the word "pizza". */
export function foodWords(name: string): string[] {
  const singular = (w: string) => (w.length > 3 && w.endsWith("s") ? w.slice(0, -1) : w);
  return [
    ...new Set(
      normaliseMealName(name)
        .split(" ")
        .map(singular)
        .filter((w) => w.length >= 2 && !FOOD_STOPWORDS.has(w) && !/^\d+$/.test(w)),
    ),
  ];
}

/**
 * BUILD 24 — a food name has a real edible identity: at least one content word
 * that is not a meal-slot label, a bare number, or pure noise. Guards against
 * calorie-only orphan rows ("150" with no food) reaching the diary.
 */
export function mealHasFoodIdentity(name: string): boolean {
  return foodWords(name).length > 0 && !isMealSlotName(name);
}

/**
 * BUILD 24 — do two food names refer to the SAME food? Paraphrase-tolerant, by
 * design: the smaller significant-word set being fully contained in the larger
 * means one is a descriptor variant of the other ("pizza" ⊆ "lower carb pizza",
 * "coffee" ⊆ "avalanche sugar free coffee", "yoghurt" ⊆ "bowl of yoghurt"). This
 * is the SAME matcher the routine path already used to dedup routines; Build 24
 * gives the onboarding meal path the same protection. Deliberately used ONLY
 * scoped to one onboarding session (provenance outranks fuzzy name similarity),
 * never as a global cross-day dedup.
 */
export function sameFood(a: string, b: string): boolean {
  const na = normaliseMealName(a);
  const nb = normaliseMealName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  const wa = new Set(foodWords(a));
  const wb = new Set(foodWords(b));
  if (!wa.size || !wb.size) return false;
  const [small, big] = wa.size <= wb.size ? [wa, wb] : [wb, wa];
  return [...small].every((w) => big.has(w));
}
