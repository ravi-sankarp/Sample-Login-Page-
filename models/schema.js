const { default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        minLength: [4, 'First name must be atleast 4 characters'],
        maxLength: [7, 'First name should be less than 8 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        maxLength: [7, 'Last name should be less than 9 characters']
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: {
            values: ['female', 'male'],
            message: 'Specify either male or female'
        }

    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        required: [true, 'Email field is required'],
        unique: [true, 'Email field must be unique'],
        validate: {
            validator: function (v) {
                const newLocal = /^([\w-\\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
                return newLocal.test(v);
            },
            message: "Please enter a valid email"
        },

    },
    password: {
        type: String,
        required: [true, 'Password field is required'],
        minLength: [6, 'Password must be atleast 6 characters']
    },
    role: {
        type: String,
        immutable: true,
        set: (v) => {
            v = 'user';
            return v;
        },
    }
}, {

    toJSON: {
        virtuals: true
    },
    toObject: {
        virtuals: true
    },

});

userSchema.method('changeResultData', (data) => {
    data = data.toObject();
    const deleteEntries = ['_id', 'password', 'firstName', 'lastName', '__v'];
    deleteEntries.forEach(ele => {
        delete data[`${ele}`];
    });
    return data;

});

// eslint-disable-next-line prefer-arrow-callback
userSchema.virtual('name').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);
module.exports = User;