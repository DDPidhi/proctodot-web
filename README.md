# ProctoDot

## Overview

ProctoDot is a decentralized online exam proctoring system built with Next.js, WebRTC, and blockchain technology. It provides secure, transparent, and automated exam monitoring capabilities for remote testing environments.

## Demo

[![ProctoDot Demo Video](./demo.mov)](./demo.mov)

## Features

- Real-time video proctoring with WebRTC
- Blockchain-based exam record keeping via ink! smart contracts
- Student and proctor dashboards
- Wallet integration for identity verification
- End-to-end encrypted communication

## Tech Stack

- **Frontend**: Next.js, TypeScript, React
- **Blockchain**: ink! smart contract on Polkadot
- **WebRTC**: Real-time video streaming
- **Backend**: proctodot-core (Rust)
- **Database**: PostgreSQL via SeaORM

## Setup Instructions

### Prerequisites

- Node.js 18+ and Yarn
- Rust (for contract interaction)
- MetaMask or similar Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd proctodot-web
```

2. Install dependencies:
```bash
yarn install
```

3. Start the development server:
```bash
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
proctodot-web/
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # React components
│   ├── contracts/        # Smart contract ABIs
│   ├── core/            # Core services
│   ├── hooks/           # Custom React hooks
│   └── constants/       # App constants
├── public/              # Static assets
└── package.json         # Dependencies
```

## Available Scripts

- `yarn dev` - Starts the development server
- `yarn build` - Creates a production build
- `yarn start` - Runs the production server
- `yarn lint` - Runs ESLint

## Architecture

ProctoDot consists of three main components:

1. **proctodot-web** (this repository) - Frontend application
2. **proctodot-core** - Backend server handling WebRTC and authentication
3. **proctoink** - ink! smart contract for on-chain exam tracking

## License

[Add license information here]