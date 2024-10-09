if [ -d "./META-INF/statedb/couchdb/indexes" ]; then
  rm -rf "./META-INF/statedb/couchdb/indexes"
else
  mkdir -p "./META-INF/statedb/couchdb/indexes"
fi

find -type d -name "__index__" -exec bash -c 'if [ -n "$(find "{}" -maxdepth 1 -type f)" ]; then cp -r "{}/." ./META-INF/statedb/couchdb/indexes; fi' \;