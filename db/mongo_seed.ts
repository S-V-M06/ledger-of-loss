import crypto from 'crypto';
import { getDb, getMongoClient } from '../lib/mongo';
import dotenv from 'dotenv';

dotenv.config();

function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.toLowerCase().trim()).digest('hex');
}

export async function seedMongoData() {
  console.log('🍃 Starting MongoDB seed (Playbooks & Breach Records)...');
  const db = await getDb();

  // --------------------------------------------------------------------------
  // 1. Seed Guidance Playbooks (~20 high-quality playbooks)
  // --------------------------------------------------------------------------
  const playbooksCollection = db.collection('guidance_playbooks');
  await playbooksCollection.deleteMany({});

  const playbooks = [
    {
      title: 'Immediate Password Reset & Credential Rotation',
      summary: 'Mitigate risk from leaked passwords by invalidating credentials across affected and related services.',
      applies_to: { data_types: ['password'], min_severity_rank: 2 },
      priority: 5,
      steps: [
        { order: 1, text: 'Change the password on the breached service immediately using a unique 16+ character passphrase.', estimated_minutes: 5 },
        { order: 2, text: 'Identify any other services where you reused this identical or similar password.', estimated_minutes: 10 },
        { order: 3, text: 'Store the newly generated random passwords in an encrypted password manager.', estimated_minutes: 5 },
        { order: 4, text: 'Terminate all active web and mobile application sessions on the affected provider.', estimated_minutes: 3 }
      ],
      tags: ['password', 'credentials', 'rotation', 'critical'],
      updated_at: new Date()
    },
    {
      title: 'Multi-Factor Authentication (MFA) Hardening',
      summary: 'Prevent unauthorized account takeover by enforcing hardware or app-based 2FA tokens.',
      applies_to: { data_types: ['password', 'email', 'username'], min_severity_rank: 1 },
      priority: 4,
      steps: [
        { order: 1, text: 'Enable 2-Step Verification using an authenticator app (TOTP) rather than SMS where possible.', estimated_minutes: 5 },
        { order: 2, text: 'Download and securely store one-time offline emergency recovery backup codes.', estimated_minutes: 3 },
        { order: 3, text: 'Review connected third-party OAuth apps and revoke permissions for unrecognized integrations.', estimated_minutes: 7 }
      ],
      tags: ['mfa', 'totp', '2fa', 'security-keys'],
      updated_at: new Date()
    },
    {
      title: 'Banking & Financial Account Freeze Protocol',
      summary: 'Immediate lockdown steps following exposure of credit cards, bank accounts, or financial transaction logs.',
      applies_to: { data_types: ['financial'], min_severity_rank: 3 },
      priority: 5,
      steps: [
        { order: 1, text: 'Contact issuing bank to place a temporary freeze or cancel compromised debit/credit card numbers.', estimated_minutes: 15 },
        { order: 2, text: 'Audit bank and credit card statements for unexpected micro-charges or unauthorized recurring bills.', estimated_minutes: 15 },
        { order: 3, text: 'Set up real-time transaction notifications on your mobile banking app for charges above $0.', estimated_minutes: 5 },
        { order: 4, text: 'Request a security callback PIN from your financial institution for phone support verifications.', estimated_minutes: 10 }
      ],
      tags: ['financial', 'banking', 'fraud', 'freeze'],
      updated_at: new Date()
    },
    {
      title: 'Government Identifier & SSN Exposure Defense',
      summary: 'Crucial steps to safeguard against synthetic identity theft, tax fraud, and unauthorized credit applications.',
      applies_to: { data_types: ['government_id'], min_severity_rank: 3 },
      priority: 5,
      steps: [
        { order: 1, text: 'Place a free security freeze on your credit files with the major credit reporting bureaus.', estimated_minutes: 20 },
        { order: 2, text: 'Create an official online account with tax authorities (e.g. IRS IP PIN) to prevent fraudulent tax filings.', estimated_minutes: 15 },
        { order: 3, text: 'File an identity theft incident notification with national consumer protection agencies.', estimated_minutes: 15 },
        { order: 4, text: 'Order annual free credit disclosure reports to verify no unauthorized inquiries exist.', estimated_minutes: 10 }
      ],
      tags: ['government_id', 'ssn', 'credit-freeze', 'identity-theft'],
      updated_at: new Date()
    },
    {
      title: 'SIM Swap Prevention & Mobile Carrier Lockdown',
      summary: 'Prevent attackers from intercepting SMS authentication codes via fraudulent carrier SIM porting.',
      applies_to: { data_types: ['phone'], min_severity_rank: 2 },
      priority: 4,
      steps: [
        { order: 1, text: 'Log in to your cellular provider account and establish a mandatory customer verification PIN/passcode.', estimated_minutes: 10 },
        { order: 2, text: 'Request "Port-Out Freeze" or "SIM Protection" to prevent unauthorized carrier number transfers.', estimated_minutes: 10 },
        { order: 3, text: 'Remove your mobile phone number as an SMS recovery option on primary email and banking portals.', estimated_minutes: 15 }
      ],
      tags: ['phone', 'sim-swap', 'carrier', 'telecom'],
      updated_at: new Date()
    },
    {
      title: 'Combatting Credential Stuffing & Password Reuse',
      summary: 'Systematically address the automated reuse of exposed password combinations across common services.',
      applies_to: { data_types: ['password', 'username'], min_severity_rank: 2 },
      priority: 4,
      steps: [
        { order: 1, text: 'Make a prioritized list of your primary accounts: Email, Cloud Storage, Banking, Social Media.', estimated_minutes: 10 },
        { order: 2, text: 'Ensure every primary account uses a completely distinct, unguessable password.', estimated_minutes: 20 },
        { order: 3, text: 'Check recent login sessions in account security settings and terminate unrecognized devices.', estimated_minutes: 5 }
      ],
      tags: ['credential-stuffing', 'reuse', 'passwords'],
      updated_at: new Date()
    },
    {
      title: 'Anti-Phishing & Social Engineering Triage',
      summary: 'Heightened awareness and filtering rules when personal contact details have been leaked to spam operations.',
      applies_to: { data_types: ['email', 'phone'], min_severity_rank: 1 },
      priority: 3,
      steps: [
        { order: 1, text: 'Enable advanced spam filtering and spear-phishing warnings in your email client settings.', estimated_minutes: 5 },
        { order: 2, text: 'Never click on urgent password-reset links sent via SMS or unverified emails.', estimated_minutes: 2 },
        { order: 3, text: 'Verify any unexpected service request by navigating directly to official provider URLs independently.', estimated_minutes: 5 }
      ],
      tags: ['phishing', 'social-engineering', 'email', 'scam'],
      updated_at: new Date()
    },
    {
      title: 'Security Questions & Knowledge-Based Auth Overhaul',
      summary: 'Replace predictable or breached security question answers with cryptographically generated passphrases.',
      applies_to: { data_types: ['security_questions'], min_severity_rank: 2 },
      priority: 4,
      steps: [
        { order: 1, text: 'Log in to platforms utilizing security questions (e.g. "Mother maiden name", "First school").', estimated_minutes: 10 },
        { order: 2, text: 'Replace truthful answers with randomly generated passwords stored in your password manager.', estimated_minutes: 10 },
        { order: 3, text: 'Disable security questions in favor of authenticator app 2FA wherever the platform permits.', estimated_minutes: 5 }
      ],
      tags: ['security-questions', 'knowledge-auth', 'passphrase'],
      updated_at: new Date()
    },
    {
      title: 'Physical Address Privacy & Mail Theft Countermeasures',
      summary: 'Safeguard your household against unsolicited mail exploits, swarming scams, and targeted physical deliveries.',
      applies_to: { data_types: ['address'], min_severity_rank: 2 },
      priority: 2,
      steps: [
        { order: 1, text: 'Sign up for informed mail delivery notifications with postal service to preview incoming mail.', estimated_minutes: 10 },
        { order: 2, text: 'Opt out of pre-screened credit card and insurance offers via official consumer opt-out registries.', estimated_minutes: 10 },
        { order: 3, text: 'Install a locking mailbox or arrange secure pickup for high-value sensitive financial paperwork.', estimated_minutes: 15 }
      ],
      tags: ['address', 'physical-security', 'privacy'],
      updated_at: new Date()
    },
    {
      title: 'Date of Birth Exposure & Synthetic ID Protection',
      summary: 'Mitigate risk when birthdate data is combined with names to bypass identity verification checkpoints.',
      applies_to: { data_types: ['date_of_birth'], min_severity_rank: 2 },
      priority: 3,
      steps: [
        { order: 1, text: 'Tighten privacy configurations on public social networks hiding your exact birth year and day.', estimated_minutes: 5 },
        { order: 2, text: 'Review student loan, utility, and medical portal accounts for unauthorized account creations.', estimated_minutes: 15 },
        { order: 3, text: 'Set up biometric or hardware key unlock on mobile device operating systems.', estimated_minutes: 5 }
      ],
      tags: ['date_of_birth', 'synthetic-id', 'privacy'],
      updated_at: new Date()
    },
    {
      title: 'Public IP Address Masking & Network Shielding',
      summary: 'Shield residential internet connection against targeted port scanning and geolocation tracking.',
      applies_to: { data_types: ['ip_address'], min_severity_rank: 1 },
      priority: 2,
      steps: [
        { order: 1, text: 'Reboot home router/cable modem to request a fresh dynamic public IP allocation from ISP.', estimated_minutes: 5 },
        { order: 2, text: 'Disable UPnP (Universal Plug and Play) and remote administrative management in router settings.', estimated_minutes: 10 },
        { order: 3, text: 'Utilize an encrypted VPN tunnel or private DNS resolver when browsing untrusted public networks.', estimated_minutes: 5 }
      ],
      tags: ['ip_address', 'networking', 'router', 'vpn'],
      updated_at: new Date()
    },
    {
      title: 'Username Disassociation & Digital Handle Sanitization',
      summary: 'Prevent cross-site profile correlation and stalking based on reused online aliases and nicknames.',
      applies_to: { data_types: ['username'], min_severity_rank: 1 },
      priority: 2,
      steps: [
        { order: 1, text: 'Audit publicly searchable accounts linked to this username using open search queries.', estimated_minutes: 10 },
        { order: 2, text: 'Consider updating usernames on sensitive gaming, developer, or forum profiles to pseudo-random handles.', estimated_minutes: 15 },
        { order: 3, text: 'Disconnect public profile linkages between professional networks and recreational forums.', estimated_minutes: 10 }
      ],
      tags: ['username', 'handle', 'osint', 'anonymity'],
      updated_at: new Date()
    },
    {
      title: 'FIDO2 & Hardware Security Key Migration',
      summary: 'Deploy the highest level of phishing-resistant authentication for critical email and banking credentials.',
      applies_to: { data_types: ['password', 'government_id'], min_severity_rank: 3 },
      priority: 5,
      steps: [
        { order: 1, text: 'Procure two FIDO2/WebAuthn compliant hardware security keys (one primary, one spare backup).', estimated_minutes: 5 },
        { order: 2, text: 'Register the security keys on your primary email, cloud storage, and password manager vaults.', estimated_minutes: 15 },
        { order: 3, text: 'Revoke less secure authentication methods such as SMS 2FA where hardware keys are supported.', estimated_minutes: 5 }
      ],
      tags: ['fido2', 'webauthn', 'security-key', 'hardware'],
      updated_at: new Date()
    },
    {
      title: 'Email Account Forwarding & Rule Audit',
      summary: 'Detect and eliminate hidden attacker persistence rules inside compromised email inboxes.',
      applies_to: { data_types: ['email', 'password'], min_severity_rank: 2 },
      priority: 4,
      steps: [
        { order: 1, text: 'Open email account settings and inspect "Forwarding and POP/IMAP" for unauthorized destination emails.', estimated_minutes: 5 },
        { order: 2, text: 'Review inbox filter rules for keywords like "invoice", "statement", "code" automatically moving to trash.', estimated_minutes: 5 },
        { order: 3, text: 'Revoke third-party API tokens and authorized OAuth app connections with mail read permissions.', estimated_minutes: 5 }
      ],
      tags: ['email', 'forwarding-rules', 'persistence', 'inbox'],
      updated_at: new Date()
    },
    {
      title: 'Credit Bureau Fraud Alert Placement',
      summary: 'Put automated warnings on your credit profile requiring creditors to verify your identity before opening loans.',
      applies_to: { data_types: ['financial', 'government_id'], min_severity_rank: 3 },
      priority: 4,
      steps: [
        { order: 1, text: 'Contact one credit bureau (Equifax, Experian, or TransUnion) to post a initial 1-year fraud alert.', estimated_minutes: 15 },
        { order: 2, text: 'Confirm the bureau notifies the other two reporting agencies automatically as mandated by law.', estimated_minutes: 5 },
        { order: 3, text: 'Ensure your current verified telephone number is listed on the alert for creditor callback verification.', estimated_minutes: 5 }
      ],
      tags: ['fraud-alert', 'credit-bureau', 'finance'],
      updated_at: new Date()
    },
    {
      title: 'Dark Web Credential Invalidation Check',
      summary: 'Verify whether leaked combo lists are actively being traded on cybercrime clearinghouses.',
      applies_to: { data_types: ['password', 'email'], min_severity_rank: 3 },
      priority: 3,
      steps: [
        { order: 1, text: 'Search identity hashes in privacy-respecting breach registries to identify exact leak provenance.', estimated_minutes: 5 },
        { order: 2, text: 'Rotate master vault passwords and master decryption keys immediately.', estimated_minutes: 10 },
        { order: 3, text: 'Enable session timeout auto-lock on desktop browsers and mobile devices.', estimated_minutes: 5 }
      ],
      tags: ['darkweb', 'monitoring', 'compromise'],
      updated_at: new Date()
    },
    {
      title: 'Disposable Email Aliases & Compartmentalization',
      summary: 'Prevent future breach exposure from impacting primary accounts by adopting alias routing.',
      applies_to: { data_types: ['email'], min_severity_rank: 1 },
      priority: 2,
      steps: [
        { order: 1, text: 'Set up an email forwarding alias service (e.g. SimpleLogin, AnonAddy, or iCloud Hide My Email).', estimated_minutes: 10 },
        { order: 2, text: 'Migrate newsletter, forum, and shopping registrations to dedicated single-purpose aliases.', estimated_minutes: 20 },
        { order: 3, text: 'Instantly disable any alias that begins receiving spam or is exposed in a future third-party breach.', estimated_minutes: 5 }
      ],
      tags: ['email-aliases', 'compartmentalization', 'privacy'],
      updated_at: new Date()
    },
    {
      title: 'Payment Card Dispute & Chargeback Audit',
      summary: 'Take decisive action when merchant databases leak raw CVV or transaction authorization tokens.',
      applies_to: { data_types: ['financial'], min_severity_rank: 2 },
      priority: 4,
      steps: [
        { order: 1, text: 'Review past 90 days of transactions for unfamiliar nominal charges (e.g. $1.00 authorizations).', estimated_minutes: 15 },
        { order: 2, text: 'Initiate formal dispute claims for any unrecognized debits through your card issuer portal.', estimated_minutes: 10 },
        { order: 3, text: 'Request reissue of cards with newly generated virtual account numbers.', estimated_minutes: 10 }
      ],
      tags: ['cards', 'dispute', 'chargeback', 'financial'],
      updated_at: new Date()
    },
    {
      title: 'Mobile Device Application Permission Audit',
      summary: 'Purge invasive permissions granted to apps that log network metadata, location, and device IDs.',
      applies_to: { data_types: ['phone', 'ip_address'], min_severity_rank: 1 },
      priority: 2,
      steps: [
        { order: 1, text: 'Open phone settings and audit apps with continuous Background Location access.', estimated_minutes: 10 },
        { order: 2, text: 'Revoke Contacts, SMS, and Microphone permissions for games and single-utility tools.', estimated_minutes: 10 },
        { order: 3, text: 'Uninstall applications that have not been updated or used within the preceding 6 months.', estimated_minutes: 10 }
      ],
      tags: ['mobile', 'permissions', 'audit', 'privacy'],
      updated_at: new Date()
    },
    {
      title: 'Comprehensive Emergency Account Lockdown',
      summary: 'Orchestrated containment protocol when multiple high-value personal data classes are breached simultaneously.',
      applies_to: { data_types: ['password', 'financial', 'government_id'], min_severity_rank: 4 },
      priority: 5,
      steps: [
        { order: 1, text: 'Isolate primary email and cell phone carrier accounts with hardware keys and PINs.', estimated_minutes: 15 },
        { order: 2, text: 'Execute emergency credit freezes across all credit reporting bureaus.', estimated_minutes: 20 },
        { order: 3, text: 'Trigger "Log Out of All Devices" across all email, social, cloud, and banking platforms.', estimated_minutes: 15 },
        { order: 4, text: 'Document police or regulatory identity theft incident reports for legal liability shielding.', estimated_minutes: 30 }
      ],
      tags: ['lockdown', 'emergency', 'incident-response', 'critical'],
      updated_at: new Date()
    }
  ];

  await playbooksCollection.insertMany(playbooks);
  console.log(`✅ Seeded ${playbooks.length} guidance playbooks into MongoDB.`);

  // --------------------------------------------------------------------------
  // 2. Seed Breach Records (~250 records)
  // --------------------------------------------------------------------------
  const breachRecordsCollection = db.collection('breach_records');
  await breachRecordsCollection.deleteMany({});

  const breachRecords: any[] = [];

  // Demo user targets:
  // Divya Sharma: divya@example.com (email), divya_sharma (username)
  // Arjun Patel: arjun@example.com (email), arjun_coder (username)

  // Demo records tailored so scans yield realistic exposures:
  // 1. Divya in Apex Health (Breach 1 - critical): password, financial, government_id
  breachRecords.push({
    breach_id: 1,
    identity_hash: sha256('divya@example.com'),
    identity_type: 'email',
    exposed_fields: ['password', 'financial', 'government_id', 'email'],
    extra: {
      password_hash_type: 'bcrypt',
      salt_rounds: 12,
      insurance_group_id: 'GRP-99410',
      admitted_date: '2025-11-04'
    }
  });

  // 2. Divya in CloudScale Nexus (Breach 2 - high): password, phone
  breachRecords.push({
    breach_id: 2,
    identity_hash: sha256('divya@example.com'),
    identity_type: 'email',
    exposed_fields: ['password', 'phone', 'email'],
    extra: {
      api_key_compromised: true,
      last_login_ip: '198.51.100.42',
      session_token_leaked: false
    }
  });

  // 3. Divya in CyberForums Darknet (Breach 9 - critical): password, security_questions
  breachRecords.push({
    breach_id: 9,
    identity_hash: sha256('divya@example.com'),
    identity_type: 'email',
    exposed_fields: ['password', 'security_questions', 'email'],
    extra: {
      plaintext_combo: true,
      dump_source: 'Underground compilation v4.1',
      hash_algorithm: 'md5_crypt'
    }
  });

  // 4. Divya's username in NexusPlay Gaming (Breach 10 - medium): username, ip_address
  breachRecords.push({
    breach_id: 10,
    identity_hash: sha256('divya_sharma'),
    identity_type: 'username',
    exposed_fields: ['username', 'ip_address'],
    extra: {
      player_rank: 'Diamond',
      registered_guild: 'ZeroDawn',
      last_ip: '203.0.113.19'
    }
  });

  // 5. Divya's username in StreamWave Media (Breach 7 - medium): username, password
  breachRecords.push({
    breach_id: 7,
    identity_hash: sha256('divya_sharma'),
    identity_type: 'username',
    exposed_fields: ['username', 'password'],
    extra: {
      forum_posts_count: 84,
      avatar_url_leaked: true
    }
  });

  // 6. Arjun in Metro Transit (Breach 3 - medium): address, phone, financial
  breachRecords.push({
    breach_id: 3,
    identity_hash: sha256('arjun@example.com'),
    identity_type: 'email',
    exposed_fields: ['address', 'phone', 'financial', 'email'],
    extra: {
      transit_card_serial: 'METRO-4402-9912',
      stored_balance: '$34.50',
      frequent_route: 'BlueLine-Subway'
    }
  });

  // 7. Arjun in VoltUtility (Breach 4 - low): email, ip_address
  breachRecords.push({
    breach_id: 4,
    identity_hash: sha256('arjun@example.com'),
    identity_type: 'email',
    exposed_fields: ['email', 'ip_address'],
    extra: {
      smart_meter_id: 'SM-90021-VLT',
      billing_tier: 'Residential-Solar'
    }
  });

  // 8. Arjun in FinSecure Credit (Breach 5 - critical): financial, government_id, security_questions
  breachRecords.push({
    breach_id: 5,
    identity_hash: sha256('arjun@example.com'),
    identity_type: 'email',
    exposed_fields: ['financial', 'government_id', 'security_questions', 'email'],
    extra: {
      loan_application_number: 'LOAN-2023-88102',
      credit_tier: 'Prime',
      bank_swift: 'FINSUS33'
    }
  });

  // 9. Arjun's username in NexusPlay Gaming (Breach 10 - medium): username, password
  breachRecords.push({
    breach_id: 10,
    identity_hash: sha256('arjun_coder'),
    identity_type: 'username',
    exposed_fields: ['username', 'password'],
    extra: {
      discord_tag_linked: 'arjun#9981',
      total_playtime_hours: 312
    }
  });

  // ==========================================================================
  // VIVA SPECIAL TEST PERSONAS (5 Distinct Risk Profiles for Live Defense)
  // ==========================================================================

  // Persona 1: Rohan Verma (CRITICAL THREAT) - Leaked in 3 high-impact breaches
  breachRecords.push(
    {
      breach_id: 1, // Apex Health (Critical)
      identity_hash: sha256('rohan.verma@example.com'),
      identity_type: 'email',
      exposed_fields: ['password', 'financial', 'government_id', 'email'],
      extra: {
        insurance_policy: 'POL-CRIT-9921',
        ssn_last_four: '8812',
        hospital_id: 'HOSP-METRO-04'
      }
    },
    {
      breach_id: 5, // FinSecure Credit Archive (Critical)
      identity_hash: sha256('rohan.verma@example.com'),
      identity_type: 'email',
      exposed_fields: ['financial', 'security_questions', 'email'],
      extra: {
        credit_score_bracket: '720-750',
        account_number_suffix: '4491',
        bank_branch: 'Wall Street Central'
      }
    },
    {
      breach_id: 9, // CyberForums Darknet Repository (Critical)
      identity_hash: sha256('rohan.verma@example.com'),
      identity_type: 'email',
      exposed_fields: ['password', 'security_questions', 'email'],
      extra: {
        hash_format: 'SHA-512 crypt',
        dump_title: 'Global Darknet Credential Stuffing Compilation 2026'
      }
    }
  );

  // Persona 2: Pooja Rao (HIGH RISK / CREDENTIAL REUSE)
  breachRecords.push(
    {
      breach_id: 2, // CloudScale Nexus (High)
      identity_hash: sha256('pooja.rao@example.com'),
      identity_type: 'email',
      exposed_fields: ['password', 'phone', 'email'],
      extra: {
        api_token_exposed: true,
        department: 'Cloud Infrastructure DevOps'
      }
    },
    {
      breach_id: 6, // GigaShop Global (High)
      identity_hash: sha256('pooja.rao@example.com'),
      identity_type: 'email',
      exposed_fields: ['address', 'phone', 'email'],
      extra: {
        delivery_address_city: 'Bangalore',
        order_history_count: 47
      }
    }
  );

  // Persona 3: Vikram Malhotra (LOW RISK / MINIMAL FOOTPRINT)
  breachRecords.push(
    {
      breach_id: 4, // VoltUtility (Low)
      identity_hash: sha256('vikram.m@example.com'),
      identity_type: 'email',
      exposed_fields: ['email', 'ip_address'],
      extra: {
        tariff_code: 'DOMESTIC-STANDARD-2025'
      }
    },
    {
      breach_id: 8, // OmniTravel (Low)
      identity_hash: sha256('vikram.m@example.com'),
      identity_type: 'email',
      exposed_fields: ['username', 'email'],
      extra: {
        loyalty_tier: 'Silver Explorer'
      }
    }
  );

  // Persona 4: Ananya Iyer (MEDIUM RISK / HERO REMEDIATED PERSONA)
  breachRecords.push(
    {
      breach_id: 7, // StreamWave Media (Medium)
      identity_hash: sha256('ananya.iyer@example.com'),
      identity_type: 'email',
      exposed_fields: ['username', 'password'],
      extra: {
        forum_handle: 'ananya_coder',
        subscription_status: 'VIP'
      }
    },
    {
      breach_id: 10, // NexusPlay Gaming (Medium)
      identity_hash: sha256('ananya.iyer@example.com'),
      identity_type: 'email',
      exposed_fields: ['username', 'ip_address'],
      extra: {
        gamer_tag: 'AnanyaStrike',
        playtime_rank: 'Gold'
      }
    }
  );

  // Persona 5: Kabir Mehta (CLEAN SLATE - Zero Breaches Seeded)
  // No breach records inserted for kabir.mehta@example.com to maintain 0 exposures for live scanning demo!

  // 10. Generate 241 synthetic decoy records to reach ~250 records across breaches 1-10
  const fieldCombinations = [
    ['password', 'email'],
    ['password', 'username', 'ip_address'],
    ['financial', 'address', 'phone', 'email'],
    ['government_id', 'date_of_birth', 'email'],
    ['security_questions', 'password', 'username'],
    ['phone', 'address', 'date_of_birth'],
    ['email', 'ip_address'],
    ['password', 'financial', 'email'],
    ['username', 'ip_address', 'phone'],
    ['government_id', 'financial', 'password', 'email']
  ];

  for (let i = 1; i <= 241; i++) {
    const isEmail = i % 3 !== 0;
    const fakeIdent = isEmail ? `decoy_victim_${i}@synthetic-domain.org` : `decoy_handle_${i}`;
    const breachId = (i % 10) + 1; // Distribute evenly across breaches 1..10
    const fields = fieldCombinations[i % fieldCombinations.length];

    breachRecords.push({
      breach_id: breachId,
      identity_hash: sha256(fakeIdent),
      identity_type: isEmail ? 'email' : 'username',
      exposed_fields: fields,
      extra: {
        record_serial: `SYN-REC-${i.toString().padStart(5, '0')}`,
        hash_salt: `salt_${i}`,
        compromised_server: `srv-${(i % 5) + 1}.datacenter.internal`,
        decoy_flag: true
      }
    });
  }

  await breachRecordsCollection.insertMany(breachRecords);
  console.log(`✅ Seeded ${breachRecords.length} breach records into MongoDB (including demo targets and decoys).`);

  console.log('🎉 MongoDB seed completed successfully!');
}

if (require.main === module) {
  seedMongoData()
    .then(async () => {
      const client = await getMongoClient();
      await client.close();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal Mongo seed error:', err);
      const client = await getMongoClient();
      await client.close();
      process.exit(1);
    });
}
