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

// Create the client
const client = new helloProto.Greeter('localhost:50051', grpc.credentials.createInsecure());

// Call the SayHello method
client.sayHello({ name: 'World', age: 25 }, (error, response) => {
  if (!error) {
    console.log('Greeting:', response.message);
    console.log('Timestamp:', response.timestamp);
  } else {
    console.error('Error:', error);
  }
});
