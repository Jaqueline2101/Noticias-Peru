
const https = require('https');

const supabaseUrl = 'https://unitbhhizdvtvsmplhon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuaXRiaGhpemR2dHZzbXBsaG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDc1ODcsImV4cCI6MjA3OTIyMzU4N30.uQTs1Ax6CtDj_LO0osCPm1JjEPLj2BHjk5H9LLz8qms';

const url = `${supabaseUrl}/rest/v1/noticias?select=id,titulo,imagen_principal,url_original&order=fecha_publicacion.desc&limit=5`;
const options = {
    method: 'GET',
    headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
    }
};

console.log('Fetching news images...');

const req = https.request(url, options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const news = JSON.parse(data);
            console.log(`Fetched ${news.length} news items.`);
            news.forEach(n => {
                console.log(`\nID: ${n.id}`);
                console.log(`Title: ${n.titulo}`);
                console.log(`Image URL: ${n.imagen_principal}`);
                console.log(`Original URL: ${n.url_original}`);
            });
        } catch (e) {
            console.error('Error parsing response:', e);
            console.log('Raw body:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('Request error:', e);
});

req.end();
