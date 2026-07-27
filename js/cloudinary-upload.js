import { auth } from "./auth.js";
import { getIdToken } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function uploadImage(file) {
  validateImage(file);

  if (typeof auth.authStateReady === "function") {
    await auth.authStateReady();
  }
  const user = auth.currentUser;
  if (!user) throw new Error("Upload के लिए दोबारा login करें।");

  const idToken = await getIdToken(user, true);
  const signatureResponse = await fetch("/api/cloudinary-signature", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });
  const signed = await signatureResponse.json();
  if (!signatureResponse.ok) {
    throw new Error(signed.error || "Secure upload शुरू नहीं हो पाया।");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signed.apiKey);
  formData.append("timestamp", String(signed.timestamp));
  formData.append("signature", signed.signature);
  formData.append("upload_preset", signed.uploadPreset);
  formData.append("folder", signed.folder);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(signed.cloudName)}/image/upload`,
    { method: "POST", body: formData },
  );
  const imageData = await uploadResponse.json();
  if (!uploadResponse.ok || !imageData.secure_url) {
    throw new Error(imageData.error?.message || "Image upload failed.");
  }
  return imageData.secure_url;
}

export function validateImage(file) {
  if (!file) throw new Error("कृपया image चुनें।");
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("केवल JPG, PNG, WebP या AVIF image चुनें।");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image 5 MB से छोटी होनी चाहिए।");
  }
}

export function optimizedCloudinaryUrl(value, width = 1200) {
  const url = String(value || "");
  if (!url.startsWith("https://res.cloudinary.com/") || !url.includes("/image/upload/")) return url;
  const safeWidth = Math.min(2400, Math.max(320, Number(width) || 1200));
  return url.replace("/image/upload/", `/image/upload/c_limit,w_${safeWidth},q_auto:good,f_auto/`);
}
