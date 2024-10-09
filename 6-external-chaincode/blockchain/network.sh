# chmod 755 *
# up and down network
if [ "$1" == "up" ]; then
  ./test-network/network.sh up createChannel -ca -c mychannel -s couchdb
elif [ "$1" == "down" ]; then
 ./test-network/network.sh down
elif [ "$1" == "deployCCASS" ]; then
  if [ "$2" == "--name" ]; then
    CC_NAME=$3
    
    OUTPUT=$(./externalCCInfo.sh mychannel $CC_NAME)
    
    echo "Chaincode id: $OUTPUT"
    CHAINCODE_ID=$(echo $OUTPUT)
    CHAINCODE_SERVER_ADDRESS=0.0.0.0:$(grep "CCAAS_SERVER_PORT" ./externalCCInfo.sh | head -n 1 | cut -d '=' -f2 | tr -d ' ')
    PORT=$(grep "CCAAS_SERVER_PORT" ./externalCCInfo.sh | head -n 1 | cut -d '=' -f2 | tr -d ' ')
    ENV_FILE="../chaincode/.env"
    echo "CHAINCODE_NAME=$CC_NAME" > $ENV_FILE
    echo "CHAINCODE_ID=$CHAINCODE_ID" >> $ENV_FILE
    echo "CHAINCODE_SERVER_ADDRESS=$CHAINCODE_SERVER_ADDRESS" >> $ENV_FILE
    echo "PORT=$PORT" >> $ENV_FILE
  else
    echo "error: --name parameter is required for deployCCASS"
    exit 1
  fi
else
  echo "error command"
  exit 1
fi


