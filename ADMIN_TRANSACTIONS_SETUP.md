# Configuration des Transactions Admin Faroty Pay

## Vue d'ensemble
Un système complet de gestion des transactions admin a été intégré dans l'application de paiement. Celui-ci se connecte à l'API Faroty Pay Production pour afficher les transactions en temps réel.

## Fichiers créés

### 1. Service: `/lib/admin-transaction-service.ts`
- **Rôle**: Gérer la communication avec l'API admin Faroty Pay
- **API**: `https://api-pay-prod.faroty.me/payments/api/v1/admin/transactions`
- **Fonctionnalités**:
  - Récupération des transactions avec pagination
  - Filtrage par statut (SUCCESSFUL, PENDING, FAILED, REFUNDED, CANCELLED)
  - Filtrage par type (DEPOSIT, WITHDRAWAL, TRANSFER)
  - Filtrage par compte et plage de dates
  - Calcul des statistiques (totaux, frais, etc.)

### 2. Composant: `/components/AdminTransactionTable.tsx`
- **Rôle**: Afficher les transactions admin dans un tableau interactif
- **Fonctionnalités**:
  - Tableau responsive avec colonnes: Référence, Compte, Type, Montant, Frais, Statut, Méthode, Date
  - Filtrage par statut et type via dropdowns
  - Recherche en temps réel par référence, ID, compte ou payeur
  - Pagination avec navigation Précédent/Suivant
  - Affichage formaté des montants (XAF, XOF, EUR, USD)
  - Icônes et badges de couleur pour les statuts
  - Logos des méthodes de paiement
  - Actualisation manuelle et automatique (optionnelle)
  - Loading states et gestion des erreurs

### 3. Intégration: Page `/app/payment/page.tsx`
- Section "Transactions" de la page de paiement
- Le composant `AdminTransactionTable` s'affiche sous l'historique local
- Configuration par défaut:
  - 20 transactions par page
  - Actualisation automatique toutes les 60 secondes
  - Affichage immédiat des données récupérées

## Structure des données

### Réponse API
```json
{
  "success": true,
  "message": "Transactions récupérées avec succès",
  "statusCode": 200,
  "timestamp": "2026-05-11T09:44:37.951090467",
  "data": {
    "content": [...],        // Tableau des transactions
    "page": 0,               // Numéro de page (0-indexed)
    "size": 20,              // Nombre d'éléments par page
    "totalElements": 2042,   // Nombre total de transactions
    "totalPages": 103,       // Nombre total de pages
    "last": false,           // Dernière page?
    "first": true,           // Première page?
    "hasNext": true          // Page suivante existe?
  }
}
```

### Transaction
```json
{
  "transaction": {
    "transactionId": "9377dc2f-921a-4e0d-9a78-71a50f634451",
    "reference": "TXN_1778484638010_tjT91VZARiI",
    "status": "SUCCESSFUL",        // SUCCESSFUL, PENDING, FAILED, REFUNDED, CANCELLED
    "type": "DEPOSIT",             // DEPOSIT, WITHDRAWAL, TRANSFER
    "amount": 100.00,
    "netAmount": 98.00,
    "currency": "XAF",
    "payerId": "697636339",
    "createdAt": "2026-05-11T08:30:38.00998+01:00",
    "updatedAt": "2026-05-11T08:31:03.717866+01:00",
    "paymentMethod": "OM",
    "paymentMethodInfo": {
      "id": "28825b64-69e7-49cc-901e-4bcb7da44f10",
      "name": "Orange Money",
      "slug": "OM",
      "technicalName": "orange_money_cm",
      "logoUrl": "https://..."
    }
  },
  "account": {
    "id": "24738a5b-dd35-4d3e-bc06-8a9a973dd741",
    "userId": "abb40122-a10f-4bb6-b606-8681a4a38938",
    "accountName": "AssoPerso",
    "countryCode": "CM"
  },
  "fees": 2.00,
  "totalFeeRate": 2.00,
  "accountFeeRate": 0.00,
  "walletFeeRate": 2.00,
  "paymentMethodFeeRate": 0.00
}
```

## Authentification

**En-tête requis**:
```
X-api-key: fk_live_Qbtr6Cv-s91sQ7rdz7ii2HcPs7rF8b8qE81w_pPzYi5oW5L8thU4kVTgOzQdYF31X8R2B5U6sHk
```

⚠️ **Sécurité**: La clé API est actuellement stockée dans `admin-transaction-service.ts`. 
Pour la production, déplacez-la vers une variable d'environnement:

```bash
# .env.local
NEXT_PUBLIC_FAROTY_API_KEY=fk_live_Qbtr6Cv-s91sQ7rdz7ii2HcPs7rF8b8qE81w_pPzYi5oW5L8thU4kVTgOzQdYF31X8R2B5U6sHk
```

## Utilisation

### Dans la page Payment
```tsx
<AdminTransactionTable 
  limit={20}              // Transactions par page
  autoRefresh={true}      // Actualisation automatique
  refreshInterval={60000} // Intervalle en ms
/>
```

### Directement dans un composant
```tsx
import AdminTransactionTable from '@/components/AdminTransactionTable'

export default function MyComponent() {
  return <AdminTransactionTable limit={50} autoRefresh={false} />
}
```

### Utiliser le service
```tsx
import { AdminTransactionService } from '@/lib/admin-transaction-service'

const response = await AdminTransactionService.getTransactions(0, 20)
const stats = AdminTransactionService.getStatistics(response.data.content)
const successful = AdminTransactionService.filterByStatus(response.data.content, 'SUCCESSFUL')
```

## Statuts de transactions

| Statut | Couleur | Signification |
|--------|---------|---------------|
| SUCCESSFUL | Vert ✓ | Transaction réussie |
| PENDING | Ambre ⏳ | En attente de traitement |
| FAILED | Rouge ✗ | Échec de la transaction |
| REFUNDED | Bleu ↻ | Transaction remboursée |
| CANCELLED | Gris ⊘ | Transaction annulée |

## Types de transactions

| Type | Icône | Signification |
|------|-------|---------------|
| DEPOSIT | ⬇ | Dépôt d'argent |
| WITHDRAWAL | ⬆ | Retrait d'argent |
| TRANSFER | ↔ | Transfert entre comptes |

## Méthodes de paiement supportées

- **OM** - Orange Money
- **MOMO** - MTN Mobile Money
- **CARD** - Carte bancaire (Stripe)
- Et autres méthodes selon la configuration

## Fonctionnalités du composant

### ✅ Filtrages
- **Par statut**: Dropdown avec 5 options + tous
- **Par type**: Dropdown avec 3 options + tous
- **Recherche**: Texte libre sur référence, ID, compte, payeur

### ✅ Pagination
- Navigation Précédent/Suivant
- Affichage du numéro de page actuelle
- Affichage du nombre total de transactions

### ✅ Affichage
- Logos des méthodes de paiement
- Informations du compte (nom, code pays)
- Montants brut et net
- Taux de frais par catégorie
- Dates formatées en français

### ✅ Interactions
- Actualisation manuelle au clic
- Actualisation automatique optionnelle
- États de chargement et erreurs
- Responsive sur mobile

## Optimisations futures

1. **Cache côté client** - Mémoriser les résultats pour éviter les requêtes répétées
2. **Export CSV/Excel** - Permettre l'export des transactions
3. **Graphiques** - Visualiser les tendances des transactions
4. **Webhooks** - Notifications en temps réel des nouvelles transactions
5. **Alertes** - Notifier les anomalies ou montants importants
6. **Audit trail** - Enregistrer les actions de consultation

## Troubleshooting

### Erreur 401 - Clé API invalide
- Vérifiez que la clé API est correcte
- Vérifiez que l'en-tête `X-api-key` est bien défini
- Assurez-vous que la clé n'a pas d'espaces

### Pas de données affichées
- Vérifiez la connexion réseau
- Vérifiez la console du navigateur pour les erreurs CORS
- L'API peut ne pas avoir de transactions disponibles

### Performance lente
- Réduisez le nombre de transactions par page (limit)
- Désactivez l'actualisation automatique si inutile
- Utilisez les filtres pour restreindre les résultats

## Tests

Pour tester l'API manuellement:
```bash
curl -X GET "https://api-pay-prod.faroty.me/payments/api/v1/admin/transactions" \
  -H "X-api-key: fk_live_Qbtr6Cv-s91sQ7rdz7ii2HcPs7rF8b8qE81w_pPzYi5oW5L8thU4kVTgOzQdYF31X8R2B5U6sHk"
```

## Documentation API
- **Base URL**: `https://api-pay-prod.faroty.me/payments/api/v1/admin`
- **Endpoint**: `/transactions`
- **Méthode**: GET
- **Paramètres**: `page`, `size`
- **Authentification**: Header `X-api-key`
