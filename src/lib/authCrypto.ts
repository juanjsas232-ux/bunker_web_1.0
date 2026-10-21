const AUTH_SALT = 'bunker_secure_salt_2024';
const KEY_CUSTOM_ADMIN = 'bunker_custom_admin_auth';

export async function hashValue(val: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(val);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPasswordWithSalt(pass: string): Promise<string> {
  return hashValue(pass + AUTH_SALT);
}

// Master password hashes (no plain passwords in source code)
const MASTER_PASS_HASHES = new Set([
  '5e48825f6b00d50112ede3121558c5f6f1273bc668f57d964da1093aa79d98e1', // primary
  '5aab923be797c41f1018a7ef668c37018f9fff67c9305758f969f19cb3d4d0eb', // secondary
]);

const MASTER_EMAIL_HASHES = new Set([
  'b9631f39f380250cfbf15392bdb670ce8e3bb0795625cd34f695962197f78864',
  '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
]);

export async function verifyLocalCredentials(emailInput: string, passInput: string): Promise<{ valid: boolean; email: string }> {
  const cleanEmail = emailInput.trim().toLowerCase();
  const passHash = await hashPasswordWithSalt(passInput);
  const emailHash = await hashValue(cleanEmail);

  // 1. Check custom configured admin credentials in localStorage
  if (typeof window !== 'undefined') {
    const rawCustom = localStorage.getItem(KEY_CUSTOM_ADMIN);
    if (rawCustom) {
      try {
        const custom = JSON.parse(rawCustom);
        if (custom.emailHash === emailHash && custom.passHash === passHash) {
          return { valid: true, email: custom.displayEmail || cleanEmail };
        }
      } catch (e) {}
    }
  }

  // 2. Check master cryptographic hash
  if (MASTER_EMAIL_HASHES.has(emailHash) && MASTER_PASS_HASHES.has(passHash)) {
    return { valid: true, email: cleanEmail.includes('@') ? cleanEmail : 'admin@bunker.com.ar' };
  }

  return { valid: false, email: '' };
}

export async function updateLocalAdminCredentials(newEmail: string, newPassword?: string): Promise<void> {
  if (typeof window === 'undefined') return;
  const cleanEmail = newEmail.trim().toLowerCase();
  const emailHash = await hashValue(cleanEmail);

  const existingRaw = localStorage.getItem(KEY_CUSTOM_ADMIN);
  let passHash = '';

  if (newPassword && newPassword.trim()) {
    passHash = await hashPasswordWithSalt(newPassword.trim());
  } else if (existingRaw) {
    try {
      const existing = JSON.parse(existingRaw);
      passHash = existing.passHash;
    } catch (e) {}
  }

  if (!passHash) {
    passHash = '5e48825f6b00d50112ede3121558c5f6f1273bc668f57d964da1093aa79d98e1';
  }

  localStorage.setItem(
    KEY_CUSTOM_ADMIN,
    JSON.stringify({
      displayEmail: newEmail.trim(),
      emailHash,
      passHash,
      updatedAt: new Date().toISOString(),
    })
  );
}
