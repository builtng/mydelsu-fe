import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "myDelsu — Delta State University Student Companion",
  description: "The definitive resource platform for Delta State University students.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
