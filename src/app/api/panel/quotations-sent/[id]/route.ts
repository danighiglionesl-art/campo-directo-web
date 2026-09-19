import { NextResponse } from "next/server";
import {
  updateQuotationSent,
  deleteQuotationSent,
} from "@/utils/serverDataStore";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const updated = updateQuotationSent(id, body);

    if (!updated) {
      return NextResponse.json(
        { error: "Propuesta no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[api/panel/quotations-sent/[id] PATCH] Error:", error);
    return NextResponse.json(
      { error: "Error al actualizar propuesta comercial." },
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
    const deleted = deleteQuotationSent(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Propuesta no encontrada o ya eliminada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[api/panel/quotations-sent/[id] DELETE] Error:", error);
    return NextResponse.json(
      { error: "Error al eliminar propuesta comercial." },
      { status: 500 }
    );
  }
}
