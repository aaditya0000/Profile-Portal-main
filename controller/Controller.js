const User = require('../models/User');
const Skill = require('../models/skills');
const Interest = require('../models/interests');
const Por = require('../models/pors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// handling  errors

const handleErrors = (err) => {
  //console.log(err.message,err.code);
  const errors = { msg: '' };

  if (err.message === 'incorrect email') {
    errors.msg = 'Email or password incorrect.';
    return errors;
  }
  if (err.message === 'no email') {
    errors.msg = 'No registered user found with that email.';
    return errors;
  }
  if (err.message === 'incorrect password') {
    errors.msg = 'Email or password incorrect.';
    return errors;
  }
  if(err.code === 11000 || err.message === 'email registered')
   {
     errors.msg = 'Email already registered.';
     return errors;
   }
}

// setting up nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'profileportal.icc.iitb@gmail.com',
      pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

// creating jsonwebtoken
const maxAge = 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, 'something random', {
    expiresIn: maxAge
  });
};

module.exports.homepage_get = async (req,res) => {
  res.locals.details = null;
  res.setHeader("Cache-Control","private,no-store,no-cache,max-age=0, must-revalidate");

  const SKILLS = await Skill.find({});
  const INTERESTS = await Interest.find({});
  const PORS = await Por.find({});

  let name;
  if (req.query.name) {
    name = new RegExp(`${req.query.name}`,'i');
  }
  //console.log(name);
  //const name = req.query.name;
  //new RegExp(String.raw`${req.query.name}`,'i');
  let skills = req.query.skills;
  if (skills === '') {skills = 'null'}
  const pors = req.query.pors;
  const interests = req.query.interests;
  //name = new RegExp(String.raw`${name}`,'i');
   //console.log('skills : ' + skills);

  if (name || pors || interests || skills) {
    console.log("Find is being executed.");
    User.find({$or: [{interests: {$in: interests.split(',')}}, {pors: {$in: pors.split(',')}}, {name:name}, {skill_1: {$in: skills.split(',')}}, {skill_2: {$in: skills.split(',')}}, {skill_3: {$in: skills.split(',')}}], isVerified: true}, function (err, allDetails) {
      if (err) {
          console.log(err);
      }
      else {
          console.log("Find successfully executed.");
          console.log(allDetails);
          res.render("homepage", { details: allDetails, skills: SKILLS, interests : INTERESTS, pors: PORS });
      }
    });
  }
  else {
    console.log("Else executed.");
    res.render('homepage', { skills: SKILLS, interests : INTERESTS, pors: PORS });
  }
}

module.exports.login_get = (req,res) => {
  res.setHeader("Cache-Control","private,no-store,no-cache,max-age=0, must-revalidate");
  res.render('login');
}

module.exports.signup_get = async (req,res) => {
  const SKILLS = await Skill.find({});
  const INTERESTS = await Interest.find({});
  const PORS = await Por.find({});
  res.setHeader("Cache-Control","private,no-store,no-cache,max-age=0, must-revalidate");
  res.render('signup', { skills: SKILLS, interests : INTERESTS, pors: PORS });
}

module.exports.login_post = async (req,res) => {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user.email });
  }
  catch (err) {
    console.log(err);
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
}

module.exports.signup_post = async (req,res) => {
  const { name, email, wano, password, hostel, gradyr, interests, pors,skill_1,skill_1_value,skill_2,skill_2_value,skill_3,skill_3_value } = req.body;

  try {
    const userExists = await User.findOne({ verifiedEmail: email });
    if (!userExists) {
      const user = await User.create({ name, email, wano, password, hostel, gradyr, interests, pors,
                                        emailToken: null,
                                       //emailToken: crypto.randomBytes(64).toString('hex'),
                                       //verifiedEmail: crypto.randomBytes(64).toString('hex'),
                                       verifiedEmail: email,
                                       //isVerified: false,
                                       isVerified: true,
                                       skill_1,skill_1_value,skill_2,skill_2_value,skill_3,skill_3_value});
      const token = createToken(user._id);
      res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
//       const mailInfo = await transporter.sendMail({
//         from: 'profileportal.icc.iitb@gmail.com',
//         to: user.email,
//         subject: 'Verify your email',
//         html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
// <html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
// <head>
//  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
//  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
//  <meta http-equiv="X-UA-Compatible" content="IE=Edge">
//   <style type="text/css">
//     body, p, div {
//       font-family: inherit;
//       font-size: 14px;
//     }
//     body {
//       color: #000000;
//     }
//     body a {
//       color: #1188E6;
//       text-decoration: none;
//     }
//     p { margin: 0; padding: 0; }
//     table.wrapper {
//       width:100% !important;
//       table-layout: fixed;
//       -webkit-font-smoothing: antialiased;
//       -webkit-text-size-adjust: 100%;
//       -moz-text-size-adjust: 100%;
//       -ms-text-size-adjust: 100%;
//     }
//     img.max-width {
//       max-width: 100% !important;
//     }
//     .column.of-2 {
//       width: 50%;
//     }
//     .column.of-3 {
//       width: 33.333%;
//     }
//     .column.of-4 {
//       width: 25%;
//     }
//     @media screen and (max-width:480px) {
//       .preheader .rightColumnContent,
//       .footer .rightColumnContent {
//         text-align: left !important;
//       }
//       .preheader .rightColumnContent div,
//       .preheader .rightColumnContent span,
//       .footer .rightColumnContent div,
//       .footer .rightColumnContent span {
//         text-align: left !important;
//       }
//       .preheader .rightColumnContent,
//       .preheader .leftColumnContent {
//         font-size: 80% !important;
//         padding: 5px 0;
//       }
//       table.wrapper-mobile {
//         width: 100% !important;
//         table-layout: fixed;
//       }
//       img.max-width {
//         height: auto !important;
//         max-width: 100% !important;
//       }
//       a.bulletproof-button {
//         display: block !important;
//         width: auto !important;
//         font-size: 80%;
//         padding-left: 0 !important;
//         padding-right: 0 !important;
//       }
//       .columns {
//         width: 100% !important;
//       }
//       .column {
//         display: block !important;
//         width: 100% !important;
//         padding-left: 0 !important;
//         padding-right: 0 !important;
//         margin-left: 0 !important;
//         margin-right: 0 !important;
//       }
//     }
//   </style>
//       <!--user entered Head Start-->
//       <link href="https://fonts.googleapis.com/css?family=Muli&display=swap" rel="stylesheet">
//       <style>
//        body {font-family: 'Muli', sans-serif;}
//      </style><!--End Head user entered-->
// </head>
// <body>
//   <center class="wrapper" data-link-color="#1188E6" data-body-style="font-size:14px; font-family:inherit; color:#000000; background-color:#FFFFFF;">
//     <div class="webkit">
//       <table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#FFFFFF">
//         <tbody><tr>
//           <td valign="top" bgcolor="#FFFFFF" width="100%">
//             <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
//               <tbody><tr>
//                 <td width="100%">
//                   <table width="100%" cellpadding="0" cellspacing="0" border="0">
//                     <tbody><tr>
//                       <td>
//                         <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; max-width:600px;" align="center">
//                           <tbody><tr>
//                             <td role="modules-container" style="padding:0px 0px 0px 0px; color:#000000; text-align:left;" bgcolor="#FFFFFF" width="100%" align="left"><table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%" style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
//                               <tbody><tr>
//                                 <td role="module-content">
//                                   <p></p>
//                                 </td>
//                               </tr>
//                             </tbody>
//                           </table>
//                           <table border="0" cellpadding="0" cellspacing="0" align="center" width="100%" role="module" data-type="columns" style="padding:30px 20px 30px 20px;" bgcolor="#f6f6f6">
//                             <tbody>
//                               <tr role="module-content">
//                                 <td height="100%" valign="top">
//                                   <table class="column" width="540" style="width:540px; border-spacing:0; border-collapse:collapse; margin:0px 10px 0px 10px;" cellpadding="0" cellspacing="0" align="left" border="0" bgcolor="">
//                                     <tbody>
//                                       <tr>
//                                         <td style="padding:0px;margin:0px;border-spacing:0;">
//
//                                           <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="948e3f3f-5214-4721-a90e-625a47b1c957" data-mc-module-version="2019-10-22">
//                                             <tbody>
//                                               <tr>
//                                                 <td style="padding:50px 30px 18px 30px; line-height:36px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 43px">Thanks for signing up, ${user.name}&nbsp;</span></div><div></div></div></td>
//                                               </tr>
//                                             </tbody>
//                                           </table>
//                                           <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="a10dcb57-ad22-4f4d-b765-1d427dfddb4e" data-mc-module-version="2019-10-22">
//                                             <tbody>
//                                               <tr>
//                                                 <td style="padding:18px 30px 18px 30px; line-height:22px; text-align:inherit; background-color:#ffffff;" height="100%" valign="top" bgcolor="#ffffff" role="module-content"><div><div style="font-family: inherit; text-align: center"><span style="font-size: 18px">Please verify your email address to</span><span style="color: #000000; font-size: 18px; font-family: arial,helvetica,sans-serif"> get access to the portal</span><span style="font-size: 18px">.</span></div>
//                                                   <div style="font-family: inherit; text-align: center"><span style="color: #ffbe00; font-size: 18px"><strong>Thank you!&nbsp;</strong></span></div><div></div></div></td>
//                                                 </tr>
//                                               </tbody>
//                                             </table>
//                                             <table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7770fdab-634a-4f62-a277-1c66b2646d8d">
//                                               <tbody>
//                                                 <tr>
//                                                   <td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="#ffffff">
//                                                   </td>
//                                                 </tr>
//                                               </tbody>
//                                             </table>
//                                             <table border="0" cellpadding="0" cellspacing="0" class="module" data-role="module-button" data-type="button" role="module" style="table-layout:fixed;" width="100%" data-muid="d050540f-4672-4f31-80d9-b395dc08abe1">
//                                               <tbody>
//                                                 <tr>
//                                                   <td align="center" bgcolor="#ffffff" class="outer-td" style="padding:0px 0px 0px 0px;">
//                                                     <table border="0" cellpadding="0" cellspacing="0" class="wrapper-mobile" style="text-align:center;">
//                                                       <tbody>
//                                                         <tr>
//                                                           <td align="center" bgcolor="#ffbe00" class="inner-td" style="border-radius:6px; font-size:16px; text-align:center; background-color:inherit;">
//                                                             <a href="http://localhost:8000/verifyEmail?token=${user.emailToken}" style="background-color:#ffbe00; border:1px solid #ffbe00; border-color:#ffbe00; border-radius:0px; border-width:1px; color:#000000; display:inline-block; font-size:14px; font-weight:normal; letter-spacing:0px; line-height:normal; padding:12px 40px 12px 40px; text-align:center; text-decoration:none; border-style:solid; font-family:inherit;" target="_blank">Verify Email Now</a>
//                                                           </td>
//                                                         </tr>
//                                                       </tbody>
//                                                     </table>
//                                                   </td>
//                                                 </tr>
//                                               </tbody>
//                                             </table>
//                                             <table class="module" role="module" data-type="spacer" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;" data-muid="7770fdab-634a-4f62-a277-1c66b2646d8d.1">
//                                               <tbody>
//                                                 <tr>
//                                                   <td style="padding:0px 0px 20px 0px;" role="module-content" bgcolor="#ffffff">
//                                                   </td>
//                                                 </tr>
//                                               </tbody>
//                                             </td>
//                                           </tr>
//                                         </tbody>
//                                       </table>
//
//                                     </td>
//                                   </tr>
//                                 </tbody>
//                               </table>
//                               <div data-role="module-unsubscribe" class="module" role="module" data-type="unsubscribe" style="color:#444444; font-size:12px; line-height:20px; padding:16px 16px 16px 16px; text-align:Center;" data-muid="4e838cf3-9892-4a6d-94d6-170e474d21e5">
//                                 <div class="Unsubscribe--addressLine">
//                                   <p class="Unsubscribe--senderName" style="font-size:12px; line-height:20px;">{{Sender_Name}}</p>
//                                   <p style="font-size:12px; line-height:20px;">
//                                     <span class="Unsubscribe--senderAddress">{{Sender_Address}}</span>,
//                                     <span class="Unsubscribe--senderCity">{{Sender_City}}</span>,
//                                     <span class="Unsubscribe--senderState">{{Sender_State}}</span>
//                                     <span class="Unsubscribe--senderZip">{{Sender_Zip}}</span>
//                                   </p>
//                                 </div>
//                               </div>
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </td>
//           </tr>
//         </tbody>
//       </table>
//     </td>
//   </tr>
// </tbody>
// </table>
// </div>
// </center>
//
// </body>
// </html>
//
//                `
//       });
      // <p> Hey ${user.name}, </p>
      //       <p> Thanks for registering on our portal. Click the below to verify your account.</p>
      //       <a href = "http://localhost:3000/verifyEmail?token=${user.emailToken}"> Link </a>
      // transporter.sendMail(mailInfo,);
      res.status(201).json({ msg: 'Account successfully created.' }); //, check your email to verify your account
    }
    else {
      throw Error('email registered');
    }
  }
  catch (err) {
    console.log(err);
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
}

module.exports.editprofile_get = async (req,res) => {
  const SKILLS = await Skill.find({});
  const INTERESTS = await Interest.find({});
  const PORS = await Por.find({});
  res.setHeader("Cache-Control","private,no-store,no-cache,max-age=0, must-revalidate");
  res.render('editprofile', { skills: SKILLS, interests : INTERESTS, pors: PORS });
}

module.exports.editprofile_put = async (req,res) => {
  console.log('put request recieved.');
  const { email, linkedinLink, instaLink, fbLink, interests, pors, skill_1, skill_1_value, skill_2, skill_2_value, skill_3, skill_3_value  } = req.body;

  try {
    let doc = await User.findOneAndUpdate({verifiedEmail: email}, { linkedinLink, instaLink, fbLink, interests, pors, skill_1, skill_1_value, skill_2, skill_2_value, skill_3, skill_3_value }, {new: true});
    res.status(201).json({ msg: 'profile updated.' });
    console.log(doc);
    console.log('Updated.');
  }
  catch (err) {
    console.log(err);
  }
}

module.exports.about_get = (req,res) => {
  res.render('about');
}

module.exports.forgotPassword_get = (req,res) => {
  res.setHeader("Cache-Control","private,no-store,no-cache,max-age=0, must-revalidate");
  res.render('forgotPassword');
}

module.exports.forgotPassword_post = async (req,res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ verifiedEmail: email });
    if (user) {
      //generating password reset token
      user.generatePasswordReset();

      const savee = await user.save();

      if (savee) {
        let link = `http://localhost:8000/resetPassword?token=${user.resetPasswordToken}`;
        const mailInfo = await transporter.sendMail({
          from: 'profileportal.icc.iitb@gmail.com',
          to: user.email,
          subject: 'Password Change',
          html:`Hi ${user.name} \n
                Please click on the following link <a href='${link}'> link </a> to reset your password. \n
                If you did not request this, please ignore this email and your password will remain unchanged.`
        });
         res.status(201).json({ user: user.email });
      }
    }
    else {
      throw Error('no email');
    }
  }
  catch (err) {
    console.log(err);
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
}

module.exports.resetPassword_get = async (req,res) => {
  res.setHeader("Cache-Control","private,no-store,no-cache,max-age=0, must-revalidate");
  const resetPasswordToken = req.query.token;
  if (resetPasswordToken) {
    try {
      const user = await User.findOne({ resetPasswordToken, resetPasswordExpires: {$gt: Date.now()}});
      if (user) {
        //console.log(user);
        //user.resetPasswordToken = undefined;
        //user.resetPasswordExpires = undefined;
        const doc = await user.save();
        if (doc) {
          res.render('resetPassword', { email: doc.verifiedEmail });
        }
       //console.log(doc);
      }
      else {
        res.send('invalid or expired link.')
      }
    }
    catch (err) {
      console.log(err);
    }
  }
  else {
    res.redirect('/forgotPassword');
  }
}

module.exports.resetPassword_post = async (req,res) => {
   const { email, password } = req.body;

   try {
     const user = await User.findOne({verifiedEmail: email});
     if (user) {
       user.password = password;
       user.resetPasswordToken = undefined;
       user.resetPasswordExpires = undefined;
       await user.save();
       res.status(201).json({ msg: 'Password successfully updated.' });
     }
   }
   catch (err) {
     console.log(err);
   }
}

module.exports.logout_get = (req,res) => {
  res.cookie('jwt', '', {maxAge: 1});
  res.redirect('/login');
}

module.exports.verifyEmail_get = async (req,res) => {
  res.setHeader("Cache-Control","private,no-store,no-cache,max-age=0, must-revalidate");
  const emailToken = req.query.token;
  if (emailToken) {
    try {
      const user = await User.findOne({ emailToken });
      if (user) {
        user.emailToken = null;
        user.isVerified = true;
        user.verifiedEmail = user.email;
        await user.save();
      }
    }
    catch (err) {
      console.log(err);
    }
    finally{
      res.redirect('/login');
    }
  }
  else {
    res.redirect('/login');
  }
}
