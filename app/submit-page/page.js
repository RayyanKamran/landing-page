"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Rnd } from "react-rnd";
import { Button } from "@/components/button";

export default function SubmitPage() {
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [imageMeta, setImageMeta] = useState(null);
  const router = useRouter();

  const [position, setPosition] = useState({ x: 100, y: 100 });
  const [size, setSize] = useState({ width: 100, height: 100 });

  useEffect(() => {
    const stored = localStorage.getItem("pendingUpload");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const dataUrl = `data:${parsed.type};base64,${parsed.data}`;
        setImageMeta(parsed);
        setImageDataUrl(dataUrl);
      } catch (e) {
        alert("Corrupted image data. Please upload again.");
        router.replace("/");
      }
    } else {
      alert("No design found. Please upload one first.");
      router.replace("/");
    }
  }, []);

  const handleSubmit = async () => {
    if (!imageMeta) {
      alert("No image to submit.");
      return;
    }

    try {
      // Convert base64 to Blob
      const byteString = atob(imageMeta.data);
      const byteArray = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }

      const blob = new Blob([byteArray], { type: imageMeta.type });

      const file = new File([blob], imageMeta.name, {
        type: imageMeta.type,
      });

      const formData = new FormData();

      formData.append("file", file); // your uploaded image

      const mockupWidth = 350;
      const mockupHeight = 350;

      const positionPercent = {
        x: (position.x / mockupWidth) * 100,
        y: (position.y / mockupHeight) * 100,
      };

      const sizePercent = {
        width: (size.width / mockupWidth) * 100,
        height: (size.height / mockupHeight) * 100,
      };

      formData.append("position", JSON.stringify(positionPercent));
      formData.append("size", JSON.stringify(sizePercent));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        alert("Upload successful! Waiting for approval");

        // Optional: clear localStorage
        localStorage.removeItem("pendingUpload");

        // Redirect or show next step
        router.push("/gallery");
      } else {
        alert("Upload failed: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during upload.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
        Adjust Your Design
      </h1>

      <div className="relative w-[350px] h-[350px] border border-gray-300 bg-white overflow-hidden">
        {/* T-shirt Image (background) */}
        <img
          src="/tshirt.jpg"
          alt="T-shirt Mockup"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {imageDataUrl && (
          <Rnd
            bounds="parent"
            size={{ width: size.width, height: size.height }}
            position={{ x: position.x, y: position.y }}
            onDragStop={(_, d) => setPosition({ x: d.x, y: d.y })}
            onResizeStop={(_, __, ref, ___, position) => {
              setSize({
                width: parseInt(ref.style.width),
                height: parseInt(ref.style.height),
              });
              setPosition(position);
            }}
            style={{
              zIndex: 10,
              position: "absolute", // required
            }}
          >
            <img
              src={imageDataUrl}
              alt="Uploaded Design"
              className="w-full h-full object-contain"
              draggable={false}
            />
          </Rnd>
        )}
      </div>

      <div className="mt-6 flex gap-4">
        <Button onClick={() => window.history.back()}>Back</Button>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={handleSubmit}
        >
          Submit Design
        </Button>
      </div>
    </div>
  );
}
