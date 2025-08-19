import { NextResponse } from "next/server"

export async function POST() {
  // Clear the authentication cookie
  const response = NextResponse.json(
    { message: "Logout successful" },
    { status: 200 }
  )

  response.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // delete immediately
    path: "/",
  })

  return response
}
