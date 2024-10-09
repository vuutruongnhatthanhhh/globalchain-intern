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

// Call the ListGreetings method
const call = client.listGreetings({ count: 5 });

call.on('data', (response) => {
  console.log('Received:', response.message);
});

call.on('end', () => {
  console.log('Server has finished sending data.');
});

call.on('error', (error) => {
  console.error('Error:', error);
});
