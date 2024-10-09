#!/bin/bash

# Kiểm tra nếu tham số truyền vào không tồn tại
if [ -z "$1" ]; then
  echo "Usage: $0 <appUser>"
  exit 1
fi

# Lấy tham số truyền vào
USER_ID=$1

# Bước 1: Đưa path có file nhị phân vào
export PATH=$PATH:./src/binary

# Bước 2: Thiết lập biến môi trường
export FABRIC_CA_CLIENT_HOME=../test-network/organizations/peerOrganizations/org1.example.com/

# Bước 3: Chạy revoke
fabric-ca-client revoke -e $USER_ID --gencrl --tls.certfiles ${PWD}/src/fabricCA/tls-cert.pem

# Bước 4: Mã hóa theo base64 và đưa vào thư mục chạy
base64 -i ../test-network/organizations/peerOrganizations/org1.example.com/msp/crls/crl.pem > crl_base64

# Bước 5: Thiết lập các biến môi trường
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID=Org1MSP
export CORE_PEER_TLS_ROOTCERT_FILE=../test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=../test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# Bước 6: Cần file core.yaml
peer channel fetch config -c mychannel

# Bước 7: Chạy configtxlator và sửa đổi config.json
configtxlator proto_decode --input mychannel_config.block --type common.Block --output mychannel_config.json
jq .data.data[0].payload.data.config mychannel_config.json > config.json
jq --arg new "$(cat crl_base64)" '.channel_group.groups.Application.groups.Org1MSP.values.MSP.value.config.revocation_list? += [$new]' config.json > modified_config.json
configtxlator proto_encode --input config.json --type common.Config --output config.pb
configtxlator proto_encode --input modified_config.json --type common.Config --output modified_config.pb
configtxlator compute_update --channel_id mychannel --original config.pb --updated modified_config.pb --output crl_update.pb
configtxlator proto_decode --input crl_update.pb --type common.ConfigUpdate --output crl_update.json
echo '{"payload":{"header":{"channel_header":{"channel_id":"mychannel", "type":2}},"data":{"config_update":'$(cat crl_update.json)'}}}' | jq . > crl_update_in_envelope.json
configtxlator proto_encode --input crl_update_in_envelope.json --type common.Envelope --output crl_update_in_envelope.pb

# Bước 8: Cần file ca.crt của orderer
peer channel update -f crl_update_in_envelope.pb -c mychannel -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile src/fabricCA/ca.crt
