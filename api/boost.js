export default async function handler(req, res) {
    const DEVICE_ID = "DEV-6a0e5559-0ea9-44f7-bba7-c9545175ece2"; 
    const USER_KEY = "VOID-FBOA-SEIK-FAZR-D92E";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbXJlcnJlbW1ibnJ4eXV0dW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2MTkwODIsImV4cCI6MjA4MjE5NTA4Mn0.tVCTSr8FZI8Z6KyiVqsVRga0qwRrEHkIZIHT2eDcvWs";

    const supabaseUrl = 'https://emmrerremmbnrxyutunp.supabase.co';

    // Headers strictly mirrored from the production JS file
    const baseHeaders = {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'x-client-info': 'supabase-js/2.39.7',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://auto-boost-void-booster.vercel.app',
        'Referer': 'https://auto-boost-void-booster.vercel.app/'
    };

    try {
        // 1. Re-verify Binding
        await fetch(`${supabaseUrl}/rest/v1/rpc/bind_device_to_key`, {
            method: 'POST',
            headers: { ...baseHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify({ p_key: USER_KEY, p_device_id: DEVICE_ID })
        });

        // 2. The Proxy Call
        // Note: Using a standard 'type' and 'count' to avoid E003
        const params = new URLSearchParams({
            action: 'start',
            url: "https://www.facebook.com/profile.php?id=61583017822517",
            type: 'facebook_followers',
            count: '100',
            device_id: DEVICE_ID
        });

        const response = await fetch(`${supabaseUrl}/functions/v1/boost-proxy?${params.toString()}`, {
            method: 'GET',
            headers: baseHeaders
        });

        // Some Edge Functions return 403 but the body is JSON
        const data = await response.json();

        if (data.error === "Access denied") {
            return res.status(403).json({
                success: false,
                message: "Vercel IP is Blacklisted by the target server.",
                technical_reason: "The server's WAF (Web Application Firewall) is detecting Vercel's Node.js environment.",
                server_data: data
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
