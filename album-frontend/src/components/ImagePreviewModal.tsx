import { useState } from "react";
import Notify from "./Notify";

type ImagePreviewModalProps = {
  title: string;
  src: string;
  onClose: () => void;
};

function ImagePreviewModal({ title, src, onClose }: ImagePreviewModalProps) {
  const [notifyMessage, setNotifyMessage] = useState("");

  const handleDownload = async () => {
    const response = await fetch(src, { credentials: "include" });

    if (!response.ok) {
      throw new Error("Unable to download image.");
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = title;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
    setNotifyMessage(`${title} downloaded successfully.`);
    window.setTimeout(() => setNotifyMessage(""), 3000);
  };

  return (
    <>
      <div className="preview-modal-backdrop" role="presentation">
        <section
          className="image-preview-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="image-preview-modal-title"
        >
          <div className="preview-modal-header">
            <div>
              <p className="eyebrow">Image preview</p>
              <h2 id="image-preview-modal-title">{title}</h2>
            </div>
          </div>

          <img className="image-preview-modal-media" src={src} alt={title} />

          <div className="preview-modal-actions">
            <button className="secondary-action" type="button" onClick={onClose}>
              Close
            </button>
            <button
              className="primary-action download-action"
              type="button"
              onClick={handleDownload}
            >
              Download
            </button>
          </div>
        </section>
      </div>
      {notifyMessage && <Notify message={notifyMessage} />}
    </>
  );
}

export default ImagePreviewModal;
