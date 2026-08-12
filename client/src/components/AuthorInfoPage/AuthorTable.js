import React, { useState } from "react";
import styles from "./AuthorTable.module.css";

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return null;
  return dateString.split("T")[0];
};

const capitalize = (value) => {
  if (!value || typeof value !== "string") return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const getEmbedUrl = (url) => {
  if (!url) return null;

  try {
    const urlObj = new URL(url);

    if (urlObj.hostname === "youtu.be") {
      return `https://www.youtube.com/embed/${urlObj.pathname.slice(1)}`;
    }

    if (urlObj.hostname.includes("youtube.com")) {
      const videoId = urlObj.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    return url;
  } catch (error) {
    console.error("Invalid video URL:", error);
    return null;
  }
};

const VideoEmbed = ({ videoUrl }) => {
  const embedUrl = getEmbedUrl(videoUrl);

  if (!embedUrl) {
    return <p>Invalid or unsupported video URL</p>;
  }

  return (
    <div className={styles.videoContainer}>
      <iframe
        src={embedUrl}
        title="Video"
        className={styles.videoFrame}
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

const AuthorTable = ({ author }) => {
  const [activeTab, setActiveTab] = useState("general");

  if (!author) {
    return <p>Loading author details...</p>;
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const authorData = [
    { label: "Name", value: author.name },
    { label: "Gender", value: author.gender },
    { label: "Born Date", value: formatDate(author.born_date) },
    { label: "Died Date", value: formatDate(author.died_date) },
    { label: "Zodiac Sign", value: author.zodiac_sign },
    {
      label: "Country",
      value: author.country
        ? author.latitude && author.longitude
          ? {
              display: author.country,
              link: `https://www.google.com/maps?q=${author.latitude},${author.longitude}`,
            }
          : { display: author.country, link: null }
        : null,
    },
    { label: "Most Popular Genre", value: author.most_popular_genre },
  ].filter((item) => item.value);

  return (
    <div className={styles.container}>
      {/* Tabs */}
      <div className={styles.tabContainer}>
        <div
          className={`${styles.tab} ${
            activeTab === "general" ? styles.activeTab : ""
          }`}
          onClick={() => handleTabClick("general")}
        >
          Author Details
        </div>
        {author.has_nobel_prize && (
          <div
            className={`${styles.tab} ${
              activeTab === "nobel" ? styles.activeTab : ""
            }`}
            onClick={() => handleTabClick("nobel")}
          >
            Nobel Laureate Details
          </div>
        )}
      </div>

      {/* General Info */}
      {activeTab === "general" && (
      <div>
        {authorData.map((item, index) => (
          <div key={index}>
            <div className={styles.row}>
              <span className={styles.label}>{item.label}</span>
              <span className={styles.value}>
                {typeof item.value === "object" && item.value.link ? (
                  <a
                    href={item.value.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                  >
                    {capitalize(item.value.display)}
                  </a>
                ) : (
                  capitalize(item.value?.display || item.value)
                )}
              </span>
            </div>
            <div className={styles.divider2}></div> {/* Divider below each row */}
          </div>
        ))}
      </div>
    )}

      {/* Nobel Info */}
      {activeTab === "nobel" && (
        <div>
          <div className={`${styles.row} ${styles.nobelRow}`}>
            <span className={styles.label}>Award Year</span>
            <span className={styles.value}>{author.award_year}</span>
          </div>

          <div className={styles.multilineRow}>
            <span className={styles.label}>Motivation</span>
            <div className={styles.multilineValue}>
              {capitalize(author.motivation)}
            </div>
          </div>

          <div className={styles.multilineRow}>
            <span className={styles.label}>Work</span>
            <div className={styles.multilineValue}>
              {capitalize(author.work_text)}
            </div>
          </div>
          <div className={styles.divider}></div>
          {author.video_url && <VideoEmbed videoUrl={author.video_url} />}
        </div>
      )}
    </div>
  );
};

export default AuthorTable;
