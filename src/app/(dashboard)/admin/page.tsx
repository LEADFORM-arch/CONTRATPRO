import { redirect } from "next/navigation";

import { requireAdminUser } from "@/server/admin";

export default async function AdminIndexPage() {
  await requireAdminUser("/admin");
  redirect("/admin/prospection");
}
