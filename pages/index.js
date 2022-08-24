import { useState } from "react";
import axios from "axios";
import styles from "../styles/Home.module.css";

export default function Home() {
  const [image, setImage] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");

  const handleImageChange = (e) => {
    const reader = new FileReader();
    if (!e.target.files[0]) return;
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = function (e) {
      setImage(e.target.result);
    };
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadStatus("Uploading...");
    try {
      const response = await axios.post("/api/upload", { image });
      const imageUrl = /'(.+)'/.exec(response.data)[1].split("' ")[0];
      setImage(imageUrl);
      setUploadStatus("Upload successful");
      console.log(response.data);
    } catch (error) {
      setUploadStatus("Upload failed..");
    }
  };

  return (
    <div className={styles.container}>
      <h2>Cloudinary Fashion Model Demo</h2>
      <form onSubmit={handleUpload}>
        <input type="file" onChange={handleImageChange} />
        <button type="submit" disabled={!image}>
          Upload
        </button>
        <p>{uploadStatus}</p>
      </form>
      <section>{image && <img src={image} alt="img" />}</section>
    </div>
  );
}
