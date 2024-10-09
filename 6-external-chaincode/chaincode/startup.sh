if [ ! -d /usr/src/app/node_modules ]; then
  echo "Install dependencies..."
  cd /usr/src/app && yarn install --no-bin-links
fi
cd /usr/src/app && yarn start
