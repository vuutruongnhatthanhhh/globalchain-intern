# Requirement

## Cấu trúc thư mục

6-external-chaincode/
├── chaincode
│ └── docker-compose.yaml # dùng để chạy một service để dev
└── blockchain
├── tesk-network # giữ nguyên không thay đổi
└── network.sh # tự viết scripts

## Cách end-user sử dụng

B1: Người dùng pull source trên về
B2: Vào blockchain chạy lệnh ./network.sh up
B3: Vào blockchain chạy lệnh ./network.sh deployCCAAS --name "chaincode_v1"
B4: Vào chaincode chạy lệnh docker compose up dev để bắt đầu code

## Yêu cầu về file network.sh tự viết

Mục đích là để đơn giản hóa quá trình liên quan đến blockchain

- File này gồm có 3 hàm

  1. up
  2. down
  3. deployCCASS

- Đối với hàm "up":

  1. Khi chạy không nhận bất kì đối số nào
  2. Dựng lên một mạng blockchain với 2 tổ chức có CA và work state sử dụng là couchdb.

- Đối với hàm "down":

  1. Khi chạy không nhận bất kì đối số nào
  2. Dọn dẹp sạch mạng hiện có

- Đối với hàm "deployCCAAS"
  1. Khi chạy nhận một đối số duy nhất đó là --name
  2. Thực hiện nhiệm vụ package như sau:
  ```sh
  local address="{{.peername}}_${CC_NAME}_ccaas:${CCAAS_SERVER_PORT}"
  {
    "address": "${address}",
    "dial_timeout": "10s",
    "tls_required": false
  }
  ```
  Trường {{.peername}} để cấu hình cho mỗi peer gọi đến một chaincode riêng
  Nhưng trong trường hợp dev của cần gọi đến chaincode dev nên bỏ trường này đi
  Kết quả:
  ```sh
  local address="${CC_NAME}_ccaas:${CCAAS_SERVER_PORT}"
  {
    "address": "${address}",
    "dial_timeout": "10s",
    "tls_required": false
  }
  ```
  3. Thực hiện các nhiệm vụ install, approve, commit
  4. Kết quả in ra là CHAINCODE_ID
  5. Tạo ra một file .env bên folder chainccode.
     Chứa các thông tin cần thiết để run chaincode
  ```.env
  CHAINCODE_NAME=
  CHAINCODE_ID=
  CHAINCODE_SERVER_ADDRESS=
  ```

## Yêu cầu về file docker-compose.yaml

1. Có một service tên là chaincode-dev
2. Sử dụng image node:18.19.0
3. Service này sẽ sử dụng file .env để
   - Đặt tên container theo biến CHAINCODE_NAME
   - Các biến còn lại sử dụng để khởi tạo env cho container
4. Service này sử dụng mạng chung với mạng blockchain
5. Volumn source vào service này
6. Thiết lập lệnh cmd để chạy được bash hoặc shell

# Reference documents

https://viblo.asia/p/tao-moi-truong-develop-nodejs-voi-docker-nwmGyMJgGoW
