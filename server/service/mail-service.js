import nodemailer from 'nodemailer'

class MailService {

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: "btihovic@gmail.com",
                pass: "qxmjlnmvnciazzwr",
            }
        })
    }
    async sendActivationEmail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMPT_USER,
            to,
            subject: 'Activation account' + process.env.API_URL,
            text: '',
            html:
                `
                    <div>
                        <h1>Follow the link to activate</h1>
                        <a href="${link}">${link}</a>
                    <div/>
                `
        })
    }

}

export default new MailService