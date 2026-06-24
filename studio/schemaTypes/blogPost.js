export default {
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    { name: "title",            title: "Title",              type: "string",   validation: R => R.required() },
    { name: "slug",             title: "Slug",               type: "slug",     options: { source: "title", maxLength: 80 }, validation: R => R.required() },
    { name: "excerpt",          title: "Excerpt",            type: "text",     rows: 3 },
    { name: "body",             title: "Body",               type: "text",     rows: 20 },
    { name: "keywords",         title: "Keywords",           type: "array",    of: [{ type: "string" }] },
    { name: "trendSource",      title: "Trend Source",       type: "string" },
    { name: "publishedAt",      title: "Published At",       type: "datetime" },
    { name: "featuredImageUrl", title: "Featured Image URL", type: "url" },
    { name: "featuredImageAlt", title: "Featured Image Alt", type: "string" },
    { name: "imageSource",      title: "Image Source",       type: "string" },
    { name: "contentType",      title: "Content Type",       type: "string" },
  ],
  preview: { select: { title: "title", subtitle: "publishedAt" } },
}