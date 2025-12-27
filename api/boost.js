const axios = require('axios');

export default async function handler(req, res) {
    // Verified Credentials
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2";
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";
    
    // Hardcoded Facebook Target
    const targetUrl = "https://www.facebook.com/profile.php?id=61583017822517";

    try {
        // Step 1: Request the Boost from the Supabase Edge Function
        const response = await axios.get(`https://emmrerremmbnrxyutunp.supabase.co/functions/v1/boost-proxy`, {
            params: {
                action: 'start',
                url: targetUrl,
                type: 'facebook_followers',
                count: 1,
                device_id: DEVICE_ID
            },
            headers: {
                'apikey': ANON_KEY,
                'Authorization': `Bearer ${ANON_KEY}`
            },
            timeout: 10000 // 10s timeout
        });

        // Step 2: Return success to the caller (cron-job.org)
        return res.status(200).json({ 
            success: true, 
            message: "Signal sent to server", 
            server_response: response.data 
        });

    } catch (error) {
        // Step 3: Handle errors (like Cooldowns) without crashing Vercel
        const errorData = error.response ? error.response.data : error.message;
        
        return res.status(200).json({ 
            success: false, 
            message: "Request processed, but server denied it (likely cooldown).",
            details: errorData 
        });
    }
}
