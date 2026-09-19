import { NextResponse } from "next/server";
import {
  getPaymentMethods,
  updatePaymentMethod,
} from "@/utils/serverDataStore";

export async function GET() {
  try {
    const list = getPaymentMethods();
    return NextResponse.json({ success: true, data: list });
  } catch (error: any) {
    console.error("[api/panel/payment-methods GET] Error:", error);
    return NextResponse.json(
      { error: "Error al obtener formas de pago." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const updated = updatePaymentMethod(id, data);

    if (!updated) {
      return NextResponse.json(
        { error: "Forma de pago no encontrada." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("[api/panel/payment-methods PATCH] Error:", error);
    return NextResponse.json(
      { error: "Error al actualizar forma de pago." },
      { status: 500 }
    );
  }
}
