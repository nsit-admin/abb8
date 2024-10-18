const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define Schema
let tagSchema = new Schema({
    tagName: {
        type: String,
        unique:true,
        lowercase: true,
        required: true,
        validate: {
            isAsync: true,
            validator: function(value, isValid) {
                const self = this;
                return self.constructor.findOne({ tagName: value })
                .exec(function(err, user){
                    if(err){
                        throw err;
                    }
                    else if(user) {
                        if(self.id === user.id) {  // if finding and saving then it's valid even for existing email
                            return isValid(true);
                        }
                        return isValid(false);  
                    }
                    else{
                        return isValid(true);
                    }

                })
            },
            message:  'Tag already exists'
        },
    },
    tagStyle: String,
}, {
    collection: 'tags'
})

module.exports = mongoose.model('Tags', tagSchema)