#!/usr/bin/env bash
set -euo pipefail

#skip "testo" app for now, because it is not ready for release yet

for APP_DIR in apps/*/; do
    APP=$(basename "$APP_DIR")

    ## TODO: Testo uygulaması hazır değil.
    ## TODO: Integration Iyzico uygulaması hazır değil. Tamamlanınca release edilecek.
    if [ "$APP" = "testo" ] || [ "$APP" = "integration-iyzico" ]; then
        echo "Skipping $APP"
        continue
    fi

    echo "Releasing $APP"
    $(dirname ${BASH_SOURCE[0]})/release-app.sh $APP
done
