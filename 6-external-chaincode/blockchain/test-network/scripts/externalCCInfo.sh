CHANNEL_NAME=${1:-"mychannel"}
CC_NAME=${2:-"basicts3"}
CC_SRC_PATH=${3:-"../../asset-transfer-basic/chaincode-typescript"}
CCAAS_DOCKER_RUN=${4:-"true"}
CC_VERSION=${5:-"1.0"}
# Increase the sequence by 1 each time you run it.
CC_SEQUENCE=${6:-"33"}
CC_INIT_FCN=${7:-"NA"}
CC_END_POLICY=${8:-"NA"}
CC_COLL_CONFIG=${9:-"NA"}
DELAY=${10:-"3"}
MAX_RETRY=${11:-"5"}
VERBOSE=${12:-"false"}

CCAAS_SERVER_PORT=9999


: ${CONTAINER_CLI:="docker"}
if command -v ${CONTAINER_CLI}-compose > /dev/null 2>&1; then
    : ${CONTAINER_CLI_COMPOSE:="${CONTAINER_CLI}-compose"}
else
    : ${CONTAINER_CLI_COMPOSE:="${CONTAINER_CLI} compose"}
fi

# FABRIC_CFG_PATH=$PWD/../config/

# TEST_NETWORK_HOME=${TEST_NETWORK_HOME:-${PWD}}
export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=../organizations/ordererOrganizations/example.com/tlsca/tlsca.example.com-cert.pem
export PEER0_ORG1_CA=../organizations/peerOrganizations/org1.example.com/tlsca/tlsca.org1.example.com-cert.pem
export PEER0_ORG2_CA=../organizations/peerOrganizations/org2.example.com/tlsca/tlsca.org2.example.com-cert.pem
export PEER0_ORG3_CA=../organizations/peerOrganizations/org3.example.com/tlsca/tlsca.org3.example.com-cert.pem




function errorln() {
  println "${C_RED}${1}${C_RESET}"
}

function fatalln() {
  errorln "$1"
  exit 1
}

# Set environment variables for the peer org
setGlobals() {
  local USING_ORG=""
  if [ -z "$OVERRIDE_ORG" ]; then
    USING_ORG=$1
  else
    USING_ORG="${OVERRIDE_ORG}"
  fi
  if [ $USING_ORG -eq 1 ]; then
    export CORE_PEER_LOCALMSPID=Org1MSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
    export CORE_PEER_MSPCONFIGPATH=../organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
  elif [ $USING_ORG -eq 2 ]; then
    export CORE_PEER_LOCALMSPID=Org2MSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG2_CA
    export CORE_PEER_MSPCONFIGPATH=../organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
  elif [ $USING_ORG -eq 3 ]; then
    export CORE_PEER_LOCALMSPID=Org3MSP
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
    export CORE_PEER_MSPCONFIGPATH=../organizations/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
    export CORE_PEER_ADDRESS=localhost:11051
  else
    errorln "ORG Unknown"
  fi

  if [ "$VERBOSE" = "true" ]; then
    env | grep CORE
  fi
}

# parsePeerConnectionParameters $@
# Helper function that sets the peer connection parameters for a chaincode
# operation
parsePeerConnectionParameters() {
  PEER_CONN_PARMS=()
  PEERS=""
  while [ "$#" -gt 0 ]; do
    setGlobals $1
    PEER="peer0.org$1"
    ## Set peer addresses
    if [ -z "$PEERS" ]
    then
	PEERS="$PEER"
    else
	PEERS="$PEERS $PEER"
    fi
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" --peerAddresses $CORE_PEER_ADDRESS)
    ## Set path to TLS certificate
    CA=PEER0_ORG$1_CA
    TLSINFO=(--tlsRootCertFiles "${!CA}")
    PEER_CONN_PARMS=("${PEER_CONN_PARMS[@]}" "${TLSINFO[@]}")
    # shift by one to get to the next organization
    shift
  done
}

verifyResult() {
  if [ $1 -ne 0 ]; then
    fatalln "$2"
  fi
}

function installChaincode() {
  ORG=$1
  setGlobals $ORG

  > log.txt

  peer lifecycle chaincode queryinstalled --output json 2>/dev/null | jq -r 'try (.installed_chaincodes[].package_id)' | grep ^${PACKAGE_ID}$ >/dev/null

  if [ $? -ne 0 ]; then
    peer lifecycle chaincode install ${CC_NAME}.tar.gz >/dev/null 2>&1
  fi
}



function resolveSequence() {
  if [[ "${CC_SEQUENCE}" != "auto" ]]; then
    return 0
  fi

  local rc=1
  local COUNTER=1
  
  while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ]; do
    COMMITTED_CC_SEQUENCE=$(peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME} 2>/dev/null | sed -n "/Version:/{s/.*Sequence: //; s/, Endorsement Plugin:.*$//; p;}")
    res=$?
    let rc=$res
    COUNTER=$((COUNTER + 1))
  done

  if [ -z "$COMMITTED_CC_SEQUENCE" ]; then
    CC_SEQUENCE=1
    return 0
  fi

  rc=1
  COUNTER=1
  
  while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ]; do
    APPROVED_CC_SEQUENCE=$(peer lifecycle chaincode queryapproved --channelID $CHANNEL_NAME --name ${CC_NAME} 2>/dev/null | sed -n "/sequence:/{s/^sequence: //; s/, version:.*$//; p;}")
    res=$?
    let rc=$res
    COUNTER=$((COUNTER + 1))
  done

  if [ "$COMMITTED_CC_SEQUENCE" == "$APPROVED_CC_SEQUENCE" ]; then
    CC_SEQUENCE=$((COMMITTED_CC_SEQUENCE + 1))
  else
    CC_SEQUENCE=$APPROVED_CC_SEQUENCE
  fi
}


function approveForMyOrg() {
  ORG=$1
  setGlobals $ORG

  peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence ${CC_SEQUENCE} ${INIT_REQUIRED} ${CC_END_POLICY} ${CC_COLL_CONFIG} >/dev/null 2>&1

  res=$?
  if [ $res -ne 0 ]; then
    echo "Detailed error output:"
  peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" --channelID $CHANNEL_NAME --name ${CC_NAME} "${PEER_CONN_PARMS[@]}" --version ${CC_VERSION} --sequence ${CC_SEQUENCE} ${INIT_REQUIRED} ${CC_END_POLICY} ${CC_COLL_CONFIG} 2>&1
  fi
}


function commitChaincodeDefinition() {
  parsePeerConnectionParameters $@
  res=$?
  verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters"

  peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "$ORDERER_CA" --channelID $CHANNEL_NAME --name ${CC_NAME} "${PEER_CONN_PARMS[@]}" --version ${CC_VERSION} --sequence ${CC_SEQUENCE} ${INIT_REQUIRED} ${CC_END_POLICY} ${CC_COLL_CONFIG} >/dev/null 2>&1

  res=$?
  if [ $res -ne 0 ]; then
    echo "Error commit: $res." >&2
  fi
}

packageChaincode() {
  address="{{.peername}}_${CC_NAME}_ccaas:${CCAAS_SERVER_PORT}"
  prefix=$(basename "$0")
  tempdir=$(mktemp -d -t "$prefix.XXXXXXXX") || { echo "Error creating temporary directory" >&2; exit 1; }
  label=${CC_NAME}_${CC_VERSION}
  mkdir -p "$tempdir/src"

  cat > "$tempdir/src/connection.json" <<CONN_EOF
{
  "address": "${address}",
  "dial_timeout": "10s",
  "tls_required": false
}
CONN_EOF

  mkdir -p "$tempdir/pkg"

  cat << METADATA-EOF > "$tempdir/pkg/metadata.json"
{
    "type": "ccaas",
    "label": "$label"
}
METADATA-EOF

  tar -C "$tempdir/src" -czf "$tempdir/pkg/code.tar.gz" .
  tar -C "$tempdir/pkg" -czf "$CC_NAME.tar.gz" metadata.json code.tar.gz
  rm -Rf "$tempdir"

  PACKAGE_ID=$(peer lifecycle chaincode calculatepackageid ${CC_NAME}.tar.gz)
  
  # Print only PACKAGE_ID
  echo $PACKAGE_ID
}

## package the chaincode
packageChaincode

## Install chaincode on peer0.org1 and peer0.org2
installChaincode 1
installChaincode 2

resolveSequence

## approve the definition for org1
approveForMyOrg 1

## now approve also for org2
approveForMyOrg 2

## now that we know for sure both orgs have approved, commit the definition
commitChaincodeDefinition 1 2

exit 0
