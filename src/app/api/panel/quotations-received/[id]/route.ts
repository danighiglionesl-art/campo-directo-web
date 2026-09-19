import { NextResponse } from "next/server";
import {
  updateQuotationReceivedStatus,
  deleteQuotationReceived,
} from "@/utils/serverDataStore";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { estado, fechaRespuesta } = body;

    const updated = updateQuotationReceivedStatus(id, estado, fechaRespuesta);
    if (!updated) {
      return NextResponse.json(
        { error: "Cotización no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[api/panel/quotations-received/[id] PATCH] Error:", error);
    return NextResponse.json(
      { error: "Error al actualizar estado de cotización." },
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
    const deleted = deleteQuotationReceived(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Cotización no encontrada o ya eliminada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[api/panel/quotations-received/[id] DELETE] Error:", error);
    return NextResponse.json(
      { error: "Error al eliminar cotización recibida." },
      { status: 500 }
    );
  }
}
