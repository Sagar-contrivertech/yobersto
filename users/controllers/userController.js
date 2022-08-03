const user = require('../models/user')
const admin = require("../models/admin")
const agent = require("../models/agent")
const bussinessOwner = require("../models/businessOwner")
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const bcrypt = require('bcrypt')
const twillo = require('../utlis/twillio');
const consumer = require('../models/consumer');
const sendsms = require('../utlis/twillio');

const config = require('../config/config')

const accountSid = config.TWILIO_ACCOUNT_SID
const authToken = config.TWILIO_AUTH_TOKEN;
const phoneNumber = config.TWILIO_PHONE_NUMBER
const serviceId = config.Service_SID;

exports.registeruser = catchAsyncErrors(async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
            isBlocked,
            isRemoved,
            profileImage,
            devices,
            userType,
            dateOfBirth,
        } = req.body;

        const finduser = await user.findOne({ email: email });
        const finduserphone = await user.findOne({ phone: phone })
        // console.log(finduserphone , "finduserphone");

        if (finduser || finduserphone) {
            res.status(400).json({
                success: false,
                message: 'user already exsit with same credtinals',
            })
            return
        }

        const createuser = await user.create({
            name,
            email,
            phone,
            password,
            isBlocked,
            isRemoved,
            profileImage,
            devices,
            userType,
            isactive: false,
            dateOfBirth,
        });
        if (!createuser) {
            res.status(400).json({
                success: false,
                message: 'cannot create user',
            })
        }

        if (createuser) {
            const token = createuser.getJwtToken()
            // console.log(token)
            const salt = await bcrypt.genSalt(10);
            createuser.password = await bcrypt.hash(createuser.password, salt);
            
            // await data.save();
            createuser.token = token
            await createuser.save()
            res.status(200).json({
                success: true,
                message: "user register succesfully",
                data: createuser
            });
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "validation failled in catch",
        });
    }
});

// new login sagar sir
exports.loginUser = catchAsyncErrors(async (req, res) => {
    try {
        const { email, password, role, phone } = req.body
        console.log({ email, password, role })
        // if (req.body.phone = '7506001297') {
        //     res.status(200).json({
        //         success: true,
        //         message: "Login succesfully ",
        //         // userRole: userRoleData,
        //         // token: token
        //     });
        // }
        const finduser = await user.find({
            $or: [{
                email: email
            },
            {
                phone: phone
            }
            ]
        })
        console.log(finduser, "finduser")
        if (!role) {
            res.status(400).json({
                success: false,
                message: "Please Provide Email , Password , Role",
            })
            return
        }
        if (!finduser) {
            res.status(400).json({
                success: false,
                message: "Login  failled in try",
            });
            return
        }

        // if user is insactive then dont login
        if (finduser[0].isActive === false) {
            res.status(400).json({
                success: false,
                message: "User Is Inactive So You Cannot Login"
            })
            return
        }

        let passwordData
        let data1
        finduser && finduser.map((i) => {
            passwordData = i.password
            data1 = i
            console.log(i.password)
        })
        console.log(data1, "data1")
        const token = data1.getJwtToken()
        console.log(token, "token")

        if (finduser) {
            let ismatch = await bcrypt.compare(password, passwordData)
            // let ismatch = finduser.comparePassword(password)
            console.log(ismatch)
            if (!ismatch) {
                res.status(400).json({
                    success: false,
                    message: "Login unsuccesfully ",
                });
            }

            if (ismatch) {
                // const token = jwt.sign({
                //     id: finduser._id,
                //     isAdmin: finduser.isAdmin
                // },
                //     "ADGSGWUEVVKBSSGKJSKJJKGS",
                //     { expiresIn: '1w' }
                // )
                let userRoleData;
                console.log("Role", token)
                if (role === "agent") {
                    userRoleData = await agent.findOne({ agent_id: data1._id })
                } else if (role === "consumer") {
                    userRoleData = await consumer.findOne({ name: data1._id })
                } else if (role === "businessOwner") {
                    userRoleData = await bussinessOwner.findOne({ name: data1._id })
                } else if (role === "admin") {
                    userRoleData = await admin.findOne({ name: data1._id })
                } else if (role === "subAdmin") {
                    userRoleData = await admin.findOne({ name: data1._id })
                }
                let data = []
                // data.push(data1,token)
                console.log(";hjjj", data1)
                data1.token = token
                console.log(data1, "data1")
                const token1 = Object.assign(data1, { token })
                console.log(token1, 'lll')
                if (token1) {
                    res.status(200).json({
                        success: true,
                        message: "Login succesfully ",
                        data: token1,
                        // userRole: userRoleData,
                        // token: token
                    });
                } else {
                    res.status(400).json({
                        success: false,
                        message: "Login Unsuccesfully ",
                    });
                }
            }

        }


    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Login  failled in catch",
        });
    }
})


// old login 
// exports.loginUser = catchAsyncErrors(async (req, res) => {
//     try {
//         const { email, password, role } = req.body
//         console.log({ email, password, role })
//         const finduser = await user.findOne({ email: email })
//         if(!email || !password || !role){
//             res.status(400).json({
//                 success: false,
//                 message: "Please Provide Email , Password , Role",
//             })
//             return
//         }
//         if (!finduser) {
//             console.log(finduser)
//             res.status(400).json({
//                 success: false,
//                 message: "Login  failled in try",
//             });
//             return
//         }

//         if (finduser) {

//             // let ismatch = await bcrypt.compare(password , finduser.password)
//             let ismatch = finduser.comparePassword(password)

//             if (!ismatch) {
//                 res.status(400).json({
//                     success: false,
//                     message: "Login unsuccesfully ",
//                 });
//             }

//             if (ismatch) {
//                 const token = finduser.getJwtToken()
//                 console.log(token)
//                 console.log(finduser.userType)
//                 let userRoleData;
//                 console.log("Role", role)
//                 // "consumer", "businessOwner", "agent", "admin", "subAdmin"


//                 if (role === "agent") {
//                     userRoleData = await agent.findOne({ agent_id: finduser._id })
//                 } else if (role === "consumer") {
//                     userRoleData = await consumer.findOne({ name: finduser._id })
//                 } else if (role === "businessOwner") {
//                     userRoleData = await bussinessOwner.findOne({ name: finduser._id })
//                 } else if (role === "admin") {
//                     userRoleData = await admin.findOne({ name: finduser._id })
//                 } else if (role === "subAdmin") {
//                     userRoleData = await admin.findOne({ name: finduser._id })
//                 }

//                 if (userRoleData) {
//                     res.status(200).json({
//                         success: true,
//                         message: "Login succesfully ",
//                         data: finduser,
//                         userRole: userRoleData,
//                         token: token
//                     });
//                 } else {
//                     res.status(400).json({
//                         success: false,
//                         message: "Login Unsuccesfully ",
//                     });
//                 }
//             }

//         }


//     } catch (error) {
//         console.log(error);
//         res.status(400).json({
//             success: false,
//             message: "Login  failled in catch",
//         });
//     }
// })

exports.getUsers = catchAsyncErrors(async (req, res) => {
    try {
        const findusers = await user.find()

        if (!findusers) {
            res.status(400).json({
                success: false,
                message: "getUsers failled in try",
            });
        }

        if (findusers) {
            res.status(200).json({
                success: true,
                message: "getUsers Succesfully",
                data: findusers
            });
        }

    } catch (error) {
        // console.log(error);
        res.status(500).json({
            success: false,
            message: "getUsers failled in catch",
        });
    }
})

exports.getUserById = catchAsyncErrors(async (req, res) => {
    try {
        const findusers = await user.findById(req.params.id)

        if (!findusers) {
            res.status(400).json({
                success: false,
                message: "getUsersById failled in try",
            });
        }

        if (findusers) {
            res.status(200).json({
                success: true,
                message: "getUsersById Succesfully",
                data: findusers
            });
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({
            success: false,
            message: "getUsersById failled in catch",
        });
    }
})

// 
exports.forgetPassword = catchAsyncErrors(async (req, res, next) => {
    try {
        const { phone } = req.body
        const findUser = await user.find({ phone })
        // console.log(findUser)
        if (!findUser) {
            res.status(400).json({
                success: false,
                message: "user doesn't exsit !",
            });
            return
        }
        if (findUser) {
            try {
                // console.log("data")
                const client = require('twilio')(accountSid, authToken);
                await client.verify.services(serviceId)
                    .verifications
                    .create({
                        // body: message,
                        from: phoneNumber,
                        to: `+91${phone}`,
                        channel: 'sms'
                    }).then((verification) => {
                        data = verification
                        if (data) {
                            res.status(200).json({
                                success: true,
                                message: "otp send successfully",
                                data: data
                            })
                            return
                        }
                        if (!data) {
                            res.status(400).json({
                                success: false,
                                message: "otp send cannot send !",
                            })
                        }
                    })

            } catch (err) {
                console.log(err);
                res.status(201).json({ message: "error while sending otp" })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "validation failled in catch",
        });
    }
})


exports.verfiyOtp = catchAsyncErrors(async (req, res, next) => {
    try {
        let data
        const { phone, code } = req.body
        const client = require('twilio')(accountSid, authToken);
        await client.verify.v2.services(serviceId)
            .verificationChecks
            .create({
                // body: message,
                to: `+91${phone}`,
                code: code
            }).then((verification_check) => {
                data = verification_check
                console.log(verification_check)
                if (data.valid === true) {
                    res.status(200).json({
                        success: true,
                        message: "otp verfied",
                        data: data
                    })
                    return
                }
                if (!data) {
                    res.status(400).json({
                        success: false,
                        message: "otp send cannot send !",
                    })
                }
            }).catch((err) => {
                console.log(err)
            })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "validation failled in catch twillo",
        });
    }
})


// internal services

exports.internalservices = catchAsyncErrors(async (req, res) => {
    try {
        console.log("finduser id ", req.params.id)

        const findusers = await user.findById(req.params.id)
        console.log("finduser ", findusers)
        if (!findusers) {
            res.status(400).json({
                success: false,
                message: "getUsersById failled in try",
            });
        }

        if (findusers) {
            res.status(200).json({
                success: true,
                message: "getUsersById Succesfully",
                data: findusers
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "getUsersById failled in catch",
        });
    }
})

exports.resetPassword = async (req, res) => {
    try {
        const { phone, email, password, cpassword } = req.body;

        // if(!phone || !email){
        //     res.status(400).json({
        //         success: false,
        //         message: "Please Enter The Data",
        //     });
        //     return
        // }

        let bcryptpassword

        if (password !== cpassword) {
            res.status(400).json({
                success: false,
                message: "Password And Cpassword Is Not Matching",
            });
            return
        } else {
            const salt = await bcrypt.genSalt(10)
            bcryptpassword = await bcrypt.hash(password, salt)

            const finduser = await user.find({
                $or: [{
                    email: email
                },
                {
                    phone: phone
                }
                ]
            })

            if (finduser) {
                console.log(finduser, "finduser")
                const updateuser = await user.findByIdAndUpdate(finduser[0]._id, {
                    password: bcryptpassword
                }, { new: true })

                if (!updateuser) {

                    res.status(400).json({
                        success: false,
                        message: "Update User Failled For Password",
                    });
                    return
                }

                if (updateuser) {

                    // console.log(finduser , "number user")
                    res.status(200).json({
                        success: true,
                        message: "New Password Is Updated",
                        data: updateuser
                    });
                    return
                }

            }
            // const findUser = await user.find({phone : phone})
        }




    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "resetPassword failled in catch",
        });
    }
}

exports.profile = catchAsyncErrors(async (req, res, next) => {
    try {
        console.log(req.user, "profile me id")
        const users = await user.findById(req.user._id)
        console.log(users._id)
        const findConsumer = await consumer.find({ name: users._id }).populate('name')
        // console.log(findConsumer)
        res.status(200).json({
            success: true,
            message: "user fetch sucessfully",
            data: findConsumer,
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            message: "token invalid ! something went wrong"
        })
    }
})

exports.updateuserData = catchAsyncErrors(async (req, res, next) => {
    try {
        const data = req.body
        const updateUserData = await user.findByIdAndUpdate( req.params.id , data, {
            new: true
        })
        if (!updateUserData) {
            return res.status(400).json({
                message: "user data cannot find",
                success: false
            })
        }
        if (updateUserData) {
            return res.status(200).json({
                messagae: "data found",
                success: true,
                data: updateUserData
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            messagae: "internal server error",
            success: false
        })
    }
})
