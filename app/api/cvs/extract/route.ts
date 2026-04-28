import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { resumeUrl } = await request.json();

    if (!resumeUrl) {
      return NextResponse.json({ error: "Missing resumeUrl" }, { status: 400 });
    }

    // Fetch the PDF buffer from the public URL
    const pdfResponse = await fetch(resumeUrl);
    if (!pdfResponse.ok) {
      return NextResponse.json({ error: "Failed to fetch PDF" }, { status: 500 });
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

    // Import pdf-parse (ESM build exposes a named export, not default)
    const pdfParseModule = await import("pdf-parse");
    const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;
    const parsed = await pdfParse(pdfBuffer);
    const cvText = parsed.text || "";

    // Upsert the extracted text into the candidates table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("candidates")
      .update({ cv_text: cvText })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error saving cv_text:", updateError);
      return NextResponse.json({ error: "Failed to save extracted text" }, { status: 500 });
    }

    return NextResponse.json({ success: true, charCount: cvText.length });
  } catch (err: any) {
    console.error("CV Extract API Error:", err);
    return NextResponse.json({ error: err.message || "Extraction failed" }, { status: 500 });
  }
}
