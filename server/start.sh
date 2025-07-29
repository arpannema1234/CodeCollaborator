#!/bin/bash

# Start script for Render
echo "Starting server with Daphne on 0.0.0.0:$PORT"
daphne -b 0.0.0.0 -p $PORT server.asgi:application
