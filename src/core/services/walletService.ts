import { web3Enable, web3Accounts, web3FromAddress } from '@polkadot/extension-dapp'

export interface WalletAccount {
  address: string
  meta: {
    name?: string
    source: string
  }
}

export class WalletService {
  private static instance: WalletService
  private accounts: WalletAccount[] = []
  private selectedAccount: WalletAccount | null = null
  private extensionEnabled: boolean = false

  private constructor() {}

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService()
    }
    return WalletService.instance
  }

  async connectWallet(appName: string = 'ProctoDot'): Promise<WalletAccount[]> {
    try {
      // Enable the extension
      const extensions = await web3Enable(appName)
      
      if (extensions.length === 0) {
        throw new Error('No extension found. Please install Polkadot{.js} extension.')
      }

      this.extensionEnabled = true

      // Get all accounts
      const accounts = await web3Accounts()
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please create an account in your wallet.')
      }

      this.accounts = accounts
      return accounts
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    }
  }

  async selectAccount(address: string) {
    const account = this.accounts.find(acc => acc.address === address)
    if (!account) {
      throw new Error('Account not found')
    }
    this.selectedAccount = account
    return account
  }

  getSelectedAccount(): WalletAccount | null {
    return this.selectedAccount
  }

  getAccounts(): WalletAccount[] {
    return this.accounts
  }

  async signAndSend(address: string, transaction: any) {
    if (!this.extensionEnabled) {
      throw new Error('Wallet not connected')
    }

    // Get the signer from the extension
    const injector = await web3FromAddress(address)
    
    // Sign and send the transaction
    return transaction.signAndSend(address, { signer: injector.signer })
  }

  disconnect() {
    this.accounts = []
    this.selectedAccount = null
    this.extensionEnabled = false
  }

  isConnected(): boolean {
    return this.extensionEnabled && this.accounts.length > 0
  }
}