const Joi = require('joi');
module.exports.listingschema=Joi.object({
    newlisting:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        location:Joi.string().required(),
        city:Joi.string().required(),
        price:Joi.number().required().min(0),
        image:Joi.string().allow("",null)
    }).required()
});