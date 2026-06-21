export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { connectDB } = await import("./src/lib/db");
    connectDB().catch((error) => {
      console.error("[instrumentation] DB warm-up failed:", error);
    });
  }
}
