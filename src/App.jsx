import React, { useState, useEffect, useCallback } from "react";
import { createLibp2p } from "libp2p";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { noise } from "@chainsafe/libp2p-noise";
import { yamux } from "@chainsafe/libp2p-yamux";
import { circuitRelayTransport } from "@libp2p/circuit-relay-v2";
import { dcutr } from "@libp2p/dcutr";
import { identify } from "@libp2p/identify";
import { webRTC } from "@libp2p/webrtc";
import { webSockets } from "@libp2p/websockets";
import * as filters from "@libp2p/websockets/filters";
import { multiaddr } from "@multiformats/multiaddr";
import { fromString, toString } from "uint8arrays";
import "./App.css";

function App() {
  const [libp2p, setLibp2p] = useState(null);
  const [peerId, setPeerId] = useState("");
  const [dialMultiaddr, setDialMultiaddr] = useState("");
  const [subscribeTopic, setSubscribeTopic] = useState("");
  const [message, setMessage] = useState("");
  const [output, setOutput] = useState([]);
  const [listeningAddresses, setListeningAddresses] = useState([]);
  const [connectedPeers, setConnectedPeers] = useState([]);
  const [topicPeers, setTopicPeers] = useState([]);

  const appendOutput = useCallback((line) => {
    setOutput((prev) => [...prev, line]);
  }, []);

  useEffect(() => {
    const initLibp2p = async () => {
      const node = await createLibp2p({
        addresses: {
          listen: ["/webrtc"],
        },
        transports: [
          webSockets({
            filter: filters.all,
          }),
          webRTC(),
          circuitRelayTransport({
            discoverRelays: 1,
          }),
        ],
        connectionEncryption: [noise()],
        streamMuxers: [yamux()],
        connectionGater: {
          denyDialMultiaddr: () => false,
        },
        services: {
          identify: identify(),
          pubsub: gossipsub(),
          dcutr: dcutr(),
        },
        connectionManager: {
          minConnections: 0,
        },
      });

      setLibp2p(node);
      setPeerId(node.peerId.toString());

      node.addEventListener("self:peer:update", () => {
        setListeningAddresses(node.getMultiaddrs().map((ma) => ma.toString()));
      });

      const updatePeerList = () => {
        setConnectedPeers(node.getPeers());
      };

      node.addEventListener("connection:open", updatePeerList);
      node.addEventListener("connection:close", updatePeerList);

      node.services.pubsub.addEventListener("message", (event) => {
        const topic = event.detail.topic;
        const message = toString(event.detail.data);
        appendOutput(`Message received on topic '${topic}': ${message}`);
      });
    };

    initLibp2p();
  }, [appendOutput]);

  const handleDial = async () => {
    if (!libp2p) return;
    try {
      const ma = multiaddr(dialMultiaddr);
      appendOutput(`Dialing '${ma}'`);

      // Ensure the multiaddr includes the '/p2p/' protocol
      if (!ma.toString().includes("/p2p/")) {
        throw new Error(
          "Multiaddr must include a peer ID (e.g., /p2p/QmHash...)"
        );
      }

      await libp2p.dial(ma);
      appendOutput(`Connected to '${ma}'`);
    } catch (error) {
      appendOutput(`Error dialing: ${error.message}`);
      console.error("Detailed error:", error);

      // Additional error information
      if (error.code) {
        appendOutput(`Error code: ${error.code}`);
      }
      if (error.errno) {
        appendOutput(`Error number: ${error.errno}`);
      }
      if (error.syscall) {
        appendOutput(`System call: ${error.syscall}`);
      }
    }
  };

  const handleSubscribe = () => {
    if (!libp2p || !subscribeTopic) return;
    libp2p.services.pubsub.subscribe(subscribeTopic);
    appendOutput(`Subscribed to '${subscribeTopic}'`);
  };

  const handleSendMessage = async () => {
    if (!libp2p || !subscribeTopic || !message) return;
    try {
      await libp2p.services.pubsub.publish(subscribeTopic, fromString(message));
      appendOutput(`Sent message to '${subscribeTopic}': ${message}`);
      setMessage("");
    } catch (error) {
      appendOutput(`Error sending message: ${error.message}`);
    }
  };

  useEffect(() => {
    if (!libp2p || !subscribeTopic) return;
    const interval = setInterval(() => {
      setTopicPeers(libp2p.services.pubsub.getSubscribers(subscribeTopic));
    }, 1000);
    return () => clearInterval(interval);
  }, [libp2p, subscribeTopic]);

  return (
    <div className="App">
      <h1>libp2p React PubSub Example</h1>
      <div className="section">
        <h2>Node</h2>
        <p>PeerId: {peerId}</p>
        <div>
          <input
            type="text"
            value={dialMultiaddr}
            onChange={(e) => setDialMultiaddr(e.target.value)}
            placeholder="Multiaddr to dial (e.g., /ip4/127.0.0.1/tcp/40975/ws/p2p/12D3KooW...)"
          />
          <button onClick={handleDial}>Connect</button>
        </div>
      </div>
      <div className="section">
        <h2>PubSub</h2>
        <div>
          <input
            type="text"
            value={subscribeTopic}
            onChange={(e) => setSubscribeTopic(e.target.value)}
            placeholder="Topic to subscribe"
          />
          <button onClick={handleSubscribe}>Subscribe</button>
        </div>
        <div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message to send"
          />
          <button onClick={handleSendMessage}>Send Message</button>
        </div>
      </div>
      <div className="section">
        <h2>Listening Addresses</h2>
        <ul>
          {listeningAddresses.map((addr, index) => (
            <li key={index}>{addr}</li>
          ))}
        </ul>
      </div>
      <div className="section">
        <h2>Connected Peers</h2>
        <ul>
          {connectedPeers.map((peer, index) => (
            <li key={index}>{peer.toString()}</li>
          ))}
        </ul>
      </div>
      <div className="section">
        <h2>Topic Peers</h2>
        <ul>
          {topicPeers.map((peer, index) => (
            <li key={index}>{peer.toString()}</li>
          ))}
        </ul>
      </div>
      <div className="section">
        <h2>Output</h2>
        <pre>
          {output.map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </pre>
      </div>
    </div>
  );
}

export default App;
