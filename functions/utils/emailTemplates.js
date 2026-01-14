/**
 * Generate join request notification email template
 * @param {string} userName - Name of user requesting to join
 * @param {string} userEmail - Email of user requesting to join
 * @param {string} clubName - Name of the club
 * @param {string} appUrl - Application URL
 * @return {string} - HTML email template
 */
function getJoinRequestTemplate(userName, userEmail, clubName, appUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 15px 30px;
          background: #6366f1;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .info-box {
          background: white;
          padding: 15px;
          border-radius: 5px;
          margin: 15px 0;
          border-left: 4px solid #6366f1;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏃 New Join Request</h1>
        </div>
        <div class="content">
          <p>Hi Admin,</p>
          <p>A new member has requested to join <strong>${clubName}</strong>!</p>
          
          <div class="info-box">
            <p><strong>Name:</strong> ${userName}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
          </div>
          
          <p>Please review and approve this request in the admin dashboard:</p>
          
          <p style="text-align: center;">
            <a href="${appUrl}/admin/members" class="button">Review Request</a>
          </p>
          
          <p>Best regards,<br>Running Diary Team</p>
        </div>
        <div class="footer">
          <p>This is an automated notification from Running Diary</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate approval confirmation email template
 * @param {string} memberName - Name of approved member
 * @param {string} clubName - Name of the club
 * @param {string} approvedBy - Name of admin who approved
 * @param {string} appUrl - Application URL
 * @return {string} - HTML email template
 */
function getApprovalConfirmationTemplate(memberName, clubName, approvedBy, appUrl) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 15px 30px;
          background: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .success-badge {
          display: inline-block;
          background: #10b981;
          color: white;
          padding: 10px 20px;
          border-radius: 20px;
          font-weight: bold;
          margin: 15px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to ${clubName}!</h1>
        </div>
        <div class="content">
          <p>Hi ${memberName},</p>
          
          <p style="text-align: center;">
            <span class="success-badge">✓ Your request has been approved!</span>
          </p>
          
          <p>Great news! Your request to join <strong>${clubName}</strong> has been approved by ${approvedBy}.</p>
          
          <p>You can now:</p>
          <ul>
            <li>View and join club events</li>
            <li>Connect with other members</li>
            <li>Track your running progress</li>
            <li>Participate in club activities</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="${appUrl}/dashboard" class="button">Go to Dashboard</a>
          </p>
          
          <p>We're excited to have you as part of our running community!</p>
          
          <p>Best regards,<br>The ${clubName} Team</p>
        </div>
        <div class="footer">
          <p>Happy running! 🏃‍♂️</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

module.exports = {
  getJoinRequestTemplate,
  getApprovalConfirmationTemplate,
};
