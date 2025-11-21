import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase Service Role Client (Bu Edge Function'ga DBga to'liq kirish imkonini beradi)
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Fayl yo'lidan foydalanuvchi ID sini ajratib olish
function getUserIdFromPath(path: string): string | null {
  // Yo'l formati: bucket_name/user_id/file_name.webm
  const parts = path.split('/');
  // Agar yo'l 'recordings/uuid/...' formatida bo'lsa, ikkinchi qism UUID bo'ladi
  if (parts.length >= 2) {
    const userId = parts[1];
    // Oddiy UUID tekshiruvi
    if (userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return userId;
    }
  }
  return null;
}

// Foydalanuvchining barcha fayllari umumiy hajmini hisoblash
async function calculateTotalStorageUsed(userId: string): Promise<number> {
  // Storage API faqat 1000 tagacha faylni qaytaradi. Agar foydalanuvchida 1000 dan ortiq fayl bo'lsa, bu noto'g'ri hisoblaydi.
  // Lekin hozircha bu yetarli.
  const { data, error } = await supabaseAdmin.storage.from('recordings').list(userId, {
    limit: 1000, 
    offset: 0,
  });

  if (error) {
    console.error(`Error listing storage files for user ${userId}:`, error.message);
    return 0;
  }

  // Fayl hajmini metadata.size dan olish
  const totalSize = data.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
  return totalSize;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const eventType = payload.event_type;
    
    let path: string | undefined;
    let userId: string | null = null;

    // Qaysi qatordan (new yoki old) path ni olishni aniqlash
    if (eventType === 'INSERT' || eventType === 'UPDATE') {
        path = payload.new?.path;
    } else if (eventType === 'DELETE') {
        path = payload.old?.path;
    }

    if (!path) {
        console.warn(`Missing path in payload for event type: ${eventType}`);
        return new Response('Missing path in payload', { status: 400, headers: corsHeaders });
    }

    userId = getUserIdFromPath(path);

    if (!userId) {
      console.warn(`Could not extract user ID from path: ${path}`);
      return new Response('User ID not found', { status: 200, headers: corsHeaders });
    }

    // Umumiy hajmni qayta hisoblash
    const totalUsedBytes = await calculateTotalStorageUsed(userId);

    // Profiles jadvalini yangilash
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ storage_used_bytes: totalUsedBytes })
      .eq('id', userId);

    if (updateError) {
      console.error("Error updating profile storage usage:", updateError.message);
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Storage usage updated for user ${userId}: ${totalUsedBytes} bytes.`);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Edge Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});