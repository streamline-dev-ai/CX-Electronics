export type PaymentMethodId = 'eft' | 'ozow' | 'yoco' | 'paystack' | 'payfast'

export interface PaymentMethod {
  id: PaymentMethodId
  label: string
  labelZh: string
  description: string
  descriptionZh: string
  enabled: boolean
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'eft',
    label: 'EFT / Bank Transfer',
    labelZh: '银行转账',
    description: 'Pay via instant EFT from your banking app. We confirm payment manually within trading hours (Mon–Sun 09:00–15:00).',
    descriptionZh: '通过银行应用程序进行即时电子转账。我们在营业时间内手动确认付款（每天 09:00–15:00）。',
    enabled: true,
  },
  {
    id: 'ozow',
    label: 'Instant EFT (Ozow)',
    labelZh: '即时电子转账 (Ozow)',
    description: 'Real-time bank-to-bank payment. Confirms automatically.',
    descriptionZh: '实时银行付款，自动确认。',
    enabled: false,
  },
  {
    id: 'yoco',
    label: 'Card Payment (Yoco)',
    labelZh: '银行卡支付 (Yoco)',
    description: 'Pay by credit or debit card.',
    descriptionZh: '使用信用卡或借记卡付款。',
    enabled: false,
  },
  {
    id: 'paystack',
    label: 'Card / Apple Pay (Paystack)',
    labelZh: '银行卡 / Apple Pay (Paystack)',
    description: 'Card, Apple Pay, or mobile money via Paystack.',
    descriptionZh: '通过 Paystack 使用银行卡、Apple Pay 或移动支付。',
    enabled: false,
  },
  {
    id: 'payfast',
    label: 'PayFast',
    labelZh: 'PayFast',
    description: 'Card or instant EFT via PayFast.',
    descriptionZh: '通过 PayFast 使用银行卡或即时电子转账。',
    enabled: false,
  },
]

export function getEnabledPaymentMethods(): PaymentMethod[] {
  return PAYMENT_METHODS.filter((m) => m.enabled)
}

export function getPaymentMethod(id: PaymentMethodId): PaymentMethod | undefined {
  return PAYMENT_METHODS.find((m) => m.id === id)
}
