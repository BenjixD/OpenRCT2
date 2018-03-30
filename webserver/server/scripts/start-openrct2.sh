#1 /bin/bash

#sanity check parameters
if [ "$#" -ne 2 ];
	then echo "not enough arguments"
	exit 1
fi

FILE = "$1"
PORT = "$2"

#Check save file exits
if [ ! -f "$FILE" ]; then
	echo "file not found"
	exit 2
fi

#Check if valid port
if[ "$PORT" -le 0 -o "$PORT" -ge 65535 ];
	echo "invalid port number"
	exit 3
fi

#run command
~/OpenRCT2/build/openrct2 host "$FILE" --port "$PORT" --headless --verbose
echo "game is starting: $FILE : $PORT!"

exit 0
