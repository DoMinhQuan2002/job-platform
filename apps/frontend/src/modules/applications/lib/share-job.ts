export function shareJobOnFacebook(url: string) {
  window.open(
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    "_blank",
    "noopener,noreferrer,width=640,height=480",
  );
}

export function shareJobOnLinkedIn(url: string) {
  window.open(
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    "_blank",
    "noopener,noreferrer,width=640,height=480",
  );
}

export async function shareJobNative(title: string, url: string) {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    await navigator.share({ title, text: title, url });
    return;
  }

  window.open(
    `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
    "_self",
  );
}

export async function copyJobLink(url: string) {
  await navigator.clipboard.writeText(url);
}
