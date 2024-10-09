export CCAAS_DOCKER_RUN=true
export CC_NAME=basicts3
export CC_SRC_PATH=../../asset-transfer-basic/chaincode-typescript-copyright/
export CONTAINER_CLI=docker

 successln() {
echo "[SUCCESS] $*"
 }

verifyResult() {
    if [ $1 -ne 0 ]; then
        exit 1
    fi
}

buildDockerImages() {
    if [ "$CCAAS_DOCKER_RUN" = "true" ]; then
        set -x
        ${CONTAINER_CLI} build -f $CC_SRC_PATH/Dockerfile -t ${CC_NAME}_ccaas_image:latest --build-arg CC_SERVER_PORT=9999 $CC_SRC_PATH > /dev/null 2>&1
        res=$?
        { set +x; } 2>/dev/null
        verifyResult $res "Docker build of chaincode-as-a-service container failed"
         successln "Docker image '${CC_NAME}_ccaas_image:latest' built successfully" 
    else
        :
    fi
}

buildDockerImages
