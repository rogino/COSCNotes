# Exam Notes

## Ray

### Wireless & Mobile Networks

Tools:

- `airmon-ng`: set wireless adapter to monitor mode
  - `airmon-ng start {interface_name} {channel_number}`
- `airodump-ng`: capture packets, display AP properties
  - Signal strength, channel number, BSSID, encryption scheme, etc.
- `aireplay-ng`: de-auth and capture re-connection packets
  - Requires wireless adapter with injection mode
- `aircrack-ng`: crack keys
- `airbase-ng`: establishing access point for evil-twin attack
- Pwnagotchi

### IoT

TCP/Thermostat:

- Attacker-controlled gateway server to put devices on different subnets
- DHCP configured to put phone and thermostat on two different subnets
  - Gateway must be used for routing instead of ARP
- `mitmproxy` used to intercept and modify JSON flowing over HTTP

UDP/Smart Lights:

- Cannot intercept and block/modify; send packet immediately afterwards
- Lifx: broadcast packets so visible to all users on the network
- `hexinject` to modify packets and then immediately send them

Bluetooth/Door Lock:

- Ubertooth One for packet capture
- Capture *initial* pairing with victim phone
- Use Crackle to crack: Bluetooth LE 'just works' legacy pairing mode: temporary key of 0 used to derive later keys

### VPN

- OpenVPN
  - TUN (layer 3), TAP (layer 2, Ethernet)
  - `net30`: virtual /30 subnet for each device
  - Clients given IP addresses on a private subnet (e.g. 10.0.0.0)
  - Username/password, static key, or PKI: CA public key, TLS auth key, user private/public keys
- IKEv2/Watchguard
  - ISAKMP: connection setup using UDP/500
  - ESP traffic, or UDP/4500 fallback if blocked by client firewall
  - CA root certificate (self-signed by server), then set up VPN with username/password (RADIUS or Firebox-DB)
  - Configure traffic over VPN tunnel by adding route (matching all traffic) to go through the VPN virtual interface with low metric

### Smart Cards

- Mifare Classic:
  - 16 64 byte sectors; four 16 byte blocks per sector
    - Permissions: 3 logical bits per sector, stored using 6 physical bits. 24 bits per sector, and 2 48-bit keys in sector trailer.
  - Implementation flaws:
   - Parity bits computed over plaintext, sent encrypted
   - Nested authentication: if key for any sector known (common/default key used), can be used in conjunction with timing attack (control PRNG state) to determine 32 bits
   - Attacks available which requires ~300 attempts, even without any known keys

