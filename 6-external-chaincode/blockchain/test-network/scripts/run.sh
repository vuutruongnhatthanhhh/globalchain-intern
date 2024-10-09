export CHAINCODE_SERVER_ADDRESS=0.0.0.0:9999
export CHAINCODE_ID=basicts3_1.0:9b1888b50809d21b9bfbd10c61bc802f38e41d11900d62b34c1fa31c89b59dbd
export CORE_CHAINCODE_ID_NAME=basicts3_1.0:9b1888b50809d21b9bfbd10c61bc802f38e41d11900d62b34c1fa31c89b59dbd

docker run --rm -d --name peer0org1_basicts3_ccaas --network fabric_test -e CHAINCODE_SERVER_ADDRESS=$CHAINCODE_SERVER_ADDRESS -e CHAINCODE_ID=$CHAINCODE_ID -e CORE_CHAINCODE_ID_NAME=$CORE_CHAINCODE_ID_NAME basicts3_ccaas_image:latest

docker run --rm -d --name peer0org2_basicts3_ccaas --network fabric_test -e CHAINCODE_SERVER_ADDRESS=$CHAINCODE_SERVER_ADDRESS -e CHAINCODE_ID=$CHAINCODE_ID -e CORE_CHAINCODE_ID_NAME=$CORE_CHAINCODE_ID_NAME basicts3_ccaas_image:latest

