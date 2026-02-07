import { NextResponse } from "next/server";

export async function GET() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Missing GEMINI_API_KEY in process.env" }, { status: 500 });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "ping" }] }]
            })
        });

        const statusCode = response.status;
        const rawBody = await response.text();

        // 返回状态码和截断前 500 字的原始 JSON
        return NextResponse.json({
            statusCode,
            rawResponse: rawBody.slice(0, 500),
            success: response.ok,
            keyHead: apiKey.slice(0, 5),
            keyTail: apiKey.slice(-4)
        });
    } catch (error: any) {
        return NextResponse.json({
            error: "Fetch failed",
            message: error.message
        }, { status: 500 });
    }
}
