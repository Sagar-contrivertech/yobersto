const express = require('express');
const {Category} = require('../models/Category')
const q = require('q')
const multer = require("multer")
const AWS = require('aws-sdk')
const config = require('../config/config')

const accessId = config.accessId
const secretKey = config.secretKey
const BUCKET_NAME = config.BUCKET_NAME

AWS.config.credentials = {
    accessKeyId: accessId,
    secretAccessKey: secretKey,
    region: "ap-south-1",
    ACL: "public-read",
}

AWS.config.region = "ap-south-1"

const s3 = new AWS.S3()

exports.addCategory = async (req, res) => {
    try {
        console.log(req.file, "req.file")

        let fileObject = [
            {
                key: req.files.icon[0].originalname,
                value: req.files.icon[0].buffer,
                filekey: 'icon'
            },
        ]

        let newupdateobject = await uploadMultipleFiles(fileObject).then(data => {
            console.log(data, '79')
            return data
        }).catch((err) => {
            console.log(err)
        })
        // 
        let icon
        newupdateobject && newupdateobject.map(m => {
            if (m.key === 'icon') {
                console.log(m.Location)
                icon = m.Location
                return m.Location
            }
        })
        const categoryData = await Category.create({
            name: req.body.name,
            icon: icon
        })
        await categoryData.save()
        res.status(200).json({
            success: true,
            message: "catgeory added",
            data: categoryData
        })
    }
    catch (err) {
        res.status(400).json({ message: "Something went wrong", err });
        console.log(err)
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


exports.getCategory = async (req, res) => {
    try {
        const findCategory = await Category.find()
        if (!findCategory) {
            res.status(400).json({
                success: false,
                message: "cannot find category"
            })
            return
        }

        res.status(200).json({
            message: "category data",
            success: true,
            data: findCategory
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            data: err
        })
    }
}

exports.getCategoryById = async (req, res) => {
    try {
        const categoryById = await Category.findById(req.params.id);
        if (!categoryById) {
            res.status(400).json({ message: "failed to fetch data" })
            return;
        }
        res.status(200).json({ message: "category Fetch sucessfully", categoryById })
    }
    catch (err) {
        res.status(400).json({ message: "Something went wrong", err });
        console.log(err)
    }
}
