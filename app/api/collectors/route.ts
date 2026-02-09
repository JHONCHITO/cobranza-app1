import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

// GET /api/collectors
export async function GET() {
  try {
    const collection = await getCollection("collectors");

    const collectors = await collection.find({}).sort({ createdAt: -1 }).toArray();

    const formatted = collectors.map((c: any) => ({
      ...c,
      id: c._id.toString(),
    }));

    return NextResponse.json(formatted, { status: 200 });
  } catch (error) {
    console.error("Error en GET /api/collectors:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener cobradores" },
      { status: 500 }
    );
  }
}

// POST /api/collectors
// - Crear cobrador nuevo
// - Actualizar cobrador cuando viene { id, _update: true, ...campos }
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const collection = await getCollection("collectors");

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
      status: data.status ?? "active",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(doc);

    return NextResponse.json(
      { success: true, id: result.insertedId.toString() },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error en POST /api/collectors:", error);
    return NextResponse.json(
      { success: false, error: "Error del servidor al guardar cobrador" },
      { status: 500 }
    );
  }
}

// DELETE /api/collectors?id=...
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

    const collection = await getCollection("collectors");
    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error en DELETE /api/collectors:", error);
    return NextResponse.json(
      { success: false, error: "Error del servidor al borrar cobrador" },
      { status: 500 }
    );
  }
}
