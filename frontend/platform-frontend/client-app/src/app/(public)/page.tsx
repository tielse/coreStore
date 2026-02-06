import { getBestSeller, getNewProducts } from '@/services/product.service'

export default async function Home() {
  const [best, news] = await Promise.all([
    getBestSeller(),
    getNewProducts(),
  ])

  return (
    <>
      <HeroSEO />
      <ProductList title="Bán chạy nhất" items={best} />
      <ProductList title="Sản phẩm mới" items={news} />
    </>
  )
}
