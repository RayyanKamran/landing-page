"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Masonry from "react-masonry-css";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/button";

const breakpointColumnsObj = {
  default: 3,
  1100: 3,
  700: 2,
  500: 1,
};

const LIMIT = 6;

export default function GalleryPage() {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/images?page=${page}&limit=${LIMIT}`);
      const data = await res.json();

      const newImages = Array.isArray(data.images)
        ? data.images
        : Array.isArray(data)
        ? data
        : [];

      setImages((prev) => [...prev, ...newImages]);
      setHasMore(data.hasMore ?? newImages.length === LIMIT);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to load images", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const lastImageRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          fetchImages();
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-green-50">
      <header className="flex justify-start mb-8">
        <Link href="/" passHref>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
          >
            ← Home
          </Button>
        </Link>
      </header>

      <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
        Design Gallery
      </h1>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex gap-6"
        columnClassName="flex flex-col gap-6"
      >
        {images.map((image, i) => {
          const isLast = i === images.length - 1;
          return (
            <div
              key={i}
              ref={isLast ? lastImageRef : null}
              className="relative bg-white rounded-xl overflow-hidden shadow-lg w-full max-w-[600px] mx-auto"
            >
              {/* T-shirt mockup */}
              <Image
                src="/tshirt.jpg"
                alt="T-shirt mockup"
                width={600}
                height={800}
                className="w-full h-auto object-contain"
                unoptimized
              />

              {/* Design overlay */}
              <div
                className="absolute"
                style={{
                  top: "33%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "40%",
                  height: "auto",
                }}
              >
                <Image
                  src={image.url}
                  alt={`Uploaded Design ${i}`}
                  layout="responsive"
                  width={1}
                  height={1}
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
          );
        })}
      </Masonry>
      {loading && (
        <div className="text-center py-8 text-blue-500 font-semibold">
          Loading more designs...
        </div>
      )}
    </main>
  );
}
