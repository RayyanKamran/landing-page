import "./globals.css"

export const metadata = {
  title: "Design Your Own Shirt OYE",
  description: "Competition landing page for shirt design",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
