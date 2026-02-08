import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb'

// Initialize default admin if not exists
async function ensureDefaultAdmin() {
  try {
    const admins = await getCollection('admins')
    const existing = await admins.findOne({ email: 'admin@gotaagota.com' })
    if (!existing) {
      await admins.insertOne({
        name: 'Administrador',
        email: 'admin@gotaagota.com',
        password: 'admin123',
        role: 'admin',
        createdAt: new Date().toISOString(),
      })
    }
  } catch {
    // MongoDB not available, will fallback to localStorage on client
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    await ensureDefaultAdmin()

    // Check admins
    const admins = await getCollection('admins')
    const admin = await admins.findOne({ 
      email: email.toLowerCase(), 
      password 
    })

    if (admin) {
      return NextResponse.json({
        success: true,
        session: {
          userId: admin._id.toString(),
          userType: 'admin',
          email: admin.email,
          name: admin.name,
        }
      })
    }

    // Check collectors
    const collectors = await getCollection('collectors')
    const collector = await collectors.findOne({ 
      email: email.toLowerCase(), 
      password, 
      status: 'active' 
    })

    if (collector) {
      return NextResponse.json({
        success: true,
        session: {
          userId: collector._id.toString(),
          userType: 'collector',
          email: collector.email,
          name: collector.name,
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'Correo o contrasena incorrectos' },
      { status: 401 }
    )
  } catch {
    return NextResponse.json(
      { success: false, error: 'Error del servidor. Usando modo local.' },
      { status: 500 }
    )
  }
}
