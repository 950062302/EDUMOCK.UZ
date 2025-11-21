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
  const { data, error } = await supabaseAdmin.storage.from('recordings').list(userId, {
    limit: 1000, // Agar 1000 dan ortiq fayl bo'lsa, pagination kerak bo'ladi, lekin hozircha 1000 yetarli
    offset: 0,
  });

  if (error) {
    console.error("Error listing storage files:", error.message);
    return 0;
  }

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
    const path = payload.new.path; // Faylning Storage ichidagi yo'li (masalan, recordings/user_id/video.webm)
    
    if (!path) {
        return new Response('Missing path in payload', { status: 400, headers: corsHeaders });
    }

    const userId = getUserIdFromPath(path);

    if (!userId) {
      console.warn(`Could not extract user ID from path: ${path}`);
      return new Response('User ID not found', { status: 200, headers: corsHeaders });
    }

    // Fayl yaratilgan, yangilangan yoki o'chirilganidan qat'i nazar, umumiy hajmni qayta hisoblaymiz
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