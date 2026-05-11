import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Appeler l'API admin transactions externe
    const apiKey = 'fk_live_Qbtr6Cv-s91sQ7rdz7ii2HcPs7rF8b8qE81w_pPzYi5oW5L8thU4kVTgOzQdYF31X8R2B5U6sHk'
    const baseUrl = 'https://api-pay-prod.faroty.me/payments/api/v1/admin/transactions'
    const url = new URL(baseUrl)
    const page = request.nextUrl.searchParams.get('page') ?? '0'
    const size = request.nextUrl.searchParams.get('size') ?? '100'
    url.searchParams.set('page', page)
    url.searchParams.set('size', size)

    console.log(`[Transactions API] Appel externe: ${url.toString()}`)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-api-key': apiKey
      }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'N/A')
      console.error(`[Transactions API] Erreur externe ${response.status}:`, errorText)
      throw new Error(`Erreur API externe: ${response.status} - ${errorText.substring(0, 100)}`)
    }

    const apiResponse = await response.json()

    // L'API retourne une structure paginée, nous devons extraire le tableau de transactions
    let transactions = []
    if (Array.isArray(apiResponse)) {
      // Si c'est directement un tableau (ancienn format)
      transactions = apiResponse
    } else if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data.content)) {
      // Si les données sont dans apiResponse.data.content (format paginé)
      transactions = apiResponse.data.content
    } else if (apiResponse && Array.isArray(apiResponse.data)) {
      // Si les données sont dans apiResponse.data (nouveau format)
      transactions = apiResponse.data
    } else {
      // Structure inattendue, retourner un tableau vide
      transactions = []
    }

    const srcData = apiResponse?.data
    const isPagedEnvelope =
      srcData &&
      typeof srcData === 'object' &&
      !Array.isArray(srcData) &&
      Array.isArray((srcData as { content?: unknown }).content)

    let totalElements = transactions.length
    let totalPages = 1
    let pageNum = Number.parseInt(page, 10) || 0
    let sizeNum = Number.parseInt(size, 10) || transactions.length
    let last = true
    let first = true
    let hasNext = false
    let hasPrevious = false

    if (isPagedEnvelope) {
      const d = srcData as {
        totalElements?: number
        totalPages?: number
        page?: number
        size?: number
        last?: boolean
        first?: boolean
        hasNext?: boolean
        hasPrevious?: boolean
      }
      if (typeof d.totalElements === 'number' && !Number.isNaN(d.totalElements)) {
        totalElements = d.totalElements
      }
      if (typeof d.totalPages === 'number' && !Number.isNaN(d.totalPages)) {
        totalPages = d.totalPages
      }
      if (typeof d.page === 'number' && !Number.isNaN(d.page)) pageNum = d.page
      if (typeof d.size === 'number' && !Number.isNaN(d.size)) sizeNum = d.size
      if (typeof d.last === 'boolean') last = d.last
      if (typeof d.first === 'boolean') first = d.first
      if (typeof d.hasNext === 'boolean') hasNext = d.hasNext
      if (typeof d.hasPrevious === 'boolean') hasPrevious = d.hasPrevious
    }

    const formattedTransactions = transactions.map((item: any, index: number) => {
      try {
        const transaction = item.transaction
        if (!transaction) {
          console.error(`Transaction ${index} manquante:`, item)
          return null
        }
        
        return {
          id: transaction.transactionId || `tx_${index}`,
          reference: transaction.reference || `REF_${index}`,
          type: transaction.type?.toLowerCase() || 'unknown',
          amount: Number(transaction.amount) || 0,
          currency: transaction.currency || 'XAF',
          status: transaction.status === 'SUCCESSFUL' ? 'completed' : transaction.status?.toLowerCase() || 'unknown',
          createdAt: transaction.createdAt || new Date().toISOString(),
          updatedAt: transaction.updatedAt || new Date().toISOString(),
          description: transaction.message || '',
          senderInfo: {
            id: transaction.payerId || 'unknown',
            name: 'Utilisateur',
            email: null,
            phone: transaction.payerId || null
          },
          receiverInfo: {
            id: item.account?.id || 'unknown',
            name: item.account?.accountName || 'Compte',
            email: null,
            phone: null
          },
          paymentMethod: {
            id: transaction.paymentMethodInfo?.id || 'unknown',
            name: transaction.paymentMethodInfo?.name || 'Inconnu',
            technicalName: transaction.paymentMethodInfo?.technicalName || 'unknown'
          },
          wallet: {
            id: item.account?.id || 'unknown',
            name: item.account?.accountName || 'Compte',
            currency: transaction.currency || 'XAF'
          },
          fee: Number(item.fees) || 0,
          netAmount: Number(transaction.netAmount) || 0
        }
      } catch (error) {
        return null
      }
    }).filter(Boolean) // Filtrer les valeurs nulles

    return NextResponse.json({
      success: true,
      message: 'Transactions récupérées avec succès',
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        content: formattedTransactions,
        page: pageNum,
        size: sizeNum,
        totalElements,
        totalPages,
        last,
        first,
        hasNext,
        hasPrevious
      }
    })
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('[Transactions API] Erreur:', errorMsg)
    
    // Retourner un tableau vide plutôt qu'une erreur 500
    return NextResponse.json({
      success: true,
      message: 'Aucune transaction disponible actuellement',
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: {
        content: [],
        page: 0,
        size: 0,
        totalElements: 0,
        totalPages: 0,
        last: true,
        first: true,
        hasNext: false,
        hasPrevious: false
      }
    })
  }
}
