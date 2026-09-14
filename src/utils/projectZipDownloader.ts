/**
 * Utility to download the entire project ZIP inside iframe or browser tab
 */
export async function downloadProjectSourceZip(onStatus?: (status: "downloading" | "success" | "error", message?: string) => void): Promise<boolean> {
  if (onStatus) onStatus("downloading", "Proje arşivi hazırlanıyor ve indiriliyor...");

  try {
    const response = await fetch("/api/download-project-zip", {
      method: "GET",
      headers: {
        "Accept": "application/zip, application/octet-stream, */*"
      }
    });

    if (!response.ok) {
      throw new Error(`Sunucu yanıtı: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error("İndirilen ZIP dosyası boş.");
    }

    const blobUrl = window.URL.createObjectURL(blob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.style.display = "none";
    downloadAnchor.href = blobUrl;
    downloadAnchor.download = "jetkur-com-tr-project.zip";

    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(downloadAnchor);
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);

    if (onStatus) onStatus("success", "jetkur-com-tr-project.zip başarıyla indirildi!");
    return true;
  } catch (error: any) {
    console.error("ZIP indirme hatası:", error);
    if (onStatus) onStatus("error", error?.message || "ZIP dosyası indirilemedi.");
    return false;
  }
}
