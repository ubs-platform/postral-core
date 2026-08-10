#!/bin/bash
source tools/loadenv.sh dev.env apps/$1/dev.env
nest start -w $1 --memoryLimit=512 ${@:2}
