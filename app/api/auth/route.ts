import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/lib/mongodb";

// Inicializar admin por defecto si no existe
async function ensureDefaultAdmin() {
  const admins = await getCollection("admins");

  const existing = await admins.findOne({ email: "admin@gotaagota.com" });

  if (!existing) {
    await admins.insertOne({
      name: "Administrador",
      email: "admin@gotaagota.com",
      password: "admin123", // TODO: reemplazar por hash (bcrypt) en el futuro
      role: "admin",
      createdAt: new Date(),
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Correo y contraseña son obligatorios" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase();

    // Aseguramos que el admin por defecto exista
    await ensureDefaultAdmin();

    // Buscar en admins
    const admins = await getCollection("admins");
    const admin = await admins.findOne({
      email: normalizedEmail,
      password,
    });

    if (admin) {
      return NextResponse.json(
        {
          success: true,
          session: {
            userId: admin._id.toString(),
            userType: "admin",
            email: admin.email,
            name: admin.name,
          },
        },
        { status: 200 }
      );
    }

    // Buscar en collectors
    const collectors = await getCollection("collectors");
    const collector = await collectors.findOne({
      email: normalizedEmail,
      password,
      status: "active",
    });

    if (collector) {
      return NextResponse.json(
        {
          success: true,
          session: {
            userId: collector._id.toString(),
            userType: "collector",
            email: collector.email,
            name: collector.name,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Correo o contraseña incorrectos" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Error en /api/auth:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          "Error del servidor al autenticar. Verifica la conexión con la base de datos.",
      },
      { status: 500 }
    );
  }
}
