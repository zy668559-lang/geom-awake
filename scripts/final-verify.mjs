import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/analyze';
const TEST_IMAGE = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDAREAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAAAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFREBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEBase64";

async function runTest() {
    console.log("🚀 Starting Final Orchestration Test...");
    console.log("Target:", API_URL);

    const body = JSON.stringify({
        imageBase64: TEST_IMAGE,
        stuckPoint: "孩子始终看不出图中平行四边形和三角形的面积关系，急死我了。"
    });

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body
        });

        const data = await response.json();

        if (response.ok) {
            console.log("\n✅ [SUCCESS] Orchestration complete!");
            console.log("\n--- 陈老师诊断报告 ---");
            console.log(JSON.stringify(data, null, 2));
            console.log("\n----------------------");
        } else {
            console.log("\n❌ [FAILURE] Status:", response.status);
            console.log("Details:", data.details || data.error);

            if (data.details && data.details.includes("429")) {
                console.log("\n⚠️ Gemini is rate-limited. Retrying in 30s...");
                setTimeout(runTest, 30000);
                return;
            }
        }
    } catch (error) {
        console.error("\n💥 [CRASH] Fatal error:", error.message);
    }
}

runTest();
