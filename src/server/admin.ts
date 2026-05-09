import { redirect } from "next/navigation";

import { getCurrentUser } from "@/server/auth";

const defaultAdminEmails = ["esport.hub.pro@proton.me"];

function normalizedEmail(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function getAdminEmails() {
  const configured = process.env.CONTRATPRO_ADMIN_EMAILS;
  const emails = configured
    ? configured.split(",").map((email) => normalizedEmail(email))
    : defaultAdminEmails;

  return new Set(emails.filter(Boolean));
}

export async function getCurrentAdminUser() {
  const user = await getCurrentUser();
  if (!user?.email) {
    return null;
  }

  const admins = getAdminEmails();
  return admins.has(normalizedEmail(user.email)) ? user : null;
}

export async function requireAdminUser(nextPath = "/admin/prospection") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const admins = getAdminEmails();
  if (!user.email || !admins.has(normalizedEmail(user.email))) {
    redirect("/");
  }

  return user;
}
