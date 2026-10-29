export const retiredBlogSlug = "savoring-the-flavors-of-bengal-in-the-heart-of-london";
export const retainedBlogSlug = "bringing-a-taste-of-bengal-to-your-table-authentic-bangladeshi-catering-in-londo";

export function canonicalBlogSlug(slug) {
  return slug === retiredBlogSlug ? retainedBlogSlug : slug;
}
