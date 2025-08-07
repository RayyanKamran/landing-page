"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/button";
import { useRouter } from "next/navigation";

export default function SubmitPage() {
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("pendingUpload");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const dataUrl = `data:${parsed.type};base64,${parsed.data}`;
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Adjust Your Design</h1>

      <div className="relative w-72 h-72 border border-gray-300 bg-white">
        {/* T-shirt mockup */}
        <img
          src="/tshirt.jpg"
          alt="T-shirt Mockup"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Uploaded design overlay */}
        {imageDataUrl && (
          <img
            src={imageDataUrl}
            alt="Uploaded Design"
            className="absolute top-[30%] left-[30%] w-24 h-24 object-contain cursor-move"
            draggable
          />
        )}
      </div>

      <div className="mt-6 flex gap-4">
        <Button onClick={() => window.history.back()}>Back</Button>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={() => alert("Submit logic goes here")}
        >
          Submit Design
        </Button>
      </div>
    </div>
  );
}
