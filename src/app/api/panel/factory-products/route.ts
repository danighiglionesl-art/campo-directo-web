import { NextResponse } from "next/server";
import {
  getFactoryProducts,
  updateFactoryProductServer,
  addFactoryProductServer,
} from "@/utils/serverDataStore";

export async function GET() {
  try {
    const list = getFactoryProducts();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    console.error("[api/panel/factory-products GET] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener productos de fábrica." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.id && body.isUpdate) {
      const updated = updateFactoryProductServer(body.id, body.data);
      return NextResponse.json({ success: true, data: updated });
    }
    const created = addFactoryProductServer(body);
    return NextResponse.json({ success: true, data: created });
  } catch (error: any) {
    console.error("[api/panel/factory-products POST] Error:", error);
    return NextResponse.json(
      { error: "Error al guardar producto de fábrica." },
      { status: 500 }
    );
  }
}
