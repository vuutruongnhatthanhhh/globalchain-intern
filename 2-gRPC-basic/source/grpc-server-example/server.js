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


// Implement the SayHello RPC method
// callback gửi một phản hồi duy nhất
function sayHello(call, callback) {
  console.log(call.request); // Log the received request
  const name = call.request.name;
  const age = call.request.age;

  const message = `Hello ${name}, Age: ${age}`;
  const timestamp = new Date().toISOString();

  callback(null, { message, timestamp });
}

// Create and start the gRPC server
function main() {
  const server = new grpc.Server();
  server.addService(helloProto.Greeter.service, { SayHello: sayHello });
  const port = '0.0.0.0:50051';
  server.bindAsync(port, grpc.ServerCredentials.createInsecure(), () => {
    console.log(`Server running at ${port}`);
    server.start();
  });
}

main();
