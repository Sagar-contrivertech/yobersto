const Category  = require('../models/Category');
const  SubCategory  = require('../models/SubCategory');


exports.addSubCategory = async (req, res) => {
    try {
        const subCategories = new SubCategory({
            name: req.body.name,
            image: req.body.image,
            Category: req.body.Category
        })
        await subCategories.save()
        console.log("hh", subCategories._id, 'hh')
        let data = subCategories.Category
        let l = []
        l.push(subCategories._id)
        if (subCategories.Category) {
            console.log('work', data)
            let ct = await Category.findByIdAndUpdate(data, {
                $push: {
                    "subCategorydataL": {
                        name: subCategories.name,
                        SubCategoryId: subCategories._id
                    }
                }
            }, {
                new: true
            })
            console.log(ct);
            return;
        }


        res.status(200).json({ message: "Sub Category saved sucessfull", subCategories })
    } catch (err) {
        console.log(err);
    }
}