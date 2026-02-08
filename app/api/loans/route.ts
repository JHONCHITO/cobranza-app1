import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const collectorId = searchParams.get('collectorId')
    const clientId = searchParams.get('clientId')
    
    const collection = await getCollection('loans')
    const filter: Record<string, string> = {}
    if (collectorId) filter.collectorId = collectorId
    if (clientId) filter.clientId = clientId
    
    const loans = await collection.find(filter).toArray()
    const formatted = loans.map(l => ({ ...l, id: l._id.toString() }))
    return NextResponse.json(formatted)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const collection = await getCollection('loans')
    
    if (data.id && data._update) {
      const { id, _update, ...updateData } = data
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      )
      return NextResponse.json({ success: true, id })
    }
    
    const result = await collection.insertOne({
      ...data,
      createdAt: new Date().toISOString(),
    })
    return NextResponse.json({ success: true, id: result.insertedId.toString() })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}
