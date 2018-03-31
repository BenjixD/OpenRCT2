#!/bin/bash

#sanity check parameters
if [ "$#" -ne 2 ];
        then echo "not enough arguments"
        exit 1
fi

FILE="$1"
PORT="$2"

#Check save file exits
if [ ! -f "$FILE" ]; then
        echo "file not found"
        exit 2
fi

#Check if valid port
if [ "$PORT" -le 0 -o "$PORT" -ge 65535 ]; then
        echo "invalid port number"
        exit 3
fi

#Check if port is open
nc -z 127.0.0.1 "$PORT"
if [ "$?" -eq 0 ]; then
        echo "port is being used"
        exit 4
fi

exit 0
