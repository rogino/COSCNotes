### Distance-Vector

Periodically send $D_n$, $n$'s estimates of the least cost path to all nodes in the networks: $D_x(y) = min([C(x, v) + D_v(y) \mbox{ for } v \mbox{ in } neighbours(x)])$

Poisoned reverse: if $x$ routes to $z$ through $y$, $x$ will say that $D_x(z) = \infty$, ensuring $y$ will not route to $z$ through $x$ if the link cost changes. This reduces the time to converge when link cost increases.

#### RIP

- Metric: number of hops (number of subsets traversed())

- Max path cost: 15
- DVs sent to neighbours every 30 seconds via UDP
  - Each advertisement contains at max 25 entries

- Table stores destination network, next hop and number of hops
- After 3 minutes of no advertisements, node declared dead

### Link-State (Dijkstra)

Each router reliably floods information about its neighbours and independently calculates the least-cost path to every other router.

Add nearest node not in tree to the tree, calculate distance to each neighbour through the node.

### OSPF

- Authenticated advertisements over IP (not UDP/TCP)
- Multiple same-cost paths allowed
- Link cost can be set by administrators
- Uni/multi/broadcast support
- Used mostly in upper-tier ISPs

##### Hierarchy

- Can be configured into areas. Each area runs OSPF:
  - Broadcasts only within the same area
  - Each node has detailed topology about its own area
  - Inter-area routing through area-border routers
    - 'Summarizes' distance to networks in its own area
- One backbone area which connects all areas
- Boundary routers connect to other ASes

## IPv6

-  Version (4): 6
- Traffic class (8): QoS
- Flow label (20): identifier for a group of packets
- Payload length (16): size of data in bytes
- Next header (8): payload type (e.g. UDP, TCP)
- Hop limit (8): TTL
- Source/Destination: 128 bytes each

When forwarding packet through IPv4 router:

- Dual stack: transform to IPv4, lose metadata
- Tunnelling: stuff IPv6 packet into IPV4

## BGP

Pairs of routers, either in the same (iBGP) or different AS (eBGP), exchange information over TCP. If a node advertises a prefix, it promises that it can forward datagrams to the prefix. Some attributes:

- `AS_PATH`: not updated in iBGP connections. Contains a list of ASes through which the advertisement has passed - reject if already in the path
- `NEXT_HOP`: not updated in iBGP connections. Advertisements flow from the destination outwards, so it contains the address of the boundary router for the next-hop AS

Import policy used to accept/reject advertisements.

Route selection uses local preference (policy decision), shortest `AS_PATH`, closest `NEXT_HOP` router etc.

## Reliable Data Transfer

### Internet checksum:

```python
def ones_complement_addition(shorts):
  result = 0
  for short in shorts:
    result += short
    if result > 0xFFFF:
      result -= 0xFFFF
  return result

def checksum(shorts):
  return 0xFFFF - ones_complement_addition(shorts)

def check_checksum(shorts, checksum):
  return 0xFFFF == (ones_complement_addition(shorts) + checksum)
```

#### CRC

- `d` data bits and `r` checksum appended to the end.
- Agreed-upon `r+1` bit pattern, with MSB being `1`
- To find `r`: Initially set `r` to `0`, do long division (XOR) and get remainder
- Can detect consecutive bit errors up to `r` bits long.

## RDT

1.0: no bit errors, buffer overflows, out-of-order packets, packet loss

2.0: bit errors; checksum. Stop and wait for ACK/NACK after each packet

2.1: 1-bit sequence numbers in case ACK/NACK corrupted

2.2: No NACK. Sends ACK with sequence number - last packet that was received successfully

3.0: bit errors and lost packets. Assumes packets are not reordered in the channel (although this can be solved by having a time to live and sufficiently large sequence space)

### Go-Back-*N*

No more than *N* unacknowledged packets. Receiver sends cumulative ACK. On timeout, all packets reset

#### Selective Repeat

An ACK for each packet.

On timeout, resend oldest packet without ACK. If duplicate packet received, send ACK for that packet again.

Worst case scenario:

- All but the first packet in the window arrives. ACKs arrive
- First packet resent, ACK lost
- Receiver window moves forward by $N - 1$ sender does not move
  - Sender window is $[base, base + N - 1]$
  - Receiver window is $[base + N, base + 2N - 1]$
- Sender sends first packet again

To prevent this from being interpreted as a new packet, the sender base number must not be in the receiver window. Hence, the window size must be larger than $2N - 1$.

## UDP and TCP

### UDP

```
|   16 bits   |      16 bits     |
| Source port | Destination port |
|   Length    |     Checksum     |
|              Data              |
```

Identified by destination port and IP,

### TCP

```
| 16 bits     | 16 bits           |
| Source port | Destination port  |
|         Sequence Number         |
|      Acknowledgement Number     |
| Flags       | Receive window    |
| Checksum    | Urg. data pointer |
|     Options (variable)          |
|        Application Data         |
```

- Sequence number: byte number for first byte in segment
- Acknowledgement: next expected byte number
- Flags starts with 4-bit header length - bytes in header divided by 4
- `LastByteSent - LastByteACKed <= min(CongestionWindow, RecvWindow)`

#### Handshake and Termination

Segments with `SYN` or `FIN` treated as if they have a 1 byte payload

Three-way handshake:

1. Client sends TCP SYN segment
2. Server replies with SYNACK: `ack = client_isn + 1`
3. Client replies with ACK: `ack = server_isn + 1, sequence_number = client_isn + 1`

Termination:

1. Client sends `FIN`
2. Server responds with `ACK`
3. Once connection closed, server sends `FIN` 
4. Client responds with `ACK`, waiting twice the max segment lifespan to ensure the ACK arrived

#### Acknowledgements

ACK: **largest byte received** (cumulative ACK)

Sender events:

- One retransmission timer timer
- If timer expires, resend oldest unacknowledged packet
  - Double timeout and restart timer
- When ACK received, restart timer (if received ACK is not for base packet)
- Fast retransmit: if three ACKs with the same segment number received, retransmit it immediately

Receiver events:

- If in-order segment arrives, wait 500 ms. If another in-order segment arrives in this window, send the ACK immediately
- If out-of-order packet arrives, buffer and send duplicate ACK

Timeout value requires finding round trip time: use exponential weighted moving average

- $EstimatedRTT = EstimatedRTT (1 - \alpha) + SampleRTT * \alpha$
- $DevRTT = devRTT (1 - \beta) + \beta|SampleRTT - EstimatedRTT|$
- $\alpha \approx 0.125, \beta \approx 0.25$
- $Timeout = EstimatedRTT + 4 * DevRTT$

#### Flow control

- Send receive window - amount of free space in buffer
- If receive window 0, need to periodically send TCP segment

#### Congestion Control

Overflowing router buffers

Slow start:

- Congestion window = 1 MSS (1 segment per RTT)
- Double window every RTT (increment by one after every ACK)

AIMD (after first loss):

- Increase by 1 after every RTT (window += 1/window)
- Half after every loss

After 3 duplicate ACKs, half window and move to AIMD

After timeout, slow start until it reaches half of window size before timeout. Then move to AIMD

`LastByteSent - LastByteAcked <= min(CongestionWindow, ReceiveWindow)`

### Lab 4

- First ping to station on the same network slow as ARP request required
- Minimal forwarding table: `0.0.0.0/0` pointing to default gateway

Ping failure modes:

- Network unreachable: no entry in forwarding table
- Destination host unreachable: directly-attached network, ARP fails
- Destination port not reachable: TCP/UDP packet, port not bound
- No response: if routing table of receiver empty

ASes:

- Stub: leaf node connected to single AS
- Multihomed: connected to multiple ASes
- Transit: multihomed but traffic can path through