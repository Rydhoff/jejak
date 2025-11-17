import { supaPublish } from "../supabaseClient";

// --- Fungsi panggil AI ---
export const callAI = async ({ text }) => {
  if (!text) throw new Error("Text is required");

  try {
    const res = await fetch(
      "https://xepaobgjnetmybdlahdm.supabase.co/functions/v1/hello-world", // endpoint Supabase Edge Function
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supaPublish}`
        },
        body: JSON.stringify({ text }) // Kirim text
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "AI request failed");
    }

    const rawData = await res.json();

    // Jika rawData adalah string JSON, parse dulu
    let data;
    if (typeof rawData === "string") {
      data = JSON.parse(rawData);
    } else {
      data = rawData;
    }

    const result = {
      category: data.category,
      title: data.title,
      description: data.description,
      moderation: data.moderation,
      priority: data.priority
    };

    return result;
  } catch (error) {
    console.error("AI Service Error:", error.message);
    throw error;
  }
};
