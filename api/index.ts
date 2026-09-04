import type { VercelRequest, VercelResponse } from "@vercel/node";

// Lazy-load so import errors surface as JSON instead of a blank FUNCTION_INVOCATION_FAILED.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const mod = await import("../src/app");
    const app = mod.default;
    return app(req, res);
  } catch (error) {
    console.error("Director OS API boot failure", error);
    res.status(500).json({
      message: "API boot failed",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
