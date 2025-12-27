const axios = require('axios');

export default async function handler(req, res) {
    // 1. Credentials from your file
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2";
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";
    
    // 2. Configuration
    // If you don't provide a URL in the query string, it uses this default
    const targetUrl = req.query.url || "https://www.facebook.com/profile.php?id=61583017822517"; 
    const boostType = "facebook_followers"; 

    console.log(`[LOG] Attempting ${boostType} for: ${targetUrl}`);

    try {
        // Step A: Ensure binding is active (Optional but safe)
        // This ensures the server knows this Device ID owns the Lifetime Key
        await axios.post('https://emmrerremmbnrxyutunp.supabase.co/rest/v1/rpc/bind_device_to_key', {
            p_key: USER_KEY,
            p_device_id: DEVICE_ID
        }, { 
            headers: { 'apikey': ANON_KEY } 
        });

        // Step B: Trigger the Boost Proxy
        const response = await axios.get(`https://emmrerremmbnrxyutunp.supabase.co/functions/v1/boost-proxy`, {
            params: {
                action: 'start',
                url: targetUrl,
                type: boostType,
                count: 1,
                device_id: DEVICE_ID
            },
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            }
        });

        // 3. Success Response
        return res.status(200).json({
            success: true,
            timestamp: new Date().toISOString(),
            message: "Boost request sent successfully",
            details: response.data
        });

    } catch (error) {
        // 4. Error Handling (Cooldowns, Invalid Key, etc.)
        const errorData = error.response ? error.response.data : error.message;
        console.error("[ERROR]", errorData);

        return res.status(200).json({ 
            success: false, 
            message: "Server rejected the request (Likely Cooldown)", 
            error: errorData 
        });
    }
}
