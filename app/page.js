"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Upload, ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";

export default function HomePage() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((file) => {
    if (file) {
      // Check if file is JPG (including JPEG)
      const isJpg = file.type === "image/jpeg" || file.type === "image/jpg";

      if (!isJpg) {
        alert("Please upload a valid JPG file only");
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit");
        return;
      }

      // If all validations pass
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  const [authLoading, setAuthLoading] = useState(false);

  const handleSubmit = async () => {
    setAuthLoading(true);
    try {
      if (!isAuthenticated) {
        // Store file in localStorage before redirect
        if (selectedFile) {
          const reader = new FileReader();
          reader.onload = (e) => {
            localStorage.setItem(
              "pendingUpload",
              JSON.stringify({
                name: selectedFile.name,
                type: selectedFile.type,
                size: selectedFile.size,
                data: e.target.result.split(",")[1], // Base64 encoded
              })
            );
          };
          reader.readAsDataURL(selectedFile);
        }

        await loginWithRedirect({
          authorizationParams: {
            screen_hint: "signup",
            prompt: "login",
          },
        });
        return;
      }

      if (!selectedFile) {
        alert("Please upload a design first.");
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Upload failed");
      }

      alert(`Design "${selectedFile.name}" uploaded successfully!`);
    } catch (err) {
      alert("Error uploading file: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    const handleReturnFromAuth = async () => {
      if (isAuthenticated) {
        const pendingUpload = localStorage.getItem("pendingUpload");
        if (pendingUpload) {
          try {
            const uploadData = JSON.parse(pendingUpload);
            const byteString = atob(uploadData.data);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const uintArray = new Uint8Array(arrayBuffer);

            for (let i = 0; i < byteString.length; i++) {
              uintArray[i] = byteString.charCodeAt(i);
            }

            const file = new File([arrayBuffer], uploadData.name, {
              type: uploadData.type,
            });

            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            localStorage.removeItem("pendingUpload");

            // Optional
            alert(
              `Welcome back! Your design "${uploadData.name}" is ready to submit.`
            );
          } catch (error) {
            console.error("Error restoring file:", error);
            alert("Couldn't restore your design. Please upload it again.");
          }
        }
      }
    };

    handleReturnFromAuth();
  }, [isAuthenticated]); // Only runs when auth state changes

  const handleFileUpload = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragOver(false);

      const file = event.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [previewUrl]);

  const openFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-green-50 flex flex-col">
      {/* Header with Gallery Button */}
      <header className="w-full p-4 flex justify-between items-center">
        <Link href="/gallery">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
          >
            <ImageIcon className="w-4 h-4" />
            Gallery
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-gray-600">
                Welcome, {user.name}
              </span>
              <Button
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
                onClick={() =>
                  logout({ logoutParams: { returnTo: window.location.origin } })
                }
              >
                Log Out
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
              onClick={() => loginWithRedirect()}
            >
              Log In
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="bg-gradient-to-b from-blue-50 to-green-50">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-light text-blue-600 mb-2">
            Design your own shirt
          </h1>
          <p className="text-4xl text-green-600 font-light">OYE</p>
        </div>

        {/* Upload Box */}
        <div className="flex justify-center w-full px-4">
          <Card
            className={`w-full max-w-md border-2 border-dashed transition-colors cursor-pointer ${
              isDragOver
                ? "border-blue-400 bg-blue-50"
                : selectedFile
                ? "border-green-400 bg-green-50"
                : "border-gray-300 hover:border-blue-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <div className="text-center">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-md mb-4"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <p className="text-sm font-medium text-green-700">
                    {selectedFile?.name}
                  </p>
                  <p className="text-xs text-gray-500">Click to change file</p>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <Upload
                      className={`w-12 h-12 mx-auto transition-colors ${
                        isDragOver ? "text-blue-500" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {isDragOver
                      ? "Drop your design here"
                      : "Upload your design"}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Drag and drop your image here, or click to browse
                  </p>
                  <Button
                    type="button"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Choose File
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,image/jpeg"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Supported Formats */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Supported format: JPG only (Max 5MB)
        </p>

        {/* Submit Button */}
        <div className="flex justify-center w-full px-4">
          {selectedFile && (
            <div className="mt-6 flex gap-3">
              <Button
                size="lg"
                className="px-8 bg-green-600 hover:bg-green-700"
                onClick={handleSubmit}
                disabled={!selectedFile} // Disable if no file selected
              >
                {isAuthenticated ? "Submit Design" : "Sign Up to Submit"}
              </Button>
              {selectedFile && !isAuthenticated && (
                <p className="text-sm text-red-500">
                  Please sign up to submit your design
                </p>
              )}

              <Button variant="outline" size="lg" onClick={clearFile}>
                Clear
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full p-4 text-center">
        <div className="flex justify-center space-x-6 text-sm text-gray-600">
          <Link href="#" className="hover:text-blue-600 transition-colors">
            About
          </Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">
            Rules
          </Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}
