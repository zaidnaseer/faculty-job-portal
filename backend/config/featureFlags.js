// Feature flags read at request time so they can be toggled via env vars
// without a code change (e.g. disabled locally, enabled in production).

const isEmailVerificationRequired = () => process.env.EMAIL_VERIFICATION_REQUIRED === 'true';

module.exports = { isEmailVerificationRequired };
