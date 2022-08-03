const agent = require('../models/agent')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const axios = require("axios")
const AWS = require("aws-sdk")
const fs = require("fs")
const config = require('../config/config')

const multer = require("multer")

const accessId = config.accessId
const secretKey = config.secretKey
const BUCKET_NAME = config.BUCKET_NAME
const q = require('q')


AWS.config.credentials = {
    accessKeyId: accessId,
    secretAccessKey: secretKey,
    region: "ap-south-1",
    ACL: "public-read",
}

AWS.config.region = "ap-south-1"

const s3 = new AWS.S3()

exports.addagent = catchAsyncErrors(async (req, res, next) => {
    try {
        const data = req.body

        const userdata = axios.get(`http://localhost:8082/api/v1/get/${data.name}`).then((res) => {
            console.log(res, "res")
            return res.data.data
        }).catch((err) => {
            console.log(err)
        })

        console.log(userdata.userType)
        console.log(data.role, "data.role")
        if (data.role !== userdata.userType) {
            res.status(400).json({
                success: false,
                message: "cannot create the agent This type not match while registration",
            });
            return
        }

        const checkData = await agent.findOne({ agent_id: req.body.agent_id })
        if (checkData) {
            res.status(201).json({
                success: true,
                message: "agent already exist",
            })
            return
        }

        // add vehicle lincense image 

        let fileObject = [
            {
                key: req.files.vehicleLicenceImage[0].originalname,
                value: req.files.vehicleLicenceImage[0].buffer,
                filekey: 'vehicleLicenceImage'
            }
        ]

        let newupdateobject = await uploadMultipleFiles(fileObject).then(data => {
            console.log(data, '79')
            return data
        }).catch((err) => {
            console.log(err)
        })
        console.log(newupdateobject, '77')

        let vehicleLicenceImage

        newupdateobject && newupdateobject.map(m => {
            if (m.key === 'vehicleLicenceImage') {
                console.log(m.Location)
                vehicleLicenceImage = m.Location
                return m.Location
            }
        })

        const createagent = await agent.create({
            agent_id: req.body.agent_id,
            income: req.body.income,
            address: req.body.address,
            feedbacks: req.body.feedbacks,
            last_active: req.body.last_active,
            active_status: req.body.active_status,
            dob: req.body.dob,
            vehicle_type: req.body.vehicle_type,
            vehicle_reg: req.body.vehicle_reg,
            orders: req.body.orders,
            bankName: req.body.bankName,
            bankAccountNumber: req.body.bankAccountNumber,
            bankAccountHolderName: req.body.bankAccountHolderName,
            bankCode: req.body.bankCode,
            current_longitude: req.body.current_longitude,
            current_latitude: req.body.current_latitude,

            // images
            vehicleLicenceImage: vehicleLicenceImage,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            service_radius: req.body.service_radius,
            verification: req.body.verification,
        })
        // console.log(createagent)
        if (!createagent) {
            res.status(400).json({
                success: false,
                message: 'cannot create agent',
            })
            return
        }
        if (createagent) {
            await createagent.save()
            res.status(200).json({
                success: true,
                message: "agent register succesfully",
                data: createagent,
            });
            return
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Internal Server Error !",
            error
        });
    }
})

exports.getAgent = catchAsyncErrors(async (req, res) => {
    try {
        const findusers = await agent.find()

        if (!findusers) {
            res.status(400).json({
                success: false,
                message: "getAgent failled in try",
            });
        }

        if (findusers) {
            res.status(200).json({
                success: true,
                message: "getAgent Succesfully",
                data: findusers
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "getAgent failled in catch",
        });
    }
})

exports.getAgentById = catchAsyncErrors(async (req, res) => {
    try {
        const findusers = await agent.find({agentUrl:req.params.id})
        console.log(findusers)
        if (!findusers) {
            res.status(400).json({
                success: false,
                message: "getAgentById failled in try",
            });
        }

        if (findusers) {
            res.status(200).json({
                success: true,
                message: "getAgentById Succesfully",
                data: findusers
            });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "getAgentById failled in catch",
        });
    }
})

async function uploadMultipleFiles(fileObject) {
    console.log(fileObject, "fileobject")
    const deferred = q.defer();
    let s3response = []
    try {

        for (const file of fileObject) {
            const params = {
                Bucket: BUCKET_NAME,
                Key: file.key, // File name you want to save as in S3
                Body: file.value,
                ContentEncoding: 'base64',
                ContentType: 'image/jpeg'
            };
            const data = await s3.upload(params).promise()
            console.log(data, '255')
            s3response.push({

                key: file.filekey,
                fileName: data.key,
                Location: data.Location
            })
        }

    } catch (err) {
        console.log(err)
    }
    deferred.resolve(s3response)
    console.log(deferred, "deferred")
    return deferred.promise

}