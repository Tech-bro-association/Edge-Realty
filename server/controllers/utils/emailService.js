const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "journalprojectjs@gmail.com",
        pass: newFunction()
    }
});

function newFunction() {
    return "abnnrzypwzqulhuj";
}

const mailOptions = (emailAddress, subject, message) => {
    return {
        from: "journalprojectjs@gmail.com",
        to: emailAddress,
        subject: subject,
        text: message
    };
};

function sendMail(mail_data) {
    return new Promise((resolve, reject) => {
        try {
            let user_mail_option = mailOptions(
                mail_data.email,
                mail_data.title,
                mail_data.message
            );

            // Send token and resetLink to user's Email address
            transporter.sendMail(user_mail_option, (error, info) => {
                if (error) { throw error } else { console.log("Email sent: " + info.response); resolve(info) }
            });
        } catch (error) {
            console.log(error);
            reject(error)
        }
    })

};


module.exports = {
    sendMail,
};

