import { createClient } from '@sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID || 'u5i02ojt',
  dataset:   import.meta.env.VITE_SANITY_DATASET || 'production',
  useCdn:    false,
  apiVersion: "2024-01-01",
});

const builder = createImageUrlBuilder(client)
export const urlFor = (source) => builder.image(source)