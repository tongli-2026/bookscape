import React, { useState } from "react";
import { IconButton, Tooltip, Snackbar, Alert } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { apiUrl } from "../api";

const RemoveFromGalleryButton = ({ bookId, userId, onBookRemoved }) => {
    const [isClicked, setIsClicked] = useState(false);
    const [alertInfo, setAlertInfo] = useState({
      open: false,
      severity: "info",
      message: "",
    });
  
    const handleRemoveFromGallery = async () => {
      if (!userId) {
        setAlertInfo({
          open: true,
          severity: "warning",
          message: "Please log in to remove books from your gallery.",
        });
        return;
      }
  
      try {
        const response = await fetch(apiUrl(`/remove_from_gallery/${userId}`), {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookId }),
        });

        // display different alert info to user based on their actions
        // remove book success
        if (response.ok) {
          setIsClicked(true);
          setAlertInfo({
            open: true,
            severity: "success",
            message: "Book removed from your gallery!",
          });
          onBookRemoved(bookId); 
        } else {
          //failed to remove book 
          const error = await response.json();
          setAlertInfo({
            open: true,
            severity: "error",
            message: error.message || "Failed to remove book from gallery.",
          });
        }
      } catch (error) {
        //error to remove book
        console.error("Error removing book from gallery:", error);
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
        <Tooltip title={isClicked ? "Already removed" : "Remove from gallery"}>
          <IconButton
            onClick={handleRemoveFromGallery}
            disabled={isClicked}
            style={{
                display: "inline-flex",
                backgroundColor: isClicked ? "#b1b1b1" : "transparent",
                color: isClicked ? "#000" : "#b1b1b1",
                cursor: "pointer",
                transition: "all 0.3s ease",
                width: "24px", 
                height: "24px", 
                justifyContent: "center",
                alignItems: "center",
                fontSize: "16px", 
              }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
  
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
  
  export default RemoveFromGalleryButton;
  
