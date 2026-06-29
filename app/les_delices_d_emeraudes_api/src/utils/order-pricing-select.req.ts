/**
 * Sélection minimale nécessaire à la revalidation du prix côté serveur.
 * Contrairement à PRODUCT_DETAIL_SELECT (catalogue public), on n'a pas
 * besoin de la catégorie ici — uniquement prix de base + options/valeurs.
 */
export const PRODUCT_PRICING_SELECT = `
  id,
  name,
  image_url,
  base_price,
  is_active,
  options:product_options (
    id,
    name,
    values:product_option_values (
      id,
      value,
      price_modifier
    )
  )
` as const;