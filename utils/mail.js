const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USERNAME, // generated ethereal user
        pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
});

module.exports = {
    async sendMail(email, subject, html) {
        
    
        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: `"PAB Jobs " <${process.env.SMTP_USERNAME}>`, // sender address
            to: email, // list of receivers
            // to: process.env.SMTP_USERNAME,
            subject,//: "Daily Report of "+date, // Subject line
            // text: "Hello world?", // plain text body
            html,//: `<p>Hi,</p>
                // <p>Your daily report of ${date} is attached to this mail</p>    
            // `, // html body
            // attachments: [
            //     {   // utf-8 string as an attachment
            //         filename: 'report.pdf',
            //         content: file
            //     }
            // ]
        });

        console.log("Message sent: ", info.messageId);

        return info.messageId;
    
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    
        // Preview only available when sending through an Ethereal account
        // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
}
