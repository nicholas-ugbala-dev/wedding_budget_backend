export async function getRate(from: string, to: string): Promise<number | null> {
    if (from === to) return 1;
    try {
        const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
        const json = await res.json() as { rates?: Record<string, number> };
        return json?.rates?.[to] ?? null;
    } catch {
        return null;
    }
}
