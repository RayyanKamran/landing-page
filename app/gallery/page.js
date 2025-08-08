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

      if (data?.images?.length > 0) {
        // Avoid adding duplicates
        setImages((prev) => {
          const seen = new Set(prev.map((img) => img.url));
          const uniqueNewImages = data.images.filter(
            (img) => !seen.has(img.url)
          );
          return [...prev, ...uniqueNewImages];
        });
      }

      setHasMore(data.hasMore);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to load images", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
    console.log(`Fetching page ${page}`);
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
    <main className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-green-50">
      <header className="flex justify-between items-center mb-8">
        <Link href="/" passHref>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
          >
            ← Home
          </Button>
        </Link>

        <Link href="/submit-page" passHref>
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            + Submit Design
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
              className="relative w-full h-[350px] bg-white rounded-xl overflow-hidden shadow-lg max-w-[600px] mx-auto"
            >
              {/* T-shirt mockup */}
              <Image
                src="/tshirt.jpg"
                alt="T-shirt"
                width={350}
                height={350}
                className="w-full h-full object-cover"
              />

              {/* Uploaded design overlay */}
              <div
                className="absolute"
                style={{
                  top: `${image.position?.y ?? 30}%`,
                  left: `${image.position?.x ?? 30}%`,
                  width: `${image.size?.width ?? 40}%`,
                  height: `${image.size?.height ?? 40}%`,
                  transform: "translate(-0%, 0%)",
                  zIndex: 10,
                }}
              >
                <Image
                  src={image.url}
                  alt="User Design"
                  width={350}
                  height={350}
                  className="w-full h-full object-contain"
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
