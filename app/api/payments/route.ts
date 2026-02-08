import { NextRequest, NextResponse } from 'next/server'
import { getCollection } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const loanId = searchParams.get('loanId')
    
    const collection = await getCollection('payments')
    const filter = loanId ? { loanId } : {}
    const payments = await collection.find(filter).sort({ createdAt: -1 }).toArray()
    const formatted = payments.map(p => ({ ...p, id: p._id.toString() }))
    return NextResponse.json(formatted)
  } catch {
    return NextResponse.json([])
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Save payment
    const payments = await getCollection('payments')
    await payments.insertOne({
      ...data,
      createdAt: new Date().toISOString(),
    })
    
    // Update loan
    const loans = await getCollection('loans')
    const loan = await loans.findOne({ _id: new ObjectId(data.loanId) })
    
    if (loan) {
      const newPaidAmount = (loan.paidAmount || 0) + data.amount
      const newPaidInstallments = (loan.paidInstallments || 0) + 1
      const newStatus = newPaidAmount >= loan.totalAmount ? 'completed' : loan.status
      
      await loans.updateOne(
        { _id: new ObjectId(data.loanId) },
        { 
          $set: { 
            paidAmount: newPaidAmount,
            paidInstallments: newPaidInstallments,
            status: newStatus
          }
        }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Error del servidor' }, { status: 500 })
  }
}
