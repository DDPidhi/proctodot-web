import { getPopNetworkClient, initializeContractSDK } from './popNetwork'
import proctorinkMetadata from '../../contracts/proctoink.json'

// Interface for exam metadata
export interface ExamMetadata {
  startTime?: number | null
  endTime?: number | null
  violations: (number | null)[]
  kicked: boolean
}

// Proctoink contract service for interacting with the deployed ink! contract
export class ProctorinkContractService {
  private sdk: any
  private contractAddress: string
  private initialized: boolean = false

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress
  }

  // Initialize the SDK with contract metadata
  async initialize() {
    if (!this.initialized) {
      this.sdk = await initializeContractSDK(proctorinkMetadata)
      this.initialized = true
    }
  }

  // Set exam start time for a user
  async setStartTime(userAddress: string, startTime: number, proctorAddress: string) {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    const contract = this.sdk.getContract(this.contractAddress)
    
    // Dry run the transaction first
    const dryRun = await contract.query('set_start', {
      origin: proctorAddress,
      args: [userAddress, startTime]
    })

    if (dryRun.isOk) {
      // Send the actual transaction
      const tx = await contract.tx.set_start(userAddress, startTime, {
        origin: proctorAddress
      })

      // This will need to be signed with the wallet
      return tx
    } else {
      throw new Error(`Contract call failed: ${dryRun.asErr}`)
    }
  }

  // Set exam end time for a user
  async setEndTime(userAddress: string, endTime: number, proctorAddress: string) {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    const contract = this.sdk.getContract(this.contractAddress)
    
    // Dry run the transaction first
    const dryRun = await contract.query('set_end', {
      origin: proctorAddress,
      args: [userAddress, endTime]
    })

    if (dryRun.isOk) {
      // Send the actual transaction
      const tx = await contract.tx.set_end(userAddress, endTime, {
        origin: proctorAddress
      })

      // This will need to be signed with the wallet
      return tx
    } else {
      throw new Error(`Contract call failed: ${dryRun.asErr}`)
    }
  }

  // Add a violation for a user
  async addViolation(userAddress: string, violationTime: number, proctorAddress: string) {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    const contract = this.sdk.getContract(this.contractAddress)
    
    // Dry run the transaction first
    const dryRun = await contract.query('add_violation', {
      origin: proctorAddress,
      data: [userAddress, violationTime]
    })

    if (dryRun.status === 'success') {
      // Send the actual transaction
      const tx = await contract.send('add_violation', {
        origin: proctorAddress,
        data: [userAddress, violationTime]
      })

      // Wait for transaction confirmation
      return await tx.signAndSubmit()
    } else {
      throw new Error(`Contract call failed: ${dryRun.error}`)
    }
  }

  // Get start time for a user
  async getStartTime(userAddress: string) {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    const contract = this.sdk.getContract(this.contractAddress)
    
    const result = await contract.query('get_start_time', {
      data: [userAddress]
    })

    if (result.status === 'success') {
      return result.data
    } else {
      throw new Error(`Query failed: ${result.error}`)
    }
  }

  // Get end time for a user
  async getEndTime(userAddress: string) {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    const contract = this.sdk.getContract(this.contractAddress)
    
    const result = await contract.query('get_end_time', {
      data: [userAddress]
    })

    if (result.status === 'success') {
      return result.data
    } else {
      throw new Error(`Query failed: ${result.error}`)
    }
  }

  // Get violation times for a user
  async getViolationTimes(userAddress: string) {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    const contract = this.sdk.getContract(this.contractAddress)
    
    const result = await contract.query('get_violation_times', {
      data: [userAddress]
    })

    if (result.status === 'success') {
      return result.data
    } else {
      throw new Error(`Query failed: ${result.error}`)
    }
  }

  // Check if user is kicked
  async isKicked(userAddress: string) {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    const contract = this.sdk.getContract(this.contractAddress)
    
    const result = await contract.query('is_kicked', {
      data: [userAddress]
    })

    if (result.status === 'success') {
      return result.data
    } else {
      throw new Error(`Query failed: ${result.error}`)
    }
  }

  // Get all exam metadata for a user
  async getExamMetadata(userAddress: string): Promise<ExamMetadata> {
    const [startTime, endTime, violations, kicked] = await Promise.all([
      this.getStartTime(userAddress),
      this.getEndTime(userAddress),
      this.getViolationTimes(userAddress),
      this.isKicked(userAddress)
    ])

    return {
      startTime,
      endTime,
      violations,
      kicked
    }
  }
}

// Create singleton instance
let proctorinkService: ProctorinkContractService | null = null

export function getProctorinkService(contractAddress?: string): ProctorinkContractService {
  if (!proctorinkService && contractAddress) {
    proctorinkService = new ProctorinkContractService(contractAddress)
  }
  
  if (!proctorinkService) {
    throw new Error('Proctorink service not initialized')
  }
  
  return proctorinkService
}