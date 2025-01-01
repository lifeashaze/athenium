import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { prisma } from '@/lib/db'

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { assignmentTitle, assignmentDeadline, description } = await request.json();
    
    const members = await prisma.membership.findMany({
      where: {
        classroomId: params.id,
      },
      include: {
        user: true,
      },
    });

    const emailPromises = members.map(member => {
      const deadline = new Date(assignmentDeadline).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      
      return resend.emails.send({
        from: '',
        to: member.user.email,
        subject: `New Assignment: ${assignmentTitle}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Assignment Notification</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f9fafb;
                }
                .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                }
                .header {
                  background-color: #4f46e5;
                  color: white;
                  padding: 20px;
                  text-align: center;
                  border-radius: 8px 8px 0 0;
                }
                .content {
                  padding: 20px;
                  background-color: white;
                  border-radius: 0 0 8px 8px;
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .assignment-title {
                  color: #1f2937;
                  font-size: 24px;
                  font-weight: bold;
                  margin-bottom: 16px;
                }
                .deadline {
                  background-color: #f3f4f6;
                  padding: 12px;
                  border-radius: 6px;
                  margin-bottom: 16px;
                }
                .deadline-label {
                  color: #4b5563;
                  font-weight: 600;
                  display: block;
                  margin-bottom: 4px;
                }
                .deadline-time {
                  color: #dc2626;
                  font-weight: bold;
                }
                .description {
                  color: #4b5563;
                  background-color: #f9fafb;
                  padding: 16px;
                  border-radius: 6px;
                  margin-bottom: 20px;
                }
                .button {
                  display: inline-block;
                  padding: 12px 24px;
                  background-color: #4f46e5;
                  color: white;
                  text-decoration: none;
                  border-radius: 6px;
                  font-weight: 600;
                  margin-top: 16px;
                }
                .button:hover {
                  background-color: #4338ca;
                }
                .footer {
                  text-align: center;
                  margin-top: 20px;
                  color: #6b7280;
                  font-size: 14px;
                }
                .icon {
                  font-size: 24px;
                  margin-bottom: 10px;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="icon">📚</div>
                  <h1>New Assignment Posted</h1>
                </div>
                
                <div class="content">
                  <div class="assignment-title">
                    ${assignmentTitle}
                  </div>
                  
                  <div class="deadline">
                    <span class="deadline-label">Due Date</span>
                    <span class="deadline-time">${deadline}</span>
                  </div>
                  
                  <div class="description">
                    <strong>Assignment Details:</strong><br>
                    ${description}
                  </div>
                  
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/assignments" class="button">
                    View Assignment
                  </a>
                  
                  <div class="footer">
                    <p>This is an automated message from your classroom management system.</p>
                    <p>Please do not reply to this email.</p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `,
      });
    });

    await Promise.all(emailPromises);
    return NextResponse.json({ message: 'Notification emails sent successfully' });

  } catch (error) {
    console.error('Failed to send notification emails:', error);
    return NextResponse.json(
      { error: 'Failed to send notification emails' },
      { status: 500 }
    );
  }
}
