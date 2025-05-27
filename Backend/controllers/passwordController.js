
const User = require('../models/userModel');
const nodemailer = require('nodemailer');

// Store email reset requests in memory (in production, use a database or Redis)
const resetRequests = {};

// Configure nodemailer transporter with Brevo SMTP
// Added tls configuration to ignore self-signed certificate errors
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false
  }
});

// @desc    Send password reset email with client-provided code
// @route   POST /api/password/forgot
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email, resetCode } = req.body;
    
    if (!email || !resetCode) {
      return res.status(400).json({
        status: 400,
        message: 'Email and reset code are required'
      });
    }

    // Check if user exists
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found'
      });
    }

    // Store reset request for this user with 15 minutes expiration
    resetRequests[email] = {
      code: resetCode,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes expiration
    };

    const mailOptions = {
      from: `"JendoubaLife" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #3498db; text-align: center;">Réinitialisation de votre mot de passe</h2>
          <p>Bonjour ${user.firstName},</p>
          <p>Nous avons reçu une demande de réinitialisation de votre mot de passe. Veuillez utiliser le code ci-dessous pour procéder à la réinitialisation :</p>
          <div style="background-color: #f2f2f2; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${resetCode}
          </div>
          <p>Ce code est valable pendant <strong>15 minutes</strong>. Passé ce délai, vous devrez effectuer une nouvelle demande.</p>
          <p>Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet email ou contacter notre support.</p>
          <p>Cordialement,<br><strong>L'équipe JendoubaLife</strong></p>
        </div>
      `
    };
    

    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({
        status: 200,
        message: `Reset code sent to ${email}`
      });
    } catch (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({
        status: 500,
        message: 'Error sending email',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      status: 500,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reset password with verification code
// @route   POST /api/password/reset
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetCode, newPassword } = req.body;
    
    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        status: 400,
        message: 'Email, reset code, and new password are required'
      });
    }

    // Check if reset request exists
    const resetData = resetRequests[email];
    if (!resetData) {
      return res.status(400).json({
        status: 400,
        message: 'Please request a password reset first'
      });
    }

    // Check if request is expired
    if (Date.now() > resetData.expiresAt) {
      // Clean up expired request
      delete resetRequests[email];
      return res.status(400).json({
        status: 400,
        message: 'Password reset code has expired. Please try again.'
      });
    }

    // Verify reset code
    if (resetData.code !== resetCode) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid reset code'
      });
    }

    // Find user and update password
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        status: 404,
        message: 'User not found'
      });
    }

    // Update user password
    const updated = await User.update(user.id, { password: newPassword });
    
    if (updated) {
      // Clean up used reset request
      delete resetRequests[email];
      
      res.status(200).json({
        status: 200,
        message: 'Password updated successfully'
      });
    } else {
      res.status(400).json({
        status: 400,
        message: 'Failed to update password'
      });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      status: 500,
      message: 'Server error',
      error: error.message
    });
  }
};
