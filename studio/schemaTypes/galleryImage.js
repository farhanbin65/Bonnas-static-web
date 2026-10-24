export default {
  name: 'galleryImage',
  title: 'Gallery Image',
  type: 'document',
  initialValue: {displayOrder: 0, visible: true},
  fields: [
    {
      name: 'title',
      title: 'Food name',
      type: 'string',
      description: 'Shown on the photo, for example Chicken biryani.',
      validation: (Rule) => Rule.required().max(120),
    },
    {
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: {hotspot: true},
      description: 'Upload a photo, then adjust its crop and focal point if needed.',
      validation: (Rule) => Rule.required().assetRequired(),
    },
    {
      name: 'alt',
      title: 'Image description (alt text)',
      type: 'string',
      description: 'Describe what is visible for people using screen readers.',
      validation: (Rule) => Rule.required().max(300),
    },
    {
      name: 'description',
      title: 'Food details',
      type: 'text',
      rows: 3,
      description: 'Details to show on hover or tap. Only include confirmed ingredients or dietary claims.',
      validation: (Rule) => Rule.max(1000),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Rice & biryani', value: 'rice-biryani'},
          {title: 'Main dishes', value: 'main-dishes'},
          {title: 'Starters & snacks', value: 'starters-snacks'},
          {title: 'Sides & bhorta', value: 'sides-bhorta'},
          {title: 'Desserts & sweets', value: 'desserts-sweets'},
          {title: 'Catering & platters', value: 'catering-platters'},
          {title: 'Other', value: 'other'},
        ],
      },
    },
    {
      name: 'tags',
      title: 'Search tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {layout: 'tags'},
      description: 'Add relevant search words, such as chicken, biryani, or party platter.',
      validation: (Rule) => Rule.unique().max(30),
    },
    {
      name: 'displayOrder',
      title: 'Display order',
      type: 'number',
      description: 'Lower numbers appear first. Use 10, 20, 30 to leave room between photos.',
      validation: (Rule) => Rule.integer().min(0),
    },
    {
      name: 'visible',
      title: 'Show in gallery',
      type: 'boolean',
      description: 'Turn off to keep this published entry out of the future website gallery.',
    },
  ],
  orderings: [
    {title: 'Display order', name: 'displayOrderAsc', by: [{field: 'displayOrder', direction: 'asc'}, {field: 'title', direction: 'asc'}]},
    {title: 'Food name', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'title', media: 'image', visible: 'visible'},
    prepare({title, media, visible}) {
      return {title: title || 'Untitled food photo', media, subtitle: visible === false ? 'Hidden from gallery' : 'Gallery photo'}
    },
  },
}
