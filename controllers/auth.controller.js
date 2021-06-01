const User = require('../models/auth.model');
const expressJwt = require('express-jwt');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const fetch = require('node-fetch');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../helpers/dbErrorHandling')
const nodemailer = require('nodemailer');
const nodeMailgun = require('nodemailer-mailgun-transport');




exports.registerController = (req, res) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })

    } else {
        User.findOne({
            email
        }).exec((err, user) => {
            if (user) {
                return res.status(400).json({
                    error: "Email is Taken"
                })
            }
        })

        //Generate Token
        const token = jwt.sign({
            name,
            email,
            password
        },
            process.env.JWT_ACCOUNT_ACTIVATION,
            {
                expiresIn: '15m'
            }

        )

        //Email Data Sending
        const auth = {
            auth: {
                api_key: process.env.MAIL_KEY,
                domain: process.env.MAIL_DOMAIN
            }
        };

        let transporter = nodemailer.createTransport(nodeMailgun(auth));

        const emailData = {
            from: `Activation ${process.env.EMAIL_FROM}`,
            to: email,
            subject: 'Account acivation link',
            html: `
            <h1>Please Click to the link to activate</h1>
            <p>${process.env.CLIENT_URL}/users/activate/${token}</p>
            <hr/>
            <p>This is email contain sensitive info</p>
            <p>${process.env.CLIENT_URL}</p>


            `
        }

        transporter.sendMail(emailData, function (err, data) {
            if (err) {
                return res.status(400).json({
                    error: errorHandler(err)
                })
            } else {
                return res.json({
                    message: `Email has been sent to ${email}`
                })
            }
        })
    }
}


//Activation and save to database

exports.activationController = (req, res) => {
    const { token } = req.body

    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, (err, decode) => {
            if (err) {
                return res.status(401).json({
                    error: 'Expired Token. Signup Again'
                })
            } else {
                const { name, email, password } = jwt.decode(token)

                const userData = new User({
                    name,
                    email,
                    password
                })

                userData.save((err, user) => {
                    if (err) {
                        console.log("Save Error", err)
                        return res.status(401).json({
                            error: errorHandler(err)
                        })

                    } else {
                        return res.json({
                            success: true,
                            message: 'Register Success',
                            user: user
                        })
                    }

                })

            }

        })
    } else {
        return res.json({
            message: 'Error happening Please try again'
        })

    }


}

exports.loginController = (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const firstError = errors.array().map(error => error.msg)[0]
        return res.status(422).json({
            error: firstError
        })

    } else {
        User.findOne({
            email
        }).exec((err, user) => {
            if (err || !user) {
                return res.status(400).json({
                    error: "Invalid Email"
                })
            }


            if (!user.authenticate(password)) {
                return res.status(400).json({
                    error: "Invalid Email/Password"
                })
            }


            const token = jwt.sign({
                _id: user._id
            }, process.env.JWT_SECRET, {
                expiresIn: '7d'
            })


            const {_id, name, email, role } = user
            return res.json({
                token,
                user: {
                    _id,
                    name,
                    email,
                    role
                }

            })







        })

    }


}






