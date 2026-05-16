export interface BankingDetails {
  bank: string
  accountHolder: string
  accountNumber: string
  branchCode: string
  accountType: string
}

export const BANKING_DETAILS: BankingDetails = {
  bank:          import.meta.env.VITE_BANK_NAME           ?? 'Nedbank',
  accountHolder: import.meta.env.VITE_BANK_ACCOUNT_HOLDER ?? 'SWIFTOP TRADING',
  accountNumber: import.meta.env.VITE_BANK_ACCOUNT_NUMBER ?? '1334154554',
  branchCode:    import.meta.env.VITE_BANK_BRANCH_CODE    ?? '198765',
  accountType:   import.meta.env.VITE_BANK_ACCOUNT_TYPE   ?? 'Current',
}
