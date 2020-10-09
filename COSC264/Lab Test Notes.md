
- First ping to station on the same network slow as ARP request required
- Minimal forwarding table: `0.0.0.0/0` pointing to default gateway

Ping failure modes:

- Network unreachable: no entry in forwarding table
- Destination host unreachable: directly-attached network, ARP fails
- Destination port not reachable: TCP/UDP packet, port not bound
- No response: if routing table of receiver empty