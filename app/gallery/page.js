"use client";
import React, { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import Image from "next/image";

const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1,
};

export default function GalleryPage() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Fetch uploaded image URLs from your server
    fetch("/pages/api/images") // Change this to your actual API route
      .then((res) => res.json())
      .then((data) => setImages(data))
      .catch((err) => console.error("Failed to load images", err));
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-green-50">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
        Design Gallery
      </h1>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex gap-4"
        columnClassName="my-masonry-column"
      >
        {images.map((url, i) => (
          <div key={i} className="rounded-xl overflow-hidden shadow-lg">
            <Image
              src={url}
              alt={`Design ${i}`}
              width={500}
              height={500}
              className="w-full object-cover"
              style={{ borderRadius: "12px" }}
            />
          </div>
        ))}
      </Masonry>
    </main>
  );
}
