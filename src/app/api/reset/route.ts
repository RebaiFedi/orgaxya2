import { resetDatabase } from "@/lib/db/reset";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await resetDatabase();
    return NextResponse.json({ success: true, message: "Base de données réinitialisée" });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation:", error);
    return NextResponse.json(
      { success: false, message: "Erreur lors de la réinitialisation" },
      { status: 500 }
    );
  }
} 