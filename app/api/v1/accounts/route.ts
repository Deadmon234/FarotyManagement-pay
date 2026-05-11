import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Mock data for development
    const mockAccounts = [
      {
        id: 'account_1',
        accountName: 'Compte Principal',
        accountSubName: 'Compte Principal EUR',
        accountMode: 'standard',
        frozen: false,
        country: {
          code: 'FR',
          nameFr: 'France'
        },
        createdAt: '2024-01-10T08:00:00Z',
        updatedAt: '2024-01-20T16:30:00Z',
        walletsCount: 2,
        transactionsCount: 45,
        accountPaymentMethodsCount: 3,
        webhooksCount: 1,
        suspiciousActivitiesCount: 0,
        publicKey: 'pk_live_1234567890abcdef1234567890abcdef1234567890abcdef',
        twoFactorEnabled: true,
        lastLogin: '2024-01-20T14:25:00Z',
        webhookUrl: 'https://webhook.faroty.me/account1',
        webhookActive: true,
        webhookEvents: ['payment.created', 'payment.completed', 'account.updated']
      }
    ]

    return NextResponse.json({
      success: true,
      message: 'Comptes récupérés avec succès',
      statusCode: 200,
      timestamp: new Date().toISOString(),
      data: mockAccounts,
      pagination: {
        page: 1,
        limit: 10,
        total: 1
      }
    })
  } catch (error) {
    console.error('Erreur API accounts:', error)
    return NextResponse.json({
      success: false,
      message: 'Erreur lors de la récupération des comptes',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      errorCode: 'UNEXPECTED_ERROR'
    }, { status: 500 })
  }
}
