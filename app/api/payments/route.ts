import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/payments?loanId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get("loanId");

    const collection = await getCollection("payments");
    const filter = loanId ? { loanId } : {};

    const payments = await collection.find(filter).sort({ createdAt: -1 }).toArray();

    const formatted = payments.map((p: any) => ({
      ...p,
      id: p._id.toString(),
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/payments:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener pagos" },
      { status: 500 }
    );
  }
}

// POST /api/payments
// Guarda el pago y actualiza el préstamo relacionado
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.loanId || !ObjectId.isValid(data.loanId)) {
      return NextResponse.json(
        { success: false, error: "loanId inválido" },
        { status: 400 }
      );
    }

    if (typeof data.amount !== "number" || data.amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Monto del pago inválido" },
        { status: 400 }
      );
    }

    // Colecciones
    const payments = await getCollection("payments");
    const loans = await getCollection("loans");

    const loanObjectId = new ObjectId(data.loanId);

    // Guardar pago
    await payments.insertOne({
      ...data,
      loanId: data.loanId,
      createdAt: new Date(),
    });

    // Obtener préstamo actual
    const loan = await loans.findOne({ _id: loanObjectId });

    if (loan) {
      const currentPaidAmount = typeof loan.paidAmount === "number" ? loan.paidAmount : 0;
      const currentPaidInstallments =
        typeof loan.paidInstallments === "number" ? loan.paidInstallments : 0;

      const newPaidAmount = currentPaidAmount + data.amount;
      const newPaidInstallments = currentPaidInstallments + 1;
      const totalAmount = typeof loan.totalAmount === "number" ? loan.totalAmount : 0;

      const newStatus =
        totalAmount > 0 && newPaidAmount >= totalAmount ? "completed" : loan.status ?? "active";

      await loans.updateOne(
        { _id: loanObjectId },
        {
          $set: {
            paidAmount: newPaidAmount,
            paidInstallments: newPaidInstallments,
            status: newStatus,
            updatedAt: new Date(),
          },
        }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error en POST /api/payments:", error);
    return NextResponse.json(
      { success: false, error: "Error del servidor al registrar pago" },
      { status: 500 }
    );
  }
}
