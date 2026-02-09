import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/clients?collectorId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collectorId = searchParams.get("collectorId");

    const collection = await getCollection("clients");

    const filter = collectorId ? { collectorId } : {};
    const clients = await collection.find(filter).sort({ createdAt: -1 }).toArray();

    const formatted = clients.map((c: any) => ({
      ...c,
      id: c._id.toString(),
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/clients:", error);
    // Si hay error, mejor devolver error explícito que un array vacío
    return NextResponse.json(
      { success: false, error: "Error al obtener clientes" },
      { status: 500 }
    );
  }
}

// POST /api/clients
// - Crear cliente nuevo
// - Actualizar cliente existente cuando viene { id, _update: true, ...campos }
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const collection = await getCollection("clients");

    // Actualización
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

    // Creación
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
    console.error("Error en POST /api/clients:", error);
    return NextResponse.json(
      { success: false, error: "Error del servidor al guardar cliente" },
      { status: 500 }
    );
  }
}

// DELETE /api/clients?id=...
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

    const collection = await getCollection("clients");

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error en DELETE /api/clients:", error);
    return NextResponse.json(
      { success: false, error: "Error del servidor al borrar cliente" },
      { status: 500 }
    );
  }
}
