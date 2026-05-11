import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data for development
    const mockWallets = [
      {
        id: 'wallet_1',
        refName: 'Wallet Principal',
        account: {
          id: 'account_1',
          accountName: 'Compte Principal'
        },
        currency: {
          code: 'EUR',
          nameFr: 'Euro',
          symbol: '€'
        },
        balance: {
          totalBalance: 1500.50,
          balance: 1200.00,
          pendingBalance: 50.50
        },
        frozen: false,
        walletType: 'principal',
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:25:00Z'
      },
      {
        id: 'wallet_2',
        refName: 'Wallet Secondaire',
        account: {
          id: 'account_1',
          accountName: 'Compte Principal'
        },
        currency: {
          code: 'USD',
          nameFr: 'Dollar Américain',
          symbol: '$'
        },
        balance: {
          totalBalance: 2500.00,
          balance: 2300.00,
          pendingBalance: 100.00
        },
        frozen: false,
        walletType: 'secondary',
        createdAt: '2024-02-01T09:15:00Z',
        updatedAt: '2024-02-10T16:30:00Z'
      }
    ]

    return NextResponse.json({
      success: true,
      message: 'Wallets récupérés avec succès',
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockWallets,
      pagination: {
        page: 1,
        limit: 10,
        total: 2
      }
    })
  } catch (error) {
    console.error('Erreur API wallets:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la récupération des wallets',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      errorCode: 'UNEXPECTED_ERROR'
    }, { status: 500 })
  }
}
