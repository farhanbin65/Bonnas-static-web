export default {
  name: 'menuItem',
  title: 'Menu Item',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Item Name',
      type: 'string',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Packages', value: 'packages' },
          { title: 'Biriyani', value: 'biriyani' },
          { title: 'Starters', value: 'starters' },
          { title: 'Desis', value: 'desis' },
          { title: 'Add Ons', value: 'addons' },
          { title: 'Dessert', value: 'dessert' },
        ],
      },
    },
    {
      name: 'price',
      title: 'Price (£)',
      type: 'number',
    },
    {
      name: 'priceLabel',
      title: 'Price Label (optional e.g. £6/£10 for 5/10 people)',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'available',
      title: 'Available',
      type: 'boolean',
      initialValue: true,
    },
  ],
}