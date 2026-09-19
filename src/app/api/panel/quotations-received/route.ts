import { NextResponse } from "next/server";
import {
  getQuotationsReceived,
  addQuotationReceived,
} from "@/utils/serverDataStore";

export async function GET() {
  try {
    const list = getQuotationsReceived();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    console.error("[api/panel/quotations-received GET] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener cotizaciones recibidas." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = addQuotationReceived(body);
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("[api/panel/quotations-received POST] Error:", error);
    return NextResponse.json(
      { error: "Error al registrar cotización recibida." },
      { status: 500 }
    );
  }
}
