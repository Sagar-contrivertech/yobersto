const mongoose = require('mongoose')

const BusinessOwnerSchema =  mongoose.Schema({
    name:{
        type: mongoose.Schema.Types.ObjectId,
        // type : String,
        required: true,
        ref: 'user'
    },
    ownerName : {
        type : String
    },
    ownerEmail : {
        type : String
    },
    ownerImages : {
        type : String
    },
    dateOfBirth : {
        type : String
    },
    storeName : {
        type : String
    },
    bussinessName : {
        type : String
    },
    bussinessLegalName : {
        type : String
    },
    bussinessEmailId : {
        type : String
    },
    bussinessWebsite : {
        type : String
    },
    bussinessNIF : {
        type : String
    },
    bussinessType : {
        type : String
    },
    bussinessServices : {
        type : String
    },
    bussinessLandlineNumber : {
        type : String
    },
    bussinessMobileNumber : {
        type : String
    },
    openingTime : {
        type : String
    },
    closingTime : {
        type : String
    },
    range : {
        type : String
    },
    workSince : {
        type : String
    },
    designation: {
        type: String
    },
    merchant_type: {
        enum: {
            values: ['Localbusiness','RegionalFranchise','LiquorStore']
        }
    },
    bankName: {
        type: String
    },
    bankAccountNumber: {
        type: String
    },
    bankAccountHolderName: {
        type: String
    },
    bankCode: {
        type: String
    },
    currentAddress: {
        type: String
    },
    // images field 
    Images : {
        type : Array
    },
    bussinessLogo : {
        type : String
    },
    bussinessImages : {
        type : String
    },
    bannerImage : {
        type : String
    },
    owneridproofurl: {
        type: String
    },
    ownerImage : {
        type : String
    },
    isactive: {
        type: Boolean,
        default: false
    },
})

module.exports = mongoose.model('BusinessOwner', BusinessOwnerSchema)