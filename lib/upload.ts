const CLOUD_NAME = "doc3mb9if";
const UPLOAD_PRESET = "hdcwears";

/** Upload an image file to Cloudinary (unsigned preset). Returns the public_id path. */
export async function uploadImage(
  file: File,
  folder: string
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("folder", `hdc-wears/${folder}`);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: form }
  );
  if (!res.ok) throw new Error("Upload failed");
  const j = await res.json();
  // Return the path portion after hdc-wears/ for use with cl()
  const publicId: string = j.public_id;
  return publicId.replace(/^hdc-wears\//, "");
}
