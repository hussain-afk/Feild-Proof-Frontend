export function canUseChatPlan(sub) {
  if (!sub) return false;

  const plan = String(sub.plan || sub.planName || "").toLowerCase();
  const status = String(sub.status || sub.planStatus || "").toLowerCase();

  // active hona zaroori
  if (status && status !== "active") return false;

  // endsAt guzar gaya?
  if (sub.endsAt && new Date(sub.endsAt) < new Date()) return false;

  return plan === "pro" || plan === "enterprise";
}