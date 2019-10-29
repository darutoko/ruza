#!/usr/bin/bash
rm -rf /home/darutoko/Web/ruza/public
cp -r /home/darutoko/Development/ruza/web/dist /home/darutoko/Web/ruza/public
cp -r /home/darutoko/Development/ruza/core/public /home/darutoko/Web/ruza/public
cp -r /home/darutoko/Development/ruza/core/db /home/darutoko/Web/ruza/db
cp -r /home/darutoko/Development/ruza/core/graphql /home/darutoko/Web/ruza/graphql
cp -r /home/darutoko/Development/ruza/core/middleware /home/darutoko/Web/ruza/middleware
cp /home/darutoko/Development/ruza/core/app.js /home/darutoko/Web/ruza/app.js
cp /home/darutoko/Development/ruza/core/config.js /home/darutoko/Web/ruza/config.js
cp /home/darutoko/Development/ruza/core/package.json /home/darutoko/Web/ruza/package.json
cp /home/darutoko/Development/ruza/core/package-lock.json /home/darutoko/Web/ruza/package-lock.json