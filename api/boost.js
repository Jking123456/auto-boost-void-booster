export default async function handler(req, res) {
    // 1. Use the original bound identity to bypass security checks
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2"; 
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    
    // Credentials extracted from the site's source code
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";

    // Mandatory headers for Supabase authorization and client identification
    const headers = {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'x-client-info': 'supabase-js/2.39.7' // Essential for server validation
    };

    try {
        // STEP 1: Perform the mandatory binding/handshake
        // Even if already bound, this refreshes the session state for the proxy
        const bindResponse = await fetch('https://emmrerremmbnrxyutunp.supabase.co/rest/v1/rpc/bind_device_to_key', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ 
                p_key: USER_KEY, 
                p_device_id: DEVICE_ID 
            })
        });

        const bindData = await bindResponse.json();

        // STEP 2: Trigger the Boost Proxy with corrected parameters
        // E003 is often triggered by invalid 'count' or 'type' values
        const params = new URLSearchParams({
            action: 'start',
            url: "https://www.facebook.com/profile.php?id=61583017822517",
            type: 'facebook_followers', // Ensure this service type is supported
            count: '100',               // Set a standard value; '1' may be rejected
            device_id: DEVICE_ID
        });

        const boostResponse = await fetch(`https://emmrerremmbnrxyutunp.supabase.co/functions/v1/boost-proxy?${params}`, {
            method: 'GET',
            headers: headers
        });

        const data = await boostResponse.json();

        // Check if the server-side boost-proxy returned an error
        if (data.error) {
            return res.status(400).json({
                success: false,
                message: "Server returned a proxy error",
                error_code: data.code,
                error_details: data.error,
                binding_status: bindData
            });
        }

        return res.status(200).json({
            success: true,
            message: "Boost process initiated successfully",
            server_data: data
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}

