"use server";

import { logoutUser } from "@/actions/auth.actions";
import { redirect } from "next/navigation";

export async function handleLogout() {
  await logoutUser();
  redirect("/login");
}
