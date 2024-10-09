const nodemailer = require('nodemailer')
const dotenv = require("dotenv");

dotenv.config()

 const convertPrice = (price) => {
  try {
      const result  = price?.toLocaleString().replaceAll(',', '.')
      return `${result}`
  } catch (error) {
      return null
  }
}

const sendEmailCreateOrder = async (email, orderItems) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secusre: true, // Use `true` for port 465, `false` for all other ports
        auth: {
          user: process.env.MAIL_ACCOUNT,
          pass: process.env.MAIL_PASSWORD,
        },
      });

      let listItem = ''
      const attachImage = []
      orderItems.forEach((order) =>{
        listItem += `<div>
        <div>Sản phẩm: <b>${order.name}</b>, số lượng: <b>${order.amount}</b>, giá tiền: <b>${convertPrice(order.price)} VND</b></div>
       
        </div>`
        attachImage.push({path: order.image})
      })
      
      const info = await transporter.sendMail({
        from: process.env.MAIL_ACCOUNT, // sender address
        to: email, // list of receivers
        subject: "Bạn đã đặt hàng tại TLPN", // Subject line
        text: "Bạn đã đặt hàng thành công", // plain text body
        html: `<div><b>Bạn đã đặt hàng thành công tại TLPN</b><br>(Hình ảnh sản phẩm được đính kèm bên dưới)</div>${listItem}`, // html body
        attachments: attachImage,
      });
}

module.exports = {
    sendEmailCreateOrder ,
    convertPrice
}