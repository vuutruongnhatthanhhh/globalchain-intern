const User = require("../models/UserModel")
const bcrypt = require("bcryptjs")
const { generalAccessToken, generalRefreshToken } = require("./JwtService")
const { use } = require("../routes/UserRouter")

const grpc = require('@grpc/grpc-js');
const { connect, Contract, Identity, Signer, signers } = require('@hyperledger/fabric-gateway');
const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');
const { TextDecoder } = require('util');
const dotenv = require("dotenv");
const { createGatewayAndContract } = require("../utils");
dotenv.config()

// const channelName = envOrDefault('CHANNEL_NAME', 'mychannel');
// const chaincodeName = envOrDefault('CHAINCODE_NAME', 'basic');
const mspId = process.env.MSP_ID
function envOrDefault(envVar, defaultValue) {
    return process.env[envVar] || defaultValue;
}

// const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', 'org1.example.com'));
// Path to user certificate directory.
// const certDirectoryPath = envOrDefault('CERT_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'User1@org1.example.com', 'msp', 'signcerts'));

// Path to peer tls certificate.
// const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt'));

// Gateway peer endpoint.
// const peerEndpoint = envOrDefault('PEER_ENDPOINT', '172.20.0.205:7051');

// Gateway peer SSL host name override.
// const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

const utf8Decoder = new TextDecoder();




// function displayInputParameters() {
//     console.log(`channelName:       ${channelName}`);
//     console.log(`chaincodeName:     ${chaincodeName}`);
//     console.log(`mspId:             ${mspId}`);
//     console.log(`cryptoPath:        ${cryptoPath}`);
//     console.log(`keyDirectoryPath:  ${process.env.}`);
//     console.log(`certDirectoryPath: ${certDirectoryPath}`);
//     console.log(`tlsCertPath:       ${tlsCertPath}`);
//     console.log(`peerEndpoint:      ${peerEndpoint}`);
//     console.log(`peerHostAlias:     ${peerHostAlias}`);
// }



// async function getFirstDirFileName(dirPath) {
//     try {
//         const files = await fs.readdir(dirPath);
//         const file = files[0];
//         if (!file) {
//             throw new Error(`No files in directory: ${dirPath}`);
//         }
//         return path.join(dirPath, file);
//     } catch (error) {
//         console.error('Error getting first directory file name:', error);
//         throw error;
//     }
// }



async function getAllUserBlockchain(contract) {
    try {
        console.log('\n--> Evaluate Transaction: GetAllUser, function returns all the current user on the ledger');

        const resultBytes = await contract.evaluateTransaction('GetAllUser');

        const utf8Decoder = new TextDecoder('utf-8');
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);

        console.log('*** Result:', result);
        return result; // Trả về kết quả JSON
    } catch (error) {
        console.error('Error in getAllAssets:', error);
        throw error;
    }
}

// async function createUserBlockchain(contract) {
//     try {
//         console.log('\n--> Submit Transaction: CreateUser, creates new user');

//         await contract.submitTransaction(
//             'CreateUser',
//             '6',
//             'vuutruongnhatthanh',
//             '123',
//             'Vưu Trường Nhật Thanh',
//             '075202001346',
//             '28/01/2002',
//             'vuutruongnhatthanh@gmail.com',
//             '0'
//         );

//         console.log('*** Transaction committed successfully');
//     } catch (error) {
//         console.error('Error in createAsset:', error);
//         throw error;
//     }
// }

async function createUserBlockchain(contract, user) {
    try {
        console.log('\n--> Submit Transaction: CreateUser, creates new user');

        // Trích xuất thông tin từ đối tượng user
        const {
            id,
            username,
            password,
            name,
            citizenID,
            birthDay,
            email,
            isAdmin
        } = user;

        // Gọi phương thức submitTransaction với các tham số được truyền từ đối tượng user
        await contract.submitTransaction(
            'CreateUser',
            id,
            username,
            password,
            name,
            citizenID,
            birthDay,
            email,
            isAdmin
        );

        console.log('*** Transaction committed successfully');
    } catch (error) {
        console.error('Error in createAsset:', error);
        throw error;
    }
}

async function readUserByIDBlockchain(contract, id) {
    console.log(`\n--> Evaluate Transaction: ReadUser, function returns user attributes for ID: ${id}`);

    try {
        const resultBytes = await contract.evaluateTransaction('ReadUser', id);

        const resultJson = Buffer.from(resultBytes).toString('utf8');
        const result = JSON.parse(resultJson);

        console.log('*** Result:', result);
        return result; // Trả về kết quả đọc được từ blockchain
    } catch (error) {
        console.error('Error in readUserByID:', error);
        throw error;
    }
}

async function DeleteUserBlockchain(contract, id) {
    console.log(`\n--> Evaluate Transaction: Delete User`);

    try {
        await contract.submitTransaction('DeleteUser', id);

     

        console.log('*** Result: Delete Success');
       
    } catch (error) {
        console.error('Error in DeleteUser:', error);
        throw error;
    }
}



async function updateUserBlockchain(contract, updatedUser) {
    try {
        console.log('\n--> Submit Transaction: UpdateUser');

        // Trích xuất thông tin từ đối tượng user
        const {
            id,
            username,
            password,
            name,
            citizenID,
            birthDay,
            email,
            isAdmin
        } = updatedUser;

        // Gọi phương thức submitTransaction với các tham số được truyền từ đối tượng user
        await contract.submitTransaction(
            'UpdateUser',
            id.toString(),
            username,
            password,
            name,
            citizenID,
            birthDay,
            email,
            isAdmin.toString()
        );

        console.log('*** Transaction committed successfully');
    } catch (error) {
        console.error('Error in updateUserBlockchain:', error);
        throw error;
    }
}

async function getAllProductsBlockchain(contract) {
    try {
        console.log('\n--> Evaluate Transaction: GetAllProducts, function returns all the current products on the ledger');

        const resultBytes = await contract.evaluateTransaction('GetAllProducts');

        const utf8Decoder = new TextDecoder('utf-8');
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);

        console.log('*** Result:', result);
        return result; // Trả về kết quả JSON
    } catch (error) {
        console.error('Error in getAllProducts:', error);
        throw error;
    }
}

async function createProductBlockchain(contract, product) {
    try {
        console.log('\n--> Submit Transaction: CreateProduct, creates new product');

        // Trích xuất thông tin từ đối tượng product
        const {
            productId,
            name,
            description,
            price,
            quantity
        } = product;

        // Gọi phương thức submitTransaction với các tham số được truyền từ đối tượng product
        await contract.submitTransaction(
            'CreateProduct',
            productId,
            name,
            description,
            price.toString(), // Convert price to string
            quantity.toString() // Convert quantity to string
        );

        console.log('*** Transaction committed successfully');
    } catch (error) {
        console.error('Error in createProduct:', error);
        throw error;
    }
}


// Xử lý api ở đây
const getAllUser = () =>{
    return new Promise(async(resolve, reject) =>{
        try{
   
          const { contract } = await createGatewayAndContract();
          const result = await getAllUserBlockchain(contract);

        
          resolve(result);

       

        
        }catch(e){
            reject(e)
        }
    })
}


const getAllProduct = () =>{
    return new Promise(async(resolve, reject) =>{
        try{
   
          const { contract } = await createGatewayAndContract();
          const result = await getAllProductsBlockchain(contract);

        
          resolve(result);

       

        
        }catch(e){
            reject(e)
        }
    })
}




const createUser = (user) =>{
    return new Promise(async(resolve, reject) =>{
       
        try{
           
          const { contract } = await createGatewayAndContract();
        const result=  await createUserBlockchain(contract, user);
  
        
        
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: result
            })
        


        }catch(e){
            reject(e)
        }
    })
}


const createProduct = (product) =>{
    return new Promise(async(resolve, reject) =>{
       
        try{
           
          const { contract } = await createGatewayAndContract();
        const result=  await createProductBlockchain(contract, product);
  
        
        
            resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: result
            })
        


        }catch(e){
            reject(e)
        }
    })
}

const checkEmail = (email) =>{
    return new Promise(async(resolve, reject) =>{
        // console.log('emailSv',email)
        try{
            // Check xem email đã tồn tại trong db hay chưa, nếu chưa tồn tại trả về null
          
       
           
         
            
        }catch(e){
            reject(e)
        }
    })
}

const loginUser = (userLogin) =>{
    return new Promise(async(resolve, reject) =>{
        const {email, password} = userLogin
        try{
            // Check xem email đã tồn tại trong db hay chưa, nếu chưa tồn tại trả về null
            const checkUser = await User.findOne({
                email : email
            })
          if(checkUser===null){
            resolve({
                status: 'ERR',
                message: 'The user is not defined'
            })
          }
        //   Kiểm tra password mã hóa và password mã hóa được lưu trong db
        // comparePassword là true thì mật khẩu trùng khớp và ngược lại
          const comparePassword  = bcrypt.compareSync(password, checkUser.password)
            // gọi bên model
            // const createdUser = await User.create({
            //     name, 
            //     email, 
            //     password: hash, 
            //     phone
            // })
            // if(createdUser){
                if(!comparePassword){
                    resolve({
                        status: 'ERR',
                        message: 'The password or user is incorrect'
                    })
                }


                // Mình sẽ lấy được 1 cái mã access_token, paste nó vào jwt.io là biết được id và isadmin của cái tài khoản đó
                const access_token = await generalAccessToken({
                    id: checkUser.id,
                    isAdmin: checkUser.isAdmin
                })

                // Trong trường hợp access_token hết hạn thì refresh token sẽ cấp lại 1 cái token mới
                const refresh_token = await generalRefreshToken({
                    id: checkUser.id,
                    isAdmin: checkUser.isAdmin
                })

                // Trả về cái thằng user có cái email đó sau khi hoàn thành các bước kiểm tra
                // Không trả về user mà trả về cái access_token của cái tài khoản đó
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    access_token,
                    refresh_token
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}

const updateUser = (id, user) =>{
    return new Promise(async(resolve, reject) =>{
        const {
            username,
            password,
            name,
            citizenID,
            birthDay,
            email,
            isAdmin
        } = user;
        const updatedUser = { id, username, password, name, citizenID, birthDay, email, isAdmin };
        try{
          
            const { contract } = await createGatewayAndContract();

              const result=  await updateUserBlockchain(contract, updatedUser);

              resolve({
                status: 'OK',
                message: 'SUCCESS',
                data: result
            })

        }catch(e){
            reject(e)
        }
    })
}

const deleteUser = (id) =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
          
            const { contract } = await createGatewayAndContract();

              await DeleteUserBlockchain(contract, id)
              resolve({
                status: 'OK',
                message: 'SUCCESS',
               
            })

        }catch(e){
            reject(e)
        }
    })
}

const deleteManyUser = (ids) =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
           
            // delete user
             await User.deleteMany({_id: ids})
                resolve({
                    status: 'OK',
                    message: 'DELETE USER SUCCESS',
                    // Trả về user mới sau khi update
                })
            // }
            // resolve({})
        }catch(e){
            reject(e)
        }
    })
}




const getDetailsUser = (id) =>{
    return new Promise(async(resolve, reject) =>{
        try{
      
            const user = await User.findOne({
                _id: id
            })
            // console.log('user',user)
            if(user===null){
                resolve({
                    status: 'OK',
                    message: 'The user is not defined'
                })
            }
                resolve({
                    status: 'OK',
                    message: 'SUCCESS',
                    data: user
                })
            // }
            // resolve({})

           

        }catch(e){
            reject(e)
        }
    })
}

const getDetailsUserBlockchain = (id) =>{
    return new Promise(async(resolve, reject) =>{
        try{
            const { contract } = await createGatewayAndContract();
  const result=  await readUserByIDBlockchain(contract, id);
  resolve({
    status: 'OK',
    message: 'SUCCESS',
    data: result
})
           

        }catch(e){
            reject(e)
        }
    })
}





module.exports = {
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getAllUser,
    getDetailsUser,
    deleteManyUser,
    checkEmail,
    getDetailsUserBlockchain,
    createProduct,
    getAllProduct
  
}