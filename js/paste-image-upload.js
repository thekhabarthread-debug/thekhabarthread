// Lets an admin paste an image straight from the clipboard into a
// textarea (the "Full Article" field). The image is uploaded to the
// same Cloudinary account used for the news thumbnail, and its URL
// is inserted at the cursor on its own line — so content-embeds.js
// picks it up and shows it inline wherever it was pasted.

const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/m9332fjb/image/upload";
const CLOUDINARY_PRESET = "thekhabarthread";

export function attachImagePaste(textarea) {

  if (!textarea) return;

  textarea.addEventListener("paste", async (e) => {

    const items = e.clipboardData && e.clipboardData.items;

    if (!items) return;

    let imageFile = null;

    for (const item of items) {
      if (item.type && item.type.startsWith("image/")) {
        imageFile = item.getAsFile();
        break;
      }
    }

    // No image on the clipboard — let the normal text paste happen.
    if (!imageFile) return;

    e.preventDefault();

    const token = `[[uploading-image-${Date.now()}-${Math.random().toString(36).slice(2)}]]`;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const before = textarea.value.slice(0, start);
    const after = textarea.value.slice(end);

    const leadingBreak = before.length && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const trailingBreak = after.length && !after.startsWith("\n\n") ? (after.startsWith("\n") ? "\n" : "\n\n") : "\n\n";

    const insert = `${leadingBreak}${token}${trailingBreak}`;

    textarea.value = before + insert + after;

    const cursorPos = (before + insert).length;
    textarea.setSelectionRange(cursorPos, cursorPos);
    textarea.focus();

    try {

      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", CLOUDINARY_PRESET);

      const uploadResponse = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: "POST",
        body: formData
      });

      const imageData = await uploadResponse.json();

      if (!imageData.secure_url) {
        throw new Error("Cloudinary upload did not return a URL");
      }

      textarea.value = textarea.value.replace(token, imageData.secure_url);

    } catch (error) {

      console.error("Pasted image upload failed:", error);

      textarea.value = textarea.value.replace(token, "");

      alert("Image paste nahi ho paaya (upload fail). Dobara try karein.");

    }

  });

}
