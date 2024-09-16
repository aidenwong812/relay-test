# Decentralized Chat POC/MVP React and libp2p

This is a Proof of Concept (POC) / Minimum Viable Product (MVP) of a decentralized chat application built using **React.js**, **libp2p**, and **Vite**. The chat allows peer-to-peer (P2P) communication without relying on a central server.

## Features

- Decentralized peer-to-peer messaging
- Built using libp2p for communication
- Real-time messaging with multiple peers
- Lightweight frontend with Vite.js

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)

### Installation

1. Clone the repository to your local machine:

    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Install the required dependencies:

    ```bash
    npm install
    ```

### Running the Relay Server

To allow peers to communicate, you first need to start a relay server:

1. Run the relay server:

    ```bash
    node relay.js
    ```

2. You will see an array of multiaddresses printed in the terminal. These are the addresses peers will use to connect to the relay.

### Running the UI

1. Start the development server for the chat UI:

    ```bash
    npm run dev
    ```

2. Open the app in your browser. The default URL is typically [http://localhost:5173](http://localhost:5173).

or you can go to 
https://libp2p-react-poc-vitejs-q1bb.vercel.app/

### Connecting Peers

1. In the UI, there is an input field labeled **"Multiadd to Dial"**. Copy one of the multiaddresses from the relay server and paste it into this input field, then click **"Connect"**.

2. Once connected, you will see your **"Listening Address"** in the **Listening Addresses** component. Copy this address.

3. Open another browser window (you do not need a new terminal, just a new window for the UI) and paste the **Listening Address** into the input field of the second instance of the app, then click **"Connect"**.

4. After both peers are connected, subscribe to a topic on both windows, and you can start exchanging messages.



# Example Workflow

- Run `node relay.js` in one terminal.
- Open another terminal and start the UI by running `npm run dev`.
- Copy the multiaddress from `relay.js` output and use it to connect in the UI.
- Open a second browser window, paste the **Listening Address** from the first peer, and connect.
- Once connected, subscribe to the same topic in both windows, and start chatting!

## Tech Stack

- **React.js** for building the frontend
- **libp2p** for decentralized peer-to-peer communication
- **Vite** for fast, lightweight development server and build process