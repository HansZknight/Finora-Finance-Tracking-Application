// Utility functions for encoding and decoding ArrayBuffers to base64
// Standard base64 functions can't handle Uint8Arrays directly in some browsers

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const charCode of bytes) {
    str += String.fromCharCode(charCode);
  }
  const base64String = btoa(str);
  return base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const padding = '='.repeat((4 - base64url.length % 4) % 4);
  const base64 = (base64url + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export async function isWebAuthnAvailable(): Promise<boolean> {
  if (!window.PublicKeyCredential) return false;
  try {
    // Check if a platform authenticator (like TouchID, FaceID) is available
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (e) {
    return false;
  }
}

/**
 * Creates a new local WebAuthn credential bound to the device's biometrics.
 * Returns the raw credential ID as a base64url string.
 */
export async function registerBiometric(): Promise<string> {
  if (!await isWebAuthnAvailable()) {
    throw new Error("Biometric authentication is not supported on this device or browser.");
  }

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  const userId = new Uint8Array(16);
  crypto.getRandomValues(userId);

  const publicKey: PublicKeyCredentialCreationOptions = {
    challenge: challenge.buffer,
    rp: {
      name: "Finora Finance Tracker",
      id: window.location.hostname // Automatically binds to current domain (works on localhost too)
    },
    user: {
      id: userId.buffer,
      name: "Finora User",
      displayName: "Finora User"
    },
    pubKeyCredParams: [
      { type: "public-key", alg: -7 }, // ES256
      { type: "public-key", alg: -257 } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform", // Forces built-in biometrics
      userVerification: "required", // Forces FaceID / Fingerprint / PIN
      residentKey: "required" // Discoverable credential
    },
    timeout: 60000,
    attestation: "none"
  };

  try {
    const credential = await navigator.credentials.create({ publicKey }) as PublicKeyCredential;
    if (!credential) throw new Error("Failed to create biometric credential.");
    return bufferToBase64url(credential.rawId);
  } catch (error) {
    console.error("Biometric registration failed:", error);
    throw new Error("Failed to register biometrics. You may have cancelled or your device doesn't support it.");
  }
}

/**
 * Prompts the user to verify their identity using a previously saved credential ID.
 */
export async function verifyBiometric(credentialIdBase64Url: string): Promise<boolean> {
  if (!window.PublicKeyCredential) return false;

  const challenge = new Uint8Array(32);
  crypto.getRandomValues(challenge);
  const rawId = base64urlToBuffer(credentialIdBase64Url);

  const publicKey: PublicKeyCredentialRequestOptions = {
    challenge: challenge.buffer,
    rpId: window.location.hostname,
    allowCredentials: [{
      type: "public-key",
      id: rawId,
    }],
    userVerification: "required", // Forces FaceID / Fingerprint / PIN
    timeout: 60000,
  };

  try {
    const assertion = await navigator.credentials.get({ publicKey }) as PublicKeyCredential;
    return !!assertion;
  } catch (error) {
    console.error("Biometric verification failed:", error);
    // Could be user cancelled or failed auth
    return false;
  }
}
