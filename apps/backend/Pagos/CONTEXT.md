# Pagos / MercadoPago context

This migration intentionally keeps the current payment flow stateless.

## Current behavior

- Backend creates MercadoPago preferences through `POST /api/c/pagos/iniciar/` and `/api/pagos/iniciar/`.
- MercadoPago webhook endpoints accept and log notifications at `/api/c/pagos/webhook/` and `/api/pagos/webhook/`.
- Payment response endpoint returns a lightweight status response from return/query parameters.
- Frontend payment routes remain under `/pagos/reserva/:id`.

## Intentional limitations

- No local payment data is persisted.
- No payment models, migrations, or payment tables are created.
- Webhooks are logged but do not update local payment records.
- Local payment history cannot be reconstructed by reference.
- Coupon and receipt URLs remain in the frontend contract, but the stateless backend does not implement persisted coupon usage or PDF receipts.

## Production URLs

```txt
Backend:  https://raiz-viva-backend.vercel.app/
Frontend: https://raiz-viva-frontend.vercel.app/
Webhook:  https://raiz-viva-backend.vercel.app/api/pagos/webhook/
```
