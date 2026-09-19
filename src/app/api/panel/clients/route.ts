import { NextResponse } from "next/server";
import {
  getClients,
  addClient,
} from "@/utils/serverDataStore";

export async function GET() {
  try {
    const list = getClients();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    console.error("[api/panel/clients GET] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener lista de clientes." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const created = addClient(body);
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("[api/panel/clients POST] Error:", error);
    return NextResponse.json(
      { error: "Error al crear cliente." },
      { status: 500 }
    );
  }
}
