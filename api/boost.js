const axios = require('axios');

export default async function handler(req, res) {
    // 1. Credentials & Configuration
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2";
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";
    
    // Hardcoded Target (No more URL parameter errors!)
    const targetUrl = "https://www.facebook.com/profile.php?id=61583017822517";
    const boostType = "facebook_followers"; 

    console.log(`[LOG] Hardcoded Boost starting for: ${targetUrl}`);

    try {
        // Step A: Keep Device Bound
        await axios.post('https://emmrerremmbnrxyutunp.supabase.co/rest/v1/rpc/bind_device_to_key', 
            { p_key: USER_KEY, p_device_id: DEVICE_ID }, 
            { headers: { 'apikey': ANON_KEY }, timeout: 5000 }
        ).catch(() => {});

        // Step B: Trigger Boost
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
            },
            timeout: 10000 
        });

        return res.status(200).json({ 
            success: true, 
            message: "Request sent to Supabase", 
            server_data: response.data 
        });

    } catch (error) {
        // Capture specific Supabase error (like Cooldown)
        const errorMessage = error.response ? error.response.data : error.message;
        
        return res.status(200).json({ 
            success: false, 
            message: "Request failed (Expected if on cooldown)",
            error: errorMessage
        });
    }
}
