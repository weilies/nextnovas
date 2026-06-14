import { Redis } from "@upstash/redis";

// Works with either the Upstash Marketplace env names or the legacy KV_ names.
export const redis = new Redis({
  url:
    process.env.KV_REST_API_URL ||
    process.env.UPSTASH_REDIS_REST_URL ||
    "",
  token:
    process.env.KV_REST_API_TOKEN ||
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    "",
});
