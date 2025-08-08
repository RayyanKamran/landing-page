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

  // Text overlay state
  const [textOverlays, setTextOverlays] = useState([]);
  const [addingText, setAddingText] = useState(false);
  const [newText, setNewText] = useState("");

  const [selectedOverlay, setSelectedOverlay] = useState(null); // For text overlays
  const [imageSelected, setImageSelected] = useState(false); // For image

  // T-shirt color state (now stores index)
  const [tshirtIndex, setTshirtIndex] = useState(0);

  // List of T-shirt mockups with color info
  const tshirtColors = [
    { name: "White", value: "#fff", img: "/tshirt.jpg" },
    { name: "Black", value: "#222", img: "/tshirt-black.png" },
    { name: "Red", value: "#ef4444", img: "/tshirt-red.png" },
    { name: "Blue", value: "#2563eb", img: "/tshirt-blue.png" },
    { name: "Green", value: "#22c55e", img: "/tshirt-green.png" },
    { name: "Gray", value: "#6b7280", img: "/tshirt-gray.png" },
  ];

  useEffect(() => {
    const stored = localStorage.getItem("pendingUpload");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const dataUrl = `data:${parsed.type};base64,${parsed.data}`;
        setImageMeta(parsed);
        setImageDataUrl(dataUrl);
      } catch (e) {
        setImageMeta(null);
        setImageDataUrl(null);
      }
    } else {
      setImageMeta(null);
      setImageDataUrl(null);
    }
  }, []);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      if (imageMeta) {
        const byteString = atob(imageMeta.data);
        const byteArray = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
          byteArray[i] = byteString.charCodeAt(i);
        }

        const blob = new Blob([byteArray], { type: imageMeta.type });

        const file = new File([blob], imageMeta.name, {
          type: imageMeta.type,
        });

        formData.append("file", file);

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
      } else {
        formData.append("file", "");
        formData.append("position", JSON.stringify({ x: 0, y: 0 }));
        formData.append("size", JSON.stringify({ width: 0, height: 0 }));
      }

      // Add text overlays to submission
      formData.append("textOverlays", JSON.stringify(textOverlays));

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        alert("Upload successful! Waiting for approval");
        localStorage.removeItem("pendingUpload");
        router.push("/gallery");
      } else {
        alert("Upload failed: " + result.error);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong during upload.");
    }
  };

  // Add new text overlay
  const handleAddText = () => {
    if (newText.trim() === "") return;
    setTextOverlays([
      ...textOverlays,
      {
        text: newText,
        x: 120,
        y: 120,
        width: 120,
        height: 40,
        color: "#222",
        fontSize: 20,
      },
    ]);
    setNewText("");
    setAddingText(false);
  };

  // Update position/size of text overlays
  const handleTextDragResize = (idx, d, ref) => {
    setTextOverlays((prev) =>
      prev.map((overlay, i) =>
        i === idx
          ? {
              ...overlay,
              x: d.x,
              y: d.y,
              width: Number(ref.style.width.replace("px", "")),
              height: Number(ref.style.height.replace("px", "")),
            }
          : overlay
      )
    );
  };

  // Font size adjustment for selected text overlay
  const handleFontSizeChange = (delta) => {
    if (selectedOverlay === null) return;
    setTextOverlays((prev) =>
      prev.map((overlay, i) =>
        i === selectedOverlay
          ? {
              ...overlay,
              fontSize: Math.max(8, overlay.fontSize + delta),
            }
          : overlay
      )
    );
  };

  // Text color change for selected text overlay
  const handleTextColorChange = (color) => {
    if (selectedOverlay === null) return;
    setTextOverlays((prev) =>
      prev.map((overlay, i) =>
        i === selectedOverlay ? { ...overlay, color } : overlay
      )
    );
  };

  // List of colors for dropdown
  const textColors = [
    { name: "Black", value: "#222" },
    { name: "White", value: "#fff" },
    { name: "Red", value: "#ef4444" },
    { name: "Blue", value: "#2563eb" },
    { name: "Green", value: "#22c55e" },
    { name: "Yellow", value: "#eab308" },
    { name: "Purple", value: "#a21caf" },
    { name: "Orange", value: "#f97316" },
    { name: "Gray", value: "#6b7280" },
  ];

  return (
    <div className="bg-gradient-to-b from-blue-50 to-green-50 flex flex-row items-start justify-center min-h-screen p-8">
      <div className="absolute top-8 left-0 w-full flex justify-center pointer-events-none">
        <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
          Adjust Your Design
        </h1>
      </div>
      {/* Left: Mockup */}
      <div className="flex flex-col items-center">
        <div className="relative w-[350px] h-[350px] border border-gray-300 bg-white overflow-hidden mt-24">
          {/* T-shirt Image */}
          <img
            src={tshirtColors[tshirtIndex].img}
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
                position: "absolute",
                border: imageSelected ? "2px dotted #2563eb" : "none",
              }}
              onClick={() => {
                setImageSelected(true);
                setSelectedOverlay(null);
              }}
              enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
              }}
            >
              <img
                src={imageDataUrl}
                alt="Uploaded Design"
                className="w-full h-full object-contain"
                draggable={false}
                style={{ pointerEvents: "none" }}
              />
            </Rnd>
          )}

          {/* Render text overlays */}
          {textOverlays.map((overlay, idx) => (
            <Rnd
              key={idx}
              bounds="parent"
              size={{ width: overlay.width, height: overlay.height }}
              position={{ x: overlay.x, y: overlay.y }}
              onDragStop={(_, d) => {
                handleTextDragResize(idx, d, {
                  style: {
                    width: `${overlay.width}px`,
                    height: `${overlay.height}px`,
                  },
                });
              }}
              onResizeStop={(_, __, ref, ___, position) => {
                handleTextDragResize(idx, position, ref);
              }}
              style={{
                zIndex: 20,
                position: "absolute",
                pointerEvents: "auto",
                border: selectedOverlay === idx ? "2px dotted #2563eb" : "none",
              }}
              onClick={() => {
                setSelectedOverlay(idx);
                setImageSelected(false);
              }}
              enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true,
              }}
            >
              <div
                className="flex items-center justify-center w-full h-full bg-transparent"
                style={{
                  color: overlay.color,
                  fontSize: overlay.fontSize,
                  fontWeight: "bold",
                  textAlign: "center",
                  userSelect: "none",
                  cursor: "move",
                  pointerEvents: "auto",
                }}
              >
                {overlay.text}
              </div>
            </Rnd>
          ))}
        </div>
        {/* T-shirt mockup buttons row */}
        <div className="flex gap-2 mt-4">
          {tshirtColors.map((c, idx) => (
            <button
              key={c.value}
              className={`w-8 h-8 rounded-full border-2 ${
                tshirtIndex === idx ? "border-blue-600" : "border-gray-300"
              }`}
              style={{ backgroundColor: c.value }}
              onClick={() => setTshirtIndex(idx)}
              title={c.name}
            />
          ))}
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex flex-col items-start ml-8 gap-4 mt-24">
        <Button onClick={() => window.history.back()}>Back</Button>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white"
          onClick={handleSubmit}
        >
          Submit Design
        </Button>
        <div className="mt-4">
          {!addingText ? (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setAddingText(true)}
            >
              + Add Text
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                className="border rounded px-2 py-1"
                placeholder="Enter text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleAddText}
                >
                  Add
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAddingText(false);
                    setNewText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
        {/* Font size controls for selected text overlay */}
        {selectedOverlay !== null && (
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex gap-2">
              <Button
                className="bg-gray-200 text-black"
                onClick={() => handleFontSizeChange(2)}
              >
                A+
              </Button>
              <Button
                className="bg-gray-200 text-black"
                onClick={() => handleFontSizeChange(-2)}
              >
                A-
              </Button>
            </div>
            <div className="mt-2">
              <label className="mr-2 font-medium">Text Color:</label>
              <select
                className="border rounded px-2 py-1"
                value={textOverlays[selectedOverlay]?.color || "#222"}
                onChange={(e) => handleTextColorChange(e.target.value)}
              >
                {textColors.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
