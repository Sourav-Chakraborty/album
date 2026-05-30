type UploadPreviewFile = {
  id: number;
  title: string;
  src: string;
};

type UploadPreviewModalProps = {
  files: UploadPreviewFile[];
  onCancel: () => void;
  onUpload: () => void;
  isLoading: boolean;
};

function UploadPreviewModal({
  files,
  onCancel,
  onUpload,
  isLoading,
}: UploadPreviewModalProps) {
  return (
    <div className="preview-modal-backdrop" role="presentation">
      <section
        className="preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
      >
        <div className="preview-modal-header">
          <div>
            <p className="eyebrow">Selected photos</p>
            <h2 id="preview-modal-title">Preview upload</h2>
          </div>
          <span>
            {files.length} photo{files.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="preview-grid">
          {files.map((file) => (
            <article className="preview-card" key={file.id}>
              <img src={file.src} alt={file.title} />
              <p>{file.title}</p>
            </article>
          ))}
        </div>

        <div className="preview-modal-actions">
          <button className="secondary-action" type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button className="primary-action" type="button" onClick={onUpload} disabled={isLoading}>
            {isLoading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </section>
    </div>
  );
}

export default UploadPreviewModal;
