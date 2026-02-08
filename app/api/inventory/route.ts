import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const collectorId = searchParams.get('collectorId')
    
    const collection = await getCollection('inventory')
    const filter = collectorId ? { collectorId } : {}
    const items = await collection.find(filter).toArray()
    const formatted = items.map(i => ({ ...i, id: i._id.toString() }))
    return NextResponse.json(formatted)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const collection = await getCollection('inventory')
    
    if (data.id && data._update) {
      const { id, _update, ...updateData } = data
      await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData })
      return NextResponse.json({ success: true, id })
    }
    
    const result = await collection.insertOne(data)
    return NextResponse.json({ success: true, id: result.insertedId.toString() })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false }, { status: 400 })
    
    const collection = await getCollection('inventory')
    await collection.deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
