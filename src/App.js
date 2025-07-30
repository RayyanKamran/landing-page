"use client";

import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, ImageIcon, X } from "lucide-react";
import Link from "next/link";
import { useAuth0 } from "@auth0/auth0-react";

const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = useCallback((file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 flex flex-col">
      {/* Header with Gallery Button */}
      <header className="w-full p-4 flex justify-end">
        <Button
          variant="outline"
          className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
        >
          <ImageIcon className="w-4 h-4" />
          Gallery
        </Button>

        <Button onClick={() => loginWithRedirect()}>Log In</Button>

        <Button
          onClick={() =>
            logout({ logoutParams: { returnTo: window.location.origin } })
          }
        >
          Log Out
        </Button>

        {isAuthenticated && <p>Welcome, {user.name}</p>}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-16">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-light text-blue-600 mb-2">
            Design your own shirt
          </h1>
          <p className="text-4xl text-green-600 font-light">OYE</p>
        </div>

        {/* Upload Box */}
        <Card
          className={`w-full max-w-md p-8 border-2 border-dashed transition-colors cursor-pointer ${
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
                  {isDragOver ? "Drop your design here" : "Upload your design"}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Drag and drop your image here, or click to browse
                </p>
                <Button type="button" className="bg-blue-600 hover:bg-blue-700">
                  Choose File
                </Button>
              </>
            )}
          </div>
        </Card>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Supported Formats */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Supported formats: JPG, PNG, SVG (Max 10MB)
        </p>

        {/* Submit Button */}
        {selectedFile && (
          <div className="mt-6 flex gap-3">
            <Button size="lg" className="px-8 bg-green-600 hover:bg-green-700">
              Submit Design
            </Button>
            <Button variant="outline" size="lg" onClick={clearFile}>
              Clear
            </Button>
          </div>
        )}
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
