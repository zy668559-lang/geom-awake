
import { NextResponse } from "next/server";
import { getSession } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { sessionId, round, operations } = await req.json();
    
    // In a real app, we would compare current operations with the previous ones
    // stored in the session to see if the student improved.
    // For MVP, we just return a mock success.
    
    const session = getSession(sessionId);
    if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Mock comparison logic
    const isImproved = operations.length < session.operations.length;

    return NextResponse.json({
      compareResult: {
        round,
        isImproved,
        message: isImproved ? "恭喜！这次比上次更熟练了！" : "还要加油哦，步骤还是有点多。"
      }
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
