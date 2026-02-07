import { NextResponse } from "next/server";

export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY || "";
    const hasKey = apiKey.length > 0;
    const keyHead = hasKey ? apiKey.slice(0, 4) : "NONE";
    const keyTail = hasKey ? apiKey.slice(-4) : "NONE";
    const keyLen = apiKey.length;

    // 检查是否有 NEXT_PUBLIC_ 前缀的影子
    const publicShadow = process.env.NEXT_PUBLIC_GEMINI_API_KEY ? "EXISTS" : "NONE";

    console.log('--- [Audit Env Check] ---');
    console.log('Head:', keyHead, '| Tail:', keyTail, '| Len:', keyLen);

    return NextResponse.json({
        hasKey,
        keyHead,
        keyTail,
        keyLen,
        publicShadow,
        nodeVersion: process.version,
        timestamp: new Date().toISOString()
    });
}
