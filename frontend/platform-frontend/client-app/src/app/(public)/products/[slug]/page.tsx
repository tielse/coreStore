export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug)
  return {
    title: product.name,
    description: product.description,
  }
}

export default async function ProductDetail({ params }) {
  const product = await getProductBySlug(params.slug)
  return <ProductDetailView product={product} />
}
