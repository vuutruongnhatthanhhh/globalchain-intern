const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load the protobuf definition
const PROTO_PATH = path.join(__dirname, 'helloworld.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});
const helloProto = grpc.loadPackageDefinition(packageDefinition).helloworld;

// Implement the ListGreetings RPC method
function listGreetings(call) {
  const count = call.request.count;
  console.log(`Client requested ${count} greetings`);

//   call.write gửi được nhiều phản hồi
  for (let i = 1; i <= count; i++) {
    call.write({ message: `Greeting ${i}` });
  }

  call.end(); // Kết thúc luồng dữ liệu
}

// Create and start the gRPC server
function main() {
  const server = new grpc.Server();
  server.addService(helloProto.Greeter.service, { listGreetings });
  const port = '0.0.0.0:50051';
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Server running at ${port}`);
    server.start();
  });
}

main();
