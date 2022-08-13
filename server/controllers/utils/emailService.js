const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "journalprojectjs@gmail.com",
        pass: "abnnrzypwzqulhuj"
    }
});

const mailOptions = (emailAddress, subject, message) => {
    return {
        from: "journalprojectjs@gmail.com",
        to: emailAddress,
        subject: subject,
        text: message
    };
};

module.exports = {
    nodemailer,
    transporter,
    mailOptions
};
