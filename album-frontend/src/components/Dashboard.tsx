import { type ChangeEvent, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useLogoutMutation, useMeQuery } from "../store/api/auth";
import {
  useChunkMergeMutation,
  useChunkUploadMutation,
} from "../store/api/upload";
import type { RootState } from "../store/store";
import ImagePreviewModal from "./ImagePreviewModal";
import UploadPreviewModal from "./UploadPreviewModal";

type AlbumPhoto = {
  id: number;
  title: string;
  src: string;
  source: "saved" | "uploaded";
  file?: File;
};

type SelectedImage = {
  title: string;
  src: string;
};

const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime", // .mov
  "video/x-msvideo", // .avi
  "video/x-matroska", // .mkv
  "video/webm",
  "video/mpeg",
  "video/3gpp",
];
const maxFileSize = 1000 * 1024 * 1024;

function Dashboard() {
  // const navigate = useNavigate()
  const [logout] = useLogoutMutation();
  const [previewPhotos, setPreviewPhotos] = useState<AlbumPhoto[]>([]);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(
    null,
  );
  const [uploadMessage, setUploadMessage] = useState(
    "Upload JPG, PNG, or WebP photos up to 5 MB each.",
  );

  const [chunkUpload, { isLoading }] = useChunkUploadMutation();
  const [chunkMerge] = useChunkMergeMutation();
  const { refetch } = useMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  const loggedInUser = useSelector((state: RootState) => state.auth.user);

  const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    const validPhotos: AlbumPhoto[] = [];
    const rejectedFiles: string[] = [];

    files.forEach((file, index) => {
      if (!allowedImageTypes.includes(file.type)) {
        rejectedFiles.push(`${file.name} is not a supported image type.`);
        return;
      }

      if (file.size > maxFileSize) {
        rejectedFiles.push(`${file.name} is larger than 5 MB.`);
        return;
      }

      validPhotos.push({
        id: Date.now() + index,
        title: file.name.replace(/\.[^/.]+$/, ""),
        src: URL.createObjectURL(file),
        source: "uploaded",
        file,
      });
    });

    if (validPhotos.length > 0) {
      setPreviewPhotos((currentPreviewPhotos) => {
        currentPreviewPhotos.forEach((photo) => URL.revokeObjectURL(photo.src));
        return validPhotos;
      });
    }

    setUploadMessage(
      rejectedFiles.length > 0
        ? rejectedFiles.join(" ")
        : `${validPhotos.length} photo${validPhotos.length === 1 ? "" : "s"} ready for upload.`,
    );

    event.target.value = "";
  };

  const createChunks = (file: File) => {
    const chuckSize = 5 * 1024 * 1024;
    const chunks: Blob[] = [];

    for (let i = 0; i < file.size; i += chuckSize) {
      const chunk = file.slice(i, i + chuckSize);
      chunks.push(chunk);
    }
    return chunks;
  };

  const handleConfirmUpload = async () => {
    for (const { file } of previewPhotos) {
      if (file) {
        const chunks = createChunks(file);
        const uploadId = crypto.randomUUID();
        for (const [index, chunk] of chunks.entries()) {
          const formData = new FormData();
          formData.append("chunk", chunk);
          formData.append("uploadId", uploadId);
          formData.append("chunkIndex", index.toString());

          try {
            await chunkUpload(formData);
          } catch (error) {
            console.log(error);
          }
        }

        await chunkMerge({
          uploadId,
          totalChunks: chunks.length,
          extension: file.name.split(".")[1],
        });
      }
    }

    setPreviewPhotos([]);
    refetch();
  };

  const handleCancelUpload = () => {
    previewPhotos.forEach((photo) => URL.revokeObjectURL(photo.src));
    setPreviewPhotos([]);
    setUploadMessage("Upload JPG, PNG, or WebP photos up to 5 MB each.");
  };

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link className="brand-mark dashboard-brand" to="/dashboard">
          <span className="brand-icon">A</span>
          <span>Album</span>
        </Link>

        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <a className="active" href="#gallery">
            Gallery
          </a>
          <a href="#upload">Upload</a>
        </nav>

        <button
          className="secondary-action"
          type="button"
          onClick={() => logout()}
        >
          Logout
        </button>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Your photo collection</h1>
          </div>
          <div className="dashboard-header-actions">
            <div className="dashboard-user">
              <span>Signed in as</span>
              <strong>{loggedInUser?.name ?? "User"}</strong>
            </div>
            <label className="upload-button" htmlFor="photo-upload">
              Upload photo
            </label>
          </div>
        </header>

        <section
          id="upload"
          className="upload-panel"
          aria-labelledby="upload-title"
        >
          <div>
            <p className="eyebrow">Photo validation</p>
            <h2 id="upload-title">Add new memories</h2>
            <p>{uploadMessage}</p>
          </div>
          <label className="upload-dropzone" htmlFor="photo-upload">
            <span>Choose photos</span>
            <small>JPG, PNG, WebP only.</small>
            <input
              id="photo-upload"
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handlePhotoUpload}
            />
          </label>
        </section>

        <section
          id="gallery"
          className="gallery-section"
          aria-labelledby="gallery-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">Saved photos</p>
              <h2 id="gallery-title">Preview old images</h2>
            </div>
            <span>{loggedInUser?.medias?.length ?? 0} photos</span>
          </div>

          <div className="photo-grid">
            {loggedInUser?.medias?.map((media) => {
              const mediaSrc = `${import.meta.env.VITE_API_BASE_API}/merged/${media.name}`;

              return (
                <article className="gallery-card" key={media.id}>
                  <button
                    className="gallery-card-preview"
                    type="button"
                    onClick={() =>
                      setSelectedImage({
                        title: media.name,
                        src: mediaSrc,
                      })
                    }
                  >
                    <img src={mediaSrc} alt={media.name} />
                  </button>
                </article>
              );
            })}
          </div>
        </section>
      </section>

      {previewPhotos.length > 0 && (
        <UploadPreviewModal
          files={previewPhotos}
          onCancel={handleCancelUpload}
          onUpload={handleConfirmUpload}
          isLoading={isLoading}
        />
      )}

      {selectedImage && (
        <ImagePreviewModal
          title={selectedImage.title}
          src={selectedImage.src}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </main>
  );
}

export default Dashboard;
