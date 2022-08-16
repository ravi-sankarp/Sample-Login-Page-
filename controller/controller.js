const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

//linking config file
dotenv.config({ path: './config.env' });

const User = require('../models/schema');
const Session = require('../models/sessionSchema');

const user = new User();
const session = new Session();


module.exports = {
    checkSession: (req, res, next) => {
        if (req.session.loggedIn) {
            if (req.session.admin) {

                res.redirect('/adminhome');
            }
            else {

                res.redirect('/home');
            }
        }
        else {
            next();

        }
    },
    checkAdmin: async (req, res, next) => {
        try {
            const sessionResult = await Session.findOne({ sessionId: req.session.id }).populate('userId').lean();
            if (sessionResult.userId) {
                if (sessionResult.userId.role === 'admin') {
                    next();
                }
                else {
                    
                    res.redirect('/');
                }
            }
            else {
                res.redirect('/');
            }
        }
        catch (err) {
            res.render('error');
        }
    },
    renderLoginPage: (req, res) => {
        res.render('login.hbs', { err: req.session.loginError });
        req.session.destroy();
    },

    renderRegisterPage: (req, res) => {
        const error = req.session.errMessage;
        res.render('register.hbs', { error, js: 'registerValidate' });
        req.session.destroy();
    },

    renderHomePage: async function (req, res) {
        try {
            if (req.session.loggedIn) {
                const sessionResult = await Session.findOne({ sessionId: req.session.id }).populate('userId');
                if (sessionResult.userId) {
                    let userResult = sessionResult.userId;
                    userResult = userResult.changeResultData(userResult);
                    res.render('home.hbs', { resultData: userResult });

                }
                else {
                    req.session.destroy();
                    res.redirect('/');
                }

            }
            else {
                req.session.destroy();
                res.redirect('/');

            }
        }
        catch (err) {
            res.render('error.hbs');
        }
    },

    createUser: async (req, res) => {
        try {
            const data = req.body;
            // const salt = await bcrypt.genSalt(12);
            data.password = await bcrypt.hash(data.password, 12);
            let resultData = await User.create(data);
            req = session.createSessionDetails(req, Session, resultData._id);
            resultData = resultData.changeResultData(resultData);
            res.status(201).redirect('/home');
        }
        catch (err) {
            if (err.code === 11000) {
                req.session.errMessage = 'Account already exists';
                res.redirect('/register');
            }
            else {
                req.session.errMessage = err;
                res.redirect('/register');
            }
        }
    },

    loginUser: async function (req, res) {
        try {
            const data = req.body;
            const result = await User.findOne({ email: data.email });
            if (result) {
                const check = await bcrypt.compare(data.password, result.password);
                if (check) {
                    session.createSessionDetails(req, Session, result._id);
                    if (result.role === 'admin') {
                        req.session.admin = true;
                        res.redirect('/adminhome');
                    }
                    else {
                        res.redirect('/home');
                    }
                }
                else {
                    req.session.loginError = 'Invalid username or password';
                    res.status(401).redirect('/');
                }
            }
            else {
                req.session.loginError = 'Invalid username or password';
                res.status(401).redirect('/');
            }
        }
        catch (err) {
            req.session.loginError = err.message;
            res.status(500).redirect('/');
        }
    },

    adminRender: async (req, res) => {
        try {
            if (req.session.admin) {
                const sessionResult = await Session.findOne({ sessionId: req.session.id }).populate('userId');
                if (sessionResult.userId) {
                    if (sessionResult.userId.role === 'admin') {
                        const adminData = await User.find();
                        const modifiedData = adminData.reduce((acc, obj) => {

                            if (obj.role !== 'admin') {
                                acc.push(user.changeResultData(obj));
                            }
                            return acc;
                        }, []);
                        res.status(200).render('adminHome.hbs', { resultData: modifiedData });
                    }
                    else {
                        res.redirect('/home');
                    }
                }
                else {
                    req.session.destroy();
                    res.redirect('/');
                }

            }
            else {
                req.session.destroy();
                res.redirect('/');

            }
        }
        catch (err) {
            req.session.loginError = err.message;
            res.status(500).redirect('/');
        }




    },

    userLogOut: async (req, res) => {
        try {
            await Session.findOneAndDelete({ sessionId: req.session.id });
            req.session.destroy();
            res.redirect('/');
        }
        catch (error) {
            res.render('error');
        }
    },
    renderaddUser: (req, res) => {
        res.render('adminAddUser', { error: req.session.errMessage });
        delete req.session.errMessage;
    },
    addUser: async (req, res) => {
        try {
            const data = req.body;
            data.password = await bcrypt.hash(data.password, 12);
            await User.create(data);
            res.status(201).redirect('/adminhome');
        }
        catch (err) {
            if (err.code === 11000) {
                req.session.errMessage = 'Account already exists';
                res.redirect('/addUser');
            }
            else {
                req.session.errMessage = err.message;
                res.redirect('/addUser');
            }
        }
    },
    renderUpdateUser: async (req, res) => {
        try {
            const result = await User.findById(req.params.id);
            const { error } = req.session;
            res.render('adminUpdateUser.hbs', { result, error });
            delete req.session.error;
        }
        catch (err) {
            res.render('error');
        }
    },
    updateUser: async function (req, res) {
        try {
            await User.findByIdAndUpdate(req.params.id, req.body);
            res.redirect('/adminhome');

        }
        catch (err) {
            if (err.code === 11000) {
                console.log(err);
                const result = await User.findById(req.params.id);
                res.render('adminUpdateUser.hbs', { result, error: 'Email already exists' });
            }
            else {
                req.session.errMessage = err.message;
                res.status(402).redirect(`updateUser/${req.params.id}`);
            }
        }
    },
    deleteUser: async (req, res) => {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.redirect('/adminhome');
        }
        catch (err) {
            res.render('error');
        }
    },
};