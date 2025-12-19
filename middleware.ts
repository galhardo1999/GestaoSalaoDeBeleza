import { withAuth } from "next-auth/middleware"
import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Configuração do Rate Limiter (Requer UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN)
const rateLimit = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(20, "1 m"), // 20 requests per minute
        analytics: true,
    })
    : null

export default withAuth(
    async function middleware(req: NextRequest) {
        // Lógica de Rate Limiting
        if (rateLimit) {
            const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1"
            const { success, limit, reset, remaining } = await rateLimit.limit(`mw_${ip}`)

            if (!success) {
                return new NextResponse("Too Many Requests", {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": limit.toString(),
                        "X-RateLimit-Remaining": remaining.toString(),
                        "X-RateLimit-Reset": reset.toString(),
                    },
                })
            }
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
)

export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"]
}
