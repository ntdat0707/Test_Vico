import SMTPTransport = require('nodemailer/lib/smtp-transport');

import * as nodemailer from 'nodemailer';
// var nodeoutlook = require('nodejs-nodemailer-outlook');
interface IEmailOptions {
  receivers: string | string[];
  subject: string;
  type: 'text' | 'html';
  message: string;
  cc?: string | string[];
}

const sendEmailViaNodemailer = async (options: IEmailOptions): Promise<any> => {
  try {
    const receivers: string = Array.isArray(options.receivers) ? options.receivers.join(',') : options.receivers;
    let cc: string = null;
    if (options.cc) {
      cc = Array.isArray(options.cc) ? options.cc.join(',') : options.cc;
    }
    const auth = {
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      // proxy: 'http://user:pass@localhost:8080' // optional proxy, default is false
    };

    const nodemailerTransporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      auth: auth.auth,
    });

    const sendEmailOptions: {
      // auth: any;
      from: string;
      to: string;
      subject: string;
      html?: string;
      text?: string;
      cc?: string;
      bcc?: string;
    } = {
      // auth: auth.auth,
      from: `${process.env.GMAIL_SENDER_NAME} <${process.env.GMAIL_SENDING_EMAIL}>`,
      to: receivers,
      subject: options.subject,
    };
    if (options.type === 'html') {
      sendEmailOptions.html = options.message;
    } else {
      sendEmailOptions.text = options.message;
    }
    if (cc) {
      sendEmailOptions.cc = cc;
    }

    //send
    const info = await nodemailerTransporter.sendMail(sendEmailOptions);
    return info;
  } catch (error) {
    throw error;
  }
};

/**
 * Send Email
 *
 * @param {IEmailOptions} options
 * @returns {Promise<any>}
 */
const executeSendingEmail = async (options: IEmailOptions): Promise<any> => {
  try {
    const info = await sendEmailViaNodemailer(options);
    return info;
  } catch (error) {
    throw error;
  }
};

export { IEmailOptions, executeSendingEmail };
