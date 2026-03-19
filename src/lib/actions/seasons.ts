"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSeason(formData: FormData) {
  const name = formData.get("name") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const isActive = formData.get("is_active") === "true";

  if (!name?.trim()) return { error: "Nome é obrigatório" };
  if (!startDate) return { error: "Data de início é obrigatória" };

  const supabase = await createClient();

  if (isActive) {
    await supabase.from("seasons").update({ is_active: false }).eq("is_active", true);
  }

  const { error } = await supabase.from("seasons").insert({
    name: name.trim(),
    start_date: startDate,
    end_date: endDate || null,
    is_active: isActive,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/seasons");
  revalidatePath("/");
  return { success: true };
}

export async function updateSeason(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const isActive = formData.get("is_active") === "true";

  if (!name?.trim()) return { error: "Nome é obrigatório" };

  const supabase = await createClient();

  if (isActive) {
    await supabase
      .from("seasons")
      .update({ is_active: false })
      .eq("is_active", true)
      .neq("id", id);
  }

  const { error } = await supabase
    .from("seasons")
    .update({
      name: name.trim(),
      start_date: startDate,
      end_date: endDate || null,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/seasons");
  revalidatePath("/");
  return { success: true };
}

export async function deleteSeason(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("seasons").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/seasons");
  revalidatePath("/");
  return { success: true };
}
