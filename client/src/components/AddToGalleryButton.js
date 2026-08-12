import React, { useState } from "react";
import { IconButton, Tooltip, Snackbar, Alert } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { apiUrl } from "../api";

const AddToGalleryButton = ({ bookId, userId }) => {
  const [isClicked, setIsClicked] = useState(false);
  const [alertInfo, setAlertInfo] = useState({
    open: false,
    severity: "info",
    message: "",
  });

  const handleAddToGallery = async () => {
    if (!userId) {
      setAlertInfo({
        open: true,
        severity: "warning",
        message: "Please log in to add books to your gallery.",
      });
      return;
    }
  
    try {
      const response = await fetch(
        apiUrl(`/add_to_gallery/${userId}`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookId }),
        }
      );
  
      const data = await response.json();

      // display different alert info to user based on their actions and their collection
      // add book success
      if (response.status === 201) {
        setIsClicked(true); 
        setAlertInfo({
          open: true,
          severity: "success",
          message: data.message, 
        });
      } else if (response.status === 200) {
        //book already exist
        setIsClicked(true); 
        setAlertInfo({
          open: true,
          severity: "info",
          message: data.message, 
        });
      } else {
        //failed to add
        setAlertInfo({
          open: true,
          severity: "error",
          message: data.message || "Failed to add book to gallery.",
        });
      }
    } catch (error) {
      //error when add
      console.error("Error adding book to gallery:", error);
      setAlertInfo({
        open: true,
        severity: "error",
        message: "An error occurred. Please try again.",
      });
    }
  };
  
  const handleCloseAlert = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertInfo((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
    {/* add to gallery icon*/}
      <Tooltip title={isClicked ? "Already in gallery" : "Add to gallery"}>
        <IconButton
          onClick={handleAddToGallery}
          disabled={isClicked}
          style={{
            display: "inline-flex",
            justifyContent: "center",
            alignItems: "center",
            width: "50px",
            height: "50px",
            borderRadius: "12px",
            border: "1px solid #6c5dd3",
            backgroundColor: isClicked ? "#6c5dd3" : "transparent",
            color: isClicked ? "#fff" : "#6c5dd3",
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
        >
          {isClicked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </Tooltip>

      {/* alert message display*/}
      <Snackbar
        open={alertInfo.open}
        autoHideDuration={3000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity={alertInfo.severity}
          sx={{ width: "100%" }}
        >
          {alertInfo.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AddToGalleryButton;
