import type { NextRequest } from "next/server";
import {
  verifySession,
  successResponse,
  errorResponse,
  apiErrorResponse,
  type APIError,
} from "@/lib/api";
import { checkRateLimit, setRateLimitHeaders } from "@/lib/api/rate-limit";

const RATE_LIMIT = 60;
const RATE_WINDOW = 60000;

function resolveRawUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "github.com") {
      const parts = parsed.pathname.split("/").filter(Boolean);
      if (parts.length >= 2) {
        const [owner, repo] = parts;
        const branch = parts[3] || "main";
        const filePath = parts.slice(4).join("/") || "README.md";
        return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
      }
    }

    if (parsed.hostname === "raw.githubusercontent.com") {
      return url;
    }

    if (url.endsWith(".md") || url.endsWith(".mdx") || url.endsWith(".txt")) {
      return url;
    }

    return null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const rateResult = await checkRateLimit(request, RATE_LIMIT, RATE_WINDOW);
    if (!rateResult.allowed) {
      const response = errorResponse("Rate limit exceeded", 429, {
        retry_after: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
      });
      return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
    }

    await verifySession();

    const url = request.nextUrl.searchParams.get("url");
    if (!url) {
      return setRateLimitHeaders(
        errorResponse("Missing url parameter", 400),
        rateResult,
        RATE_LIMIT,
      );
    }

    const rawUrl = resolveRawUrl(url);
    if (!rawUrl) {
      return setRateLimitHeaders(
        errorResponse("Unable to resolve documentation URL", 400),
        rateResult,
        RATE_LIMIT,
      );
    }

    const res = await fetch(rawUrl, {
      headers: { "User-Agent": "Siza-IDP/1.0" },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return setRateLimitHeaders(
        errorResponse("Failed to fetch documentation", res.status),
        rateResult,
        RATE_LIMIT,
      );
    }

    const content = await res.text();
    const truncated = content.slice(0, 100000);

    const response = successResponse({
      content: truncated,
      source: rawUrl,
      truncated: content.length > 100000,
    });
    return setRateLimitHeaders(response, rateResult, RATE_LIMIT);
  } catch (error) {
    if ((error as APIError).statusCode) {
      return apiErrorResponse(error as APIError);
    }
    return errorResponse("An unexpected error occurred", 500);
  }
}
