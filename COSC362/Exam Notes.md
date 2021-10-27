# COSC362 Exam Notes

CIA: Confidentiality, Integrity, Availability

## Maths

Groups:

- One binary operation
- Four properties:
  - Closure: $a \cdot b \in \mathbb{G}$
  - Identity: element $1$ such that $a \cdot 1 = a$
  - Inverse: all elements have inverse
  - Associativity: $(a \cdot b) \cdot c = a \cdot (b \cdot c)$
- **Abelian** group:
  - Additionally commutative: $a \cdot b = b \cdot a$
- Order:
  - of a group: number of elements in a group
  - for $g$ in $\mathbb{G}$, $|g|$ is smallest integer such that $g^k = 1$
  - $g$ generator if $| g | = |\mathbb{G}|$; group *cyclic* if it has a generator

Finding Generators:

- $\mathbb{Z}_n^* = \mathbb{Z}_n \backslash \{0\}$
- Primes: to find a generator of $\mathbb{Z}^*_p$:
  - Use Lagrange theorem; order of any element must exactly divide $p - 1$
  - Compute all distinct prime factors $f_1, f_2, \dots, f_r$ of $p - 1$
  - $g$ is a generator iff $g^\frac{p - 1}{f_i} \neq 1 \pmod p$ for all $i = 1, 2, \dots, r$
- Composite: brute force. Find $\mathbb{Z}_n^*$, iterate through all values of the group raised to powers up to $|\mathbb{Z}_n^*|$

Field $\mathbb{F}$: set with two operations:

- Abelian group for $+$ with identity $0$
- $\mathbb{F} \backslash \{ 0 \}$ abelian for $\cdot$ with identity $1$
- Distributivity: $a \cdot (b + c) = (a \cdot b) + (a \cdot c)$
- Finite field: field where operations use modular arithmetic

Chinese Remainder Theorem:

- Relatively prime $p$, $q$
- Given integers $c_1$ and $c_2$ there exists a unique integer $0 \le x \lt pq$ such that:

    $$
    \begin{aligned}
    x &\equiv c_1 \pmod p \\
    x &\equiv c_2 \pmod q
    \end{aligned}
    $$
- Solution:

    $$
    x \equiv qc_1(q^{-1} \pmod p) + pc_2(p^{-1} \pmod q) \pmod{pq}
    $$

Euler function:

- $\phi(n)$: number of integers smaller and relatively prime to $n$
- $\phi(p) = p - 1$ for prime $p$.
- For integer $n$ with prime divisors $p_i^{e_i}$:

    $$
    \phi(n) = \prod_{i = 1}^{t}{p_i^{e_i - 1}(p_i - 1)}
    $$

- Euler's Theorem: for relatively prime $a$ and $n$:

    $$
    a^{\phi(n)} \bmod n = 1
    $$

Fermat Primality Test:

- Uses Fermat's little theorem: if $a^{n - 1} \bmod n \neq 1$ for $1 < a < n - 1$, $a$ an $n$ are not co-prime and hence $n$ cannot be prime
- Repeat with multiple values of $a$ (e.g. known small primes); return *probable prime* if all return $1$
- Reduce powers using:
  - $ab \bmod n = (a \bmod n)(b \bmod n) \bmod n$
  - $(a^m)^k \bmod n = (a^m \bmod n)^k \bmod n$
- *Carmichael numbers*: composite numbers that are always found to be *probable primes* by the Fermat primality test

Miller-Rabin test:

- Only for odd $n$
- Pick odd $u$ and any integer $v$ such that $n - 1 = 2^v u$
- Pick any $1 < a < n - 1$
  - e.g. first 7 primes
- Set $b = a^u \bmod n$
- If $b = 1$ return *probable prime*
- Else repeat the following $v$ times:
  - If $b = -1$ return *probable prime*
  - $b = b^2 \bmod n$
- Return composite

Returns *probable prime* for composite numbers with a maximum probablility of 25%.

Discrete logarithm problem:

- Find exponent $x$ that solves $y = g^x \bmod p$
- *Hard* problem: need to brute force values of $x$

## Classical Encryption

Confidentiality: reading message requires key.

Authentication: creating message requires key.

Attack classes:

- Ciphertext only: only ciphertexts
- Known plaintext: some plaintexts and corresponding ciphertexts known
- Chosen plaintext: ciphertext of attacker-controlled plaintext known
- Chosen ciphertext: plaintext of some ciphertext chosen by attacker known

**Kerckhoff's Principle**: the only thing the attacker doesn't know is the key.

Systems:

- Transposition
  - Message uses permutation $f$ and each block of characters is permuted with this key. If block of length $d$, $d!$ possible keys
  - Frequency distribution of cipher/plaintext the same
  - Common di/trigrams in the language can be used to optimize trials
- Simple (Monoalphabetic) Substitution Cipher
  - Each character replaced with another
  - $n!$ keys where $n$ is the alphabet size
  - Frequency analysis attacks
- Polyalphabetic Substitution Cipher
  - $d$ ciphertext alphabets; $i$th character uses alphabet $i \bmod d$
- Vigenère Cipher
  - Polyalphabetic substitution, except that ciphertext alphabets are just shifted alphabets (Caesar)
  - Once period identified, substitution tables can be attacked separately
  - Autocorrelation: for each possible period length, generate frequency distribution for each alphabet and compare to (shifted) English alphabet frequency distribution
  - Kasiski Method: identify sequences of characters the appear multiple times: distance between them likely to be multiple of the period. Find common divisor
- Hill Cipher: Polygram Cipher
  - Simple substitution cipher, but substitute multiple characters at a time
  - Linear function: multiply each group (column vector) by the key (a matrix)
  - Vulnerable to known-plaintext attacks (but may fail if matrix not invertible)
  - Ciphertext-only attacks: find probable blocks

## Modern Encryption

### Hash Functions/MACs

Properties:

- **Collision resitance**: find collision given no constraints
- **Second-preimage resistance**: find collision for a given message
- **Preimage resistance**: can't find message given its hash

Birthday paradox:

- ~50% chance of finding collision to hash function outputting $k$ bits given $2^{k/2}$ trials
  - ~$2^{128}$ trials infeasible today, so hash function outputs should be at least 256 bits
  - c.f. block cipher key: need $2^{k - 1}$ trials for 50% probability of finding key

Merkle-Damgård Construction:

- Compression function $h$ takes in two $n$-bit inputs and outputs one $n$-bit output
- Split message into $n$-bit blocks
  - Hash IV and first block
  - Hash output of above and second block
  - ...
  - Hash output of above and length (plus padding)
- Length extension attacks: hash is full state of the MAC so attacker could add extra blocks

Standards:

- MDx: all broken
- SHA-0/SHA-1: broken
- SHA-2:
  - Min 256 bits (i.e. AES-128-level security)
  - SHA-512 most secure
- SHA-3: uses sponge function over compression functions

MACs:

- Tag generated from message and secret key
- **Unforgeability**: cannot produce Message-Tag pair without key
- **Unforegability under chosen message attack**: above holds even with access to oracle that can calculate MAC for attacker-chosen messages

HMAC:

- MAC from iterated hash function (compression function)
- $\mathrm{HMAC}(M, K) = H((K' \oplus \mathrm{opad}) \| H((K' \oplus \mathrm{ipad}) \| M))$
  - Where $K'$ is $H(K)$ if $K$ is larger than the block size and $K$ otherwise
  - Where $\text{opad}$ and $\text{ipad}$ are known constants

Encryption and MAC:

- If not using authenticated encryption, there are three options:
  - Encrypt-**and**-MAC: encrypt $M$, apply MAC to $M$ and send ciphertext and tag
    - Insecure; don't use
  - MAC-then-Encrypt: calculate MAC on $M$, encrypt $M\|T$, send ciphertext
  - Encrypt-then-MAC: encrypt $M$, calculate MAC on $C$, send ciphertext and tag
    - Most secure but also a bit harder

### Block Cipher

Product cipher: chain simple functions together, each using its own key.

Iterated cipher: product cipher but each round uses the same function using a key derived from a master key (using *key schedule*).

Substitution-Permutation Network (SPN):

- Substitution/S-box/$\pi_S$: function given sub-blocks of $l$ bits and returns substituted bits
  - Flips some bits; number of $1$'s in the sub-block will change
- Permutation/P-box/$\pi_P$: function given full block $n$ and returning a permutation
  - Number of $1$'s will not change but the location of them will
- In each round, split block into $n/l$ sub-blocks, run substitution each, then run permutation on the whole block
- Round key $K_i$ XORed with output of previous round, $W_{i - 1}$ (plaintext for the first round)

Feistel Cipher:

- Split plaintext into left and right
- In each round:
  - $L_i = R_{i - 1}$
  - $R_i = L_{i - 1} \oplus f(R_{i - 1}, K_i)$
  - Output of (hopefully non-linear) function $f$ XORed, so decryption is same as encryption

Shannon:

- **Key avalanche**: small change in key results in large change to ciphertext
  - Relates to Shannon's notion of **confusion**: substitution used to make the relationship between $K$ and $C$ as complex as possible
- **Plaintext avalanche**: small change in plaintext results in large change to ciphertext
  - Relates to *Shannon's notion of **diffusion**: transformations used to dissipate the statistical properties of $P$ across $C$.

DES:

- 16-round Feistel cipher with 56-bit keys, block length of 64 bits
  - Each round uses difference 48-bit subkey
- Plaintext initially permuted with fixed permutation, inverse permutation applied at the end
- Brute-force requires $2^{55}$ trials on average
- Double encryption: run DES on plaintext, then run DES on the resultant ciphertext with a different key
- Meet-in-the-Middle attack:
  - Known plaintext attack
  - For a given block:
    - Encrypt plaintext with all possible keys; store in memory
    - Decrypt ciphertext with any key; compare to above values
      - Repeat for all possible keys
      - If match found, check if it works for other pairs
  - Instead of an average of $2^{2d - 1}$ attempts, requires storage of $2^d$ ciphertexts, and $2^d$ encryption and decryption operations
- Triple DES:
  - Three independent keys approved by NIST; two keys for legacy use; never use one key; can be brute-forced as easily as DES

AES:

- 128-bit data block
- 128, 192 or 256 bit master keys with 10, 12 or 14 rounds respectively
- Byte-based: finite field operations in $\mathbb{F}_{256}^*$
- SPN but not Feistel

### Block Modes of Operation

**ECB** (Electronic Code Book):

- Each block uses the same key
- $C_t = E(P_t, K)$

**CBC** (Cipher Block Chaining)

- Plaintext XORed with previous ciphertext (or IV)
- Parallel decryption possible
- $C_t = E(P_t \oplus C_{t - 1}, K)$

**CTR** (Counter Mode):

- Concatenation of nonce $N$ and block number $t$ encrypted
- Parallel encryption and decryption
- $C_t = E(N \| t, K) \oplus P_t$

### Authentication/Integrity

Tag $T$ of message $M$ is *unforgeable* - impossible to produce $T = \mathrm{MAC}(M, K)$ without $K$.

**CBC-MAC**:

- $C_t = E(P_t \oplus C_{t - 1}, K)$
- $C_0$ is the IV: must be **fixed and public**
  - If not, IV must be sent along with the message and attacker has control over $P_1$
- The tag is the last ciphertext

**CMAC** (Cipher-Based MAC):

- NIST version of CBC-MAC
- IV all zeroes

### Authenticated Encryption

Data fits into one of two buckets:

- Payload: encrypted and authenticated
- Associated data: only authenticated

This is called AEAD - Authenticated Encryption with Associated Data.

**CCM** (Counter with CBC-MAC):

- CBC-MAC for authentication; CTR mode encryption for payload
- Nonce $N$ (for CTR encryption), payload $P$, associated data $A$
- Lengths of $N$ and $P$ included in first block; cannot be used for streaming

**GCM** (Galois Counter Mode):

- CTR mode + $\mathrm{GHASH}$ function
- Used in TLS 1.2 and 1.3
- TODO more details?

### RNGs

Seed obtained from true RNG; used in PRNG/deterministic random bit generator (DRBG).

DRBGs should have:

- **Backtracking resistance**: access to current state does not allow attacker to distinguish between random noise and *previous* DRBG output
- **Forward prediction resistance**: access to current state does not allow attacker to distinguish between random noise and *later* DRBG output

**CTR_DRBG**:

- Block cipher in counter mode (e.g. AES)
  - 'Plaintext' is just zeroes; XOR operation does nothing
- Initialized with seed:
  - Seed length = key length + block length
  - Seed defines key and counter value (no nonce)
- On each request, return $E(n, K)$ and increment counter
- Maximum of $2^{48}$ generate calls before re-seeding

**Dual_EC_DRBG**:

- Very bad, don't use, most likely backdoored by NSA

Synchronous Stream Ciphers:

- Both parties must generate the same keystream and be synchronized
- XOR the keystream and plain text to get the ciphertext
- **One-Time Pad**
  - Shannon's Perfect Secrecy: distribution of messages given ciphertext the same as the distribution of messages
- A5 Cipher, RC4, ChaCha

## Public Key Cryptography

One-way function:

- Functions where the inverse is hard to compute
- Integer factorization, discrete logarithm problem *believed* to be one-way
- Trapdoor one-way functions:
  - Inverse easy to compute given additional information - *trapdoor*
- Asymmetric cryptography: trapdoor is the decryption key

RSA:

- Choose distinct primes $p$, $q$
  - At least 1024 bits
  - $n = pq$
    - Shor's theorem: polynomial time factorization for $n$ with quantum computers
- Choose $e$ such that $e$ and $\phi(n)$ are co-prime
  - Random gives best security
  - Small values faster
  - $e = 3$ has security issues, prefer larger values (e.g. $e = 2^{16} + 1$)
  - $d$ should be at least $\sqrt(n)$
- Compute $d = e^{-1} \bmod \phi(n)$
- Public key $K_E = (n, e)$
- Private key $K_D = (p, q, d)$
- Encryption: $C = M^e \bmod n$
- Decryption: $M = C^d \bmod n$
  - CRT can be used to increase decryption speed
- Padding required to add randomness
  - Håstad’s Attack: if same $M$ and $e$ used by different people (i.e. different $n$), CRT can be used to find $M^e$ in the ordinary numbers and take the $e$th root to find $M$

Diffie-Hellman:

- Prime $p$
- Generator $g$ in $\mathbb{Z}_p^*$
- $g^a \bmod p$, $g^b \bmod p$ sent by Alice and Bob respectively
- Key $Z = g^{ab} \bmod p$
- Relies on discrete logarithm problem being hard

Authenticated Diffie-Hellman:

- Alice sends $g^a \bmod p$ and identity $A$
- Bob sends $g^b \bmod p$, identity $B$ and uses public key to sign $g^a \bmod p$, $g^b \bmod p$, $A$, and $B$
- Alice and uses public key to sign $g^a \bmod p$, $g^b \bmod p$, $A$, and $B$
- Both compute $g^{ab} \bmod p$

Static Diffie Hellman: $a$ and $g^a$ are the long-term private/public keys

Elgamal Cryptosystem:

- Key generation:
  - Pick $p$, generator $g$
  - Pick long-term private key $K_D$
  - $y = g^{K_D}$
  - Long-term public key $(p, g, y)$
- Encryption:
  - Pick ephemeral private key $k$
  - Send $(C_1, C_2) = (g^k \bmod p, My^k \bmod p)$
- Decryption:
  - $M = C_2 \cdot \left(C_1^{K_D}\right)^{-1} \bmod p$

### Digital Signatures

Unforgeability: infeasible to generate a valid signature for any message without key.

RSA signatures:

- Signing: $s = h(M)^d \bmod n$ where $h$ is a fixed, public hash function
- Verification: check that $s^e \bmod n = h(M)$

DSA signatures:

- Elgamal:
  - Private key $x$, public key $y = g^x \bmod p$
  - Signing:
    - Pick $k$ smaller than and co-prime to $p - 1$
    - $r = g^k \bmod p$
    - Find $s$ in $M = xr + ks \bmod{(p - 1)}$
    - Output $(M, r, s)$
  - Verification:
    - Check $g^M \equiv y^r r^s \pmod p$
- DSA
  - $p$ such that $p - 1$ has small prime divisor $q$
  - Generator $h$ in $\mathbb{Z}_p^*$
  - Generator $g = h^{\frac{p - 1}{q}} \bmod p$
    - Order $q$
    - All exponents can be reduced modulo $q$ prior to exponentiation
  - Generation:
    - $0 < k < q$
    - $r = (g^k \bmod p) \bmod q$
    - $s = k^{-1}(H(M) - xr) \bmod q$
  - Verification:
    - $w = s^{-1} \bmod q$
    - $u_1 = H(M)w \bmod q$
    - $u_2 = rw \bmod q$
    - Check $(g^{u_1}y^{-u_2} \bmod p) \bmod q = r$
- EDCSA:
  - $q$ order of elliptic curve group
  - Multiplication modulo $p$ replaced with elliptic curve group operation
  - Public keys shorter c.f. DSA but signatures are not
  - Takes longer to verify c.f. RSA

### Public Key Infrastructure

Trusted certification authority (CA) (CA public key required by clients) issues/signs and revokes certificates.

Certificates (e.g. X.509 v3) contain:

- Public key
- Owner identity
- Metadata (e.g. validity period, algorithms)

Revokatiion: each CA has list of revoked certificates.

### Key Management

Key management phasess:

- Generation (all keys equally likely)
- Distribution
- Protection (only accessible to authrozied parties)
- Destruction

Mutual vs unilaterial authentication:

- Mutual: both parties authenticate the other party
- Unilateral: only one party authenticates (e.g. client authenticates server)

**Pre-Shared Keys**:

- Trusted authority (TA) generates and distributes long-term keys to all users when joining
- Only involved during pre-distributino
- Simple scheme: one key for each pair of users - $O(n^2)$ keys
- Probabilistic schemes: high probability of secure channel between any two users

With symmetric keys:

- User and TA share long-term keys
- TA distributes session keys to users when requested
- Fixed Needham-Schroeder protocol:
  - $A$ asks for connection with $B$
  - $B$ sends ID and nonce to $A$
  - $A$ sends ID and nonce for both parties to TA
  - $S$ generates session key between $A$ and $B$ encrypted with long-term key $SA$
    - $S \to A: \left\{ K_{AB}, \mathrm{ID}_A, \mathrm{ID}_B, N_A \right\}_{K_{AS}}, \left\{ K_{AB}, \mathrm{ID}_A, \mathrm{ID}_B, N_B \right\}_{K_{BS}}$
  - $A$ sends portion of message encrypted with long-term key $SB$

With asymmetric keys:

- Each user has public key signed by trusted CA
- Users trusted to geenrate good session keys; parties must all have good PRNGs
- Session keys encrypted with public keys
- If long-term key compromised, attacker can act as owner
  - Forwards secrecy: if compromise does not reveal previuos session keys
  - Diffie-Hellman: both parties provide input to key material, allowing forwards secrecy

### TLS

MAC:

- SHA-2 (>= TLS 1.2)
- MD5, SHA-1 (< TLS 1.3)

Encryption:

- Block cipher in CBC mode or stream cipher
- Most commonly AES
- Block ciphers: padding applied after MAC to get complete blocks

Authenticated-Encryption:

- TLS 1.3: AES with CCM or GCM
- One key for both encryption and MAC
- Header data, (implicit) sequence number authenticated

Protocols:

- Handshake: establish session keys
- Record: sends data with established session keys

DH Handshake:

- Client hello: highest available TLS version, available cipher suites, nonce
- Server hello: server's public certificate, selected TLS version, cipher suite, nonce
- Server-key exchange: nonces and DH parameters signed with public certificate
- Client checks signature
- Client-key exchange: client's DH parameter
- Both parties compoute pre-master secret (PMS), then master secret (MS), then session keys
- Client finished: encrypted with session key
- Server finished: encrypted with session key

RSA: client generates PMS and encrypts with server's public key. No forwards secrecy.

