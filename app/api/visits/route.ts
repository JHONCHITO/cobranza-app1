import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/visits?collectorId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectorId = searchParams.get("collectorId");

    const collection = await getCollection("visits");
    const filter = collectorId ? { collectorId } : {};

    const visits = await collection.find(filter).sort({ createdAt: -1 }).toArray();

    const formatted = visits.map((v: any) => ({
      ...v,
      id: v._id.toString(),
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/visits:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener visitas" },
      { status: 500 }
    );
  }
}

// POST /api/visits
// - Crear visita nueva
// - Actualizar visita cuando viene { id, _update: true, ...campos }
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const collection = await getCollection("visits");

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
    };

    const result = await collection.insertOne(doc);

    return NextResponse.json(
      { success: true, id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/visits:", error);
    return NextResponse.json(
      { success: false, error: "Error del servidor al guardar visita" },
      { status: 500 }
    );
  }
}

// DELETE /api/visits?id=...
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "ID inválido" },
        { status: 400 }
      );
    }

    const collection = await getCollection("visits");
    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error en DELETE /api/visits:", error);
    return NextResponse.json(
      { success: false, error: "Error del servidor al borrar visita" },
      { status: 500 }
    );
  }
}
