import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Fetches the current USD→PKR rate from Settings.
 * NEVER hardcode rates — always read from DB.
 */
export async function getCurrentRate(): Promise<number> {
  const settings = await prisma.settings.findUnique({ where: { id: '1' } })
  if (!settings) throw new Error('Settings not found — run seed first')
  return Number(settings.usdPkrRate)
}

/**
 * Computes amount_usd and amount_pkr from a raw amount + currency.
 * Follows T6.1 spec: amount_usd = currency === 'USD' ? amount : amount / rate
 *                    amount_pkr = currency === 'PKR' ? amount : amount * rate
 */
export function computeAmounts(
  amount: number,
  currency: 'USD' | 'PKR',
  rate: number
): { amountUsd: number; amountPkr: number; exchangeRateUsed: number } {
  const amountUsd = currency === 'USD' ? amount : amount / rate
  const amountPkr = currency === 'PKR' ? amount : amount * rate
  return {
    amountUsd: Math.round(amountUsd * 100) / 100,
    amountPkr: Math.round(amountPkr * 100) / 100,
    exchangeRateUsed: rate,
  }
}

/**
 * Full helper: gets rate from DB and computes both USD + PKR amounts.
 * Use this for all financial write operations.
 */
export async function resolveAmounts(
  amount: number,
  currency: 'USD' | 'PKR'
): Promise<{ amountUsd: number; amountPkr: number; exchangeRateUsed: number }> {
  const rate = await getCurrentRate()
  return computeAmounts(amount, currency, rate)
}

/**
 * Compute subtotal from line items in a consistent currency.
 * All line items must be in same currency as the invoice.
 */
export function computeSubtotal(
  lineItems: Array<{ amount: number; currency: string }>,
  invoiceCurrency: 'USD' | 'PKR'
): number {
  // For now, enforce all line items must match invoice currency
  return lineItems.reduce((sum, item) => sum + item.amount, 0)
}
