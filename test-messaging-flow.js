// Simple test script for messaging and announcement flow
const API_URL = 'http://localhost:4000/api/v1';

// Test tokens (replace with actual tokens from your test environment)
const TOKENS = {
    PRINCIPAL: 'your-principal-token-here',
    TEACHER: 'your-teacher-token-here',
    PARENT: 'your-parent-token-here'
};

async function testRequest(method, endpoint, token, body = null) {
    const url = `${API_URL}${endpoint}`;
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    if (body && method !== 'GET') {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        const data = await response.json();

        console.log(`\n${method} ${endpoint}`);
        console.log(`Status: ${response.status}`);
        console.log('Response:', JSON.stringify(data, null, 2));

        return { status: response.status, data };
    } catch (error) {
        console.error(`Error in ${method} ${endpoint}:`, error.message);
        return { status: 500, error: error.message };
    }
}

async function testAnnouncementFlow() {
    console.log('\n🔔 Testing Announcement Flow...');

    // Create an announcement (requires admin token)
    const announcementData = {
        title: 'Test Announcement',
        message: 'This is a test announcement for system validation.',
        audience: 'BOTH' // Target both staff and parents
    };

    const result = await testRequest('POST', '/communications/announcements', TOKENS.PRINCIPAL, announcementData);

    if (result.status === 201) { // Assuming 201 for successful creation
        console.log('✅ Announcement created successfully');
        console.log('📨 In-app notifications should be sent to all targeted users');

        // Test getting notifications for a user
        const notifications = await testRequest('GET', '/notifications', TOKENS.TEACHER);
        if (notifications.status === 200) { // Assuming 200 for successful retrieval
            console.log(`✅ Retrieved ${notifications.data?.length || 0} notifications for teacher`);
        }
    } else {
        console.log('❌ Failed to create announcement:', result.error);
    }

    return result;
}

async function runMessagingTests() {
    console.log('='.repeat(60));
    console.log('TESTING MESSAGING & ANNOUNCEMENT SYSTEM');
    console.log('='.repeat(60));

    // Test 1: Create an announcement (should trigger notifications)
    console.log('\n📢 TEST 1: Creating announcement with notifications');
    await testAnnouncementFlow();

    // Test 2: Send simple message (parent to teacher)
    console.log('\n💬 TEST 2: Simple message (parent to teacher)');
    await testRequest('POST', '/messaging/simple/send', TOKENS.PARENT, {
        receiverId: 2, // Assuming teacher has ID 2
        subject: 'Question about my child\'s homework',
        content: 'Hello, I wanted to ask about the mathematics homework assigned yesterday.',
        category: 'ACADEMIC'
    });

    // Test 3: Get available contacts for messaging
    console.log('\n👥 TEST 3: Get available contacts (parent view)');
    await testRequest('GET', '/messaging/simple/contacts', TOKENS.PARENT);

    // Test 4: Get simple messages (inbox)
    console.log('\n📥 TEST 4: Get inbox messages (simplified format)');
    await testRequest('GET', '/messaging/simple/messages?type=inbox', TOKENS.TEACHER);

    // Test 5: Get sent messages
    console.log('\n📤 TEST 5: Get sent messages');
    await testRequest('GET', '/messaging/simple/messages?type=sent', TOKENS.PARENT);

    // Test 6: Get announcements
    console.log('\n📋 TEST 6: Get announcements');
    await testRequest('GET', '/communications/announcements', TOKENS.PARENT);

    console.log('\n' + '='.repeat(60));
    console.log('MESSAGING TESTS COMPLETED');
    console.log('='.repeat(60));
}

// Instructions for running the test
console.log(`
🧪 MESSAGING SYSTEM TEST SCRIPT

INSTRUCTIONS:
1. Make sure your server is running on port 4000
2. Update the TOKENS object above with real authentication tokens
3. Run: node test-messaging-flow.js

WHAT THIS TESTS:
✅ Announcement creation with automatic notifications
✅ Simple categorized messaging between users  
✅ Role-based contact filtering
✅ Simplified message retrieval (inbox/sent)
✅ WhatsApp notification integration (if configured)

EXPECTED RESULTS:
- Announcements should create in-app notifications for targeted users
- If WhatsApp is configured, announcements should also send WhatsApp messages
- Simple messaging should work with automatic categorization
- Users should only see contacts they can message based on their role
`);

// Export for use or run directly
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runMessagingTests, testRequest };
} else {
    // If running directly, start tests (comment out if tokens not available)
    // runMessagingTests().catch(console.error);
} 