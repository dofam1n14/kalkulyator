// Посредник для онлайн-рекордов: браузер обращается к нашему сайту (elektronshik.pages.dev/sb/…),
// а Cloudflare уже сам ходит в Supabase. Нужен тем, у кого провайдер или блокировщик рекламы
// не пускает к supabase.co напрямую.
const SB = "https://jhoqjypixkilfnshonmk.supabase.co/rest/v1/";
const KEY = "sb_publishable_UtLoaxB21zedKXUD0wberQ_ozjqaE1D"; // публичный ключ, тот же, что в странице
// Пропускаем только то, что нужно рекордам: две витрины для чтения и три функции базы
const ALLOWED = /^(leaderboard|quiz_leaderboard|rpc\/(check_nick|submit_score|submit_quiz))$/;

export async function onRequest({ request, params }) {
  const path = [].concat(params.path || []).join("/");
  if (!ALLOWED.test(path)) return new Response("Not found", { status: 404 });
  if (request.method !== "GET" && request.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const body = request.method === "POST" ? await request.text() : undefined;
  if (body && body.length > 2000) return new Response("Too large", { status: 413 });
  const r = await fetch(SB + path + new URL(request.url).search, {
    method: request.method,
    headers: { apikey: KEY, "Content-Type": "application/json" },
    body,
  });
  return new Response(r.body, {
    status: r.status,
    headers: { "Content-Type": r.headers.get("Content-Type") || "application/json", "Cache-Control": "no-store" },
  });
}
