
const fetch = require('node-fetch');

async function verify() {
    console.log('--- Verification Started ---');
    try {
        const res = await fetch('http://localhost:3000/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFgEBAQEAAAAAAAAAAAAAAAAAAAEC/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AfX//2Q==',
                stuckPoint: 'Testing verification'
            })
        });

        console.log('Status:', res.status);
        const data = await res.json();
        console.log('Response Body:', JSON.stringify(data, null, 2));

        if (res.ok && data.stuckPoint) {
            console.log('✅ Success: API returned expected mock response.');
        } else {
            console.log('❌ Failure: API response mismatch.');
        }
    } catch (e) {
        console.error('❌ Error hitting API:', e.message);
        console.log('Make sure the dev server is running on port 3000.');
    }
}

verify();
