// Sélection explicite — évite les concaténations fragiles
export const PRODUCT_DETAIL_SELECT = `
  id,
  name,
  slug,
  description,
  base_price,
  image_url,
  images,
  is_featured,
  is_active,
  category:categories!category_id (
    id,
    name,
    slug
  ),
  options:product_options (
    id,
    name,
    type,
    is_required,
    sort_order,
    values:product_option_values (
      id,
      value,
      price_modifier,
      sort_order
    )
  )
` as const;
export const PRODUCT_LIST_SELECT = (category: string) => {
  const isCategorySlug = category && !/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(category);
  const select = isCategorySlug
    ? 'category:categories!inner(name,slug)' // INNER JOIN pour filtrer par slug de catégorie
    : 'category:categories!category_id (id,name,slug)'; // LEFT JOIN classique

  return `
    id,
    name,
    slug,
    description,
    base_price,
    image_url,
    is_featured,
    is_active,
    ${select}
  ` as const;
};