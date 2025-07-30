// app/layout.jsx
import "./globals.css";
import AuthProvider from "@/components/AuthProvider"; // adjust path if needed

export const metadata = {
  title: "Design Your Own Shirt OYE",
  description: "Competition landing page for shirt design",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
