import { NextResponse } from "next/server";
import {
  getQuotationsSent,
  addQuotationSent,
} from "@/utils/serverDataStore";

export async function GET() {
  try {
    const list = getQuotationsSent();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    console.error("[api/panel/quotations-sent GET] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener cotizaciones enviadas." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = addQuotationSent(body);
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("[api/panel/quotations-sent POST] Error:", error);
    return NextResponse.json(
      { error: "Error al crear propuesta comercial." },
      { status: 500 }
    );
  }
}
