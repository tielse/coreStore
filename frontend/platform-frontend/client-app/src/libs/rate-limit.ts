export async function rateLimit(key: string, limit = 5) {
  const count = await redis.incr(key)
  if (count === 1) await redis.expire(key, 60)
  if (count > limit) throw new Error('Too many requests')
}