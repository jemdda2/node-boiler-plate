const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config/key');
const { auth } = require('./middleware/auth');
const { User } = require("./models/User");

//application/x-form-urlencoded
app.use(bodyParser.urlencoded({extended: true}));
//application/json
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, 
    useUnifiedTopology: true, 
    useCreateIndex: true, 
    useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))
  
app.get('/', (req, res) => res.send('Hello World!'))

app.post('/api/users/register', (req, res) => {
    
    //会員登録の時必要な情報をclientから取得し、DBに登録
    const user = new User(req.body)
    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    })
})

app.post('/api/users/login', (req, res)　=> {
    //Request e-mailをDBに存在確認
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user) {
            return res.json({
                loginSuccess: false,
                message: "入力されたE-mailは存在しません。"
            })
        }

        //Request e-mailがDBに存在したら、パスワードの確認
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch)
                return res.json({ loginSuccess: false, message: "パスワードが違います。"})
        
            //パスワードが同じだったら、Tokenを作成
            user.generateToken((err, user) => {
                if(err) return res.status(400).send(err);

                // Tokenをcookieに保存
                res.cookie("x_auth", user.token)
                    .status(200)
                    .json({ loginSuccess: true, userId: user._id })
            })
        })
    })
})

// role 0 일반유저    role 0이 아니면 관리자
app.get('/api/users/auth', auth, (req, res) => {
    //여기까지 미틀웨어를 통과해 왔다는 예기는 Authentication이 True라는 말.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    // console.log('req.user', req.user)
    User.findOneAndUpdate({ _id: req.user._id },
        { token: "" }
        , (err, user) => {
            if(err) return res.json({ success:false,  err});
            return res.status(200).send({
                success: true
            });
        });
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))