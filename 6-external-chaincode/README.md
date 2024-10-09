# Hướng dẫn sử dụng

1.Tạo ra 2 tổ chức có ca và world state sử dụng là couchdb.
./network.sh up

2.Xóa sạch mạng hiện có
./network.sh down

3.Deploy external chaincode
./network.sh deployCCASS --name chaincodename
(chaincodename là tên của chaincode, lưu ý nếu deploy trùng tên thì phải vào blockchain/externalCCInfo tăng biến CC_SEQUENCE lên 1 đơn vị )

4.Chạy môi trường dev cho chaincode
Trong folder chaincode chạy lệnh
docker compose up
