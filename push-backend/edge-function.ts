// ByteBuddy Push API — deploy to a DEDICATED Supabase project.
// Required Edge Function secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, PUSH_CRON_SECRET.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are supplied by the Supabase runtime.
// verify_jwt=false: public operations use per-installation credentials; cron uses a private secret.
import { createClient } from "npm:@supabase/supabase-js@2.57.0";
import webpush from "npm:web-push@3.6.7";

const SITE = "https://mebirii.github.io";
const SITE_PATH = "https://mebirii.github.io/bytebuddy-98/";
const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY") || "";
const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const cronSecret = Deno.env.get("PUSH_CRON_SECRET") || "";
const db = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
  { auth: { persistSession: false, autoRefreshToken: false } }
);
if (vapidPublic && vapidPrivate) webpush.setVapidDetails(SITE_PATH, vapidPublic, vapidPrivate);

function response(req: Request, data: unknown, status=200): Response {
  const origin = req.headers.get("origin");
  const headers: Record<string,string> = {
    "Content-Type":"application/json;charset=utf-8",
    "Cache-Control":"no-store",
    "Vary":"Origin"
  };
  if (origin === SITE) {
    headers["Access-Control-Allow-Origin"] = SITE;
    headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return new Response(JSON.stringify(data), { status, headers });
}
function validDevice(v: unknown): v is string {
  return typeof v === "string" && /^[a-f0-9-]{36}$/.test(v);
}
function validSecret(v: unknown): v is string {
  return typeof v === "string" && /^[A-Za-z0-9_-]{40,100}$/.test(v);
}
function validEndpoint(v: unknown): v is string {
  if (typeof v !== "string" || v.length > 1600) return false;
  try {
    const url = new URL(v);
    const host = url.hostname;
    return url.protocol === "https:" && (
      host === "fcm.googleapis.com" ||
      host === "updates.push.services.mozilla.com" ||
      host.endsWith(".push.apple.com") ||
      host === "web.push.apple.com" ||
      host.endsWith(".notify.windows.com")
    );
  } catch { return false; }
}
function validSubscription(raw: any): boolean {
  return !!raw && validEndpoint(raw.endpoint)
    && typeof raw.keys?.p256dh === "string" && raw.keys.p256dh.length <= 200
    && typeof raw.keys?.auth === "string" && raw.keys.auth.length <= 100;
}
function toSnapshot(raw: any): Record<string,unknown> {
  const numeric = (k:string) => Math.min(100, Math.max(0, Number(raw?.[k]) || 0));
  return {
    stage: Math.min(3,Math.max(0,Math.floor(Number(raw?.stage)||0))),
    sleeping: raw?.sleeping === true,
    fullness:numeric("fullness"),hygiene:numeric("hygiene"),
    energy:numeric("energy"),health:numeric("health"),
    joy:numeric("joy"),
    name: typeof raw?.name === "string" ? raw.name.slice(0,32) : "Ton compagnon"
  };
}
async function digest(secret:string):Promise<string> {
  const data = await crypto.subtle.digest("SHA-256",new TextEncoder().encode(secret));
  return Array.from(new Uint8Array(data),b=>b.toString(16).padStart(2,"0")).join("");
}
async function authorized(body:any) {
  if (!validDevice(body?.deviceId) || !validSecret(body?.deviceSecret)) return null;
  const hash = await digest(body.deviceSecret);
  const { data } = await db.from("bytebuddy_push_devices").select("*")
    .eq("device_id",body.deviceId).eq("secret_hash",hash).maybeSingle();
  return data;
}
function localHour(date: Date):number {
  const n = new Intl.DateTimeFormat("en-GB",{
    timeZone:"Europe/Paris",hour:"2-digit",hourCycle:"h23"
  }).format(date);
  return Number(n);
}
function localDate(date:Date):string {
  return new Intl.DateTimeFormat("en-CA",{
    timeZone:"Europe/Paris",year:"numeric",month:"2-digit",day:"2-digit"
  }).format(date);
}
function estimate(snapshot:any, minutes:number) {
  const dec = (key:string, rate:number) => Math.max(0,(Number(snapshot?.[key])||0)-minutes*rate);
  return {
    fullness: dec("fullness",5.2),
    hygiene: dec("hygiene",3.6),
    energy: snapshot.sleeping ? Math.min(100,(Number(snapshot.energy)||0)+minutes*24)
      : dec("energy",3.7),
    health: Number(snapshot.health)||0,
    stage: Number(snapshot.stage)||0,
    sleeping:!!snapshot.sleeping
  };
}
function chooseAlert(p:any): {title:string,body:string} | null {
  if (p.stage===0 || p.sleeping) return null;
  if (p.health<=24) return {title:"💊 ByteBuddy a besoin de soins",body:"Ton compagnon est affaibli. Viens prendre soin de lui !"};
  if (p.fullness<=22) return {title:"🍖 ByteBuddy a faim",body:"Sa satiété est basse. Un bon repas lui ferait plaisir !"};
  if (p.hygiene<=20) return {title:"🫧 Petite toilette nécessaire",body:"Ton compagnon a besoin d'un nettoyage."};
  if (p.energy<=16) return {title:"💤 ByteBuddy est fatigué",body:"Il aimerait faire une sieste."};
  return null;
}
async function dispatch(subscription:any,title:string,body:string):Promise<number> {
  const payload=JSON.stringify({title,body,url:SITE_PATH});
  try {
    const result = await webpush.sendNotification(subscription,payload,{TTL:3600,urgency:"normal"});
    return result.statusCode||201;
  } catch(e:any) {
    return Number(e?.statusCode)||500;
  }
}
async function tick() {
  const now = new Date(), nowIso=now.toISOString();
  const { data:rows,error }= await db.from("bytebuddy_push_devices").select("*")
    .eq("enabled",true).lte("next_check_at",nowIso).limit(100);
  if (error) throw error;
  let sent=0,expired=0;
  for (const row of rows||[]) {
    const minutes=(now.getTime()-Date.parse(row.last_seen_at))/60000;
    const today=localDate(now);
    const count=row.daily_date===today ? row.daily_count:0;
    const since=row.last_sent_at? (now.getTime()-Date.parse(row.last_sent_at))/60000:Infinity;
    const quiet=localHour(now)>=22||localHour(now)<8;
    const due = minutes>=0 && minutes<=24*60 && since>=240 && count<3 && !quiet;
    const event=due?chooseAlert(estimate(row.snapshot,Math.min(minutes,240))):null;
    let next=30,patch:any={updated_at:nowIso,daily_date:today,daily_count:count};
    if (quiet) next=60;
    if (minutes>24*60) next=24*60;
    if (event) {
      const status=await dispatch(row.subscription,event.title,event.body);
      if(status===404||status===410){
        await db.from("bytebuddy_push_devices").delete().eq("device_id",row.device_id);
        expired++;
        continue;
      }
      if(status>=200&&status<300){
        sent++;next=240;
        patch.last_sent_at=nowIso;patch.daily_count=count+1;
      }else next=60;
    }
    patch.next_check_at=new Date(now.getTime()+next*60000).toISOString();
    await db.from("bytebuddy_push_devices").update(patch).eq("device_id",row.device_id);
  }
  return {ok:true,checked:(rows||[]).length,sent,expired};
}
Deno.serve(async (req:Request) => {
  const path=new URL(req.url).pathname.split("/").filter(Boolean).at(-1)||"";
  if(req.method==="OPTIONS") return req.headers.get("origin")===SITE
    ? response(req,{ok:true}):response(req,{error:"origin denied"},403);
  try {
    if(path==="public-key" && req.method==="GET") {
      return response(req,{ready:!!(vapidPublic&&vapidPrivate),publicKey:vapidPublic});
    }
    if(path==="tick"&&req.method==="POST"){
      if(!cronSecret || req.headers.get("x-bytebuddy-cron")!==cronSecret)
        return response(req,{error:"forbidden"},403);
      if(!vapidPublic||!vapidPrivate)return response(req,{error:"not configured"},503);
      return response(req,await tick());
    }
    if(req.headers.get("origin")!==SITE) return response(req,{error:"origin denied"},403);
    if(req.method!=="POST") return response(req,{error:"method denied"},405);
    if(Number(req.headers.get("content-length")||0)>13000)return response(req,{error:"too large"},413);
    const body=await req.json();
    if(path==="subscribe"){
      if(!vapidPublic||!vapidPrivate)return response(req,{error:"not configured"},503);
      if(!validDevice(body?.deviceId)||!validSecret(body?.deviceSecret)||!validSubscription(body?.subscription))
        return response(req,{error:"invalid subscription"},400);
      const hashed=await digest(body.deviceSecret);
      const {data:prior}=await db.from("bytebuddy_push_devices").select("secret_hash")
        .eq("device_id",body.deviceId).maybeSingle();
      if(prior && prior.secret_hash!==hashed)return response(req,{error:"already registered"},409);
      const now=new Date();
      const {error}=await db.from("bytebuddy_push_devices").upsert({
        device_id:body.deviceId,secret_hash:hashed,subscription:body.subscription,
        snapshot:toSnapshot(body.snapshot),enabled:true,last_seen_at:now.toISOString(),
        next_check_at:new Date(now.getTime()+20*60000).toISOString(),updated_at:now.toISOString()
      },{onConflict:"device_id"});
      if(error)throw error;
      return response(req,{ok:true});
    }
    const row=await authorized(body);
    if(!row)return response(req,{error:"unknown device"},404);
    if(path==="sync"){
      const now=new Date();
      const {error}=await db.from("bytebuddy_push_devices").update({
        snapshot:toSnapshot(body.snapshot),last_seen_at:now.toISOString(),
        next_check_at:new Date(now.getTime()+20*60000).toISOString(),updated_at:now.toISOString()
      }).eq("device_id",body.deviceId);
      if(error)throw error;
      return response(req,{ok:true});
    }
    if(path==="unsubscribe"){
      const {error}=await db.from("bytebuddy_push_devices").delete().eq("device_id",body.deviceId);
      if(error)throw error;
      return response(req,{ok:true});
    }
    if(path==="test"){
      const age=row.last_test_at?Date.now()-Date.parse(row.last_test_at):Infinity;
      if(age<120000)return response(req,{error:"test cooldown"},429);
      const code=await dispatch(row.subscription,"🎮 ByteBuddy : test réussi !",
        "Tu peux recevoir des notifications même après avoir fermé le jeu.");
      if(code===404||code===410){
        await db.from("bytebuddy_push_devices").delete().eq("device_id",body.deviceId);
        return response(req,{error:"expired subscription"},410);
      }
      if(code<200||code>=300)return response(req,{error:"push not accepted"},502);
      await db.from("bytebuddy_push_devices").update({
        last_test_at:new Date().toISOString()
      }).eq("device_id",body.deviceId);
      return response(req,{ok:true});
    }
    return response(req,{error:"unknown route"},404);
  }catch(error){
    console.error("ByteBuddy push request failed",error instanceof Error?error.message:"error");
    return response(req,{error:"server error"},500);
  }
});
