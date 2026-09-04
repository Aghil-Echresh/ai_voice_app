const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"Content-Type":"application/json; charset=utf-8", ...CORS}
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null,{headers:CORS});
    if (request.method === "GET") return new Response("AI Voice Worker is online 🤖",{headers:CORS});
    if (request.method !== "POST") return json({ok:false,error:"Method not allowed"},405);

    try {
      const body = await request.json();
      const message = String(body.message || "").trim();
      const history = Array.isArray(body.history) ? body.history.slice(-12) : [];
      if (!message) return json({ok:false,error:"پیام خالی است"},400);
      if (!env.OPENAI_API_KEY) return json({ok:false,error:"OPENAI_API_KEY تنظیم نشده است"},500);

      const messages = [
        {role:"system",content:"You are a helpful Persian-speaking voice assistant. Answer naturally, clearly and concisely in Persian."},
        ...history.filter(x => x && (x.role==="user" || x.role==="assistant") && typeof x.content==="string"),
        {role:"user",content:message}
      ];

      const response = await fetch("https://api.openai.com/v1/chat/completions",{
        method:"POST",
        headers:{
          "Authorization":`Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          model: env.AI_MODEL || "gpt-5-mini",
          messages,
          temperature: 0.7
        })
      });

      const data = await response.json();
      if (!response.ok) return json({ok:false,error:data?.error?.message || "AI API error"},response.status);

      const answer = data?.choices?.[0]?.message?.content?.trim();
      if (!answer) return json({ok:false,error:"پاسخ خالی از AI"},502);
      return json({ok:true,answer});
    } catch (e) {
      return json({ok:false,error:"خطای داخلی Worker"},500);
    }
  }
};
