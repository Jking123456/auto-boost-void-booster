export default async function handler(req, res) {
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2"; 
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";

    const PROXY_PREFIX = "https://corsproxy.io/?url=";
    const SUPABASE_URL = "https://emmrerremmbnrxyutunp.supabase.co";

    const headers = {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'x-client-info': 'supabase-js/2.39.7',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };

    try {
        // STEP 1: Handshake (Binding) via Proxy
        const bindUrl = `${PROXY_PREFIX}${encodeURIComponent(`${SUPABASE_URL}/rest/v1/rpc/bind_device_to_key`)}`;
        const bindResponse = await fetch(bindUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({ p_key: USER_KEY, p_device_id: DEVICE_ID })
        });
        const bindData = await bindResponse.json();

        // STEP 2: Boost Request via Proxy
        const params = new URLSearchParams({
            action: 'start',
            url: "https://www.facebook.com/profile.php?id=61583017822517",
            type: 'facebook_followers',
            count: '100',
            device_id: DEVICE_ID
        });

        const boostUrl = `${PROXY_PREFIX}${encodeURIComponent(`${SUPABASE_URL}/functions/v1/boost-proxy?${params.toString()}`)}`;
        
        const boostResponse = await fetch(boostUrl, {
            method: 'GET',
            headers: headers
        });

        const data = await boostResponse.json();

        return res.status(200).json({
            success: !data.error,
            proxy: "corsproxy.io",
            server_data: data,
            binding_status: bindData
        });

    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: error.message,
            hint: "Check if the proxy is returning a non-JSON error page"
        });
    }
}
