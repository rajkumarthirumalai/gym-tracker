import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  
  if (password === "mwf@mdu") {
    const response = NextResponse.json({ success: true });
    response.cookies.set("mwf_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: "/",
    });
    return response;
  }
  
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
