
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://unitbhhizdvtvsmplhon.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVuaXRiaGhpemR2dHZzbXBsaG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NDc1ODcsImV4cCI6MjA3OTIyMzU4N30.uQTs1Ax6CtDj_LO0osCPm1JjEPLj2BHjk5H9LLz8qms';
const supabase = createClient(supabaseUrl, supabaseKey);

async function listColumns() {
    const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        const keys = Object.keys(data[0]);
        console.log('--- START COLUMNS ---');
        keys.forEach(k => console.log(k));
        console.log('--- END COLUMNS ---');
    } else {
        console.log('No data found.');
    }
}

listColumns();
