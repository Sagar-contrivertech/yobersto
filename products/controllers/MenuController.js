const Menu = require('../models/Menu')
const multer = require("multer")
const AWS = require('aws-sdk')
const config = require('../config/config')

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

exports.addMenu = async (req, res) => {
    try {

        console.log(req.file, "req.file")

        let fileObject = [
            {
                key: req.files.Image[0].originalname,
                value: req.files.Image[0].buffer,
                filekey: 'Image'
            },
        ]
        let newupdateobject = await uploadMultipleFiles(fileObject).then(data => {
            console.log(data, '79')
            return data
        }).catch((err) => {
            console.log(err)
        })
        let Image

        newupdateobject && newupdateobject.map(m => {
            if (m.key === 'Image') {
                console.log(m.Location)
                Image = m.Location
                return m.Location
            }
        })
        // 
        const menu =await  Menu.create({
            name: req.body.name,
            Image: Image,
           
            // SubCategory: req.body.SubCategory
        })
        await menu.save()
        res.status(200).json({
            success: true,
            message: "Menu saved sucessfull",
            data: menu
        })

    } catch(err) {
        console.log(err)
        res.status(200).json({
            success: false,
            message: "internall server error"
        })
    }
}




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
            console.log(data, '54')
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

