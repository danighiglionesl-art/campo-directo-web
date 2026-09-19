import { NextResponse } from "next/server";
import {
  getEstablishments,
  addEstablishment,
} from "@/utils/serverDataStore";

export async function GET() {
  try {
    const list = getEstablishments();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    console.error("[api/panel/establishments GET] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener lista de establecimientos." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = addEstablishment(body);
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("[api/panel/establishments POST] Error:", error);
    return NextResponse.json(
      { error: "Error al registrar establecimiento." },
      { status: 500 }
    );
  }
}
