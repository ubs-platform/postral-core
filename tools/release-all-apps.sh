# !/bin/bash
#skip "testo" app for now, because it is not ready for release yet

APPS=$(ls apps)
for APP in $APPS; do
    if [ "$APP" == "testo" ]; then
        echo "Skipping $APP"
        continue
    fi
    echo "Releasing $APP"
    $(dirname ${BASH_SOURCE[0]})/release-app.sh $APP
done
