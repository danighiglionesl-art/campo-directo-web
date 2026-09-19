import { NextResponse } from "next/server";
import {
  updateClient,
  deleteClient,
} from "@/utils/serverDataStore";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = updateClient(id, body);

    if (!updated) {
      return NextResponse.json(
        { error: "Cliente no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[api/panel/clients/[id] PATCH] Error:", error);
    return NextResponse.json(
      { error: "Error al actualizar datos de cliente." },
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
    const deleted = deleteClient(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Cliente no encontrado o ya eliminado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[api/panel/clients/[id] DELETE] Error:", error);
    return NextResponse.json(
      { error: "Error al eliminar cliente." },
      { status: 500 }
    );
  }
}
