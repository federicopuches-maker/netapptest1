export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 50);
}

export function makeUniqueSlug(
  base: string,
  existingSlugs: string[],
  excludeSlug?: string
): string {
  const slugs = new Set(existingSlugs.filter((s) => s !== excludeSlug));
  if (!slugs.has(base)) return base;
  let i = 2;
  while (slugs.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}
