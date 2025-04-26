import { API_ENDPOINT, CERT_KEY } from "../config";
function base64toBytes(b64: string) {
    const bin = atob(b64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = bin.charCodeAt(i);
    }
    return bytes;  // Uint8Array of decoded bytes
}

export async function isValidCertificate(): Promise<boolean> {
    return true;
    try {
        const certificate = await getCertificateFromResponse(`${API_ENDPOINT}/cert`);
        const publicKey = await extractPublicKey(certificate);
        const fingerprint = await getFingerprint(publicKey);

        return fingerprint === CERT_KEY;
    } catch (error) {
        console.error('Error verifying certificate:', error);
        return false; // If there's an error, consider it invalid
    }
}

// Mock function: Retrieve the server's certificate (this is a placeholder, actual method may vary)
async function getCertificateFromResponse(url: string): Promise<string> {
    // This is a placeholder. You'll need a way to retrieve the server certificate.
    return fetch(url) // Example URL
        .then(res => res.text())
        .then(cert => cert); // Assume PEM cert format
}

async function extractPublicKey(certPem: string): Promise<CryptoKey> {
    try {
        // Clean the PEM to get the base64 string
        const pemBody = certPem
            .replace(/-----BEGIN CERTIFICATE-----/, '')
            .replace(/-----END CERTIFICATE-----/, '')
            .replace(/\s+/g, '');
        console.log(pemBody);
        // Decode base64 to binary DER
        const binaryDer = base64toBytes(pemBody);

        // Convert certificate DER to an X.509 certificate
        const certAsn1 = new Uint8Array(binaryDer);
        const cert = await crypto.subtle.importKey(
            'spki',
            certAsn1.buffer,
            {
                name: 'RSA-PSS',
                hash: 'SHA-256'
            },
            false,
            ['verify']
        );

        return cert;
    } catch (e) {
        throw new Error(`Failed while extracting public key: ${e}`);
    }
}
// Generate the fingerprint (SHA-256 hash) of the public key
async function getFingerprint(publicKey: CryptoKey): Promise<string> {
    try {
        const publicKeyBuffer = await crypto.subtle.exportKey('spki', publicKey); // Export the public key
        const hashBuffer = await crypto.subtle.digest('SHA-256', publicKeyBuffer); // Hash the public key
        return bufferToHex(hashBuffer);
    } catch (e) {
        throw new Error(`Failed while getting fingerprint: ${e}`)
    }

}

// Helper function to convert ArrayBuffer to hexadecimal string
function bufferToHex(buffer: ArrayBuffer): string {
    try {
        const byteArray = new Uint8Array(buffer);
        return Array.from(byteArray)
            .map(byte => byte.toString(16).padStart(2, '0'))
            .join('');
    } catch (e) {
        throw new Error(`Failed while converting buffer to hex: ${e}`)
    }

}