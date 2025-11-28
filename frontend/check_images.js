
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://unitbhhizdvtvsmplhon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuaXRiaGhpemR2dHZzbXBsaG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDc1ODcsImV4cCI6MjA3OTIyMzU4N30.uQTs1Ax6CtDj_LO0osCPm1JjEPLj2BHjk5H9LLz8qms';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
    const { data, error } = await supabase
        .from('noticias')
        .select('id, titulo, imagen_url')
        .limit(20);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Checking first 20 news items:');
    data.forEach(item => {
        console.log(`ID: ${item.id}`);
        console.log(`Title: ${item.titulo}`);
        console.log(`Image URL: ${item.imagen_url}`);
        console.log('---');
    });
}

checkImages();
