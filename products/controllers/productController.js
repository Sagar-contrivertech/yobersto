const Product = require('../models/Product')
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

exports.addProduct = async (req, res) => {
    try {
        console.log(req.file,req.body, "req.file")

        let fileObject = [
            {
                key: req.files.image[0].originalname,
                value: req.files.image[0].buffer,
                filekey: 'image'
            }
        ]
        let newupdateobject = await uploadMultipleFiles(fileObject).then(data => {
            console.log(data, '79')
            return data
        }).catch((err) => {
            console.log(err)
        })
        // 
        let image
        newupdateobject && newupdateobject.map(i => {
            if (i.key === 'image') {
                console.log(i.Location)
                image = i.Location
                return i.Location
            }
        })
        const data = req.body
        const product = new Product({
            name:req.body.name,
            Quantity:req.body.Quantity,
            Price:req.body.Price,
            Menu_Name:req.body.Menu_Name,
            Estimate:req.body.Estimate,
            Catgeory:req.body.Catgeory,
            item_descriptions:req.body.item_descriptions,
            Inventory:req.body.Inventory,
            unlist:req.body.unlist,
            image: image
            // SubCategory: req.body.SubCategory
        })
        await product.save()
        res.status(200).json({
            success: true,
            message: "product added",
            data: product
        })

    } catch (err) {
        res.status(400).json({ message: "Something went wrong", err });
        console.log(err)
    }
}


// 


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

