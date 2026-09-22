import { NextResponse } from "next/server";
import { updateFactoryProductServer } from "@/utils/serverDataStore";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = updateFactoryProductServer(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { error: "Producto no encontrado." },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error(`[api/panel/factory-products/${params.id} PATCH] Error:`, error);
    return NextResponse.json(
      { error: "Error al actualizar producto de fábrica." },
      { status: 500 }
    );
  }
}
