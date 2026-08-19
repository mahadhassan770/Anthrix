/**
 * ImgBB image upload utility
 * Free image hosting — https://api.imgbb.com/
 * Set IMGBB_API_KEY in your .env file (get from https://api.imgbb.com/)
 */
export async function uploadToImgBB(
  base64Image: string,
  name = "payment-proof"
): Promise<string> {
  const apiKey = process.env.IMGBB_API_KEY;
  
  // If no ImgBB key configured yet, return data URL directly so proof upload works out-of-the-box
  if (!apiKey) {
    if (base64Image.startsWith("data:")) {
      return base64Image;
    }
    return `data:image/jpeg;base64,${base64Image}`;
  }

  // Strip prefix if any before sending to ImgBB
  const cleanBase64 = base64Image.replace(/^data:image\/[a-z]+;base64,/, "");

  const form = new FormData();
  form.append("key", apiKey);
  form.append("image", cleanBase64);
  form.append("name", name);

  try {
    const res = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn(`ImgBB upload failed: ${err}. Falling back to data URI.`);
      return base64Image.startsWith("data:") ? base64Image : `data:image/jpeg;base64,${base64Image}`;
    }

    const json = await res.json();
    if (!json.success || !json.data?.url) {
      console.warn("ImgBB response unsuccessful. Falling back to data URI.");
      return base64Image.startsWith("data:") ? base64Image : `data:image/jpeg;base64,${base64Image}`;
    }

    return json.data.url as string;
  } catch (error) {
    console.warn("ImgBB request failed, fallback to data URI:", error);
    return base64Image.startsWith("data:") ? base64Image : `data:image/jpeg;base64,${base64Image}`;
  }
}

