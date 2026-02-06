export default async function Store() {
  const products = await getAllProducts()
  return <ProductList items={products} />
}
