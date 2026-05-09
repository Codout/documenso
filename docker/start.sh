#!/bin/sh

# Banner: Codout Sign on the branded build, Documenso otherwise.
# We keep behaviour identical — only the printed strings differ.
if [ "$NEXT_PUBLIC_CODOUT_BRANDED_BUILD" = "true" ]; then
    APP_LABEL="Codout Sign"
    DOCS_URL="https://github.com/codout/documenso/blob/main/DEPLOY_AZURE.md"
    SELFHOST_URL="https://github.com/codout/documenso#deploy-codout-sign-on-azure-container-apps"
    REPO_URL="https://github.com/codout/documenso"
else
    APP_LABEL="Documenso"
    DOCS_URL="https://docs.documenso.com"
    SELFHOST_URL="https://docs.documenso.com/developers/self-hosting"
    REPO_URL="https://github.com/documenso/documenso"
fi

printf "Starting %s...\n\n" "$APP_LABEL"

printf "Checking certificate configuration...\n"

CERT_PATH="${NEXT_PRIVATE_SIGNING_LOCAL_FILE_PATH:-/opt/documenso/cert.p12}"

if [ -f "$CERT_PATH" ] && [ -r "$CERT_PATH" ]; then
    printf "Certificate file found at %s — signing ready.\n" "$CERT_PATH"
elif [ -n "$NEXT_PRIVATE_SIGNING_LOCAL_FILE_CONTENTS" ]; then
    printf "Certificate base64 contents detected — signing will resolve at runtime.\n"
    printf "If signing fails, hit /api/certificate-status to verify decode.\n"
else
    printf "Certificate not found or not readable.\n"
    printf "%s will still start, but document signing will be unavailable.\n" "$APP_LABEL"
    printf "Check /api/certificate-status for detailed status.\n"
fi

printf "\nUseful links:\n"
printf "  Docs:                %s\n" "$DOCS_URL"
printf "  Self-hosting guide:  %s\n" "$SELFHOST_URL"
printf "  Source repository:   %s\n" "$REPO_URL"
printf "  Health check:        \$INTERNAL_URL/api/health\n"
printf "  Certificate status:  \$INTERNAL_URL/api/certificate-status\n\n"

printf "Running database migrations...\n"
npx prisma migrate deploy --schema ../../packages/prisma/schema.prisma

printf "Starting %s server...\n" "$APP_LABEL"
HOSTNAME=0.0.0.0 node build/server/main.js
