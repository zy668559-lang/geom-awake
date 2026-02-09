import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache for idempotency in MVP2
// In a real app, this would be Redis or a Database
const cache = new Map<string, any>();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { submissionId, stuckPoint, content } = body;

        if (!submissionId) {
            return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
        }

        // 1. Idempotency Check
        if (cache.has(submissionId)) {
            console.log(`[API] Idempotent hit for ${submissionId}`);
            return NextResponse.json(cache.get(submissionId));
        }

        // 2. Simulate Processing (and potential 429 for testing if needed)
        // For now, we return a successful mock result
        console.log(`[API] Processing new submission: ${submissionId}`);

        // Mock result based on stuckPoint
        const result = {
            key_steps_appeared: true,
            next_action: stuckPoint === "不知道怎么开始"
                ? "先在图中标出所有已知的垂直关系，陈老师看好你。"
                : "尝试连接线段 AC，看看能否构造出一个全等三角形。",
            timestamp: Date.now()
        };

        // Cache the result
        cache.set(submissionId, result);

        return NextResponse.json(result);
    } catch (error) {
        console.error("[API] Submission error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
