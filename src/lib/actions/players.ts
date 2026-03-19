"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPlayer(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Nome é obrigatório" };

  const supabase = await createClient();
  const { error } = await supabase.from("players").insert({ name: name.trim() });

  if (error) return { error: error.message };
  revalidatePath("/admin/players");
  return { success: true };
}

export async function updatePlayer(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  if (!name?.trim()) return { error: "Nome é obrigatório" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("players")
    .update({ name: name.trim() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/players");
  return { success: true };
}

export async function deletePlayer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("players").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/players");
  return { success: true };
}
