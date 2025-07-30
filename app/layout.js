import "./globals.css";
import dynamic from "next/dynamic";

const AuthProvider = dynamic(() => import("@/components/Auth0ClientProvider"), {
  ssr: false,
});

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
