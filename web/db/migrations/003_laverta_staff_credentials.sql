-- Justificatifs facultatifs fournis à l’inscription (carte de presse, matricule). Migration additive uniquement.
-- Accès : administrateurs uniquement ; la carte est chiffrée AES-256-GCM avec LAVERTA_MEDIA_ENCRYPTION_KEY.
CREATE TABLE IF NOT EXISTS laverta_staff_credentials (
  email TEXT PRIMARY KEY CHECK (email = lower(email) AND char_length(email) <= 254),
  user_id TEXT NOT NULL,
  matricule TEXT CHECK (matricule IS NULL OR char_length(matricule) BETWEEN 1 AND 60),
  card_ciphertext BYTEA,
  card_nonce BYTEA,
  card_tag BYTEA,
  card_mime_type TEXT CHECK (card_mime_type IS NULL OR card_mime_type IN ('image/jpeg', 'image/png', 'image/webp', 'application/pdf')),
  card_size INTEGER CHECK (card_size IS NULL OR card_size BETWEEN 1 AND 5242880),
  card_sha256 CHAR(64),
  consent_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT laverta_staff_credentials_card_fields_together CHECK (
    (card_ciphertext IS NULL AND card_nonce IS NULL AND card_tag IS NULL AND card_mime_type IS NULL AND card_size IS NULL AND card_sha256 IS NULL)
    OR
    (card_ciphertext IS NOT NULL AND card_nonce IS NOT NULL AND card_tag IS NOT NULL AND card_mime_type IS NOT NULL AND card_size IS NOT NULL AND card_sha256 IS NOT NULL)
  ),
  CONSTRAINT laverta_staff_credentials_not_empty CHECK (matricule IS NOT NULL OR card_ciphertext IS NOT NULL)
);
