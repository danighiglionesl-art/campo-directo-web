import { NextResponse } from "next/server";
import {
  updateEstablishment,
  deleteEstablishment,
} from "@/utils/serverDataStore";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = updateEstablishment(id, body);

    if (!updated) {
      return NextResponse.json(
        { error: "Establecimiento no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[api/panel/establishments/[id] PATCH] Error:", error);
    return NextResponse.json(
      { error: "Error al actualizar establecimiento." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const deleted = deleteEstablishment(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Establecimiento no encontrado o ya eliminado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[api/panel/establishments/[id] DELETE] Error:", error);
    return NextResponse.json(
      { error: "Error al eliminar establecimiento." },
      { status: 500 }
    );
  }
}
