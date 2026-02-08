import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const collection = await getCollection('collectors')
    const collectors = await collection.find({}).toArray()
    const formatted = collectors.map(c => ({ ...c, id: c._id.toString() }))
    return NextResponse.json(formatted)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const collection = await getCollection('collectors')
    
    if (data.id && data._update) {
      // Update
      const { id, _update, ...updateData } = data
      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      )
      return NextResponse.json({ success: true, id })
    }
    
    // Create
    const result = await collection.insertOne({
      ...data,
      createdAt: new Date().toISOString(),
    })
    return NextResponse.json({ success: true, id: result.insertedId.toString() })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ success: false }, { status: 400 })
    
    const collection = await getCollection('collectors')
    await collection.deleteOne({ _id: new ObjectId(id) })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
