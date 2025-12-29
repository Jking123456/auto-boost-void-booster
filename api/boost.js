export default async function handler(req, res) {
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2"; 
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";

    const headers = {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'x-client-info': 'supabase-js/2.39.7',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    try {
        // Step 1: Mandatory Binding (Refresh session)
        const bindResponse = await fetch('https://emmrerremmbnrxyutunp.supabase.co/rest/v1/rpc/bind_device_to_key', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ 
                p_key: USER_KEY, 
                p_device_id: DEVICE_ID 
            })
        });

        // Step 2: Trigger Boost Proxy
        // We use encodeURIComponent to ensure the URL doesn't break the query string
        const targetUrl = encodeURIComponent("https://www.facebook.com/profile.php?id=61583017822517");
        
        // E003 Fix: The 'type' must match exactly, and 'count' usually needs to be higher
        const params = [
            `action=start`,
            `url=${targetUrl}`,
            `type=facebook_followers`,
            `count=100`, // Increased from 1 to 100
            `device_id=${DEVICE_ID}`
        ].join('&');

        const boostResponse = await fetch(`https://emmrerremmbnrxyutunp.supabase.co/functions/v1/boost-proxy?${params}`, {
            method: 'GET',
            headers: headers
        });

        const data = await boostResponse.json();

        // Check for error codes
        if (data.code === "E003") {
            return res.status(200).json({
                success: false,
                message: "Still getting E003. Trying alternative 'type' names might be required.",
                suggestion: "Try changing 'facebook_followers' to 'facebook_profile_followers' or 'fb_subscribers'.",
                server_response: data
            });
        }

        return res.status(200).json({
            success: true,
            server_data: data
        });

    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
