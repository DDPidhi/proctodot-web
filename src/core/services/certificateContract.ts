import { getPopNetworkClient, initializeContractSDK } from './popNetwork'

// Define the structure for certificate data
export interface CertificateData {
  studentId: string
  examId: string
  score: number
  timestamp: number
  proctorSignature: string
}

// Certificate contract service for interacting with the deployed ink! contract
export class CertificateContractService {
  private sdk: any
  private contractAddress: string

  constructor(contractAddress: string) {
    this.contractAddress = contractAddress
  }

  // Initialize the SDK with contract metadata
  async initialize(contractMetadata: any) {
    this.sdk = await initializeContractSDK(contractMetadata)
  }

  // Submit exam results to the blockchain
  async submitExamResult(
    studentId: string,
    examId: string,
    score: number,
    proctorAddress: string
  ) {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    const contract = this.sdk.getContract(this.contractAddress)
    
    // Create the certificate data
    const certificateData: CertificateData = {
      studentId,
      examId,
      score,
      timestamp: Date.now(),
      proctorSignature: proctorAddress
    }

    // Dry run the transaction first
    const dryRun = await contract.query('submitCertificate', {
      origin: proctorAddress,
      data: certificateData
    })

    if (dryRun.status === 'success') {
      // Send the actual transaction
      const tx = await contract.send('submitCertificate', {
        origin: proctorAddress,
        data: certificateData
      })

      // Wait for transaction confirmation
      return await tx.signAndSubmit()
    } else {
      throw new Error(`Contract call failed: ${dryRun.error}`)
    }
  }

  // Query certificate by student ID
  async getCertificate(studentId: string) {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    const contract = this.sdk.getContract(this.contractAddress)
    
    const result = await contract.query('getCertificate', {
      data: { studentId }
    })

    if (result.status === 'success') {
      return result.data
    } else {
      throw new Error(`Query failed: ${result.error}`)
    }
  }

  // Verify certificate authenticity
  async verifyCertificate(certificateId: string) {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    const contract = this.sdk.getContract(this.contractAddress)
    
    const result = await contract.query('verifyCertificate', {
      data: { certificateId }
    })

    return result.status === 'success' ? result.data : false
  }

  // Get all certificates for a specific proctor
  async getCertificatesByProctor(proctorAddress: string) {
    if (!this.sdk) {
      throw new Error('SDK not initialized')
    }

    const contract = this.sdk.getContract(this.contractAddress)
    
    const result = await contract.query('getCertificatesByProctor', {
      data: { proctorAddress }
    })

    if (result.status === 'success') {
      return result.data
    } else {
      throw new Error(`Query failed: ${result.error}`)
    }
  }
}

// Create singleton instance
let certificateService: CertificateContractService | null = null

export function getCertificateService(contractAddress?: string): CertificateContractService {
  if (!certificateService && contractAddress) {
    certificateService = new CertificateContractService(contractAddress)
  }
  
  if (!certificateService) {
    throw new Error('Certificate service not initialized')
  }
  
  return certificateService
}