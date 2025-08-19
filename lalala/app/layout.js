import "./globals.css"
import { AuthProvider } from "@/hooks/useAuth"
import { ProjectProvider } from "@/contexts/project-context"

export const metadata = {
  title: "My App",
  description: "App with Auth and Project Context",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ProjectProvider>
            {children}
          </ProjectProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
