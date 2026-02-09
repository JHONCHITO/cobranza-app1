import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/loans?collectorId=...&clientId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectorId = searchParams.get("collectorId");
    const clientId = searchParams.get("clientId");

    const collection = await getCollection("loans");

    const filter: Record<string, string> = {};
    if (collectorId) filter.collectorId = collectorId;
    if (clientId) filter.clientId = clientId;

    const loans = await collection.find(filter).sort({ createdAt: -1 }).toArray();

    const formatted = loans.map((l: any) => ({
      ...l,
      id: l._id.toString(),
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/loans:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener préstamos" },
      { status: 500 }
    );
  }
}

// POST /api/loans
// - Crear préstamo nuevo
// - Actualizar préstamo cuando viene { id, _update: true, ...campos }
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const collection = await getCollection("loans");

    // Actualizar
    if (data.id && data._update) {
      const { id, _update, ...updateData } = data;

      if (!ObjectId.isValid(id)) {
        return NextResponse.json(
          { success: false, error: "ID inválido" },
          { status: 400 }
        );
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );

      return NextResponse.json({ success: true, id }, { status: 200 });
    }

    // Crear
    const doc = {
      ...data,
      createdAt: new Date(),
      status: data.status ?? "active",
    };

    const result = await collection.insertOne(doc);

    return NextResponse.json(
      { success: true, id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/loans:", error);
    return NextResponse.json(
      { success: false, error: "Error del servidor al guardar préstamo" },
      { status: 500 }
    );
  }
}
